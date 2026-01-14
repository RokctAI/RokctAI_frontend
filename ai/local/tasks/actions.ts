export function createDraftTask(text: string, dateText?: string) {
    return {
        type: 'project',
        data: {
            id: Date.now(),
            name: text,
            priority: "medium",
            end_date: dateText || undefined,
            assignees: [],
            modelId: undefined as string | undefined
        }
    };
}
