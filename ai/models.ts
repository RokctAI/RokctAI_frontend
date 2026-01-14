export const AI_MODELS = {
    PAID: {
        id: 'gemini-3-pro',
        label: 'Pro',
        description: 'Reasoning & Depth',
    },
    FREE: {
        id: 'gemini-2.5-flash',
        label: 'Flash',
        description: 'Fast & Efficient',
    },
} as const;

export type ModelId = (typeof AI_MODELS)[keyof typeof AI_MODELS]['id'];
