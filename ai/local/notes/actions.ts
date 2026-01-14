export function createDraftNote(text: string) {
    return {
        id: Date.now(),
        title: "Quick Note",
        text: text,
        color: "yellow"
    };
}
