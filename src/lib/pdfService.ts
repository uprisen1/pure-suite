import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';

/**
 * Merge multiple PDFs into a single file in the provided order.
 */
export async function mergePDFs(files: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pageIndices = pdf.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  const mergedPdfBytes = await mergedPdf.save();
  return new Blob([mergedPdfBytes], { type: 'application/pdf' });
}

/**
 * Extract specific pages or split all pages in a PDF.
 * Returns either a single PDF Blob or a ZIP Blob.
 */
export async function splitPDF(
  file: File,
  ranges: string,
  splitAll: boolean
): Promise<{ blob: Blob; filename: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer);
  const totalPages = srcPdf.getPageCount();
  const baseName = file.name.replace(/\.pdf$/i, '');

  if (splitAll) {
    const zip = new JSZip();
    for (let i = 0; i < totalPages; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(srcPdf, [i]);
      newPdf.addPage(copiedPage);
      const bytes = await newPdf.save();
      zip.file(`${baseName}_page_${i + 1}.pdf`, bytes);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return { blob: zipBlob, filename: `${baseName}_split_pages.zip` };
  } else {
    const pagesToExtract: number[] = [];
    const parts = ranges.split(',');
    for (const part of parts) {
      const trimPart = part.trim();
      if (!trimPart) continue;
      if (trimPart.includes('-')) {
        const [start, end] = trimPart.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.min(start, end);
          const max = Math.max(start, end);
          for (let p = min; p <= max; p++) {
            if (p >= 1 && p <= totalPages) {
              pagesToExtract.push(p - 1);
            }
          }
        }
      } else {
        const p = Number(trimPart);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
          pagesToExtract.push(p - 1);
        }
      }
    }

    // De-duplicate indices
    const uniquePages = Array.from(new Set(pagesToExtract)).sort((a, b) => a - b);

    if (uniquePages.length === 0) {
      throw new Error(`Please specify valid pages between 1 and ${totalPages}.`);
    }

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(srcPdf, uniquePages);
    copiedPages.forEach((page) => newPdf.addPage(page));
    const bytes = await newPdf.save();
    return {
      blob: new Blob([bytes], { type: 'application/pdf' }),
      filename: `${baseName}_extracted.pdf`,
    };
  }
}

/**
 * Rotate target pages of a single PDF by 90, 180, or 270 degrees.
 */
export async function rotatePDF(
  file: File,
  angleDegrees: 90 | 180 | 270,
  pagesMode: 'all' | 'custom',
  pageRangeStr?: string
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  let pagesToRotate: number[] = [];
  if (pagesMode === 'all') {
    pagesToRotate = Array.from({ length: totalPages }, (_, i) => i);
  } else if (pageRangeStr) {
    const parts = pageRangeStr.split(',');
    for (const part of parts) {
      const trimPart = part.trim();
      if (!trimPart) continue;
      if (trimPart.includes('-')) {
        const [start, end] = trimPart.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.min(start, end);
          const max = Math.max(start, end);
          for (let p = min; p <= max; p++) {
            if (p >= 1 && p <= totalPages) pagesToRotate.push(p - 1);
          }
        }
      } else {
        const p = Number(trimPart);
        if (!isNaN(p) && p >= 1 && p <= totalPages) pagesToRotate.push(p - 1);
      }
    }
    pagesToRotate = Array.from(new Set(pagesToRotate));
  }

  if (pagesToRotate.length === 0) {
    throw new Error('No valid pages specified to rotate.');
  }

  pagesToRotate.forEach((idx) => {
    const page = pdfDoc.getPage(idx);
    const existingRot = page.getRotation().angle;
    page.setRotation(degrees((existingRot + angleDegrees) % 360));
  });

  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

/**
 * Helper to embed an unfamiliar file format (like WebP, GIF, or corrupted files)
 * into a PDF by using a Canvas renderer to rebuild it as standard JPG data.
 */
async function embedGenericImage(pdfDoc: PDFDocument, file: File): Promise<any> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            const res = await fetch(dataUrl);
            const binary = await res.arrayBuffer();
            const embedded = await pdfDoc.embedJpg(binary);
            resolve(embedded);
          } catch (err) {
            console.error('Failed embedding custom canvas format', err);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Convert multiple uploaded images (PNG, JPG, WebP) into a high-quality PDF.
 */
export async function imagesToPDF(
  imageFiles: File[],
  marginPoints: number = 0,
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  for (const file of imageFiles) {
    const arrayBuffer = await file.arrayBuffer();
    let img: any = null;

    try {
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        img = await pdfDoc.embedJpg(arrayBuffer);
      } else if (file.type === 'image/png') {
        img = await pdfDoc.embedPng(arrayBuffer);
      } else {
        img = await embedGenericImage(pdfDoc, file);
      }
    } catch {
      // Fallback to canvas
      img = await embedGenericImage(pdfDoc, file);
    }

    if (!img) continue;

    const imgWidth = img.width;
    const imgHeight = img.height;

    // Page layout settings
    const doubleMargin = marginPoints * 2;
    let pageWidth = imgWidth + doubleMargin;
    let pageHeight = imgHeight + doubleMargin;

    if (orientation === 'landscape') {
      pageWidth = imgHeight + doubleMargin;
      pageHeight = imgWidth + doubleMargin;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Handle rotation on landscape if desired or keep simple proportions
    const drawX = (pageWidth - imgWidth) / 2;
    const drawY = (pageHeight - imgHeight) / 2;

    page.drawImage(img, {
      x: drawX,
      y: drawY,
      width: imgWidth,
      height: imgHeight,
    });
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

/**
 * Add a transparent dynamic text watermark to each page of a PDF document.
 */
export async function addWatermark(
  file: File,
  text: string,
  fontSize: number = 50,
  colorHex: string = '#7f8c8d',
  opacity: number = 0.4,
  angle: number = 45
): Promise<Blob> {
  if (!text) {
    throw new Error('Please enter watermark label text.');
  }
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Convert Hex to RGB
  const cleanedHex = colorHex.replace('#', '');
  const r = parseInt(cleanedHex.substring(0, 2) || '00', 16) / 255;
  const g = parseInt(cleanedHex.substring(2, 4) || '00', 16) / 255;
  const b = parseInt(cleanedHex.substring(4, 6) || '00', 16) / 255;
  const rgbColor = rgb(r, g, b);

  for (const page of pages) {
    const { width, height } = page.getSize();
    
    // Draw diagonal text watermark
    page.drawText(text, {
      x: width / 2 - (font.widthOfTextAtSize(text, fontSize) / 2),
      y: height / 2 - (font.heightAtSize(fontSize) / 2),
      size: fontSize,
      font,
      color: rgbColor,
      opacity: opacity,
      rotate: degrees(angle),
    });
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

/**
 * Resize all PDF pages to a standard size or custom dimension parameters.
 */
export async function resizePDF(
  file: File,
  sizeName: 'A4' | 'Letter' | 'Legal' | 'Custom',
  customWidth: number = 595,
  customHeight: number = 841
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  let targetWidth = 595.276; // A4 width in pt
  let targetHeight = 841.890; // A4 height in pt

  if (sizeName === 'Letter') {
    targetWidth = 612;
    targetHeight = 792;
  } else if (sizeName === 'Legal') {
    targetWidth = 612;
    targetHeight = 1008;
  } else if (sizeName === 'Custom') {
    targetWidth = customWidth;
    targetHeight = customHeight;
  }

  for (const page of pages) {
    page.setSize(targetWidth, targetHeight);
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

/**
 * Discard unspecified pages, exporting only requested ones.
 */
export async function organizePDF(file: File, pagesToKeep: string): Promise<Blob> {
  if (!pagesToKeep) {
    throw new Error('Please specify at least one page index.');
  }
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer);
  const totalPages = srcPdf.getPageCount();

  const indicesToKeep: number[] = [];
  const parts = pagesToKeep.split(',');
  for (const part of parts) {
    const trimPart = part.trim();
    if (!trimPart) continue;
    if (trimPart.includes('-')) {
      const [start, end] = trimPart.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        for (let p = min; p <= max; p++) {
          if (p >= 1 && p <= totalPages) {
            indicesToKeep.push(p - 1);
          }
        }
      }
    } else {
      const p = Number(trimPart);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        indicesToKeep.push(p - 1);
      }
    }
  }

  // De-duplicate keeps
  const uniqueIndices = Array.from(new Set(indicesToKeep));

  if (uniqueIndices.length === 0) {
    throw new Error(`Please specify valid pages between 1 and ${totalPages}.`);
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(srcPdf, uniqueIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));
  const bytes = await newPdf.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

/**
 * Draw custom page numbers dynamically on a PDF in standard Helvetica.
 */
export async function addPageNumbers(
  file: File,
  format: string,
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left',
  fontSize: number = 10,
  colorHex: string = '#1e293b',
  startFrom: number = 1
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  const pageCount = pages.length;

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Parse custom HEX color
  const cleanedHex = colorHex.replace('#', '');
  const r = parseInt(cleanedHex.substring(0, 2) || '00', 16) / 255;
  const g = parseInt(cleanedHex.substring(2, 4) || '00', 16) / 255;
  const b = parseInt(cleanedHex.substring(4, 6) || '00', 16) / 255;
  const fontColor = rgb(r, g, b);

  for (let i = 0; i < pageCount; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const currentNum = i + startFrom;

    // Substitute keywords
    const label = format
      .replace('{n}', currentNum.toString())
      .replace('{count}', (pageCount + startFrom - 1).toString());

    const textWidth = font.widthOfTextAtSize(label, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    // Default positioning coordinates
    let x = width / 2 - textWidth / 2;
    let y = 30;

    if (position.startsWith('top')) {
      y = height - 35 - textHeight;
    } else {
      y = 30;
    }

    if (position.endsWith('right')) {
      x = width - 40 - textWidth;
    } else if (position.endsWith('left')) {
      x = 40;
    } else {
      x = width / 2 - textWidth / 2;
    }

    page.drawText(label, {
      x,
      y,
      size: fontSize,
      font,
      color: fontColor,
    });
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

/**
 * Overlay interactive custom text markup directly onto a PDF document.
 */
export async function editPDF(
  file: File,
  text: string,
  x: number = 50,
  y: number = 100,
  fontSize: number = 12,
  colorHex: string = '#2563eb'
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  if (pages.length === 0) {
    throw new Error('PDF has no valid pages to edit.');
  }

  const firstPage = pages[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Parse hex color parameters helper
  const cleanedHex = colorHex.replace('#', '');
  const r = parseInt(cleanedHex.substring(0, 2) || '00', 16) / 255;
  const g = parseInt(cleanedHex.substring(2, 4) || '00', 16) / 255;
  const b = parseInt(cleanedHex.substring(4, 6) || '00', 16) / 255;

  firstPage.drawText(text, {
    x,
    y,
    size: fontSize,
    font,
    color: rgb(r, g, b),
  });

  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

