"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Typography from "@tiptap/extension-typography";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

interface TiptapViewerProps {
  content: string;
  className?: string;
}

export function TiptapViewer({ content, className = "" }: TiptapViewerProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Typography,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "text-primary underline",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={`tiptap-viewer ${className}`}>
      <EditorContent editor={editor} />
    </div>
  );
}
