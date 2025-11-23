"use client";

import * as React from "react";
import { FileUploader } from "@/components/features/file-uploader";
import { PdfViewer } from "@/components/features/pdf-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { splitPdf, downloadPdf } from "@/lib/pdf-utils";
import { ArrowLeft, Loader2, Scissors, X } from "lucide-react";
import Link from "next/link";

export default function SplitPage() {
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

    const handleSplit = async () => {
        if (!file || selectedPages.length === 0) {
            alert("Please select at least one page to extract.");
            return;
        }

        setIsProcessing(true);
        try {
            const newPdfBytes = await splitPdf(file, selectedPages);
            downloadPdf(newPdfBytes, `split-${file.name}`);
        } catch (error) {
            console.error("Error splitting PDF:", error);
            alert("Failed to split PDF. Please try again.");
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
                        <h1 className="text-3xl font-bold text-slate-900">Split PDF</h1>
                        <p className="text-slate-500">Extract pages from your PDF document.</p>
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
                                    <span className="font-medium truncate max-w-[300px]">{file.name}</span>
                                    <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
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
                                        {selectedPages.length} pages selected
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={handleSplit}
                                        disabled={selectedPages.length === 0 || isProcessing}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Scissors className="w-4 h-4 mr-2" />
                                                Extract Selected Pages
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
