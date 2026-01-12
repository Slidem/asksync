"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { common, createLowlight } from "lowlight";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";

const lowlight = createLowlight(common);

interface TiptapViewerProps {
  content: string;
  className?: string;
}

export function TiptapViewer({
  content,
  className = "",
}: TiptapViewerProps): React.ReactNode {
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
