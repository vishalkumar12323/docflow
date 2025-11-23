"use client";

import * as React from "react";
import { Upload, File as FileIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
    onFilesSelected: (files: File[]) => void;
    multiple?: boolean;
    accept?: string;
    className?: string;
}

export function FileUploader({
    onFilesSelected,
    multiple = false,
    accept = "application/pdf",
    className,
}: FileUploaderProps) {
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files).filter(file =>
                file.type === "application/pdf" || file.name.endsWith(".pdf")
            );
            if (files.length > 0) {
                onFilesSelected(files);
            }
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            onFilesSelected(files);
        }
    };

    return (
        <div
            className={cn(
                "relative border-2 border-dashed rounded-lg p-8 transition-colors text-center cursor-pointer",
                isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-300 hover:bg-slate-50",
                className
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={accept}
                multiple={multiple}
                onChange={handleFileInput}
            />

            <div className="flex flex-col items-center justify-center gap-4">
                <div className={cn(
                    "p-4 rounded-full transition-colors",
                    isDragging ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                )}>
                    <Upload className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                        {isDragging ? "Drop files here" : "Click or drag files here"}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        PDF files only, up to 10MB
                    </p>
                </div>
                <Button variant="secondary" className="mt-2 pointer-events-none">
                    Select Files
                </Button>
            </div>
        </div>
    );
}

export function FileList({ files, onRemove }: { files: File[], onRemove: (index: number) => void }) {
    if (files.length === 0) return null;

    return (
        <div className="space-y-2 mt-4 w-full">
            {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-red-50 text-red-500 rounded">
                            <FileIcon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">{file.name}</span>
                            <span className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(index)}
                        className="text-slate-400 hover:text-red-500"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            ))}
        </div>
    );
}
