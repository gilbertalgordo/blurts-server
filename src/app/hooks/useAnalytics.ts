/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use client";

import { useEffect } from "react";
import Glean from "@mozilla/glean/web";
import * as pageEvents from "../../telemetry/generated/page";

// Custom hook that initializes Glean and returns the Glean objects required
// to record data.
export const useGlean = () => {
  // Initialize Glean only on the first render
  // of our custom hook.
  useEffect(() => {
    // Enable upload only if the user opted into tracking.
    const uploadEnabled = navigator.doNotTrack === "0";

    const channel = process.env.NEXT_PUBLIC_APP_ENV;
    if (!channel) {
      console.warn("No channel defined in env var NEXT_PUBLIC_APP_ENV");
    }

    Glean.initialize("monitor.frontend", uploadEnabled, {
      // This will submit an events ping every time an event is recorded.
      maxEvents: 1,
      channel,
    });

    // Glean debugging options can be found here:
    // https://mozilla.github.io/glean/book/reference/debug/index.html
    const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
    if (appEnv && ["local", "heroku"].includes(appEnv)) {
      // Enable logging pings to the browser console.
      Glean.setLogPings(true);
      // Tag pings for the Debug Viewer
      // @see https://debug-ping-preview.firebaseapp.com/pings/fx-monitor-local-dev
      Glean.setDebugViewTag(`fx-monitor-${appEnv}-dev`);
    }
  }, []);

  // Return all generated Glean objects required for recording data.
  return {
    pageEvents,
  };
};

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

interface InitGaProps {
  ga4MeasurementId: string;
  debugMode: boolean;
}

export const initGa4 = ({ ga4MeasurementId, debugMode }: InitGaProps) => {
  if (typeof window === undefined) {
    return;
  }

  if (debugMode) {
    console.info("Initialize GA4");
  }

  const uploadEnabled = navigator.doNotTrack !== "0";
  if (!uploadEnabled) {
    if (debugMode) {
      console.info("Cound not initialize GA4 due to DNT.");
    }
    return;
  }

  // GA4 setup
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function (...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", ga4MeasurementId, {
      cookie_domain: window.location.hostname,
      cookie_flags: "SameSite=None;Secure",
      debug_mode: debugMode,
    });
  }
};

type Ga4EventOptions = {
  type: "event";
  name: string;
  params: object;
};

export const useGtag = (): {
  gtag: {
    record: (options: Ga4EventOptions) => void;
  };
} => {
  const debugMode = process.env.NEXT_PUBLIC_NODE_ENV !== "production";
  useEffect(() => {
    if (!window.gtag) {
      if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") {
        console.warn("GA4 is not initialized.");
      }

      const ga4MeasurementId =
        process.env.NEXT_PUBLIC_NEXT_PUBLIC_GA4_MEASUREMENT_ID ||
        "G-CXG8K4KW4P";
      initGa4({ ga4MeasurementId, debugMode });
    }
  }, [debugMode]);

  return {
    gtag: {
      record: (options) => {
        if (window.gtag) {
          window.gtag(options);
        } else if (!window.gtag && debugMode) {
          console.warn("Could not find gtag.");
        }
      },
    },
  };
};
