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
    if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
    ) {
        return "png";
    }

    // JPEG
    if (
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
    ) {
        return "jpg";
    }

    return null;
}


function getPdfY(page, y, height) {
    return (
        page.getHeight() -
        Number(y) -
        Number(height)
    );
}


export const generateSignedDocumentPDF = async ({
    pdfBuffer,
    widgets
}) => {

    const pdfDoc =
        await PDFDocument.load(pdfBuffer);

    const font =
        await pdfDoc.embedFont(
            StandardFonts.Helvetica
        );


    for (const widget of widgets) {

        const pageNumber =
            Number(widget.page);

        if (
            !pageNumber ||
            pageNumber < 1
        ) {
            continue;
        }


        const page =
            pdfDoc.getPage(
                pageNumber - 1
            );

        if (!page) {
            continue;
        }


        const x =
            Number(widget.x) || 0;

        const y =
            Number(widget.y) || 0;

        const width =
            Number(widget.width) || 100;

        const height =
            Number(widget.height) || 30;


        /*
         * SIGNATURE
         */
        if (
            widget.widgetname ===
            "signature"
        ) {

           const imageData = dataUrlToBuffer(widget.value);
            console.log("========== SIGNATURE DEBUG ==========");
    console.log("Value prefix:", widget.value?.slice(0, 50));
    console.log("Data length:", widget.value?.length);
    console.log("Image type:", imageData?.type);
    console.log(
        "First bytes:",
        imageData
            ? [...imageData.buffer.subarray(0, 12)]
            : null
    );
    console.log("====================================");

if (!imageData) {
    continue;
}

let image;

if (imageData.type === "png") {
    const pngBytes = new Uint8Array(imageData.buffer);

    image = await pdfDoc.embedPng(pngBytes);

} else if (imageData.type === "jpg") {
    const jpgBytes = new Uint8Array(imageData.buffer);

    console.log("JPEG bytes:", jpgBytes.length);
    console.log(
        "JPEG SOI:",
        jpgBytes[0],
        jpgBytes[1]
    );

    image = await pdfDoc.embedJpg(jpgBytes);
}

            page.drawImage(
                image,
                {
                    x,
                    y: getPdfY(
                        page,
                        y,
                        height
                    ),
                    width,
                    height
                }
            );

            continue;
        }


        /*
         * TEXT / NUMBER / NAME /
         * EMAIL / DATE
         */
        if (
            [
                "text",
                "number",
                "name",
                "email",
                "date"
            ].includes(
                widget.widgetname
            )
        ) {

            if (
                widget.value ===
                undefined ||
                widget.value ===
                null ||
                widget.value === ""
            ) {
                continue;
            }


            const fontSize =
                Math.min(
                    14,
                    Math.max(
                        8,
                        height * 0.55
                    )
                );


            page.drawText(
                String(widget.value),
                {
                    x: x + 4,

                    y:
                        getPdfY(
                            page,
                            y,
                            height
                        ) +
                        Math.max(
                            2,
                            (
                                height -
                                fontSize
                            ) / 2
                        ),

                    size:
                        fontSize,

                    font,

                    color:
                        rgb(0, 0, 0),

                    maxWidth:
                        Math.max(
                            10,
                            width - 8
                        )
                }
            );
        }
    }


    const bytes =
        await pdfDoc.save();

    return Buffer.from(bytes);
};