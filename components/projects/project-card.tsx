"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';

export interface ProjectCardProps {
    id: number;
    name: string;
    description: string;
    modelId?: string;
}

export function ProjectCard({ project }: { project: ProjectCardProps }) {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleConfirm = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, modelId: project.modelId })
            });

            if (response.ok) {
                setIsSaved(true);
                toast.success("Project Created", {
                    description: `Project "${name}" has been created successfully.`
                });
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to create project");
            }
        } catch (e) {
            toast.error("Error creating project");
        } finally {
            setIsSaving(false);
        }
    };

    if (isSaved) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
                <p className="text-green-500 font-medium">Project Created Successfully</p>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 w-full flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                <div className="size-8 rounded bg-indigo-500/20 flex items-center justify-center">
                    <span className="text-indigo-400 font-bold">P</span>
                </div>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent text-lg font-bold outline-none text-white w-full placeholder-zinc-500"
                    placeholder="Project Name"
                />
            </div>

            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-zinc-950/50 rounded-md p-2 text-sm text-zinc-300 resize-none outline-none border border-zinc-800 focus:border-zinc-700 min-h-[80px]"
                placeholder="Add a description for this project..."
            />

            <div className="flex justify-end gap-2 pt-2">
                {/* Cancel acts as Ignore */}
                <button
                    onClick={handleConfirm}
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {isSaving ? 'Creating...' : 'Confirm Project'}
                </button>
            </div>
        </div>
    );
}
