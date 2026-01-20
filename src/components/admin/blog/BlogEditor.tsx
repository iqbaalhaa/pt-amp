"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import { 
  Bold, Italic, List, ListOrdered, 
  Heading1, Heading2, Quote, Undo, Redo, 
  Link as LinkIcon, Image as ImageIcon,
  Type, Underline as UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Palette, Table as TableIcon, Columns, Rows, Trash2
} from 'lucide-react'
import { useCallback, useRef } from 'react'
import { uploadImage } from '@/actions/blog-actions'

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function BlogEditor({ content, onChange }: BlogEditorProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Mulai tulis artikel...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
        attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 max-w-none',
        },
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt('URL Gambar:')
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])
  
  const uploadAndAddImage = useCallback(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
          if (input.files?.length) {
              const file = input.files[0];
              const formData = new FormData();
              formData.append('file', file);
              
              const res = await uploadImage(formData);
              if (res.success && res.url) {
                  editor?.chain().focus().setImage({ src: res.url }).run();
              } else {
                  alert('Gagal mengupload gambar');
              }
          }
      };
      input.click();
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('URL Link:', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-200 bg-zinc-50 sticky top-0 z-10">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive('bold') ? 'bg-zinc-200 text-black' : 'text-zinc-600'}`}
          title="Bold"
          type="button"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive('italic') ? 'bg-zinc-200 text-black' : 'text-zinc-600'}`}
          title="Italic"
          type="button"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive('underline') ? 'bg-zinc-200 text-black' : 'text-zinc-600'}`}
          title="Underline"
          type="button"
        >
          <UnderlineIcon size={16} />
        </button>
        
        {/* Text Color */}
        <div className="relative">
            <input 
                type="color" 
                ref={colorInputRef}
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                value={editor.getAttributes('textStyle').color || '#000000'}
            />
            <button
                onClick={() => colorInputRef.current?.click()}
                className={`p-2 rounded hover:bg-zinc-200 transition-colors text-zinc-600`}
                title="Text Color"
                type="button"
            >
                <div className="flex items-center">
                    <Palette size={16} />
                    <div 
                        className="w-3 h-3 rounded-full ml-1 border border-zinc-300" 
                        style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}
                    />
                </div>
            </button>
        </div>

        <div className="w-px h-6 bg-zinc-300 mx-1" />

        {/* Alignment */}
        <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-zinc-200 text-black' : 'text-zinc-600'}`}
            title="Align Left"
            type="button"
        >
            <AlignLeft size={16} />
        </button>
        <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-zinc-200 text-black' : 'text-zinc-600'}`}
            title="Align Center"
            type="button"
        >
            <AlignCenter size={16} />
        </button>
        <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-zinc-200 text-black' : 'text-zinc-600'}`}
            title="Align Right"
            type="button"
        >
            <AlignRight size={16} />
        </button>
        <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-zinc-200 text-black' : 'text-zinc-600'}`}
            title="Justify"
            type="button"
        >
            <AlignJustify size={16} />
        </button>

        <div className="w-px h-6 bg-zinc-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-200 text-black' : 'text-zinc-600'}`}
          title="Heading 1"
          type="button"
        >
          <Heading1 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-200 text-black' : 'text-zinc-600'}`}
          title="Heading 2"
          type="button"
        >
          <Heading2 size={16} />
        </button>
        
        <div className="w-px h-6 bg-zinc-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive('bulletList') ? 'bg-zinc-200 text-black' : 'text-zinc-600'}`}
          title="Bullet List"
          type="button"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive('orderedList') ? 'bg-zinc-200 text-black' : 'text-zinc-600'}`}
          title="Ordered List"
          type="button"
        >
          <ListOrdered size={16} />
        </button>
        
        <div className="w-px h-6 bg-zinc-300 mx-1" />

        <button
          onClick={setLink}
          className={`p-2 rounded hover:bg-zinc-200 transition-colors ${editor.isActive('link') ? 'bg-zinc-200 text-black' : 'text-zinc-600'}`}
          title="Link"
          type="button"
        >
          <LinkIcon size={16} />
        </button>
        <button
          onClick={uploadAndAddImage}
          className="p-2 rounded hover:bg-zinc-200 transition-colors text-zinc-600"
          title="Image"
          type="button"
        >
          <ImageIcon size={16} />
        </button>

        {/* Table Controls */}
        <button
          onClick={addTable}
          className="p-2 rounded hover:bg-zinc-200 transition-colors text-zinc-600"
          title="Insert Table"
          type="button"
        >
          <TableIcon size={16} />
        </button>

        {editor.isActive('table') && (
            <div className="flex items-center gap-1 bg-zinc-100 rounded px-1 ml-1">
                 <button
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    className="p-1.5 hover:bg-zinc-200 rounded text-zinc-600"
                    title="Add Column"
                    type="button"
                 >
                    <Columns size={14} />
                 </button>
                 <button
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    className="p-1.5 hover:bg-zinc-200 rounded text-zinc-600"
                    title="Add Row"
                    type="button"
                 >
                    <Rows size={14} />
                 </button>
                 <button
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                    title="Delete Table"
                    type="button"
                 >
                    <Trash2 size={14} />
                 </button>
            </div>
        )}

        <div className="flex-1" />

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded hover:bg-zinc-200 transition-colors text-zinc-600 disabled:opacity-50"
          title="Undo"
          type="button"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded hover:bg-zinc-200 transition-colors text-zinc-600 disabled:opacity-50"
          title="Redo"
          type="button"
        >
          <Redo size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 cursor-text bg-white overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
      
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror {
            padding: 1.5rem;
            min-height: 100%;
            outline: none;
        }
        .ProseMirror:focus {
            outline: none;
        }
        .ProseMirror img {
            max-width: 100%;
            border-radius: 0.5rem;
            margin-top: 1rem;
            margin-bottom: 1rem;
            display: inline-block;
        }
        .ProseMirror img.ProseMirror-selectednode {
            outline: 3px solid var(--brand);
        }
        .ProseMirror blockquote {
            border-left: 3px solid #e2e8f0;
            padding-left: 1rem;
            color: #64748b;
        }
        .ProseMirror ul {
            list-style-type: disc;
            padding-left: 1.5rem;
        }
        .ProseMirror ol {
            list-style-type: decimal;
            padding-left: 1.5rem;
        }
        .ProseMirror h1 {
            font-size: 1.75rem;
            font-weight: 800;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            line-height: 1.2;
        }
        .ProseMirror h2 {
            font-size: 1.4rem;
            font-weight: 700;
            margin-top: 1.25rem;
            margin-bottom: 0.5rem;
            line-height: 1.3;
        }
        
        /* Table Styles */
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 0;
          overflow: hidden;
        }
        
        .ProseMirror table td,
        .ProseMirror table th {
          min-width: 1em;
          border: 2px solid #ced4da;
          padding: 3px 5px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        
        .ProseMirror table th {
          font-weight: bold;
          text-align: left;
          background-color: #f1f3f5;
        }
        
        .ProseMirror table .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(200, 200, 255, 0.4);
          pointer-events: none;
        }
        
        .ProseMirror table .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: #adf;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
