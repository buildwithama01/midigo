"use client";

import { type FormEvent } from "react";

export default function ChatterComposer({
  onSend,
  onValueChange,
  placeholder = "Write a reply...",
  value,
}: {
  onSend: (message: string) => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  const maxLength = 500;

  const updateValue = (nextValue: string) => {
    onValueChange?.(nextValue);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = value.trim();
    if (!message) return;
    onSend(message);
    updateValue("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <form className="chatter-composer chatter-composer-with-canned" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="chatter-composer-message">{placeholder}</label>
      <textarea
        aria-label="Reply"
        className="form-input chatter-composer-input"
        id="chatter-composer-message"
        maxLength={maxLength}
        onChange={(event) => updateValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={2}
        value={value}
      />
      <div className="chatter-composer-footer">
        <span>{value.length}/{maxLength}</span>
        <button className="btn btn-lime" disabled={!value.trim()} type="submit">
          Send message
        </button>
      </div>
    </form>
  );
}
