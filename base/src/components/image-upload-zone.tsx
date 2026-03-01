import React, { useCallback, useState } from "react";
import { UploadCloudIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadZoneProps {
    onImageSelected: (file: File) => void;
    isProcessing: boolean;
}

export function ImageUploadZone({
    onImageSelected,
    isProcessing,
}: ImageUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith("image/")) {
                    onImageSelected(file);
                } else {
                    alert("Please upload an image file.");
                }
            }
        },
        [onImageSelected]
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                onImageSelected(e.target.files[0]);
            }
        },
        [onImageSelected]
    );

    return (
        <div className="w-full flex flex-col gap-8 items-center">
            <div
                className={cn(
                    "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-colors duration-200 ease-in-out cursor-pointer",
                    isDragging
                        ? "border-primary bg-primary/10"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                    isProcessing && "opacity-50 pointer-events-none"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                />
                <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                    <div className="p-4 rounded-full bg-background border shadow-sm">
                        <UploadCloudIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            Drag & drop, paste (Ctrl+V), or click to select
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Supports JPG, PNG, WEBP
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}
