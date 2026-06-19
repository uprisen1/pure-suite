import React, { useRef, useState } from 'react';
import { Upload, FileText, Trash2, ArrowUp, ArrowDown, ShieldAlert } from 'lucide-react';
import { ProcessingFile } from '../types';

interface FileUploaderProps {
  accept: string;
  multiple: boolean;
  files: ProcessingFile[];
  onAddFiles: (newFiles: File[]) => void;
  onRemoveFile: (id: string) => void;
  onReorderFiles?: (files: ProcessingFile[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  multiple,
  files,
  onAddFiles,
  onRemoveFile,
  onReorderFiles,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      // Filter based on accept attribute extension pattern
      const extensions = accept.split(',').map(ext => ext.trim().toLowerCase());
      const filtered = droppedFiles.filter((item: File) => {
        const ext = `.${item.name.split('.').pop()?.toLowerCase() || ''}`;
        return accept === '*' || extensions.includes(ext) || item.type.includes(accept.replace('*', ''));
      });

      if (filtered.length > 0) {
        onAddFiles(multiple ? filtered : [filtered[0]]);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      onAddFiles(multiple ? selected : [selected[0]]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (!onReorderFiles) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= files.length) return;

    const list = [...files];
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;
    onReorderFiles(list);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Target upload area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`relative cursor-pointer transition-all duration-200 py-12 px-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center outline-none
          ${
            isDragActive
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-inner scale-[0.99]'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-400 dark:hover:border-slate-600'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
        />

        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 mb-4 shadow-sm">
          <Upload className="w-8 h-8" />
        </div>

        <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Drag & drop your {multiple ? 'files' : 'file'} here, or{' '}
          <span className="text-emerald-500 hover:text-emerald-600 font-medium underline">
            browse computer
          </span>
        </p>
        <p className="text-xs text-slate-400 mt-1.5 font-mono">
          Accepted types: {accept === '*' ? 'Any File' : accept.toUpperCase()}
        </p>

        {files.length > 0 && (
          <div className="absolute right-3 top-3 px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded text-xs font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            {files.length} active {files.length === 1 ? 'file' : 'files'}
          </div>
        )}
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2.5 p-3.5 bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-lg text-xs leading-relaxed text-slate-600 dark:text-slate-400">
        <ShieldAlert className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">Local Protection Active:</span>{' '}
          Processing is completely client-side. Your uploads are loaded directly within your sandbox memory — no elements are uploaded to remote servers. Runs 100% locally in your browser.
        </div>
      </div>

      {/* Files list */}
      {files.length > 0 && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex justify-between items-center">
            <span>List of uploaded files ({files.length})</span>
            {multiple && onReorderFiles && (
              <span className="normal-case text-slate-400 font-normal">Use arrow keys/buttons to set sequence order</span>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
            {files.map((item, index) => (
              <div
                key={item.id}
                className="p-3.5 flex items-center justify-between gap-4 group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded shrink-0">
                      <FileText className="w-5.5 h-5.5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                      {formatSize(item.size)}
                    </p>
                  </div>
                </div>

                {/* Operations */}
                <div className="flex items-center gap-1">
                  {/* Reordering */}
                  {multiple && onReorderFiles && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(index, 'up');
                        }}
                        disabled={index === 0}
                        className={`p-1.5 rounded transition ${
                          index === 0
                            ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(index, 'down');
                        }}
                        disabled={index === files.length - 1}
                        className={`p-1.5 rounded transition ${
                          index === files.length - 1
                            ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(item.id);
                    }}
                    className="p-1.5 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition"
                    title="Remove file"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
