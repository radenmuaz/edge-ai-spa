import { useState } from "react";
import { ArrowRightIcon, Maximize2, Download, X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export type MediaType = 'image' | 'text' | 'audio' | 'video';

interface UniversalResultProps {
    inputType: MediaType;
    inputData: string; // URL for image/audio/video, plain string for text
    outputType: MediaType;
    outputData: string | null; // URL for image/audio/video, plain string for text
    isProcessing: boolean;
    onProcess?: () => void;
    uploadNode?: React.ReactNode;
    onReset?: () => void;
    onInputDataChange?: (data: string) => void;
}

export function UniversalResult({
    inputType,
    inputData,
    outputType,
    outputData,
    isProcessing,
    onProcess,
    uploadNode,
    onReset,
    onInputDataChange,
}: UniversalResultProps) {
    const [expandedImage, setExpandedImage] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleDownload = (data: string, type: MediaType, filename: string) => {
        if (!data || type === 'text') return;
        const link = document.createElement('a');
        link.href = data;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyText = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderMedia = (type: MediaType, data: string, label: string, isInput: boolean) => {
        if (type === 'image') {
            return (
                <div className="relative aspect-square w-full rounded-xl overflow-hidden border bg-muted/50 group flex items-center justify-center">
                    <div
                        className="relative w-full h-full cursor-pointer flex items-center justify-center"
                        onClick={() => setExpandedImage(data)}
                    >
                        <img
                            src={data}
                            alt={label}
                            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                            <span className="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-2 pointer-events-none">
                                <Maximize2 className="w-4 h-4" />
                                Expand
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        if (type === 'video') {
            return (
                <div className="relative aspect-square w-full rounded-xl overflow-hidden border bg-muted/50 flex items-center justify-center">
                    <video
                        src={data}
                        controls
                        className="w-full h-full object-contain"
                    />
                </div>
            );
        }

        if (type === 'text') {
            if (isInput && onInputDataChange) {
                return (
                    <div className="relative aspect-square w-full rounded-xl flex border bg-muted/10">
                        <textarea
                            value={data}
                            onChange={(e) => onInputDataChange(e.target.value)}
                            disabled={isProcessing}
                            className="w-full h-full p-4 bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground"
                            placeholder="Enter text..."
                        />
                    </div>
                );
            }

            return (
                <div className="relative aspect-square w-full rounded-xl overflow-y-auto border bg-muted/10 p-4">
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed break-words">{data}</p>
                </div>
            );
        }

        if (type === 'audio') {
            return (
                <div className="relative aspect-square w-full rounded-xl border bg-muted/30 flex flex-col items-center justify-center p-6 gap-6">
                    <div className="w-full max-w-[200px] h-24 flex items-end justify-between gap-1 opacity-50 relative pointer-events-none px-4">
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div
                                key={`wave-${i}`}
                                className="w-[6px] rounded-full bg-primary"
                                style={{
                                    height: `${Math.max(20, Math.random() * 100)}%`,
                                }}
                            />
                        ))}
                    </div>
                    <audio controls src={data} className="w-full z-10" />
                </div>
            );
        }
        return null;
    };

    const renderActionButtons = (type: MediaType, data: string, isResult: boolean) => {
        if (type === 'text') {
            return (
                <Button variant={isResult ? "default" : "outline"} className="w-full gap-2" onClick={() => handleCopyText(data)}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy Text"}
                </Button>
            );
        }

        return (
            <Button variant={isResult ? "default" : "outline"} className="w-full gap-2" onClick={() => handleDownload(data, type, isResult ? `result-${type}` : `original-${type}`)}>
                <Download className="h-4 w-4" />
                Download {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
        );
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 relative">
            <div className="flex flex-col md:flex-row gap-8 mt-4 items-center justify-center">
                {/* Input Column */}
                <div className="flex flex-col gap-2 w-full max-w-md">
                    <div className="text-sm font-medium text-muted-foreground flex justify-between">
                        <span>Original Input</span>
                        {inputData && <span className="uppercase text-xs font-bold px-2 py-0.5 bg-muted rounded">{inputType}</span>}
                    </div>
                    {inputData ? (
                        <>
                            {renderMedia(inputType, inputData, "Input", true)}
                            <div className="mt-2 w-full flex gap-2">
                                {onReset && (
                                    <Button variant="outline" className="w-1/3" onClick={onReset} disabled={isProcessing}>
                                        New Input
                                    </Button>
                                )}
                                <div className="w-2/3">
                                    {renderActionButtons(inputType, inputData, false)}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden border bg-card flex items-center justify-center">
                            {uploadNode || (
                                <span className="text-muted-foreground/50 text-sm">Please provide an input</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Arrow / Spinner Column */}
                <div className="flex items-center justify-center">
                    {isProcessing ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : (
                        <ArrowRightIcon className="w-8 h-8 text-muted-foreground rotate-90 md:rotate-0" />
                    )}
                </div>

                {/* Output Column */}
                <div className="flex flex-col gap-2 w-full max-w-md">
                    <div className="text-sm font-medium text-muted-foreground flex justify-between">
                        <span>Generated Result</span>
                        <span className="uppercase text-xs font-bold px-2 py-0.5 bg-primary/20 text-primary rounded">{outputType}</span>
                    </div>
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden border bg-muted/50 flex items-center justify-center group">
                        {outputData ? (
                            renderMedia(outputType, outputData, "Result", false)
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full">
                                {isProcessing ? (
                                    <div className="text-muted-foreground">Processing...</div>
                                ) : onProcess ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <p className="text-muted-foreground text-sm">Ready to generate</p>
                                        <Button onClick={onProcess} size="lg" className="shadow-lg min-w-[200px]">
                                            Generate Now
                                        </Button>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground/50 text-sm">Waiting for input...</span>
                                )}
                            </div>
                        )}
                    </div>

                    {outputData && (
                        <div className="mt-2 w-full">
                            {renderActionButtons(outputType, outputData, true)}
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Modal for Images */}
            {expandedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setExpandedImage(null)}>
                    <div className="relative max-w-[95vw] h-[95vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img alt="Expanded" className="max-w-full max-h-full object-contain rounded-md shadow-2xl" src={expandedImage} />
                        <Button variant="secondary" size="icon" className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-none" onClick={() => setExpandedImage(null)}>
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
