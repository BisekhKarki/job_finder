"use client";

import React, { useState } from "react";

type Category = {
  id: string;
  name: string;
  color: string;
};

type Tag = {
  value: string;
  category?: string;
};

type Props = {
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
  suggestedTags?: string[];
  categories?: Category[];
  editable?: boolean;
  maxTags?: number;
  placeholder?: string;
};

export default function TagInput({
  tags,
  setTags,
  suggestedTags = [],
  categories = [],
  editable = false,
  maxTags = 10,
  placeholder = "Type and press Enter...",
}: Props) {
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    categories[0]?.id || "",
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addTag = () => {
    const value = input.trim();
    if (!value) return;
    if (tags.find((t) => t.value === value)) return;
    if (tags.length >= maxTags) return;

    setTags([
      ...tags,
      {
        value,
        category: categories.length ? selectedCategory : undefined,
      },
    ]);

    setInput("");
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const startEdit = (index: number) => {
    if (!editable) return;
    setEditingIndex(index);
    setInput(tags[index].value);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;

    const updated = [...tags];
    updated[editingIndex].value = input.trim();

    setTags(updated);
    setEditingIndex(null);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      editingIndex !== null ? saveEdit() : addTag();
    }

    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const filteredSuggestions = suggestedTags.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) &&
      !tags.find((t) => t.value === s),
  );

  return (
    <div className="w-full">
      {/* Category Selector */}
      {categories.length > 0 && (
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="mb-3 border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      )}

      {/* Input + Tags */}
      <div className="border border-gray-200 rounded-xl p-3 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-blue-500">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
          >
            <span onDoubleClick={() => startEdit(index)}>{tag.value}</span>

            {editable && <button onClick={() => startEdit(index)}>✏️</button>}

            <button onClick={() => removeTag(index)}>✕</button>
          </div>
        ))}

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 outline-none text-sm min-w-30"
        />
      </div>

      {/* Suggestions */}
      {input && filteredSuggestions.length > 0 && (
        <div className="border mt-2 rounded-xl bg-white shadow-md max-h-40 overflow-y-auto">
          {filteredSuggestions.map((s) => (
            <div
              key={s}
              onClick={() => setInput(s)}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
