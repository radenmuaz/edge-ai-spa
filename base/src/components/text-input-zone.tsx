import { useState } from "react";
import { TypeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TextInputZoneProps {
    onTextSelected: (text: string) => void;
    isProcessing: boolean;
}

export function TextInputZone({
    onTextSelected,
    isProcessing,
}: TextInputZoneProps) {
    const [text, setText] = useState("");

    const handleSubmit = () => {
        if (text.trim()) {
            onTextSelected(text);
        }
    };

    return (
        <div className="w-full flex flex-col gap-6 items-center">
            <div className="w-full flex flex-col max-w-lg md:max-w-2xl gap-4 bg-background p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <TypeIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold text-sm">Enter Text / Prompt</span>
                </div>
                <textarea
                    className={cn(
                        "w-full min-h-[120px] p-4 rounded-lg border bg-muted/20 resize-y outline-none focus:ring-2 focus:ring-primary/50 transition-all",
                        isProcessing && "opacity-50 pointer-events-none"
                    )}
                    placeholder="Type or paste your text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isProcessing}
                />
                <Button
                    onClick={handleSubmit}
                    disabled={isProcessing || !text.trim()}
                    className="self-end"
                >
                    Confirm Text
                </Button>
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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl mx-auto">
                {[
                    "A vibrant sunset over a futuristic city skyline.",
                    "Translate 'Hello world' to French.",
                    "Summarize the history of AI in 3 bullet points."
                ].map((demo, idx) => (
                    <button
                        key={idx}
                        disabled={isProcessing}
                        onClick={() => {
                            setText(demo);
                            onTextSelected(demo);
                        }}
                        className="relative p-3 text-sm text-left bg-muted/30 rounded-lg border border-muted-foreground/20 hover:ring-2 hover:ring-primary hover:border-transparent transition-all group/demo disabled:opacity-50"
                    >
                        <span className="line-clamp-3 leading-snug">{demo}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
