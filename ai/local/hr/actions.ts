export function createDraftProfileUpdate() {
    return {
        type: 'profile_update',
        data: {
            id: Date.now(),
            first_name: "",
            last_name: "",
            id_number: "",
            bank_name: "",
            bank_account_no: "",
            bank_branch_code: "",
            tax_id: "",
            modelId: undefined as string | undefined
        }
    };
}
