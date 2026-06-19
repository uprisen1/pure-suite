import { useState, useEffect } from 'react';
import {
  Shield,
  Moon,
  Sun,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Download,
  FilePlus,
  FileCode,
  Merge as MergeIcon,
  Scissors,
  RotateCw,
  FileImage,
  Hash,
  LayoutGrid,
  Stamp,
  Maximize,
  Briefcase,
  FileSpreadsheet,
  FileText,
  FileUp,
  FolderOpen,
} from 'lucide-react';
import {
  PDFToolId,
  PDFTool,
  ProcessingFile,
  SplitSettings,
  RotateSettings,
  NumberSettings,
  WatermarkSettings,
  ResizeSettings,
  ImageToPdfSettings,
  OrganizeSettings,
  EditPdfSettings,
} from './types';
import { FileUploader } from './components/FileUploader';
import { ToolConfig } from './components/ToolConfig';
import { WordEditor } from './components/WordEditor';
import {
  mergePDFs,
  splitPDF,
  rotatePDF,
  imagesToPDF,
  addWatermark,
  resizePDF,
  organizePDF,
  addPageNumbers,
  editPDF,
} from './lib/pdfService';
import {
  convertWordToPdf,
  convertExcelToPdf,
  convertPdfToWord,
  convertPdfToExcel,
} from './lib/conversionService';

// Standard 13 tools including visual PDF markup & formats converter suite
const TOOLS: PDFTool[] = [
  {
    id: 'merge',
    name: 'Merge PDF',
    shortDesc: 'Combine multiple PDF files into one continuous document in any custom order.',
    iconName: 'Merge',
    acceptTypes: '.pdf',
    multiple: true,
  },
  {
    id: 'split',
    name: 'Split PDF',
    shortDesc: 'Divide a PDF file into individual pages or extract custom page ranges.',
    iconName: 'Scissors',
    acceptTypes: '.pdf',
    multiple: false,
  },
  {
    id: 'edit-pdf',
    name: 'Edit PDF Overlay',
    shortDesc: 'Write custom text, headers, signatures, or markups directly onto the document canvas.',
    iconName: 'Stamp',
    acceptTypes: '.pdf',
    multiple: false,
  },
  {
    id: 'rotate',
    name: 'Rotate PDF',
    shortDesc: 'Flip specific pages or rotation angles of a PDF clockwise.',
    iconName: 'RotateCw',
    acceptTypes: '.pdf',
    multiple: false,
  },
  {
    id: 'jpeg-to-pdf',
    name: 'Image to PDF',
    shortDesc: 'Convert PNG, JPG, or WebP graphics into structured styled PDFs.',
    iconName: 'FileImage',
    acceptTypes: '.png,.jpg,.jpeg,.webp',
    multiple: true,
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    shortDesc: 'Directly convert Microsoft Word documents or text files (.doc, .docx, .txt) to PDF format.',
    iconName: 'FileText',
    acceptTypes: '.docx,.doc,.txt',
    multiple: false,
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    shortDesc: 'Render Excel spreadsheet data grids (.xlsx, .xls, .csv) to landscape aligned tables inside PDF.',
    iconName: 'FileSpreadsheet',
    acceptTypes: '.xlsx,.xls,.csv',
    multiple: false,
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    shortDesc: 'Extract and wrap PDF text layers into an editable Word document stream (.doc format).',
    iconName: 'FolderOpen',
    acceptTypes: '.pdf',
    multiple: false,
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    shortDesc: 'Scan text node tables from PDF files, compiling them into clean Excel tables.',
    iconName: 'FileUp',
    acceptTypes: '.pdf',
    multiple: false,
  },
  {
    id: 'page-numbers',
    name: 'Add Page Numbering',
    shortDesc: 'Stamp customized page numbers into footers or headers with coordinates.',
    iconName: 'Hash',
    acceptTypes: '.pdf',
    multiple: false,
  },
  {
    id: 'organize',
    name: 'Organize Pages',
    shortDesc: 'Specify matching boundaries / pages to keep and discard the rest.',
    iconName: 'LayoutGrid',
    acceptTypes: '.pdf',
    multiple: false,
  },
  {
    id: 'watermark',
    name: 'Add Watermark',
    shortDesc: 'Stamp diagonal transparent text labels across all PDF pages.',
    iconName: 'Stamp',
    acceptTypes: '.pdf',
    multiple: false,
  },
  {
    id: 'resize',
    name: 'Resize PDF Pages',
    shortDesc: 'Scale all PDF page heights and widths to standard layouts.',
    iconName: 'Maximize',
    acceptTypes: '.pdf',
    multiple: false,
  },
];

export default function App() {
  const [activeAppMode, setActiveAppMode] = useState<'pdf' | 'word'>('pdf');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [selectedToolId, setSelectedToolId] = useState<PDFToolId | null>(null);
  const [files, setFiles] = useState<ProcessingFile[]>([]);

  // Processing state managers
  const [processing, setProcessing] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Result metadata references
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');

  // Tool specific configurations states
  const [splitSettings, setSplitSettings] = useState<SplitSettings>({
    ranges: '1',
    splitAll: false,
  });
  const [rotateSettings, setRotateSettings] = useState<RotateSettings>({
    angle: 90,
    pages: 'all',
    pageRange: '1',
  });
  const [numberSettings, setNumberSettings] = useState<NumberSettings>({
    format: 'Page {n} of {count}',
    position: 'bottom-center',
    fontSize: 10,
    color: '#1e293b',
    startPage: 1,
  });
  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>({
    text: 'CONFIDENTIAL',
    fontSize: 50,
    color: '#7f8c8d',
    opacity: 0.4,
    angle: 45,
  });
  const [resizeSettings, setResizeSettings] = useState<ResizeSettings>({
    pageSize: 'A4',
    width: 595,
    height: 841,
  });
  const [imageToPdfSettings, setImageToPdfSettings] = useState<ImageToPdfSettings>({
    margin: 0,
    orientation: 'portrait',
  });
  const [organizeSettings, setOrganizeSettings] = useState<OrganizeSettings>({
    pagesToKeep: '1',
  });
  const [editSettings, setEditSettings] = useState<EditPdfSettings>({
    textToOverlay: 'AMENDMENT / COMPLIANT APPROVED',
    xPosition: 50,
    yPosition: 120,
    fontSize: 12,
    color: '#2563eb',
  });

  // Automatically load dark mode from body classes or default to dark
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Clean memory URLs
  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      files.forEach((f) => {
        if (f.previewUrl) {
          URL.revokeObjectURL(f.previewUrl);
        }
      });
    };
  }, [downloadUrl, files]);

  const activeTool = TOOLS.find((t) => t.id === selectedToolId) || null;

  const handleToolSelection = (toolId: PDFToolId) => {
    // Clear old files & settings resets
    files.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setFiles([]);
    setStatus('idle');
    setError(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    setSelectedToolId(toolId);
  };

  const handleAddFiles = (newFiles: File[]) => {
    const list = newFiles.map((f) => {
      let previewUrl: string | undefined = undefined;
      if (f.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(f);
      }
      return {
        id: crypto.randomUUID(),
        file: f,
        name: f.name,
        size: f.size,
        type: f.type,
        previewUrl,
      };
    });

    if (activeTool?.multiple) {
      setFiles((prev) => [...prev, ...list]);
    } else {
      // Clean previous image URLs
      files.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
      setFiles(list);
    }

    setStatus('idle');
    setError(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const match = prev.find((f) => f.id === id);
      if (match?.previewUrl) {
        URL.revokeObjectURL(match.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
    setStatus('idle');
    setError(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };

  const triggerDownloadAction = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const runOperation = async () => {
    if (files.length === 0) {
      setError('Please choose or drag at least one target document first.');
      return;
    }

    setProcessing(true);
    setStatus('idle');
    setError(null);

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    try {
      let resultBlob: Blob | null = null;
      let filename = 'processed_document.pdf';

      switch (selectedToolId) {
        case 'merge': {
          resultBlob = await mergePDFs(files.map((f) => f.file));
          filename = 'merged_document.pdf';
          break;
        }
        case 'split': {
          const res = await splitPDF(files[0].file, splitSettings.ranges, splitSettings.splitAll);
          resultBlob = res.blob;
          filename = res.filename;
          break;
        }
        case 'rotate': {
          resultBlob = await rotatePDF(
            files[0].file,
            rotateSettings.angle,
            rotateSettings.pages,
            rotateSettings.pageRange
          );
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_rotated.pdf`;
          break;
        }
        case 'jpeg-to-pdf': {
          resultBlob = await imagesToPDF(
            files.map((f) => f.file),
            imageToPdfSettings.margin,
            imageToPdfSettings.orientation
          );
          filename = 'converted_images.pdf';
          break;
        }
        case 'watermark': {
          resultBlob = await addWatermark(
            files[0].file,
            watermarkSettings.text,
            watermarkSettings.fontSize,
            watermarkSettings.color,
            watermarkSettings.opacity,
            watermarkSettings.angle
          );
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_watermarked.pdf`;
          break;
        }
        case 'resize': {
          resultBlob = await resizePDF(
            files[0].file,
            resizeSettings.pageSize,
            resizeSettings.width,
            resizeSettings.height
          );
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_resized.pdf`;
          break;
        }
        case 'organize': {
          resultBlob = await organizePDF(files[0].file, organizeSettings.pagesToKeep);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_organized.pdf`;
          break;
        }
        case 'page-numbers': {
          resultBlob = await addPageNumbers(
            files[0].file,
            numberSettings.format,
            numberSettings.position,
            numberSettings.fontSize,
            numberSettings.color,
            numberSettings.startPage
          );
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_numbered.pdf`;
          break;
        }
        case 'edit-pdf': {
          resultBlob = await editPDF(
            files[0].file,
            editSettings.textToOverlay,
            editSettings.xPosition,
            editSettings.yPosition,
            editSettings.fontSize,
            editSettings.color
          );
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_edited.pdf`;
          break;
        }
        case 'word-to-pdf': {
          resultBlob = await convertWordToPdf(files[0].file);
          filename = `${files[0].name.replace(/\.[^/.]+$/, "")}_converted.pdf`;
          break;
        }
        case 'excel-to-pdf': {
          resultBlob = await convertExcelToPdf(files[0].file);
          filename = `${files[0].name.replace(/\.[^/.]+$/, "")}_sheets.pdf`;
          break;
        }
        case 'pdf-to-word': {
          resultBlob = await convertPdfToWord(files[0].file);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_editable.doc`;
          break;
        }
        case 'pdf-to-excel': {
          resultBlob = await convertPdfToExcel(files[0].file);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_extracted_dataset.xls`;
          break;
        }
        default:
          throw new Error('Unsupported processing utility action.');
      }

      if (resultBlob) {
        const url = URL.createObjectURL(resultBlob);
        setDownloadUrl(url);
        setDownloadFilename(filename);
        setStatus('success');

        // Automatically trigger download for best convenience
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('Empty output parsed by document compiler.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'An unexpected error occurred while modifying document parameters.');
      setStatus('error');
    } finally {
      setProcessing(false);
    }
  };

  const renderToolIcon = (iconName: string, className: string = 'w-6 h-6') => {
    switch (iconName) {
      case 'Merge':
        return <MergeIcon className={className} />;
      case 'Scissors':
        return <Scissors className={className} />;
      case 'RotateCw':
        return <RotateCw className={className} />;
      case 'FileImage':
        return <FileImage className={className} />;
      case 'Hash':
        return <Hash className={className} />;
      case 'LayoutGrid':
        return <LayoutGrid className={className} />;
      case 'Stamp':
        return <Stamp className={className} />;
      case 'Maximize':
        return <Maximize className={className} />;
      case 'FileSpreadsheet':
        return <FileSpreadsheet className={className} />;
      case 'FileText':
        return <FileText className={className} />;
      case 'FileUp':
        return <FileUp className={className} />;
      case 'FolderOpen':
        return <FolderOpen className={className} />;
      default:
        return <FilePlus className={className} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Upper Navigation Header bar */}
      <header className="sticky top-0 z-35 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 cursor-pointer text-white shadow-sm transition"
              onClick={() => {
                setActiveAppMode('pdf');
                handleToolSelection(null as any);
              }}
            >
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <span
                className="font-bold text-lg tracking-tight select-none cursor-pointer hover:opacity-90 transition dark:text-white"
                onClick={() => {
                  setActiveAppMode('pdf');
                  handleToolSelection(null as any);
                }}
              >
                Pure<span className="text-emerald-500 font-extrabold font-mono">Suite</span>
              </span>
              <span className="hidden sm:inline-block ml-3 px-2 py-0.5 border border-emerald-500/35 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20 rounded-full text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono uppercase">
                GitHub Pages Online Edition
              </span>
            </div>
          </div>

          {/* Nav switcher tab elements */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-850">
            <button
              onClick={() => {
                setActiveAppMode('pdf');
                handleToolSelection(null as any);
              }}
              className={`p-2 px-4 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1.5 ${
                activeAppMode === 'pdf'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-205'
              }`}
            >
              <FileCode className="w-4 h-4" /> PDF Processor
            </button>
            <button
              onClick={() => setActiveAppMode('word')}
              className={`p-2 px-4 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1.5 ${
                activeAppMode === 'word'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-205'
              }`}
            >
              <FileText className="w-4 h-4" /> Word Studio Editor
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition"
              aria-label="Toggle Theme Mode"
              title="Toggle Theme Mode"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {selectedToolId && (
              <button
                onClick={() => handleToolSelection(null as any)}
                className="hidden sm:flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition text-slate-700 dark:text-slate-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Utilities Menu
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Core */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* VIEW A: Microsoft Word Studio Mode */}
        {activeAppMode === 'word' ? (
          <WordEditor />
        ) : (
          /* VIEW B: PDF Sandbox Platform Mode */
          <>
            {/* VIEW B-1: Home Dashboard Grid of PDF Tools */}
            {!selectedToolId && (
              <div className="space-y-6">
                <div className="text-center max-w-2xl mx-auto space-y-2 mt-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                    Online Web & PDF Deployment Engine
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    High-performance client-side document compiler, fully compliant with GitHub Pages static online hosting. Convert, markup, split, and merge files online instantly.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  {TOOLS.map((tool) => (
                    <div
                      key={tool.id}
                      onClick={() => handleToolSelection(tool.id)}
                      id={`tool-card-${tool.id}`}
                      className="group bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/50 hover:shadow-md dark:hover:shadow-emerald-950/10 cursor-pointer transition-all duration-200 flex flex-col justify-between"
                    >
                      <div className="space-y-3.5">
                        <div className="w-10 h-10 rounded-lg p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition group-hover:bg-emerald-500 group-hover:text-white shadow-sm">
                          {renderToolIcon(tool.iconName, 'w-5.5 h-5.5')}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors text-sm">
                            {tool.name}
                          </h3>
                          <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-normal">
                            {tool.shortDesc}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/85 flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors">
                        <span className="font-mono">{tool.acceptTypes.toUpperCase().replace(/\./g, '  ')}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">Launch →</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Privacy Shield Info panel */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-sm">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-full shrink-0 text-emerald-600 dark:text-emerald-400">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      GitHub Pages Serverless Cloud Architecture
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                      Designed explicitly to run client-side on flat public CDNs and online GitHub Pages domains. No database servers or third-party APIs required, providing ultra-responsive results on any network connection.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW B-2: Active PDF Workspace Interface */}
            {selectedToolId && activeTool && (
              <div className="space-y-5 animate-fade-in">
                
                {/* Context Header bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToolSelection(null as any)}
                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                      title="Return to Menu"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 rounded-lg p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      {renderToolIcon(activeTool.iconName, 'w-4.5 h-4.5')}
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-slate-800 dark:text-slate-100">
                        {activeTool.name}
                      </h2>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wide font-semibold">
                        Online Cloud Workflow Utility
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {files.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          files.forEach((f) => {
                            if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
                          });
                          setFiles([]);
                          setStatus('idle');
                          setError(null);
                          if (downloadUrl) {
                            URL.revokeObjectURL(downloadUrl);
                            setDownloadUrl(null);
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 border border-rose-200 dark:border-rose-950/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-semibold transition cursor-pointer"
                        title="Clear files queue"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Clear Workspace
                      </button>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => handleToolSelection(null as any)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      Return to Tools
                    </button>
                  </div>
                </div>

                {/* Split Columns Grid: Upload section vs Sidebar Tool Preferences */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Segment: Dropzone & Files view (8 Columns) */}
                  <div className="lg:col-span-8 space-y-4">
                    <FileUploader
                      accept={activeTool.acceptTypes}
                      multiple={activeTool.multiple}
                      files={files}
                      onAddFiles={handleAddFiles}
                      onRemoveFile={handleRemoveFile}
                      onReorderFiles={setFiles}
                    />
                  </div>

                  {/* Right Segment: Configuration settings & Execution (4 Columns) */}
                  <div className="lg:col-span-4 space-y-4">
                    <ToolConfig
                      toolId={selectedToolId}
                      splitSettings={splitSettings}
                      setSplitSettings={setSplitSettings}
                      rotateSettings={rotateSettings}
                      setRotateSettings={setRotateSettings}
                      numberSettings={numberSettings}
                      setNumberSettings={setNumberSettings}
                      watermarkSettings={watermarkSettings}
                      setWatermarkSettings={setWatermarkSettings}
                      resizeSettings={resizeSettings}
                      setResizeSettings={setResizeSettings}
                      imageToPdfSettings={imageToPdfSettings}
                      setImageToPdfSettings={setImageToPdfSettings}
                      organizeSettings={organizeSettings}
                      setOrganizeSettings={setOrganizeSettings}
                      editSettings={editSettings}
                      setEditSettings={setEditSettings}
                    />

                    {/* Warning Alert state */}
                    {status === 'error' && error && (
                      <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-950/60 rounded-xl text-rose-800 dark:text-rose-300 flex items-start gap-2.5 animate-bounce-short">
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-xs uppercase tracking-wide">Operation Failed</h4>
                          <p className="text-xs mt-1 leading-normal">{error}</p>
                        </div>
                      </div>
                    )}

                    {/* Success State Screen */}
                    {status === 'success' && downloadUrl && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-950/60 rounded-xl text-emerald-800 dark:text-emerald-300 space-y-3.5 flex flex-col">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-450">Success! Compiled</h4>
                            <p className="text-xs mt-1 leading-normal">
                              The browser automatic download was initiated. If it did not launch automatically, click the manual button below.
                            </p>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={triggerDownloadAction}
                          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                        >
                          <Download className="w-4 h-4" /> Download Processed File
                        </button>
                        
                        <div className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-mono truncate">
                          {downloadFilename}
                        </div>
                      </div>
                    )}

                    {/* Primary compiling trigger button */}
                    <button
                      type="button"
                      id="process-raw-pdf"
                      disabled={files.length === 0 || processing}
                      onClick={runOperation}
                      className={`w-full py-3.5 px-5 select-none rounded-xl font-bold text-sm tracking-tight shadow-md flex items-center justify-center gap-2.5 transition active:scale-[0.985] ${
                        files.length === 0
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none border border-slate-300 dark:border-slate-800/80'
                          : processing
                          ? 'bg-emerald-600/70 text-slate-100 cursor-wait'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer'
                      }`}
                    >
                      {processing ? (
                        <>
                          <RefreshCw className="w-4.5 h-4.5 animate-spin" /> Processing Documents...
                        </>
                      ) : (
                        <>
                          Apply parameters & compile
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Decorative footer elements */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © 2026 PureSuite Platform. Optimized for instant online deployment on GitHub Pages static sites with zero server dependencies.
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 dark:text-slate-500 font-mono flex-wrap">
            <span>🌐 Online Web Edition</span>
            <span>•</span>
            <span>🐙 GitHub Pages Compatible</span>
            <span>•</span>
            <span>⚡ Client-Side Web Assembly</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
