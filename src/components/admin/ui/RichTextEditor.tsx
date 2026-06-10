"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote, Heading2 } from 'lucide-react'

export function RichTextEditor({ content, onChange }: { content: string, onChange: (content: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[250px] p-4 text-sm bg-slate-900 rounded-b-md border border-t-0 border-slate-800',
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-800/50 border border-slate-800 rounded-t-md">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('bold') ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('italic') ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('strike') ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
        >
          <Strikethrough size={16} />
        </button>
        <div className="w-px h-4 bg-slate-700 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('bulletList') ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('orderedList') ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('blockquote') ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
        >
          <Quote size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('codeBlock') ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
        >
          <Code size={16} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
