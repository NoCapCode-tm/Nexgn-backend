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
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "png";
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
    return null;
}

// pdf-lib's origin (0,0) is the bottom-left corner of the page.
function getPdfY(page, y, height) {
    return page.getHeight() - Number(y) - Number(height);
}

export const generateSignedDocumentPDF = async ({
    pdfBuffer,
    widgets
}) => {

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Matches the page.getViewport({ scale: 1.2 }) from your frontend
    const SCALE_FACTOR = 1.2;
    
    // Simulate frontend CSS (1.5px border + 4px padding = 5.5px inset)
    const INSET = 5.5 / SCALE_FACTOR;

    for (const widget of widgets) {
        const pageNumber = Number(widget.page);

        if (!pageNumber || pageNumber < 1) continue;

        const page = pdfDoc.getPage(pageNumber - 1);
        if (!page) continue;

        // 1. Convert widget coordinates to native PDF points
        const x = (Number(widget.x) || 0) / SCALE_FACTOR;
        const y = (Number(widget.y) || 0) / SCALE_FACTOR;
        const width = (Number(widget.width) || 100) / SCALE_FACTOR;
        const height = (Number(widget.height) || 30) / SCALE_FACTOR;

        // 2. Calculate the "content box" (inside the CSS padding/borders)
        const contentX = x + INSET;
        const contentY = getPdfY(page, y, height) + INSET;
        const contentWidth = Math.max(0, width - (INSET * 2));
        const contentHeight = Math.max(0, height - (INSET * 2));

        /*
         * SIGNATURE WIDGET
         */
        if (widget.widgetname === "signature") {
            const imageData = dataUrlToBuffer(widget.value);
            if (!imageData) continue;

            let image;
            if (imageData.type === "png") {
                const pngBytes = new Uint8Array(imageData.buffer);
                image = await pdfDoc.embedPng(pngBytes);
            } else if (imageData.type === "jpg") {
                const jpgBytes = new Uint8Array(imageData.buffer);
                image = await pdfDoc.embedJpg(jpgBytes);
            }

            if (image) {
                const imgDims = image.scale(1);
                const imgAspect = imgDims.width / imgDims.height;
                
                // Matches the CSS `.signaturePreviewImage` (90% width/height)
                const paddedWidth = contentWidth * 0.9;
                const paddedHeight = contentHeight * 0.9;
                const paddingX = contentWidth * 0.05;
                const paddingY = contentHeight * 0.05;
                
                let drawWidth, drawHeight, offsetX, offsetY;

                // Mathematical simulation of `object-fit: contain`
                if (imgAspect > (paddedWidth / paddedHeight)) {
                    drawWidth = paddedWidth;
                    drawHeight = paddedWidth / imgAspect;
                    offsetX = 0;
                    offsetY = (paddedHeight - drawHeight) / 2; // Center vertically
                } else {
                    drawHeight = paddedHeight;
                    drawWidth = paddedHeight * imgAspect;
                    offsetX = (paddedWidth - drawWidth) / 2; // Center horizontally
                    offsetY = 0;
                }

                // Apply padding and centering logic to the final coordinates
                const finalX = contentX + paddingX + offsetX;
                const finalY = contentY + paddingY + offsetY;

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

            const textStr = String(widget.value);
            // Dynamic font sizing to fit the box
            const fontSize = Math.min(14, Math.max(8, contentHeight * 0.6));
            
            // Calculate text width to horizontally center it (simulates text-align: center)
            const textWidth = font.widthOfTextAtSize(textStr, fontSize);
            let textX = contentX + (contentWidth - textWidth) / 2;
            
            // Prevent text from overflowing the left side if it's too long
            if (textWidth > contentWidth) textX = contentX + 2; 

            // Calculate exact vertical centering using cap-height offset
            const textY = contentY + (contentHeight / 2) - (fontSize * 0.3);

            page.drawText(textStr, {
                x: textX,
                y: textY,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
                maxWidth: Math.max(10, contentWidth)
            });
        }
    }

    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
};