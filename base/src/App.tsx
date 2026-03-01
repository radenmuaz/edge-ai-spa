import { useState, useEffect } from 'react';
import { ImageUploadZone } from '@/components/image-upload-zone';
import { UniversalResult } from '@/components/universal-result';
import { removeBackground } from '@/lib/rembg';

export default function App() {
  const [inputData, setInputData] = useState<string | null>(null);
  const [outputData, setOutputData] = useState<string | null>(null);

  // Keep file reference for image/audio processing
  const [fileToProcess, setFileToProcess] = useState<File | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageSelected = (file: File) => {
    const url = URL.createObjectURL(file);
    setInputData(url);
    setFileToProcess(file);
    setOutputData(null);
  };

  const handleProcess = async () => {
    if (!inputData) return;
    setIsProcessing(true);

    try {
      // 1. Image -> Image (Real RemBG logic)
      if (fileToProcess) {
        let resultBlob;
        try {
          resultBlob = await removeBackground(fileToProcess, 'u2netp');
        } catch (e: any) {
          throw e;
        }
        setOutputData(URL.createObjectURL(resultBlob));
        return;
      }

      // 2. Mock processing for everything else
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock output image (placeholder)
      setOutputData("https://images.unsplash.com/photo-1699933544773-fd1e2202b80f?q=80&w=400&auto=format&fit=crop");

    } catch (e: any) {
      console.error(e);
      alert("Failed to process input. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setInputData(null);
    setOutputData(null);
    setFileToProcess(null);
  };

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (isProcessing) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) handleImageSelected(file);
          return;
        }

        if (item.type === 'text/plain') {
          item.getAsString(async (url) => {
            try {
              new URL(url); // basic validation
              const res = await fetch(url);
              const blob = await res.blob();
              if (blob.type.startsWith('image/')) {
                const file = new File([blob], 'pasted-url-image.png', { type: blob.type });
                handleImageSelected(file);
              }
            } catch (err) {
              console.log("Pasted text was not a valid image URL");
            }
          });
          return;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isProcessing]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4 md:p-8">
      <header className="text-center mb-10 mt-4 md:mt-8">
        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
          Edge AI SPA Template
        </h1>
        <p className="text-muted-foreground max-w-[600px] mx-auto text-lg">
          Generic SaaS template to flexibly swap input/output modes client-side.
        </p>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-center gap-6">

        <div className="w-full max-w-4xl flex flex-col gap-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <UniversalResult
            inputType="image" // Hardcoded for now based on previous requirements, but the capability is there
            inputData={inputData || ""}
            outputType="image"
            outputData={outputData}
            isProcessing={isProcessing}
            onProcess={handleProcess}
            onReset={handleReset}
            onInputDataChange={setInputData}
            uploadNode={
              <div className="w-full h-full p-2">
                <div className="h-full bg-muted/10 p-4 sm:p-8 rounded-xl border border-dashed hover:bg-muted/20 transition-colors flex justify-center items-center">
                  <ImageUploadZone onImageSelected={handleImageSelected} isProcessing={isProcessing} />
                </div>
              </div>
            }
          />
        </div>

        {/* Demo Images Wrapper */}
        <div className="w-full max-w-4xl mt-8 flex flex-col items-center gap-4">
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground font-medium">
                Or try a sample
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-2xl">
            {[
              { src: "/demo-images/original/calico.png", label: "Calico Cat" },
              { src: "/demo-images/original/tortie.png", label: "Tortie Cat" },
              { src: "/demo-images/original/grey.png", label: "Grey Cat" },
            ].map((demo) => (
              <button
                key={demo.src}
                disabled={isProcessing}
                onClick={async () => {
                  try {
                    const res = await fetch(demo.src);
                    const blob = await res.blob();
                    const file = new File([blob], demo.src.split('/').pop()!, { type: "image/png" });
                    handleImageSelected(file);
                  } catch (e) {
                    console.error("Failed to load demo image", e);
                  }
                }}
                className="relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-xl border border-muted-foreground/20 hover:ring-2 hover:ring-primary hover:border-transparent transition-all group/demo disabled:opacity-50"
              >
                <img src={demo.src} alt={demo.label} className="w-full h-full object-cover transition-transform group-hover/demo:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/demo:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-white text-sm font-medium">{demo.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
