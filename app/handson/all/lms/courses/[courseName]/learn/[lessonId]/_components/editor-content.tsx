"use client";

import { useEffect, useRef } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";

interface EditorContentProps {
    data: OutputData;
}

export default function EditorContent({ data }: EditorContentProps) {
    const holderRef = useRef<string>(`editor-${Math.random().toString(36).substr(2, 9)}`);
    const editorRef = useRef<EditorJS | null>(null);

    useEffect(() => {
        if (!data || editorRef.current) return;

        const initEditor = async () => {
            // Dynamic imports for tools to avoid SSR issues
            const Header = (await import("@editorjs/header")).default;
            // const List = (await import("@editorjs/list")).default;
            // const Embed = (await import("@editorjs/embed")).default;
            // const Image = (await import("@editorjs/image")).default;

            const editor = new EditorJS({
                holder: holderRef.current,
                data: data,
                readOnly: true,
                tools: {
                    header: Header,
                    // list: List,
                    // embed: Embed,
                    // image: Image,
                },
                minHeight: 0,
            });

            editorRef.current = editor;
        };

        initEditor();

        return () => {
            if (editorRef.current && typeof editorRef.current.destroy === 'function') {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [data]);

    return <div id={holderRef.current} className="editorjs-content" />;
}
