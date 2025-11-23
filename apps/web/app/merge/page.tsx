"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Merge } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const FileUploader = dynamic(
  () =>
    import("@/components/features/file-uploader").then(
      (mod) => mod.FileUploader
    ),
  { ssr: false }
);

const FileList = dynamic(
  () =>
    import("@/components/features/file-uploader").then((mod) => mod.FileList),
  { ssr: false }
);

const importPdfUtils = async () => {
  return import("@/lib/pdf-utils");
};

export default function MergePage() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isMerging, setIsMerging] = React.useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      alert("Please select at least 2 PDF files to merge.");
      return;
    }

    setIsMerging(true);
    try {
      const { mergePdfs, downloadPdf } = await importPdfUtils();
      const mergedPdfBytes = await mergePdfs(files);
      downloadPdf(mergedPdfBytes, "merged-document.pdf");
    } catch (error) {
      console.error("Error merging PDFs:", error);
      alert("Failed to merge PDFs. Please try again.");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="min-h-screen primary-background primary-foreground  p-8 md:p-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold ">Merge PDFs</h1>
            <p className="">Combine multiple PDF files into one.</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <FileUploader
              onFilesSelected={handleFilesSelected}
              multiple={true}
              className="min-h-[200px]"
            />

            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    Selected Files ({files.length})
                  </h3>
                  <Button
                    variant="ghost"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setFiles([])}
                  >
                    Clear All
                  </Button>
                </div>

                <FileList files={files} onRemove={handleRemoveFile} />

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    size="lg"
                    onClick={handleMerge}
                    disabled={files.length < 2 || isMerging}
                    className="w-full md:w-auto"
                  >
                    {isMerging ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Merging...
                      </>
                    ) : (
                      <>
                        <Merge className="w-4 h-4 mr-2" />
                        Merge PDFs
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
