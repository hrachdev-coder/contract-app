declare module 'pdfkit' {
  interface PDFDocument {
    fontkit?: unknown;
    fontSize: (size: number) => PDFDocument;
    fillColor: (color: string) => PDFDocument;
    text: (text: string, options?: Record<string, unknown>) => PDFDocument;
    moveDown: (lines?: number) => PDFDocument;
    on: (
      event: string,
      listener: (...args: unknown[]) => void
    ) => PDFDocument;
    end: () => PDFDocument;
  }

  const PDFDocument: new (options: Record<string, unknown>) => PDFDocument;
  export default PDFDocument;
}