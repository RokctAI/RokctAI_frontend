import { ControlBaseService } from "./base";

export class OnboardingService {
  /**
   * Fetches the onboarding questions template for a profile type (business/life)
   * from the Control site.
   */
  static async getOnboardingTemplate(profileType: "business" | "life") {
    return ControlBaseService.call("control.api.get_onboarding_template", {
      profile_type: profileType,
    });
  }
}
