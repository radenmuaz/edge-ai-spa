import { useCallback, useState } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { MicIcon, MusicIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioUploadZoneProps {
    onAudioSelected: (file: File) => void;
    isProcessing: boolean;
}

export function AudioUploadZone({
    onAudioSelected,
    isProcessing,
}: AudioUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith("audio/")) {
                    onAudioSelected(file);
                } else {
                    alert("Please upload an audio file.");
                }
            }
        },
        [onAudioSelected]
    );

    const handleFileChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                onAudioSelected(e.target.files[0]);
            }
        },
        [onAudioSelected]
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
                onClick={() => document.getElementById("audio-file-upload")?.click()}
            >
                <input
                    type="file"
                    id="audio-file-upload"
                    className="hidden"
                    accept="audio/*"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                />
                <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                    <div className="p-4 rounded-full bg-background border shadow-sm">
                        <MicIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            Drag & drop, or click to select Audio
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Supports MP3, WAV, OGG
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted-foreground/20" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-2 text-muted-foreground font-medium">
                        Or try a sample
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
                {[
                    { label: "Person Speaking (Sample)", type: "speech" },
                    { label: "Background Music (Sample)", type: "music" },
                ].map((demo, idx) => (
                    <button
                        key={idx}
                        disabled={isProcessing}
                        onClick={() => {
                            // Dummy implementation
                            const blob = new Blob(["mock-audio-data"], { type: "audio/mp3" });
                            const file = new File([blob], `${demo.label}.mp3`, { type: "audio/mp3" });
                            onAudioSelected(file);
                        }}
                        className="flex items-center gap-3 p-3 text-sm bg-muted/30 rounded-lg border border-muted-foreground/20 hover:ring-2 hover:ring-primary hover:border-transparent transition-all group/demo disabled:opacity-50"
                    >
                        <div className="p-2 bg-background rounded-full border shadow-sm">
                            <MusicIcon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{demo.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
