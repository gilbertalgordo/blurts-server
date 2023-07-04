/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Image from "next/image";
import Script from "next/script";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { CircleChartProps, UserBreaches } from "./breaches.d";

import AppConstants from "../../../../../appConstants.js";
import { getL10n } from "../../../../functions/server/l10n";
import { getUserBreaches } from "../../../../functions/server/getUserBreaches";
import { authOptions } from "../../../../api/utils/auth";

import "../../../../../client/css/partials/breaches.css";
import ImageIconEmail from "../../../../../client/images/icon-email.svg";

import { BreachesTable } from "../../../components/server/BreachesTable";
import { getComponentAsString } from "../../../functions/server/getComponentAsString";
import { getCountryCode } from "../../../../functions/server/getCountryCode";

export async function generateMetadata() {
  const l10n = getL10n();
  return {
    title: l10n.getString("breach-meta-title"),
    twitter: {
      card: "summary_large_image",
      title: l10n.getString("brand-fx-monitor"),
      description: l10n.getString("meta-desc-2"),
      images: ["/images/og-image.webp"],
    },
    openGraph: {
      title: l10n.getString("brand-fx-monitor"),
      description: l10n.getString("meta-desc-2"),
      siteName: l10n.getString("brand-fx-monitor"),
      type: "website",
      url: process.env.SERVER_URL,
      images: ["/images/og-image.webp"],
    },
  };
}

function createEmailOptions({ breachesData, emailSelectIndex }: UserBreaches) {
  const emails = breachesData.verifiedEmails.map((obj) => obj.email);
  const optionElements = emails.map(
    (email, index) =>
      `<option ${
        emailSelectIndex === index ? "selected" : ""
      }>${email}</option>`
  );

  return optionElements.join("");
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "circle-chart": CircleChartProps;
    }
  }
}

export default async function UserBreaches() {
  const session = await getServerSession(authOptions);
  const l10n = getL10n();
  const headerList = headers();

  const userBreachesData: UserBreaches = await getUserBreaches({
    // `(authenticated)/layout.tsx` ensures that `session` is not undefined,
    // so the type assertion should be safe:
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    user: session!.user as any,
    options: {
      countryCode: getCountryCode(headerList),
    },
  });

  type FxaSubscriptionResponse = {
    subscriptions: Array<{
      product_id: string;
      plan_id: string;
      status: "active";
    }>;
  };

  // Fetch list of subscriptions.
  let subscriptions;
  const bearerToken = session?.user.subscriber?.fxa_access_token;
  if (bearerToken) {
    const result = await fetch(
      `${process.env.OAUTH_API_URI}/oauth/mozilla-subscriptions/customer/billing-and-subscriptions`,
      {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${bearerToken}`,
        },
      }
    );
    if (result.ok) {
      subscriptions = await result.json();
    }
  } else {
    console.error("User has no bearer token");
  }

  const isUserSubscribed = (subscriptions: FxaSubscriptionResponse) => {
    if (!subscriptions) {
      return false;
    }
    for (const subscription of subscriptions.subscriptions) {
      if (
        subscription.product_id === process.env.PREMIUM_PRODUCT_ID &&
        subscription.plan_id === process.env.PREMIUM_PLAN_ID_US &&
        subscription.status === "active"
      ) {
        return true;
      }
    }
    return false;
  };

  return (
    <>
      {/* These scripts predate the use of React and thus shouldn’t wait for
      hydration to adjust the layout. */}
      {/* eslint-disable @next/next/no-sync-scripts */}
      <script
        type="module"
        src="/nextjs_migration/client/js/customSelect.js"
        rel="preload"
        crossOrigin="anonymous"
      />
      <script
        type="module"
        src="/nextjs_migration/client/js/circleChart.js"
        rel="preload"
        crossOrigin="anonymous"
      />
      <script
        type="module"
        src="/nextjs_migration/client/js/breaches.js"
        rel="preload"
        crossOrigin="anonymous"
      />
      {/* eslint-enable @next/next/no-sync-scripts */}
      <Script type="module" src="/nextjs_migration/client/js/dialog.js" />

      <main data-partial="breaches">
        {process.env.PREMIUM_ENABLED === "true" &&
        !isUserSubscribed(subscriptions) ? (
          <section>
            <a
              className="button primary"
              href={`${process.env.FXA_SUBSCRIPTIONS_URL}/products/${process.env.PREMIUM_PRODUCT_ID}?plan=${process.env.PREMIUM_PLAN_ID_US}`}
            >
              Subscribe to Premium
            </a>
          </section>
        ) : (
          ""
        )}
        <section>
          <header className="breaches-header">
            <h1
              // The DOM for this element is modified by regular JavaScript
              // files that predate our migration to Next.js. We don’t use any
              // React-specific features here, so hydration errors should
              // not be a problem.
              suppressHydrationWarning
              dangerouslySetInnerHTML={{
                __html: l10n.getString("breach-heading-email", {
                  "email-select": `<custom-select name="email-account">${createEmailOptions(
                    userBreachesData
                  )}</custom-select>`,
                }),
              }}
            />

            <circle-chart
              // The DOM for this element is modified by regular JavaScript
              // files that predate our migration to Next.js. We don’t use any
              // React-specific features here, so hydration errors should
              // not be a problem.
              suppressHydrationWarning
              class="breach-chart"
              title={l10n.getString("breach-chart-title")}
              data-txt-other={l10n.getString("other-data-class")}
              data-txt-none={l10n.getString("none-data-class")}
            ></circle-chart>

            <figure
              className="email-stats"
              data-count={userBreachesData.emailTotalCount}
              data-total={AppConstants.MAX_NUM_ADDRESSES}
            >
              <Image src={ImageIconEmail} alt="" width={55} height={30} />
              <figcaption>
                <strong>
                  {l10n.getString("emails-monitored", {
                    count: userBreachesData.emailVerifiedCount,
                    total: AppConstants.MAX_NUM_ADDRESSES,
                  })}
                </strong>
                <a href="/user/settings">
                  {l10n.getString("manage-emails-link")}
                </a>
              </figcaption>
            </figure>
          </header>
        </section>

        <div
          // The DOM for this element is modified by regular JavaScript
          // files that predate our migration to Next.js. We don’t use any
          // React-specific features here, so hydration errors should
          // not be a problem.
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: await getComponentAsString({
              component: <BreachesTable userBreaches={userBreachesData} />,
            }),
          }}
        />
      </main>
    </>
  );
}
