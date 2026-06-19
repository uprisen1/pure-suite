export type PDFToolId =
  | 'merge'
  | 'split'
  | 'rotate'
  | 'jpeg-to-pdf'
  | 'watermark'
  | 'resize'
  | 'organize'
  | 'page-numbers'
  | 'edit-pdf'
  | 'word-to-pdf'
  | 'excel-to-pdf'
  | 'pdf-to-word'
  | 'pdf-to-excel';

export interface PDFTool {
  id: PDFToolId;
  name: string;
  shortDesc: string;
  iconName: string;
  acceptTypes: string; // e.g. ".pdf" or ".png,.jpg,.jpeg,.webp"
  multiple: boolean;
}

export interface ProcessingFile {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl?: string; // image previews for images-to-pdf if needed
  type: string;
}

export interface SplitSettings {
  ranges: string; // e.g. "1-2, 4"
  splitAll: boolean;
}

export interface RotateSettings {
  angle: 90 | 180 | 270;
  pages: 'all' | 'custom';
  pageRange: string;
}

export interface NumberSettings {
  format: string; // e.g. "Page {n} of {count}"
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
  fontSize: number;
  color: string; // hex string e.g. "#1e293b"
  startPage: number;
}

export interface WatermarkSettings {
  text: string;
  fontSize: number;
  color: string; // hex string e.g. "#7f8c8d"
  opacity: number; // 0.1 to 1.0
  angle: number; // rotation in degrees e.g. 45
}

export interface ResizeSettings {
  pageSize: 'A4' | 'Letter' | 'Legal' | 'Custom';
  width: number; // in points
  height: number; // in points
}

export interface ImageToPdfSettings {
  margin: number; // in pt
  orientation: 'portrait' | 'landscape';
}

export interface OrganizeSettings {
  pagesToKeep: string; // e.g. "1,3,5"
}

export interface EditPdfSettings {
  textToOverlay: string;
  xPosition: number;
  yPosition: number;
  fontSize: number;
  color: string;
}

