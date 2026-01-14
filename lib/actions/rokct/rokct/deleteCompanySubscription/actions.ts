"use server";






export async function deleteCompanySubscription(
  name: string, apiKey: string, apiSecret: string
): Promise<void> {
  const response = await fetch(`/api/v1/resource/Company%20Subscription/${encodeURIComponent(name)}`, {
    method: "DELETE",
    headers: {
      "Authorization": `token ${apiKey}:${apiSecret}`,
      "X-Action-Source": "AI",
      "Content-Type": "application/json",
    },
    
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to delete company subscription: ${errorBody}`);
  }
  
  return;
}