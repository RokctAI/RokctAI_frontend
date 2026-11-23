// Test stub for app/(auth)/agent-onboarding-session.ts: records the token
// the provisioner keeps instead of writing a cookie.
export const onboardingSession: { token: string | null; reset: () => void } = {
  token: null,
  reset() {
    onboardingSession.token = null;
  },
};

export async function rememberOnboardingToken(token: string): Promise<void> {
  onboardingSession.token = token;
}

export async function readOnboardingToken(): Promise<string | null> {
  return onboardingSession.token;
}
