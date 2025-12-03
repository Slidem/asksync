"use client";

import { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link as LinkIcon,
  List,
  ListOrdered,
  Code,
  FileCode,
  Quote,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingToolbarProps {
  editor: Editor;
}

export function FloatingToolbar({ editor }: FloatingToolbarProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateToolbar = () => {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      if (!hasSelection) {
        setShow(false);
        return;
      }

      const { view } = editor;
      const start = view.coordsAtPos(from);

      // Use fixed positioning with proper viewport calculations
      const toolbarHeight = 50;

      // Position above selection, account for scroll
      let top = start.top + window.scrollY - toolbarHeight - 10;

      // If toolbar would be off-screen above, position it below
      if (start.top < toolbarHeight + 20) {
        top = start.bottom + window.scrollY + 10;
      }

      setPosition({
        top,
        left: start.left + window.scrollX
      });
      setShow(true);
    };

    editor.on("selectionUpdate", updateToolbar);
    editor.on("update", updateToolbar);

    return () => {
      editor.off("selectionUpdate", updateToolbar);
      editor.off("update", updateToolbar);
    };
  }, [editor]);

  if (!show || !mounted) return null;

  const setLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const ToolbarButton = ({
    onClick,
    isActive = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      type="button"
      className="h-8 w-8 p-0"
      title={title}
    >
      {children}
    </Button>
  );

  const toolbar = (
    <div
      className="fixed z-[9999] flex items-center gap-1 rounded-lg border bg-background p-1 shadow-xl"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        pointerEvents: 'auto',
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-border" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-border" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-border" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        title="Inline Code"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        title="Code Block"
      >
        <FileCode className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-border" />

      <ToolbarButton
        onClick={setLink}
        isActive={editor.isActive("link")}
        title="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );

  return createPortal(toolbar, document.body);
}
