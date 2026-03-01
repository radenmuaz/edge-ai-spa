# Edge AI SPA Template

A generic, fully client-side edge AI React application template built with Vite and Tailwind CSS.
This template allows you to build applications that flexibly swap input and output modes (image, text, audio) entirely within the browser.

## Features

- **Generic Processing Pipeline**: Easily swap between Image, Text, and Audio inputs and outputs.
- **Client-Side Processing**: No data is uploaded to a server. Processing logic is designed to be run via WebAssembly (e.g. `onnxruntime-web`) securely on the local device.
- **Componentized UI**: Tailwind CSS and `shadcn/ui` style drag-and-drop zones for various media types. 
- **Universal Result Viewer**: A flexible result presentation component capable of displaying generated images, returned text, or playable audio.

## Development Setup

### 1. Install Dependencies
Ensure you have Node.js and `pnpm` installed. From this directory, run:
```bash
pnpm install
```

### 2. Run the Development Server
```bash
pnpm run dev
```
Open `http://localhost:5173` to view the app!

## Project Structure
- `src/App.tsx`: Main React application logic handling state and processing dispatchers.
- `src/components/`: Reusable Tailwind CSS UI components (dropzones, results viewer).
- `src/lib/rembg.ts`: The core background removal logic, demonstrating how an ONNX session manages image pre-processing and inference. Serve as inspiration for text/audio models!
- `public/models/`: Holds the U2Net ONNX models and `onnxruntime-web` WASM execution files.
