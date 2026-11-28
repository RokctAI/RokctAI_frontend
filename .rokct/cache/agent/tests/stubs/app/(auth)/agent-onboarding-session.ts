// Test stub for app/(auth)/agent-onboarding-session.ts: records the token
// the provisioner keeps instead of writing a cookie.
export const onboardingSession: { token: string | null; claim: string | null; reset: () => void } = {
  token: null,
  claim: null,
  reset() {
    onboardingSession.token = null;
    onboardingSession.claim = null;
  },
};

export async function rememberPaymentClaim(claim: string): Promise<void> {
  onboardingSession.claim = claim;
}

export async function rememberOnboardingToken(token: string): Promise<void> {
  onboardingSession.token = token;
}

export async function readOnboardingToken(): Promise<string | null> {
  return onboardingSession.token;
}
