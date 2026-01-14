export function createDraftLead(text: string) {
    return {
        type: 'lead_creation',
        data: {
            id: Date.now(),
            lead_name: text,
            organization: "",
            email_id: "",
            mobile_no: "",
            id_number: "",
            status: "Lead",
            modelId: undefined as string | undefined
        }
    };
}
