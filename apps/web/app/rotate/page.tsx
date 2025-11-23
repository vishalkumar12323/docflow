"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, RotateCw, X } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const FileUploader = dynamic(
  () =>
    import("@/components/features/file-uploader").then(
      (mod) => mod.FileUploader
    ),
  { ssr: false }
);

const PdfViewer = dynamic(
  () => import("@/components/features/pdf-viewer").then((mod) => mod.PdfViewer),
  { ssr: false }
);

const importPdfUtils = async () => {
  return import("@/lib/pdf-utils");
};

export default function RotatePage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [selectedPages, setSelectedPages] = React.useState<number[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setSelectedPages([]);
    }
  };

  const handlePageToggle = (pageIndex: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageIndex)
        ? prev.filter((p) => p !== pageIndex)
        : [...prev, pageIndex].sort((a, b) => a - b)
    );
  };

  const handleRotate = async (degrees: number) => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const { downloadPdf, rotatePdf } = await importPdfUtils();
      const newPdfBytes = await rotatePdf(
        file,
        degrees,
        selectedPages.length > 0 ? selectedPages : undefined
      );
      downloadPdf(newPdfBytes, `rotated-${file.name}`);
    } catch (error) {
      console.error("Error rotating PDF:", error);
      alert("Failed to rotate PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 md:p-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Rotate PDF</h1>
            <p className="text-slate-500">
              Rotate specific pages or the entire document.
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            {!file ? (
              <FileUploader
                onFilesSelected={handleFileSelected}
                multiple={false}
                className="min-h-[300px]"
              />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-100 p-4 rounded-lg">
                  <span className="font-medium truncate max-w-[300px]">
                    {file.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Change File
                  </Button>
                </div>

                <div className="bg-slate-100/50 p-6 rounded-lg border min-h-[400px]">
                  <PdfViewer
                    file={file}
                    selectedPages={selectedPages}
                    onPageToggle={handlePageToggle}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-slate-500">
                    {selectedPages.length === 0
                      ? "All pages will be rotated"
                      : `${selectedPages.length} pages selected`}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="lg"
                      onClick={() => handleRotate(90)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <RotateCw className="w-4 h-4 mr-2" />
                          Rotate 90° CW
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
