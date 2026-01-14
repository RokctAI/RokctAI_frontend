import { pipeline, env } from '@xenova/transformers';

// Skip local model checks since we are in browser
env.allowLocalModels = false;
env.useBrowserCache = true;

class AIWorker {
    static instance = null;

    static async getInstance() {
        if (!this.instance) {
            // Use quantized version for speed
            this.instance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }
        return this.instance;
    }
}

const ANCHORS = {
    // Legacy mapping (kept for safety)
    "task": "buy call email meeting schedule todo deadline",
    "note": "remember idea thought journal log record",

    // Dimension 1: Action
    "action_create": "create add new generate make build draft write",
    "action_update": "update edit change modify amend fix correct",
    "action_delete": "delete remove cancel trash destroy db_delete",
    "action_find": "find search get show list view query where",

    // Dimension 2: Entity
    "entity_invoice": "invoice bill charge receipt payment purchase sales",
    "entity_order": "order sales purchase co po",
    "entity_quote": "quote proposal estimate offer bid quotation",
    "entity_lead": "lead prospect customer client contact person sa_id kyc identification verification passport",
    "entity_opportunity": "opportunity deal potential pipeline",
    "entity_contract": "contract agreement sla",
    "entity_project": "project plan campaign roadmap",
    "entity_task": "task todo reminder deadline work job",
    "entity_meeting": "meeting call appointment schedule calendar event",
    "entity_email": "email message letter contact mail campaign",
    "entity_employee": "employee staff worker hr personnel profile salary bank_details tax_id",
    entity_leave: "leave holiday vacation off sick timeoff",
    entity_claim: "expense claim reimbursement receipt money spend",
    entity_goal: "goal kpi target objective performance okr",
    entity_appraisal: "appraisal review evaluation feedback score",
    entity_item: "item product material stock inventory asset",
    entity_journal: "journal entry ledgers gl adjustment",
    entity_report: "report analytics dashboard stats metrics",
    entity_competitor: "competitor shop store rival business brand market",
};

let anchorEmbeddings = null;

async function getEmbeddings(text, classifier) {
    const output = await classifier(text, { pooling: 'mean', normalize: true });
    return output.data;
}

function cosineSimilarity(a, b) {
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Helper to find best match in a category group
function getBestMatch(scores, prefix) {
    let bestLabel = null;
    let bestScore = -1;

    for (const [key, score] of Object.entries(scores)) {
        if (key.startsWith(prefix)) {
            if (score > bestScore) {
                bestScore = score;
                bestLabel = key.replace(prefix, ""); // remove "action_" or "entity_"
            }
        }
    }
    return { label: bestLabel, score: bestScore };
}

self.addEventListener('message', async (event) => {
    const { text, task } = event.data;

    try {
        const classifier = await AIWorker.getInstance();

        // Initialize Anchors once
        if (!anchorEmbeddings) {
            anchorEmbeddings = {};
            for (const key in ANCHORS) {
                anchorEmbeddings[key] = await getEmbeddings(ANCHORS[key], classifier);
            }
        }

        if (task === 'classify_intent') {
            const inputEmbedding = await getEmbeddings(text, classifier);

            // Calculate all scores
            const scores = {};
            for (const key in anchorEmbeddings) {
                scores[key] = cosineSimilarity(inputEmbedding, anchorEmbeddings[key]);
            }

            // Get best Action
            const actionResult = getBestMatch(scores, "action_");
            // Get best Entity
            let entityResult = getBestMatch(scores, "entity_");

            // Context Override
            if (event.data.context && event.data.context.entity) {
                // Force entity if provided by Pin Context
                entityResult = { label: event.data.context.entity, score: 1.0 };
            }

            // Standard Intent Logic
            const scoreTask = scores['task'];
            const scoreNote = scores['note'];

            let bestIntent = scoreTask > scoreNote ? 'Task' : 'Note';

            self.postMessage({
                status: 'success',
                intent: bestIntent,
                details: {
                    action: actionResult.label,
                    actionScore: actionResult.score,
                    entity: entityResult.label,
                    entityScore: entityResult.score
                },
                scores: scores
            });
        }
    } catch (error) {
        self.postMessage({ status: 'error', message: error.message });
    }
});
