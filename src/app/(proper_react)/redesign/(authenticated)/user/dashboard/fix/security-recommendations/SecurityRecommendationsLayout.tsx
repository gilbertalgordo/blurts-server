/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SecurityRecommendationTypes,
  getSecurityRecommendationsByType,
} from "./securityRecommendationsData";
import { ResolutionContainer } from "../ResolutionContainer";
import { ResolutionContent } from "../ResolutionContent";
import { Button } from "../../../../../../../components/server/Button";
import { useL10n } from "../../../../../../../hooks/l10n";
import { getLocale } from "../../../../../../../functions/universal/getLocale";
import { FixView } from "../FixView";
import {
  StepDeterminationData,
  StepLink,
  getNextGuidedStep,
} from "../../../../../../../functions/server/getRelevantGuidedSteps";
import { getGuidedExperienceBreaches } from "../../../../../../../functions/universal/guidedExperienceBreaches";
import { hasPremium } from "../../../../../../../functions/universal/user";
import { SecurityRecommendationDataTypes } from "../../../../../../../functions/universal/breach";
import { BreachBulkResolutionRequest } from "../../../../../../../(nextjs_migration)/(authenticated)/user/breaches/breaches";

export interface SecurityRecommendationsLayoutProps {
  type: SecurityRecommendationTypes;
  subscriberEmails: string[];
  data: StepDeterminationData;
}

export function SecurityRecommendationsLayout(
  props: SecurityRecommendationsLayoutProps,
) {
  const l10n = useL10n();
  const router = useRouter();
  const [isResolving, setIsResolving] = useState(false);

  const stepMap: Record<SecurityRecommendationTypes, StepLink["id"]> = {
    email: "SecurityTipsEmail",
    phone: "SecurityTipsPhone",
    ip: "SecurityTipsIp",
    done: "SecurityTipsIp",
  };

  const isStepDone = props.type === "done";

  const guidedExperienceBreaches = getGuidedExperienceBreaches(
    props.data.subscriberBreaches,
    props.subscriberEmails,
  );

  const nextStep = getNextGuidedStep(props.data, stepMap[props.type]);
  const pageData = getSecurityRecommendationsByType({
    dataType: props.type,
    breaches: guidedExperienceBreaches,
    l10n: l10n,
    nextStep,
  });

  // The non-null assertion here should be safe since we already did this check
  // in `./[type]/page.tsx`:
  const { title, illustration, content, exposedData } = pageData!;
  const hasExposedData = exposedData.length > 0;

  // TODO: Write unit tests MNTOR-2560
  /* c8 ignore start */
  const handlePrimaryButtonPress = async () => {
    const securityRecommendatioBreachClasses: Record<
      SecurityRecommendationTypes,
      | (typeof SecurityRecommendationDataTypes)[keyof typeof SecurityRecommendationDataTypes]
      | null
    > = {
      email: SecurityRecommendationDataTypes.Email,
      phone: SecurityRecommendationDataTypes.Phone,
      ip: SecurityRecommendationDataTypes.IP,
      done: null,
    };

    const dataType = securityRecommendatioBreachClasses[props.type];
    // Only attempt to resolve the breaches if the following conditions are true:
    // - There is a matching data class type in this step
    // - The current step has unresolved exposed data
    // - There is no pending breach resolution request
    if (!dataType || !hasExposedData || isResolving) {
      return;
    }

    setIsResolving(true);
    try {
      const body: BreachBulkResolutionRequest = { dataType };
      const response = await fetch("/api/v1/user/breaches/bulk-resolve", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!result?.success) {
        throw new Error(
          `Could not resolve breach data class of type: ${props.type}`,
        );
      }

      const isCurrentStepSection = Object.values(stepMap).includes(nextStep.id);
      const nextRoute = isCurrentStepSection
        ? nextStep.href
        : "/redesign/user/dashboard/fix/security-recommendations/done";
      router.push(nextRoute);
    } catch (_error) {
      // TODO: MNTOR-2563: Capture client error with @next/sentry
      setIsResolving(false);
    }
  };
  /* c8 ignore stop */

  return (
    <FixView
      subscriberEmails={props.subscriberEmails}
      data={props.data}
      nextStep={nextStep}
      currentSection="security-recommendations"
      hideProgressIndicator={isStepDone}
      showConfetti={isStepDone}
    >
      <ResolutionContainer
        label={
          !isStepDone
            ? l10n.getString("security-recommendation-steps-label")
            : ""
        }
        type="securityRecommendations"
        title={title}
        illustration={illustration}
        isPremiumUser={hasPremium(props.data.user)}
        cta={
          !isStepDone && (
            <Button
              variant="primary"
              small
              autoFocus={true}
              /* c8 ignore next */
              onPress={() => void handlePrimaryButtonPress()}
              disabled={isResolving}
            >
              {l10n.getString("security-recommendation-steps-cta-label")}
            </Button>
          )
        }
        isStepDone={isStepDone}
        data={props.data}
      >
        <ResolutionContent
          content={content}
          exposedData={exposedData}
          locale={getLocale(l10n)}
        />
      </ResolutionContainer>
    </FixView>
  );
}
