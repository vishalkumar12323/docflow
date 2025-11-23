"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  file: File | null;
  selectedPages: number[];
  onPageToggle: (pageIndex: number) => void;
}

export function PdfViewer({
  file,
  selectedPages,
  onPageToggle,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  if (!file) return null;

  return (
    <div className="flex flex-col items-center w-full">
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full"
      >
        {Array.from(new Array(numPages), (el, index) => (
          <div
            key={`page_${index + 1}`}
            className={cn(
              "relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:shadow-md",
              selectedPages.includes(index)
                ? "border-blue-500 ring-2 ring-blue-200"
                : "border-slate-200 hover:border-blue-300"
            )}
            onClick={() => onPageToggle(index)}
          >
            <Page
              pageNumber={index + 1}
              width={200}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="mx-auto"
            />

            <div
              className={cn(
                "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                selectedPages.includes(index)
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100/80 text-slate-400"
              )}
            >
              <CheckCircle2 className="w-4 h-4" />
            </div>

            <div className="absolute bottom-0 w-full bg-slate-900/50 text-white text-xs py-1 text-center backdrop-blur-sm">
              Page {index + 1}
            </div>
          </div>
        ))}
      </Document>
    </div>
  );
}
