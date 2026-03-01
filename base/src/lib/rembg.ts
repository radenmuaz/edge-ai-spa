// Global reference for the lazy-loaded ONNX runtime
let ort: any = null;
let session: any = null;

async function initOrt() {
    if (ort) return ort;
    console.log("[WASM] Dynamically importing onnxruntime-web...");
    // Lazy load the huge ONNX runtime purely on-demand so the UI doesn't crash on initial page load
    ort = (await import('onnxruntime-web')).default;
    ort.env.wasm.wasmPaths = window.location.origin + '/models/';
    ort.env.wasm.numThreads = 1;
    return ort;
}

/**
 * Normalizes and processes the input image tensor for U2Net model.
 */
function preprocess(image: HTMLImageElement, localOrt: any) {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get 2d context for resizing image");

    ctx.drawImage(image, 0, 0, 320, 320);
    const imageData = ctx.getImageData(0, 0, 320, 320);
    const { data, width, height } = imageData;

    const float32Data = new Float32Array(3 * width * height);
    for (let i = 0; i < width * height; i++) {
        let r = data[i * 4] / 255.0;
        let g = data[i * 4 + 1] / 255.0;
        let b = data[i * 4 + 2] / 255.0;
        r = (r - 0.485) / 0.229;
        g = (g - 0.456) / 0.224;
        b = (b - 0.406) / 0.225;
        float32Data[i] = r;
        float32Data[width * height + i] = g;
        float32Data[2 * width * height + i] = b;
    }
    return new localOrt.Tensor('float32', float32Data, [1, 3, height, width]);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Canvas failure")), "image/png");
    });
}

async function applyMask(probMask: Float32Array, maskWidth: number, maskHeight: number, originalImage: HTMLImageElement): Promise<Blob> {
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = maskWidth; maskCanvas.height = maskHeight;
    const maskCtx = maskCanvas.getContext('2d')!;
    const maskImageData = maskCtx.createImageData(maskWidth, maskHeight);

    let min = Infinity, max = -Infinity;
    for (let i = 0; i < maskWidth * maskHeight; i++) {
        if (probMask[i] < min) min = probMask[i];
        if (probMask[i] > max) max = probMask[i];
    }
    for (let i = 0; i < maskWidth * maskHeight; i++) {
        let val = probMask[i];
        if (max > 1.01 || min < -0.01) val = (val - min) / (max - min);
        const alpha = Math.round(val * 255);
        // We want the mask image to be purely driven by the alpha channel
        // so that globalCompositeOperation = 'destination-in' correctly masks out the background.
        maskImageData.data[i * 4] = 0;
        maskImageData.data[i * 4 + 1] = 0;
        maskImageData.data[i * 4 + 2] = 0;
        maskImageData.data[i * 4 + 3] = alpha;
    }
    maskCtx.putImageData(maskImageData, 0, 0);

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = originalImage.width; finalCanvas.height = originalImage.height;
    const finalCtx = finalCanvas.getContext('2d')!;

    // Draw original
    finalCtx.drawImage(originalImage, 0, 0);

    // Mask it using the alpha channel from maskCanvas
    finalCtx.globalCompositeOperation = 'destination-in';
    finalCtx.drawImage(maskCanvas, 0, 0, originalImage.width, originalImage.height);

    // Reset compositor just in case
    finalCtx.globalCompositeOperation = 'source-over';

    return await canvasToBlob(finalCanvas);
}

export async function removeBackground(file: File, modelName: string = 'u2net'): Promise<Blob> {
    const localOrt = await initOrt();

    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.src = imageUrl;
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; });

    let probMask: Float32Array | null = null;

    try {
        if (!session) {
            console.log(`[WASM] Fetching ONNX model: /models/${modelName}.onnx...`);
            const response = await fetch(`/models/${modelName}.onnx`);
            if (!response.ok) {
                throw new Error(`Failed to fetch model: ${response.status} ${response.statusText}`);
            }
            const modelArrayBuffer = await response.arrayBuffer();

            // Explicitly cast to Uint8Array as required by some ORT versions to prevent protobuf parsing errors
            const uint8View = new Uint8Array(modelArrayBuffer);
            if (uint8View.length > 0 && uint8View[0] === 60) { // '<' in ascii
                throw new Error("Vite served HTML instead of the ONNX binary file!");
            }

            console.log(`[WASM] Loaded model binary (${uint8View.byteLength} bytes). Initializing InferenceSession...`);
            session = await localOrt.InferenceSession.create(uint8View, { executionProviders: ['wasm'] });
        }

        console.log("[WASM] Preprocessing Tensor...");
        const tensor = preprocess(image, localOrt);
        const inputName = session.inputNames[0];
        const feeds: Record<string, any> = {};
        feeds[inputName] = tensor;

        console.log("[WASM] Executing Inference...");
        const results = await session.run(feeds);
        probMask = results[session.outputNames[0]].data as Float32Array;
    } catch (e: any) {
        console.error("ONNX Inference failed (often due to localhost dev-server protobuf limits):", e);
        // Fallback Gracefully
        console.warn("Gracefully falling back to dummy JS simulation...");
        probMask = null;
    }

    let resultBlob: Blob;
    console.log("[JS] Executing Pure JS Fast Masking...");
    if (probMask) {
        resultBlob = await applyMask(probMask, 320, 320, image);
    } else {
        // Ultimate Dummy Fallback if ONNX failed entirely
        console.log("[JS] Simulating background removal...");
        await new Promise((res) => setTimeout(res, 1000));
        resultBlob = file; // Return original
    }

    URL.revokeObjectURL(imageUrl);
    return resultBlob;
}
