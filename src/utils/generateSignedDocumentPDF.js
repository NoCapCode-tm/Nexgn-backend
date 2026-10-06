import {
    PDFDocument,
    StandardFonts,
    rgb
} from "pdf-lib";

function dataUrlToBuffer(dataUrl) {
    if (!dataUrl || typeof dataUrl !== "string") {
        return null;
    }

    const commaIndex = dataUrl.indexOf(",");

    if (commaIndex === -1) {
        return null;
    }

    const base64 = dataUrl.slice(commaIndex + 1);
    const buffer = Buffer.from(base64, "base64");
    const type = detectImageType(buffer);

    if (!type) {
        console.error("Unsupported signature image format");
        return null;
    }

    return {
        buffer,
        type
    };
}

function detectImageType(buffer) {
    if (!buffer || buffer.length < 4) {
        return null;
    }

    // PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        return "png";
    }

    // JPEG
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return "jpg";
    }

    return null;
}

// pdf-lib uses a bottom-left origin (0,0 is bottom left).
// This calculates the correct Y coordinate for the bottom-left of our widget box.
function getPdfY(page, y, height) {
    return page.getHeight() - Number(y) - Number(height);
}

export const generateSignedDocumentPDF = async ({
    pdfBuffer,
    widgets
}) => {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // ==========================================
    // FIX 1: COORDINATE SCALING
    // Matches the page.getViewport({ scale: 1.2 }) from SignViewer_2.jsx
    // ==========================================
    const SCALE_FACTOR = 1.2;

    for (const widget of widgets) {
        const pageNumber = Number(widget.page);

        if (!pageNumber || pageNumber < 1) {
            continue;
        }

        const page = pdfDoc.getPage(pageNumber - 1);

        if (!page) {
            continue;
        }

        // Downscale the coordinates from the 1.2x frontend grid back to native PDF points
        const x = (Number(widget.x) || 0) / SCALE_FACTOR;
        const y = (Number(widget.y) || 0) / SCALE_FACTOR;
        const width = (Number(widget.width) || 100) / SCALE_FACTOR;
        const height = (Number(widget.height) || 30) / SCALE_FACTOR;

        /*
         * SIGNATURE WIDGET
         */
        if (widget.widgetname === "signature") {
            const imageData = dataUrlToBuffer(widget.value);

            if (!imageData) {
                continue;
            }

            let image;

            if (imageData.type === "png") {
                const pngBytes = new Uint8Array(imageData.buffer);
                image = await pdfDoc.embedPng(pngBytes);
            } else if (imageData.type === "jpg") {
                const jpgBytes = new Uint8Array(imageData.buffer);
                image = await pdfDoc.embedJpg(jpgBytes);
            }

            if (image) {
                // ==========================================
                // FIX 2: ASPECT RATIO PRESERVATION (object-fit: contain)
                // ==========================================
                const imgDims = image.scale(1);
                const imgAspect = imgDims.width / imgDims.height;
                
                // Matches the 90% width/height CSS from `.signaturePreviewImage`
                const paddedWidth = width * 0.9;
                const paddedHeight = height * 0.9;
                
                let drawWidth, drawHeight, offsetX, offsetY;

                // Calculate dimensions to fit inside the box without stretching
                if (imgAspect > (paddedWidth / paddedHeight)) {
                    // Image is wider than the box
                    drawWidth = paddedWidth;
                    drawHeight = paddedWidth / imgAspect;
                    offsetX = 0;
                    offsetY = (paddedHeight - drawHeight) / 2; // Center vertically
                } else {
                    // Image is taller than the box
                    drawHeight = paddedHeight;
                    drawWidth = paddedHeight * imgAspect;
                    offsetX = (paddedWidth - drawWidth) / 2; // Center horizontally
                    offsetY = 0;
                }

                // Add 5% padding offset + the centering offset
                const finalX = x + (width * 0.05) + offsetX;
                const finalY = getPdfY(page, y, height) + (height * 0.05) + offsetY;

                // Draw the signature perfectly centered and un-stretched
                page.drawImage(image, {
                    x: finalX,
                    y: finalY,
                    width: drawWidth,
                    height: drawHeight
                });
            }
            continue;
        }

        /*
         * TEXT / NUMBER / NAME / EMAIL / DATE WIDGETS
         */
        if (["text", "number", "name", "email", "date"].includes(widget.widgetname)) {
            
            if (widget.value === undefined || widget.value === null || widget.value === "") {
                continue;
            }

            const fontSize = Math.min(14, Math.max(8, height * 0.55));

            page.drawText(String(widget.value), {
                x: x + 4,
                y: getPdfY(page, y, height) + Math.max(2, (height - fontSize) / 2),
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
                maxWidth: Math.max(10, width - 8)
            });
        }
    }

    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
};