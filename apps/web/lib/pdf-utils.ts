import { PDFDocument, degrees } from 'pdf-lib';

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const savedPdfBytes = await mergedPdf.save();
    return savedPdfBytes;
}

export async function splitPdf(file: File, pageIndices: number[]): Promise<Uint8Array> {
    const fileBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBuffer);
    const newPdf = await PDFDocument.create();

    const copiedPages = await newPdf.copyPages(pdf, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    return await newPdf.save();
}

export async function rotatePdf(file: File, rotation: number, pageIndices?: number[]): Promise<Uint8Array> {
    const fileBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBuffer);

    const pages = pdf.getPages();

    pages.forEach((page, index) => {
        if (!pageIndices || pageIndices.length === 0 || pageIndices.includes(index)) {
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees((currentRotation + rotation) % 360));
        }
    });

    return await pdf.save();
}

export function downloadPdf(pdfBytes: Uint8Array, filename: string) {
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
