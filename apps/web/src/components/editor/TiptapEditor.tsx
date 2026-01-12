"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { common, createLowlight } from "lowlight";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { FloatingToolbar } from "./FloatingToolbar";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  value?: string;
  onChange?: (html: string, plaintext: string) => void;
  placeholder?: string;
  minHeight?: number;
  onSubmit?: () => void;
  className?: string;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  value = "",
  onChange,
  placeholder = "Start typing...",
  minHeight = 120,
  onSubmit,
  className = "",
}: TiptapEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const plaintext = editor.getText();
      onChange?.(html, plaintext);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none",
      },
      handleKeyDown: (view, event) => {
        if (
          onSubmit &&
          event.key === "Enter" &&
          (event.ctrlKey || event.metaKey)
        ) {
          event.preventDefault();
          onSubmit();
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`tiptap-editor-wrapper ${className}`}>
      <FloatingToolbar editor={editor} />
      <div
        className="tiptap-editor-container rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        style={{ minHeight: `${minHeight}px` }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
