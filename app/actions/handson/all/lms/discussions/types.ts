export interface DiscussionTopic {
    name: string;
    title: string;
    owner: string;
    creation: string;
    user_image?: string;
    reference_doctype: string;
    reference_docname: string;
}

export interface DiscussionReply {
    name: string;
    owner: string;
    creation: string;
    modified: string;
    reply: string;
    user?: {
        full_name: string;
        user_image: string;
    };
}
