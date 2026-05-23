import { getClient } from "@/app/lib/client";

export class OnboardingService {
  /**
   * Commits the completed onboarding answers to the tenant site.
   */
  static async commitOnboardingAnswers(args: {
    profile_type: "business" | "life";
    instance_name: string;
    answers: Record<string, any>;
    milestones?: any[];
  }) {
    const client = await getClient();
    return (client as any).call({
      method: "rcore.api.plan_builder.commit_onboarding_answers",
      args: {
        profile_type: args.profile_type,
        instance_name: args.instance_name,
        answers: JSON.stringify(args.answers),
        milestones: JSON.stringify(args.milestones || []),
      },
    });
  }
}
