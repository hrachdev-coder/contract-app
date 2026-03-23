declare module 'pdfkit' {
  interface PDFDocument {
    fontkit?: unknown;
    fontSize: (size: number) => PDFDocument;
    text: (text: string, options?: Record<string, unknown>) => PDFDocument;
    moveDown: () => PDFDocument;
    on: (
      event: string,
      listener: (...args: unknown[]) => void
    ) => PDFDocument;
    end: () => PDFDocument;
  }

  const PDFDocument: new (options: Record<string, unknown>) => PDFDocument;
  export default PDFDocument;
}