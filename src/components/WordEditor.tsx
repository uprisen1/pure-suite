import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Save,
  Download,
  Plus,
  Trash2,
  Undo2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FileDown,
  Sparkles,
  HelpCircle,
  FilePlus,
  BookOpen,
  Calendar,
  CheckCircle,
  PenTool,
  Printer,
  Table,
  Heading1,
  Heading2,
  RefreshCw,
  Search,
} from 'lucide-react';

interface SavedDoc {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export const WordEditor: React.FC = () => {
  const [docs, setDocs] = useState<SavedDoc[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>('');
  const [title, setTitle] = useState<string>('Untitled Document');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [activeRibbonTab, setActiveRibbonTab] = useState<'home' | 'insert' | 'layout' | 'tools'>('home');
  const [selectedFont, setSelectedFont] = useState<string>('Calibri');
  const [fontSize, setFontSize] = useState<string>('12pt');
  const [textColor, setTextColor] = useState<string>('#0f172a');
  
  // Stats counter
  const [charCount, setCharCount] = useState<number>(0);
  const [wordCount, setWordCount] = useState<number>(0);

  const editorRef = useRef<HTMLDivElement>(null);

  // Load templates list or from local storage database
  useEffect(() => {
    const saved = localStorage.getItem('pureword_docs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SavedDoc[];
        setDocs(parsed);
        if (parsed.length > 0) {
          const first = parsed[0];
          setActiveDocId(first.id);
          setTitle(first.title);
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.innerHTML = first.content;
              updateStats();
            }
          }, 50);
        } else {
          initNewBlankDoc();
        }
      } catch (e) {
        initNewBlankDoc();
      }
    } else {
      initNewBlankDoc();
    }
  }, []);

  const saveDocsToStore = (items: SavedDoc[]) => {
    localStorage.setItem('pureword_docs', JSON.stringify(items));
    setDocs(items);
  };

  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    setCharCount(text.length);
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setIsSaved(false);
  };

  const initNewBlankDoc = (initialContent?: string, initialTitle?: string) => {
    const newId = crypto.randomUUID();
    const newDocObj: SavedDoc = {
      id: newId,
      title: initialTitle || 'Untitled Document',
      content: initialContent || '<p>Start typing your formatted word document content here...</p>',
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextList = [newDocObj, ...docs];
    saveDocsToStore(nextList);
    setActiveDocId(newId);
    setTitle(newDocObj.title);
    setIsSaved(true);

    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = newDocObj.content;
        updateStats();
      }
    }, 50);
  };

  // Pre-configured elegant MS Word templates
  const applyTemplate = (type: string) => {
    let content = '';
    let name = '';
    
    if (type === 'agenda') {
      name = 'Meeting Agenda Template';
      content = `
        <h1 style="text-align: center; color: #1e3a8a; font-family: Arial;">MEETING AGENDA</h1>
        <p style="text-align: center; color: #64748b;">Date: ${new Date().toLocaleDateString()} | Time: 10:00 AM | Location: Conference Suite B</p>
        <hr style="border: 0.5px solid #cbd5e1" />
        <h3 style="color: #2563eb;">1. Objectives</h3>
        <p>Review the quarterly processing targets and align on server security schemas.</p>
        <h3 style="color: #2563eb;">2. Expected Deliverables</h3>
        <ul>
          <li>Interactive document compiler workflow charts.</li>
          <li>System compliance sign-off rules.</li>
        </ul>
        <h3 style="color: #2563eb;">3. Action Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Owner</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Task Reference</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">Development Group</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">Integrate converter files</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; color: #10b981;">Done</td>
            </tr>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">Security Audit Team</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">Sign off memory logs</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; color: #d97706;">Pending</td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (type === 'letter') {
      name = 'Professional Cover Letter';
      content = `
        <p><strong>Your Name</strong><br>123 Enterprise Way<br>City, State, Zip</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
        <p><strong>To: Hiring Committee</strong><br>Secure Sandbox Systems Inc.</p>
        <br>
        <p>Dear Hiring Committee,</p>
        <p>I am writing to express my eager interest in the open Technical Analyst role at Secure Sandbox Systems. With extensive prior experience managing web layout engines and localized memory configurations, I excel at producing pristine work products under strict sandbox restrictions.</p>
        <p>Thank you for your valuable time and consideration. I look forward to discussing how my experience fits your goals.</p>
        <br>
        <p>Sincerely,</p>
        <p style="font-family: cursive; font-size: 14pt; color: #1e3a8a;">Your Signature</p>
        <p>Your Name Here</p>
      `;
    } else if (type === 'notes') {
      name = 'Project Notes';
      content = `
        <h2 style="color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 4px;">🎯 Project PureSuite Goals</h2>
        <p>Secure memory computing client-side document processing workbench.</p>
        <h3>Key Pillars:</h3>
        <ul>
          <li><strong>Zero Data Exfiltration:</strong> Completely isolates files inside runtime buffers.</li>
          <li><strong>Universal Conversion:</strong> Instantly convert Word, Excel, and PDF files.</li>
          <li><strong>Rich Ribbon Sandbox:</strong> Full Microsoft Word clone workspace.</li>
        </ul>
      `;
    }

    initNewBlankDoc(content, name);
  };

  const handleSelectDoc = (id: string) => {
    const docObj = docs.find(d => d.id === id);
    if (!docObj) return;
    
    // Save current active document progress before switching
    if (activeDocId) {
      const updatedList = docs.map(d => {
        if (d.id === activeDocId) {
          return { ...d, title, content: editorRef.current?.innerHTML || '' };
        }
        return d;
      });
      saveDocsToStore(updatedList);
    }

    setActiveDocId(id);
    setTitle(docObj.title);
    setIsSaved(true);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = docObj.content;
        updateStats();
      }
    }, 50);
  };

  const triggerSaveAction = () => {
    if (!activeDocId) return;
    const bodyStr = editorRef.current?.innerHTML || '';
    const updated = docs.map(d => {
      if (d.id === activeDocId) {
        return {
          ...d,
          title,
          content: bodyStr,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return d;
    });
    saveDocsToStore(updated);
    setIsSaved(true);
  };

  const triggerDeleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = docs.filter(d => d.id !== id);
    saveDocsToStore(remaining);
    if (activeDocId === id) {
      if (remaining.length > 0) {
        handleSelectDoc(remaining[0].id);
      } else {
        initNewBlankDoc();
      }
    }
  };

  // Rich Text action operations using ExecCommand (widely compatible in edit mode)
  const applyStyle = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    updateStats();
  };

  // Standard Word Download action (.doc compatible)
  const downloadWordDoc = () => {
    const rawHTML = editorRef.current?.innerHTML || '';
    
    // Wrap inside native Microsoft Office structure for flawless word processing formatting
    const fileContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${title}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body {
            font-family: 'Calibri', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            padding: 1.5in;
          }
          h1 { font-size: 20pt; color: #1e3a8a; margin-bottom: 12px; }
          h2 { font-size: 16pt; color: #0f172a; margin-top: 15px; }
          h3 { font-size: 13pt; color: #2563eb; }
          p { margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          td { border: 1px solid #cbd5e1; padding: 8px; }
        </style>
      </head>
      <body>
        ${rawHTML}
      </body>
      </html>
    `;

    const blob = new Blob([fileContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.trim().replace(/\s+/g, '_') || 'document'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTextFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      // Convert linebreaks to paragraphs
      const pFormatted = res.split('\n').map(l => `<p>${l.trim()}</p>`).join('');
      initNewBlankDoc(pFormatted, file.name.replace(/\.[^/.]+$/, ""));
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span className="p-1 px-2.5 rounded bg-blue-600 text-white font-mono text-sm shadow">Word</span>
            PureWord Sandbox Clone
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create, style, insert tables, import, and save Microsoft Word document assemblies inside the client session sandbox.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="file"
            id="import-text"
            accept=".txt,.doc,.docx"
            className="hidden"
            onChange={handleImportTextFile}
          />
          <label
            htmlFor="import-text"
            className="flex items-center gap-1.5 p-2 px-3 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 cursor-pointer shadow-sm transition"
          >
            <FileDown className="w-4 h-4 text-blue-500" /> Open External Doc
          </label>

          <button
            onClick={() => initNewBlankDoc()}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Blank Doc
          </button>
        </div>
      </div>

      {/* Outer workspace Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        
        {/* Left column: Sidebar manager */}
        <div className="xl:col-span-3 space-y-4">
          
          {/* Preset Word Quick Templates */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Word Document Templates
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => applyTemplate('agenda')}
                className="flex items-center gap-2.5 p-2 px-3 text-left rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800/60"
              >
                <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <div className="font-semibold text-[11.5px]">Meeting Agenda Layout</div>
                  <div className="text-[10px] text-slate-400">Formal tabular schedule structure</div>
                </div>
              </button>

              <button
                onClick={() => applyTemplate('letter')}
                className="flex items-center gap-2.5 p-2 px-3 text-left rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800/60"
              >
                <PenTool className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <div className="font-semibold text-[11.5px]">Professional Cover Letter</div>
                  <div className="text-[10px] text-slate-400">Signature guidelines structure</div>
                </div>
              </button>

              <button
                onClick={() => applyTemplate('notes')}
                className="flex items-center gap-2.5 p-2 px-3 text-left rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800/60"
              >
                <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-semibold text-[11.5px]">Project Notes & Goals</div>
                  <div className="text-[10px] text-slate-400">Structured markdown bullets</div>
                </div>
              </button>
            </div>
          </div>

          {/* Draft list section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Saved Document Drafts ({docs.length})
              </h3>
            </div>

            {docs.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                No local draft documents found
              </div>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc.id)}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition border ${
                      activeDocId === doc.id
                        ? 'bg-blue-50/70 border-blue-200 text-blue-900 dark:bg-blue-950/20 dark:border-blue-900/60 dark:text-blue-300'
                        : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold truncate">{doc.title}</div>
                        <div className="text-[10px] text-slate-400">Last saved {doc.updatedAt}</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => triggerDeleteDoc(doc.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Delete draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right column: MS Word Editor Board */}
        <div className="xl:col-span-9 bg-slate-100/60 dark:bg-slate-900/40 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          
          {/* Header Bar containing Document title */}
          <div className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 p-3 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:max-w-md">
              <span className="text-xs font-semibold text-slate-400">Title:</span>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsSaved(false);
                }}
                className="bg-transparent font-bold text-slate-800 dark:text-slate-150 focus:bg-white dark:focus:bg-slate-950 px-2.5 py-1 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-800/80 outline-none w-full text-sm"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                isSaved ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
              }`}>
                {isSaved ? 'Saved locally' : 'Unsaved changes'}
              </span>

              <button
                onClick={triggerSaveAction}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold transition shadow-sm cursor-pointer"
                title="Save document locally"
              >
                <Save className="w-3.5 h-3.5" /> Save
              </button>

              <button
                onClick={downloadWordDoc}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-md text-xs font-semibold transition text-slate-800 dark:text-slate-200 cursor-pointer"
                title="Download formatted word file"
              >
                <Download className="w-3.5 h-3.5" /> Export Word
              </button>
            </div>
          </div>

          {/* Microsoft Word Classic Ribbon Section */}
          <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-2 space-y-2 select-none">
            
            {/* Tab Swappers */}
            <div className="flex gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-900">
              {(['home', 'insert', 'layout'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveRibbonTab(tab)}
                  className={`px-3.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition ${
                    activeRibbonTab === tab
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-450 border border-blue-200 dark:border-blue-900'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {tab === 'home' ? 'Home Ribbon' : tab === 'insert' ? 'Insert Elements' : 'Page Layout'}
                </button>
              ))}
            </div>

            {/* TAB-1 PANEL: Font formats & Alignments */}
            {activeRibbonTab === 'home' && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                
                {/* Font Selector style */}
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-905 px-1.5 py-1 rounded-lg border border-slate-250 dark:border-slate-800">
                  <select
                    value={fontSize}
                    onChange={(e) => {
                      setFontSize(e.target.value);
                      applyStyle('fontSize', e.target.value);
                    }}
                    className="text-xs bg-transparent dark:text-white outline-none border-0"
                    title="Font size slider"
                  >
                    <option value="3">Small (10pt)</option>
                    <option value="4">Regular (12pt)</option>
                    <option value="5">Large (14pt)</option>
                    <option value="6">Heading (18pt)</option>
                    <option value="7">Display (24pt)</option>
                  </select>
                </div>

                {/* Bold, Italic, Underline styles */}
                <div className="flex items-center border-r border-slate-200 dark:border-slate-800 pr-2">
                  <button
                    onClick={() => applyStyle('bold')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded text-slate-600 dark:text-slate-300"
                    title="Bold text"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => applyStyle('italic')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded text-slate-600 dark:text-slate-300"
                    title="Italic text"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => applyStyle('underline')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded text-slate-600 dark:text-slate-300"
                    title="Underline text"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                </div>

                {/* Para headers */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => applyStyle('formatBlock', 'h1')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded text-slate-600 dark:text-slate-300 text-xs font-bold"
                    title="Header 1 style"
                  >
                    H1
                  </button>
                  <button
                    onClick={() => applyStyle('formatBlock', 'h2')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded text-slate-600 dark:text-slate-300 text-xs font-bold"
                    title="Header 2 style"
                  >
                    H2
                  </button>
                  <button
                    onClick={() => applyStyle('formatBlock', 'p')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded text-slate-600 dark:text-slate-300 text-xs font-semibold"
                    title="Normal paragraph text"
                  >
                    Para
                  </button>
                </div>

                {/* Alignments */}
                <div className="flex items-center border-l border-r border-slate-200 dark:border-slate-800 px-2">
                  <button
                    onClick={() => applyStyle('justifyLeft')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded text-slate-600 dark:text-slate-300"
                    title="Left Align"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => applyStyle('justifyCenter')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded text-slate-600 dark:text-slate-300"
                    title="Center Align"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => applyStyle('justifyRight')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded text-slate-600 dark:text-slate-300"
                    title="Right Align"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => applyStyle('justifyFull')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded text-slate-600 dark:text-slate-300"
                    title="Justify Align"
                  >
                    <AlignJustify className="w-4 h-4" />
                  </button>
                </div>

                {/* Bullets lists */}
                <div className="flex items-center gap-1 block">
                  <button
                    onClick={() => applyStyle('insertUnorderedList')}
                    className="p-1 py-0.5 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-[10px] font-semibold"
                  >
                    • Bullet list
                  </button>
                  <button
                    onClick={() => applyStyle('insertOrderedList')}
                    className="p-1 py-0.5 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-[10px] font-semibold"
                  >
                    1. Number list
                  </button>
                </div>

              </div>
            )}

            {/* TAB-2 PANEL: Insert features templates */}
            {activeRibbonTab === 'insert' && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const tableHTML = `<table style="width:100%; border-collapse:collapse; margin: 10px 0;"><thead style="background-color:#f8fafc;"><tr><th style="border:1px solid #cbd5e1; padding:6px;">Header 1</th><th style="border:1px solid #cbd5e1; padding:6px;">Header 2</th></tr></thead><tbody><tr><td style="border:1px solid #cbd5e1; padding:6px;">Row cell 1</td><td style="border:1px solid #cbd5e1; padding:6px;">Row cell 2</td></tr></tbody></table>`;
                    applyStyle('insertHTML', tableHTML);
                  }}
                  className="flex items-center gap-1 p-1 px-2 text-[11px] font-medium rounded border border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <Table className="w-3.5 h-3.5 text-blue-500" /> Insert Grid Table
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const lineHTML = `<hr style="border:none; border-top:1px solid #cbd5e1; margin: 15px 0;" />`;
                    applyStyle('insertHTML', lineHTML);
                  }}
                  className="flex items-center gap-1 p-1 px-2 text-[11px] font-medium rounded border border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Horizontal Break
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const sigHTML = `<div style="margin-top: 25px;"><p style="font-family:cursive; font-size:13pt; color:#1e40af;">Digital Signature</p><div style="width:150px; border-bottom:1px solid #94a3b8;"></div><p style="text-transform:uppercase; font-size:9px; color:#64748b; margin-top:2px;">Authorized Seal</p></div>`;
                    applyStyle('insertHTML', sigHTML);
                  }}
                  className="flex items-center gap-1 p-1 px-2 text-[11px] font-medium rounded border border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Signature Stamp block
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const calloutHTML = `<div style="padding: 12px; background-color: #eff6ff; border-left: 4px solid #2563eb; color: #1e3a8a; border-radius: 4px; margin: 10px 0;"><p><strong>Sandbox Warning:</strong> This callout block contains security compliance protocols.</p></div>`;
                    applyStyle('insertHTML', calloutHTML);
                  }}
                  className="flex items-center gap-1 p-1 px-2 text-[11px] font-medium rounded border border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Compliance Alert Box
                </button>
              </div>
            )}

            {/* TAB-3 PANEL: Layout structures */}
            {activeRibbonTab === 'layout' && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-medium">Margining:</span>
                  <select
                    className="bg-transparent text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5"
                    title="Margin template select"
                  >
                    <option>Standard Margins (1 in)</option>
                    <option>Narrow Margins (0.5 in)</option>
                    <option>Wide Margins (1.5 in)</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-medium">Paper Standards:</span>
                  <select
                    className="bg-transparent text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5"
                    title="Paper standard select"
                  >
                    <option>A4 Paper Layout (595x841)</option>
                    <option>US Letter Standards</option>
                  </select>
                </div>
              </div>
            )}

          </div>

          {/* Interactive Document Paper Container */}
          <div className="flex-1 p-6 md:p-10 flex items-center justify-center overflow-auto min-h-[480px]">
            <div
              ref={editorRef}
              contentEditable
              onInput={updateStats}
              className="w-full max-w-[816px] min-h-[1056px] bg-white text-slate-900 p-[1.2in] border border-slate-250 dark:border-slate-850 shadow-lg rounded outline-none cursor-text prose prose-slate focus:ring-1 focus:ring-blue-500/20"
              style={{
                fontFamily: 'Calibri, sans-serif',
                lineHeight: '1.6',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
              }}
            />
          </div>

          {/* MS Word Bottom Status Bar */}
          <div className="bg-slate-100 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 p-2 text-[10.5px] font-mono text-slate-400 dark:text-slate-500 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-500" /> ACTIVE DRAFT: {title}
              </span>
              <span>•</span>
              <span>WORDS: <strong className="text-slate-600 dark:text-slate-300">{wordCount}</strong></span>
              <span>•</span>
              <span>CHARACTERS: <strong className="text-slate-600 dark:text-slate-300">{charCount}</strong></span>
            </div>

            <div className="flex items-center gap-3">
              <span>Zoom level 100% (A4)</span>
              <span>•</span>
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> sandbox engine online
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
