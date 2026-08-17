/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use client";

import React from "react";

// Based on the Notes model from backend/Dash/packages/workdo/Notes/src/Entities/Notes.php
export interface NoteCardProps {
  id: number;
  title: string;
  text: string;
  color: string; // e.g., 'yellow', 'blue', 'green'
}

export function NoteCard({ note }: { note: NoteCardProps }) {
  const colorVariants: { [key: string]: string } = {
    yellow: "bg-yellow-200 border-yellow-400 text-yellow-800",
    blue: "bg-blue-200 border-blue-400 text-blue-800",
    green: "bg-green-200 border-green-400 text-green-800",
    red: "bg-red-200 border-red-400 text-red-800",
    purple: "bg-wealth-green-200 border-wealth-green-400 text-wealth-green-800",
    pink: "bg-pink-200 border-pink-400 text-pink-800",
    gray: "bg-gray-200 border-gray-400 text-gray-800",
  };

  // Default to gray if the color from the backend is not in our list
  const noteColor = colorVariants[note.color] || colorVariants.gray;

  const [isSaving, setIsSaving] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: note.title,
          description: note.text, // mapped to description/content
          public: 1,
        }),
      });

      if (response.ok) {
        setIsSaved(true);
        // Optional: Notify parent or show toast
      }
    } catch (e) {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  if (isSaved) {
    return null; // Remove card after save, or show success state
  }

  return (
    <div
      className={`border-l-4 p-4 rounded-r-lg w-full ${noteColor} flex flex-col gap-2`}
    >
      <div>
        <h3 className="font-bold text-lg mb-2">{note.title}</h3>
        <p className="text-sm">{note.text}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end mt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
        >
          {isSaving ? "Saving..." : "Save Note"}
        </button>
      </div>
    </div>
  );
}
