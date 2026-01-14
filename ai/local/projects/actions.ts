export function createDraftProject(text: string) {
    return {
        type: 'project_creation',
        data: {
            id: Date.now(),
            name: text,
            description: "",
            status: "Open",
            modelId: undefined as string | undefined
        }
    };
}
