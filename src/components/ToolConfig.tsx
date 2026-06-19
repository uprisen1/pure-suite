import React from 'react';
import {
  SplitSettings,
  RotateSettings,
  NumberSettings,
  WatermarkSettings,
  ResizeSettings,
  ImageToPdfSettings,
  OrganizeSettings,
  EditPdfSettings,
  PDFToolId,
} from '../types';
import { Settings, FileText, Compass, LayoutGrid, Type, Palette, Sparkles, Sliders } from 'lucide-react';

interface ToolConfigProps {
  toolId: PDFToolId;
  splitSettings: SplitSettings;
  setSplitSettings: React.Dispatch<React.SetStateAction<SplitSettings>>;
  rotateSettings: RotateSettings;
  setRotateSettings: React.Dispatch<React.SetStateAction<RotateSettings>>;
  numberSettings: NumberSettings;
  setNumberSettings: React.Dispatch<React.SetStateAction<NumberSettings>>;
  watermarkSettings: WatermarkSettings;
  setWatermarkSettings: React.Dispatch<React.SetStateAction<WatermarkSettings>>;
  resizeSettings: ResizeSettings;
  setResizeSettings: React.Dispatch<React.SetStateAction<ResizeSettings>>;
  imageToPdfSettings: ImageToPdfSettings;
  setImageToPdfSettings: React.Dispatch<React.SetStateAction<ImageToPdfSettings>>;
  organizeSettings: OrganizeSettings;
  setOrganizeSettings: React.Dispatch<React.SetStateAction<OrganizeSettings>>;
  editSettings: EditPdfSettings;
  setEditSettings: React.Dispatch<React.SetStateAction<EditPdfSettings>>;
}

export const ToolConfig: React.FC<ToolConfigProps> = ({
  toolId,
  splitSettings,
  setSplitSettings,
  rotateSettings,
  setRotateSettings,
  numberSettings,
  setNumberSettings,
  watermarkSettings,
  setWatermarkSettings,
  resizeSettings,
  setResizeSettings,
  imageToPdfSettings,
  setImageToPdfSettings,
  organizeSettings,
  setOrganizeSettings,
  editSettings,
  setEditSettings,
}) => {
  const positions: Array<{ value: NumberSettings['position']; label: string }> = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-center', label: 'Top Center' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-center', label: 'Bottom Center' },
    { value: 'bottom-right', label: 'Bottom Right' },
  ];

  const colors = [
    { value: '#1e293b', name: 'Slate' },
    { value: '#2563eb', name: 'Blue' },
    { value: '#059669', name: 'Emerald' },
    { value: '#dc2626', name: 'Red' },
    { value: '#7f8c8d', name: 'Gray' },
    { value: '#d97706', name: 'Amber' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <Settings className="w-5 h-5 text-emerald-500 shrink-0" />
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
          Processing Settings
        </h3>
      </div>

      {toolId === 'merge' && (
        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg">
          No additional options required. Merge will bundle all uploaded files sequentially. Use the reorder arrow keys inside the files list on the left to organize your pages in the desired sequence before executing.
        </div>
      )}

      {toolId === 'split' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="splitAll"
              className="w-4 h-4 text-emerald-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded focus:ring-emerald-500"
              checked={splitSettings.splitAll}
              onChange={(e) =>
                setSplitSettings((prev) => ({ ...prev, splitAll: e.target.checked }))
              }
            />
            <label htmlFor="splitAll" className="text-sm font-medium text-slate-700 dark:text-slate-200 select-none cursor-pointer">
              Split into single-page PDF files (.ZIP)
            </label>
          </div>

          {!splitSettings.splitAll && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                Extract Page Ranges
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-200 font-mono"
                placeholder="e.g. 1-3, 5, 8-12"
                value={splitSettings.ranges}
                onChange={(e) =>
                  setSplitSettings((prev) => ({ ...prev, ranges: e.target.value }))
                }
              />
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Use commas for non-consecutive pages and hyphens for range. Example: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">1-4, 7, 10-12</code>
              </p>
            </div>
          )}
        </div>
      )}

      {toolId === 'rotate' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight block">
              Clockwise Rotation Angle
            </span>
            <div className="grid grid-cols-3 gap-2">
              {([90, 180, 270] as const).map((angle) => (
                <button
                  key={angle}
                  type="button"
                  onClick={() => setRotateSettings((prev) => ({ ...prev, angle }))}
                  className={`py-2 px-3 text-sm font-semibold rounded-lg border transition ${
                    rotateSettings.angle === angle
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/55'
                  }`}
                >
                  {angle}° CW
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight block">
              Pages To Rotate
            </span>
            <div className="grid grid-cols-2 gap-2">
              {([
                { val: 'all', desc: 'All Pages' },
                { val: 'custom', desc: 'Specific Pages' },
              ] as const).map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setRotateSettings((prev) => ({ ...prev, pages: m.val }))}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border transition ${
                    rotateSettings.pages === m.val
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/55'
                  }`}
                >
                  {m.desc}
                </button>
              ))}
            </div>
          </div>

          {rotateSettings.pages === 'custom' && (
            <div className="space-y-1.5 pt-1">
              <label className="text-xs text-slate-505 dark:text-slate-400">Target Ranges</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-200 font-mono"
                placeholder="e.g. 1, 3-5"
                value={rotateSettings.pageRange}
                onChange={(e) =>
                  setRotateSettings((prev) => ({ ...prev, pageRange: e.target.value }))
                }
              />
            </div>
          )}
        </div>
      )}

      {toolId === 'jpeg-to-pdf' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight block">
              Page Orientation
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(['portrait', 'landscape'] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setImageToPdfSettings((prev) => ({ ...prev, orientation: o }))}
                  className={`py-2.5 px-3 capitalize text-sm font-medium rounded-lg border transition ${
                    imageToPdfSettings.orientation === o
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/55'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight block">
              Page Margins (Points)
            </label>
            <select
              value={imageToPdfSettings.margin}
              onChange={(e) =>
                setImageToPdfSettings((prev) => ({ ...prev, margin: parseInt(e.target.value) }))
              }
              className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-200"
            >
              <option value="0">No Margins (0 pt)</option>
              <option value="12">Thin Margins (12 pt)</option>
              <option value="24">Standard Margins (24 pt)</option>
              <option value="48">Wide Margins (48 pt)</option>
            </select>
          </div>
        </div>
      )}

      {toolId === 'watermark' && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-emerald-500" /> Watermark Label Text
            </label>
            <input
              type="text"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-200 font-semibold"
              placeholder="e.g. CONFIDENTIAL / COPY"
              value={watermarkSettings.text}
              onChange={(e) =>
                setWatermarkSettings((prev) => ({ ...prev, text: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight block">
                Font Size ({watermarkSettings.fontSize}pt)
              </label>
              <input
                type="range"
                min="10"
                max="100"
                className="w-full h-1.5 accent-emerald-500 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                value={watermarkSettings.fontSize}
                onChange={(e) =>
                  setWatermarkSettings((prev) => ({ ...prev, fontSize: parseInt(e.target.value) }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight block">
                Opacity ({(watermarkSettings.opacity * 100).toFixed(0)}%)
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                className="w-full h-1.5 accent-emerald-500 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                value={watermarkSettings.opacity * 100}
                onChange={(e) =>
                  setWatermarkSettings((prev) => ({ ...prev, opacity: parseInt(e.target.value) / 100 }))
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight block">
              Rotation ({watermarkSettings.angle}°)
            </label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                className="flex-1 h-1.5 mt-2.5 accent-emerald-500 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                value={watermarkSettings.angle}
                onChange={(e) =>
                  setWatermarkSettings((prev) => ({ ...prev, angle: parseInt(e.target.value) }))
                }
              />
              <span className="text-xs text-slate-400 font-mono w-8 text-right shrink-0">
                {watermarkSettings.angle}°
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Stamp Color
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setWatermarkSettings((prev) => ({ ...prev, color: c.value }))}
                  className="w-6 h-6 rounded-full border-2 transition relative flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: c.value, borderColor: watermarkSettings.color === c.value ? '#10b981' : 'transparent' }}
                  title={c.name}
                >
                  {watermarkSettings.color === c.value && (
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  )}
                </button>
              ))}
              <input
                type="color"
                value={watermarkSettings.color}
                onChange={(e) => setWatermarkSettings((prev) => ({ ...prev, color: e.target.value }))}
                className="w-8 h-7 cursor-pointer border-0 p-0 rounded bg-transparent"
                title="Custom color picker"
              />
            </div>
          </div>
        </div>
      )}

      {toolId === 'resize' && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Target Page Standard
            </label>
            <select
              value={resizeSettings.pageSize}
              onChange={(e) =>
                setResizeSettings((prev) => ({
                  ...prev,
                  pageSize: e.target.value as ResizeSettings['pageSize'],
                }))
              }
              className="w-full py-2.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-200"
            >
              <option value="A4">A4 (595 x 841 points)</option>
              <option value="Letter">US Letter (612 x 792 points)</option>
              <option value="Legal">US Legal (612 x 1008 points)</option>
              <option value="Custom">Custom Dimensions</option>
            </select>
          </div>

          {resizeSettings.pageSize === 'Custom' && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Width (pt)
                </label>
                <input
                  type="number"
                  min="50"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none text-slate-800 dark:text-slate-200 font-mono"
                  value={resizeSettings.width}
                  onChange={(e) =>
                    setResizeSettings((prev) => ({
                      ...prev,
                      width: Math.max(50, parseInt(e.target.value) || 595),
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Height (pt)
                </label>
                <input
                  type="number"
                  min="50"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none text-slate-800 dark:text-slate-200 font-mono"
                  value={resizeSettings.height}
                  onChange={(e) =>
                    setResizeSettings((prev) => ({
                      ...prev,
                      height: Math.max(50, parseInt(e.target.value) || 841),
                    }))
                  }
                />
              </div>
            </div>
          )}

          <div className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal font-mono bg-slate-50 dark:bg-slate-800/20 p-3 rounded">
            All pages of the document will be standardly set to the selected dimensions. Proportional contents coordinates remain centered.
          </div>
        </div>
      )}

      {toolId === 'organize' && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight block">
              Pages to Extract / Keep
            </label>
            <input
              type="text"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-200 font-mono"
              placeholder="e.g. 1, 3, 5-7"
              value={organizeSettings.pagesToKeep}
              onChange={(e) =>
                setOrganizeSettings((prev) => ({ ...prev, pagesToKeep: e.target.value }))
              }
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal">
              Specify which pages to group in the export file. Excluded lines are deleted. Ranges are fully supported.
            </p>
          </div>
        </div>
      )}

      {toolId === 'page-numbers' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> Text Layout Format
            </label>
            <input
              type="text"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-200"
              placeholder="e.g. Page {n} of {count}"
              value={numberSettings.format}
              onChange={(e) =>
                setNumberSettings((prev) => ({ ...prev, format: e.target.value }))
              }
            />
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Use tokens: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">{'{n}'}</code> (current page) and <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">{'{count}'}</code> (total pages).
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight block">
              Numbers Position
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {positions.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setNumberSettings((prev) => ({ ...prev, position: p.value }))}
                  className={`py-2 px-1.5 text-[11px] font-medium rounded-lg border transition leading-tight ${
                    numberSettings.position === p.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                      : 'border-slate-150 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-55 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 block">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                Font Size
              </label>
              <input
                type="number"
                min="6"
                max="36"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none text-slate-800 dark:text-slate-200"
                value={numberSettings.fontSize}
                onChange={(e) =>
                  setNumberSettings((prev) => ({
                    ...prev,
                    fontSize: Math.max(6, parseInt(e.target.value) || 10),
                  }))
                }
              />
            </div>

            <div className="space-y-1.5 block">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                Start From
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none text-slate-800 dark:text-slate-200 font-mono font-semibold"
                value={numberSettings.startPage}
                onChange={(e) =>
                  setNumberSettings((prev) => ({
                    ...prev,
                    startPage: Math.max(1, parseInt(e.target.value) || 1),
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Text Color Accent
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setNumberSettings((prev) => ({ ...prev, color: c.value }))}
                  className="w-6.5 h-6.5 rounded-full border-2 transition relative flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: c.value, borderColor: numberSettings.color === c.value ? '#10b981' : 'transparent' }}
                  title={c.name}
                >
                  {numberSettings.color === c.value && (
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  )}
                </button>
              ))}
              <input
                type="color"
                value={numberSettings.color}
                onChange={(e) => setNumberSettings((prev) => ({ ...prev, color: e.target.value }))}
                className="w-8 h-7 cursor-pointer border-0 p-0 rounded bg-transparent"
                title="Custom color picker"
              />
            </div>
          </div>
        </div>
      )}

      {toolId === 'edit-pdf' && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-500" /> Enter Text markup
            </label>
            <input
              type="text"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-200"
              placeholder="e.g. Approved by auditor"
              value={editSettings.textToOverlay}
              onChange={(e) =>
                setEditSettings((prev) => ({ ...prev, textToOverlay: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">Horizontal X (pt)</label>
              <input
                type="number"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-905 text-xs outline-none text-slate-800 dark:text-slate-200 font-mono"
                value={editSettings.xPosition}
                onChange={(e) =>
                  setEditSettings((prev) => ({ ...prev, xPosition: parseInt(e.target.value) || 50 }))
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">Vertical Y (pt)</label>
              <input
                type="number"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-905 text-xs outline-none text-slate-800 dark:text-slate-200 font-mono"
                value={editSettings.yPosition}
                onChange={(e) =>
                  setEditSettings((prev) => ({ ...prev, yPosition: parseInt(e.target.value) || 100 }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">Font size (pt)</label>
              <input
                type="number"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-905 text-xs outline-none text-slate-800 dark:text-slate-200 font-mono"
                value={editSettings.fontSize}
                onChange={(e) =>
                  setEditSettings((prev) => ({ ...prev, fontSize: parseInt(e.target.value) || 12 }))
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">Markup Color</label>
              <input
                type="color"
                value={editSettings.color}
                onChange={(e) =>
                  setEditSettings((prev) => ({ ...prev, color: e.target.value }))
                }
                className="w-full h-8 cursor-pointer rounded border border-slate-300 dark:border-slate-700 p-0 bg-transparent"
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-mono bg-slate-50 dark:bg-slate-850 p-2.5 rounded">
            The text overlay markup will be written at the coordinates (X, Y) relative to the bottom-left corner of the first page.
          </div>
        </div>
      )}

      {toolId === 'word-to-pdf' && (
        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg">
          Converting word documents (.docx/.doc/.txt) to PDF is automated. All textual layers, page margins, paragraphs and table tags will be mapped automatically.
        </div>
      )}

      {toolId === 'excel-to-pdf' && (
        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg">
          Excel spreadsheets (.xlsx/.xls/.csv) to PDF is automated. Spreadsheet grids and column alignments are standard-oriented into high-quality Landscape PDF records.
        </div>
      )}

      {toolId === 'pdf-to-word' && (
        <div className="text-xs text-slate-505 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg">
          Decompile PDF file text nodes back into responsive document components (.DOC). This generates documents structured for seamless Word desktop application edits.
        </div>
      )}

      {toolId === 'pdf-to-excel' && (
        <div className="text-xs text-slate-505 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg">
          Tabular data structures parsed from the dynamic PDF pages will be formatted into downloadable spreadsheet models (.XLS) compatible with Excel.
        </div>
      )}
    </div>
  );
};
