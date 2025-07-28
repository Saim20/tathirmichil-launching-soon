"use client"
import React, { useState, useEffect } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { 
  FaBold, 
  FaItalic, 
  FaUnderline, 
  FaListUl, 
  FaListOl, 
  FaLink,
  FaUnlink,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaCode,
  FaQuoteLeft,
  FaUndo,
  FaRedo,
  FaHeading
} from 'react-icons/fa'

interface MenuBarProps {
  editor: Editor | null;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  if (!editor) {
    return null
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k') {
          e.preventDefault();
          setIsLinkDialogOpen(true);
          // If text is selected and looks like a URL, prefill it
          const { from, to } = editor.state.selection;
          if (from !== to) {
            const selectedText = editor.state.doc.textBetween(from, to);
            if (selectedText.includes('.') && !selectedText.includes(' ')) {
              setLinkUrl(selectedText);
            }
          }
        }
      }
      if (e.key === 'Escape' && isLinkDialogOpen) {
        setIsLinkDialogOpen(false);
        setLinkUrl('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor, isLinkDialogOpen]);

  const addLink = () => {
    if (linkUrl.trim()) {
      // Ensure URL has protocol
      let url = linkUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // If text is selected, apply link to selection
      // If no text is selected, insert the URL as text with link
      const { from, to } = editor.state.selection;
      if (from === to) {
        // No text selected - insert URL as text with link
        editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
      } else {
        // Text is selected - apply link to selection
        editor.chain().focus().setLink({ href: url }).run();
      }
      
      setLinkUrl('');
      setIsLinkDialogOpen(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    children, 
    title,
    disabled = false 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode; 
    title: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
        isActive 
          ? 'bg-tathir-light-green text-tathir-dark-green shadow-md border border-tathir-cream/50' 
          : 'bg-tathir-beige/90 text-tathir-dark-green hover:bg-tathir-cream hover:shadow-md border border-transparent hover:border-tathir-light-green/30'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-r from-tathir-dark-green via-tathir-maroon to-tathir-brown rounded-t-lg border-b border-tathir-light-green/30 shadow-lg">
      {/* Text Formatting */}
      <div className="flex gap-1 border-r border-tathir-beige/30 pr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <FaBold className="text-sm" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <FaItalic className="text-sm" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <FaUnderline className="text-sm" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code"
        >
          <FaCode className="text-sm" />
        </ToolbarButton>
      </div>

      {/* Headings */}
      <div className="flex gap-1 border-r border-tathir-beige/30 pr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <div className="flex items-center gap-1">
            <FaHeading className="text-xs" />
            <span className="text-xs font-bold">1</span>
          </div>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <div className="flex items-center gap-1">
            <FaHeading className="text-xs" />
            <span className="text-xs font-bold">2</span>
          </div>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <div className="flex items-center gap-1">
            <FaHeading className="text-xs" />
            <span className="text-xs font-bold">3</span>
          </div>
        </ToolbarButton>
      </div>

      {/* Lists */}
      <div className="flex gap-1 border-r border-tathir-beige/30 pr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <FaListUl className="text-sm" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <FaListOl className="text-sm" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <FaQuoteLeft className="text-sm" />
        </ToolbarButton>
      </div>

      {/* Alignment */}
      <div className="flex gap-1 border-r border-tathir-beige/30 pr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <FaAlignLeft className="text-sm" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <FaAlignCenter className="text-sm" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <FaAlignRight className="text-sm" />
        </ToolbarButton>
      </div>

      {/* Links */}
      <div className="flex gap-1 border-r border-tathir-beige/30 pr-2">
        <ToolbarButton
          onClick={() => {
            if (editor.isActive('link')) {
              // If already a link, edit the existing link
              const href = editor.getAttributes('link').href;
              setLinkUrl(href || '');
            } else {
              // Check if text is selected
              const { from, to } = editor.state.selection;
              if (from !== to) {
                // Text is selected, suggest it as URL if it looks like one
                const selectedText = editor.state.doc.textBetween(from, to);
                if (selectedText.includes('.') && !selectedText.includes(' ')) {
                  setLinkUrl(selectedText);
                }
              }
            }
            setIsLinkDialogOpen(true);
          }}
          isActive={editor.isActive('link')}
          title={editor.isActive('link') ? "Edit Link" : "Add Link (Ctrl+K)"}
        >
          <FaLink className="text-sm" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={removeLink}
          title="Remove Link"
          disabled={!editor.isActive('link')}
        >
          <FaUnlink className="text-sm" />
        </ToolbarButton>
      </div>

      {/* Undo/Redo */}
      <div className="flex gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
          disabled={!editor.can().chain().focus().undo().run()}
        >
          <FaUndo className="text-sm" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
          disabled={!editor.can().chain().focus().redo().run()}
        >
          <FaRedo className="text-sm" />
        </ToolbarButton>
      </div>

      {/* Link Dialog */}
      {isLinkDialogOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-tathir-brown/20 rounded-b-lg p-4 shadow-lg z-20">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-tathir-dark-green mb-1">
                {editor.isActive('link') ? 'Edit Link URL' : 'Add Link URL'}
              </label>
              <input
                type="url"
                placeholder="https://example.com or mailto:email@domain.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 border border-tathir-brown/20 rounded-md focus:outline-none focus:ring-2 focus:ring-tathir-dark-green/20 focus:border-tathir-dark-green"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLink();
                  }
                  if (e.key === 'Escape') {
                    setIsLinkDialogOpen(false);
                    setLinkUrl('');
                  }
                }}
                autoFocus
              />
              {linkUrl && !linkUrl.startsWith('http') && !linkUrl.startsWith('mailto:') && (
                <p className="text-xs text-tathir-brown/60 mt-1">
                  URL will be automatically prefixed with "https://"
                </p>
              )}
              <div className="text-xs text-tathir-brown/50 mt-2 space-y-1">
                <p><strong>Tips:</strong></p>
                <p>• Select text first, then add a link to make it clickable</p>
                <p>• Press Enter to confirm, Escape to cancel</p>
                <p>• Use Ctrl+K (or Cmd+K) as a shortcut to open this dialog</p>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setIsLinkDialogOpen(false);
                  setLinkUrl('');
                }}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addLink}
                disabled={!linkUrl.trim()}
                className="px-3 py-1.5 text-sm bg-tathir-dark-green text-tathir-beige rounded-md hover:bg-tathir-maroon transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editor.isActive('link') ? 'Update Link' : 'Add Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Start writing your content...",
  minHeight = "12rem",
  disabled = false,
  className = ""
}) => {
  const [focused, setFocused] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'tiptap-heading'
          }
        },
        blockquote: {
          HTMLAttributes: {
            class: 'tiptap-blockquote'
          }
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'tiptap-code-block'
          }
        },
        code: {
          HTMLAttributes: {
            class: 'tiptap-inline-code'
          }
        }
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        protocols: ['http', 'https', 'mailto'],
        HTMLAttributes: {
          class: 'tiptap-link',
          target: '_blank',
          rel: 'noopener noreferrer'
        },
        validate: href => /^https?:\/\//.test(href) || /^mailto:/.test(href),
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // Update word and character counts
      const text = editor.getText();
      setCharCount(text.length);
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    },
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none ${minHeight} p-4 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
      }
    }
  });

  // Update content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  // Update counts on initial load
  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      setCharCount(text.length);
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded-t-lg"></div>
        <div className={`${minHeight} bg-gray-100 rounded-b-lg`}></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`
        border-2 transition-all duration-300 rounded-lg overflow-hidden
        ${focused 
          ? 'border-tathir-dark-green shadow-lg shadow-tathir-dark-green/20 transform scale-[1.001]' 
          : 'border-tathir-brown/30 hover:border-tathir-brown/50'
        }
        ${disabled ? 'opacity-60' : ''}
      `}>
        <MenuBar editor={editor} />
        
        <div className="bg-white relative">
          <EditorContent 
            editor={editor}
            className={`
              tiptap-editor
              ${minHeight}
              ${disabled ? 'pointer-events-none' : ''}
            `}
          />
          
          {/* Character/Word Count */}
          <div className="absolute bottom-2 right-2 flex gap-3 text-xs bg-gradient-to-r from-tathir-beige/90 to-tathir-cream/90 backdrop-blur-sm px-3 py-2 rounded-full border border-tathir-brown/20 shadow-sm">
            <span className="text-tathir-dark-green font-medium">{wordCount} words</span>
            <span className="text-tathir-brown/70">•</span>
            <span className="text-tathir-brown/80">{charCount} chars</span>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .tiptap-editor {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
        }
        
        .tiptap-editor h1.tiptap-heading {
          font-size: 2rem;
          font-weight: 700;
          margin: 1rem 0 0.5rem 0;
          color: var(--color-tathir-dark-green);
          line-height: 1.2;
          background: linear-gradient(135deg, var(--color-tathir-dark-green) 0%, var(--color-tathir-maroon) 50%, var(--color-tathir-light-green) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }
        
        .tiptap-editor h1.tiptap-heading::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, var(--color-tathir-dark-green) 0%, var(--color-tathir-light-green) 100%);
          border-radius: 2px;
        }
        
        .tiptap-editor h2.tiptap-heading {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          color: var(--color-tathir-maroon);
          line-height: 1.3;
          position: relative;
          padding-left: 16px;
        }
        
        .tiptap-editor h2.tiptap-heading::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 20px;
          background: linear-gradient(180deg, var(--color-tathir-dark-green) 0%, var(--color-tathir-light-green) 100%);
          border-radius: 2px;
        }
        
        .tiptap-editor h3.tiptap-heading {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          color: var(--color-tathir-dark-gray);
          line-height: 1.4;
          position: relative;
          padding-left: 12px;
        }
        
        .tiptap-editor h3.tiptap-heading::before {
          content: '●';
          position: absolute;
          left: 0;
          top: 0;
          color: var(--color-tathir-light-green);
          font-size: 0.8em;
        }
        
        .tiptap-editor p {
          margin: 0.5rem 0;
          line-height: 1.6;
          color: var(--color-tathir-dark-gray);
        }
        
        .tiptap-editor .tiptap-blockquote {
          border-left: 4px solid var(--color-tathir-light-green);
          margin: 1rem 0;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, var(--color-tathir-cream-light) 0%, var(--color-tathir-beige) 100%);
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: var(--color-tathir-dark-green);
          position: relative;
          box-shadow: 0 2px 4px rgb(from var(--color-tathir-light-green) r g b / 0.1);
        }
        
        .tiptap-editor .tiptap-blockquote::before {
          content: '"';
          position: absolute;
          top: -10px;
          left: 10px;
          font-size: 3rem;
          color: var(--color-tathir-light-green);
          opacity: 0.3;
          font-family: serif;
        }
        
        .tiptap-editor .tiptap-link {
          color: var(--color-tathir-dark-green);
          text-decoration: underline;
          text-decoration-color: var(--color-tathir-light-green);
          text-underline-offset: 3px;
          text-decoration-thickness: 2px;
          transition: all 0.2s ease-in-out;
          position: relative;
        }
        
        .tiptap-editor .tiptap-link:hover {
          color: var(--color-tathir-light-green);
          text-decoration-color: var(--color-tathir-dark-green);
          transform: translateY(-1px);
        }
        
        .tiptap-editor .tiptap-link:hover::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--color-tathir-dark-green), var(--color-tathir-light-green));
          border-radius: 1px;
        }
        
        .tiptap-editor .tiptap-inline-code {
          background: linear-gradient(135deg, var(--color-tathir-cream-light) 0%, var(--color-tathir-beige) 100%);
          border: 1px solid var(--color-tathir-cream);
          border-radius: 0.375rem;
          padding: 0.25rem 0.5rem;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Liberation Mono", "Courier New", monospace;
          font-size: 0.875em;
          color: var(--color-tathir-brown);
          font-weight: 500;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .tiptap-editor .tiptap-code-block {
          background-color: var(--color-tathir-dark-gray);
          color: var(--color-tathir-cream-light);
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1rem 0;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Liberation Mono", "Courier New", monospace;
          overflow-x: auto;
        }
        
        .tiptap-editor ul, .tiptap-editor ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        
        .tiptap-editor li {
          margin: 0.25rem 0;
          line-height: 1.6;
        }
        
        .tiptap-editor strong {
          font-weight: 600;
          color: #1f2937;
        }
        
        .tiptap-editor em {
          font-style: italic;
          color: #4b5563;
        }
        
        .tiptap-editor .ProseMirror-selectednode {
          outline: 2px solid #10b981;
          outline-offset: 2px;
        }
        
        .tiptap-editor .ProseMirror {
          outline: none;
        }
        
        .tiptap-editor p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

export default RichTextEditor