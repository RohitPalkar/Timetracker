import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Code, Heading2, Italic, Link as LinkIcon, List, ListOrdered, Quote, Redo, RemoveFormatting, Strikethrough, Undo } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
  minHeight?: number
  className?: string
}

function ToolbarButton({ active, disabled, label, onClick, children }: {
  active: boolean
  disabled?: boolean
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn('h-7 w-7 rounded-lg text-muted-foreground', active && 'bg-muted text-foreground')}
    >
      {children}
    </Button>
  )
}

export function RichTextEditor({ value, onChange, placeholder = 'Write something…', disabled, minHeight = 160, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
    editorProps: {
      attributes: { class: 'rich-text-content focus:outline-none', style: `min-height: ${minHeight}px` },
    },
  })

  React.useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) editor.commands.setContent(value)
  }, [value, editor])

  React.useEffect(() => {
    editor?.setEditable(!disabled)
  }, [disabled, editor])

  const run = (fn: () => void) => () => {
    fn()
  }

  const toggleLink = () => {
    if (!editor) return
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const href = window.prompt('Link URL', 'https://')
    if (href) editor.chain().focus().setLink({ href }).run()
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-input bg-surface transition-colors hover:border-border-strong focus-within:border-ring-focus/60 focus-within:outline-2 focus-within:outline-offset-0 focus-within:outline-ring',
        disabled && 'opacity-60',
        className,
      )}
    >
      {editor && (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface-muted/50 px-2 py-1.5">
          <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={run(() => editor.chain().focus().toggleBold().run())}>
            <Bold className="size-3.5" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={run(() => editor.chain().focus().toggleItalic().run())}>
            <Italic className="size-3.5" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Strikethrough" active={editor.isActive('strike')} onClick={run(() => editor.chain().focus().toggleStrike().run())}>
            <Strikethrough className="size-3.5" aria-hidden="true" />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
          <ToolbarButton label="Heading" active={editor.isActive('heading', { level: 2 })} onClick={run(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}>
            <Heading2 className="size-3.5" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Bullet list" active={editor.isActive('bulletList')} onClick={run(() => editor.chain().focus().toggleBulletList().run())}>
            <List className="size-3.5" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Ordered list" active={editor.isActive('orderedList')} onClick={run(() => editor.chain().focus().toggleOrderedList().run())}>
            <ListOrdered className="size-3.5" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Quote" active={editor.isActive('blockquote')} onClick={run(() => editor.chain().focus().toggleBlockquote().run())}>
            <Quote className="size-3.5" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Inline code" active={editor.isActive('code')} onClick={run(() => editor.chain().focus().toggleCode().run())}>
            <Code className="size-3.5" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Link" active={editor.isActive('link')} onClick={toggleLink}>
            <LinkIcon className="size-3.5" aria-hidden="true" />
          </ToolbarButton>
          <span className="ml-auto flex items-center gap-0.5">
            <ToolbarButton label="Undo" active={false} disabled={!editor.can().undo()} onClick={run(() => editor.chain().focus().undo().run())}>
              <Undo className="size-3.5" aria-hidden="true" />
            </ToolbarButton>
            <ToolbarButton label="Redo" active={false} disabled={!editor.can().redo()} onClick={run(() => editor.chain().focus().redo().run())}>
              <Redo className="size-3.5" aria-hidden="true" />
            </ToolbarButton>
            <ToolbarButton label="Clear formatting" active={false} onClick={run(() => editor.chain().focus().unsetAllMarks().clearNodes().run())}>
              <RemoveFormatting className="size-3.5" aria-hidden="true" />
            </ToolbarButton>
          </span>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}