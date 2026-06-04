/**
 * Export utilities — SVG-to-canvas helpers (for the radar SVG) and
 * DOM-element-to-PDF (for any HTML element, e.g. the trajectory map).
 *
 * All heavy dependencies (jsPDF, html-to-image) are dynamically imported
 * so they are excluded from the initial bundle.
 */

// ── SVG helpers (used by RadarTemplate) ──────────────────────────────────────

/**
 * Converts an SVG element to a canvas at the given scale factor.
 * Used by `downloadPNG` and `downloadPDF` for the radar SVG export.
 */
export function svgToCanvas(
  svgEl: SVGSVGElement,
  scale = 3,
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = svgEl.viewBox.baseVal.width * scale;
      canvas.height = svgEl.viewBox.baseVal.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Downloads the SVG radar as a PNG file.
 */
export async function downloadPNG(svgEl: SVGSVGElement): Promise<void> {
  const canvas = await svgToCanvas(svgEl, 3);
  const link = document.createElement("a");
  link.download = "Radar_Tecnologico_CEET_2025-2035.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/**
 * Downloads the SVG radar as a PDF file.
 * Uses dynamic import of jsPDF to keep it out of the initial bundle.
 */
export async function downloadPDF(svgEl: SVGSVGElement): Promise<void> {
  const canvas = await svgToCanvas(svgEl, 3);
  const imgData = canvas.toDataURL("image/png");
  // Dynamic import of jsPDF
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  // Title
  pdf.setFontSize(14);
  pdf.setTextColor(27, 94, 32);
  pdf.text(
    "Radar Tecnológico — Electricidad CEET 2025-2035",
    pageW / 2,
    12,
    { align: "center" },
  );
  // Radar image centered
  const imgSize = Math.min(pageW - 20, pageH - 30);
  const xOff = (pageW - imgSize) / 2;
  pdf.addImage(imgData, "PNG", xOff, 18, imgSize, imgSize);
  // Source
  pdf.setFontSize(7);
  pdf.setTextColor(140, 140, 140);
  pdf.text(
    "Fuente: Elaboración propia basada en ejercicio VCyT CEET-GICS (2025). Metodología tipo Gartner Technology Radar.",
    pageW / 2,
    pageH - 5,
    { align: "center" },
  );
  pdf.save("Radar_Tecnologico_CEET_2025-2035.pdf");
}

// ── DOM element helpers (used by TrajectoryMap export) ───────────────────────

export interface DownloadElementAsPDFOptions {
  /** Title embedded as PDF metadata. Default: "Mapa de Trayectoria". */
  title?: string;
  /** Filename (without extension). Default: "mapa-trayectoria". */
  filename?: string;
}

/**
 * Captures a DOM element as a PNG using `html-to-image` and embeds it
 * in an A4-landscape PDF using jsPDF.
 *
 * The image is fit to the A4 landscape page preserving aspect ratio
 * (letterbox / pillarbox as needed).
 *
 * @param el   - The HTMLElement to capture.
 * @param opts - Optional title and filename.
 */
export async function downloadElementAsPDF(
  el: HTMLElement,
  opts: DownloadElementAsPDFOptions = {},
): Promise<void> {
  const { title = "Mapa de Trayectoria", filename = "mapa-trayectoria" } = opts;

  // Dynamic import keeps jsPDF and html-to-image out of the initial bundle.
  const { toPng } = await import("html-to-image");
  const { default: jsPDF } = await import("jspdf");

  // Capture the DOM element at 3× pixel ratio for crisp output.
  const dataUrl = await toPng(el, { pixelRatio: 3, cacheBust: true });

  // A4 landscape dimensions in mm.
  const PAGE_W_MM = 297;
  const PAGE_H_MM = 210;

  // Compute image intrinsic size from the data URL dimensions.
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = dataUrl;
  });

  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;

  // Scale to fit inside A4 landscape preserving aspect ratio.
  const scale = Math.min(PAGE_W_MM / imgW, PAGE_H_MM / imgH);
  const renderW = imgW * scale;
  const renderH = imgH * scale;

  // Center on the page.
  const offsetX = (PAGE_W_MM - renderW) / 2;
  const offsetY = (PAGE_H_MM - renderH) / 2;

  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  pdf.setProperties({ title });
  pdf.addImage(dataUrl, "PNG", offsetX, offsetY, renderW, renderH);
  pdf.save(`${filename}.pdf`);
}
