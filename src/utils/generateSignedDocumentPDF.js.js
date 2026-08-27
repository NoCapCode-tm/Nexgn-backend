import {
    PDFDocument,
    StandardFonts,
    rgb
} from "pdf-lib";


function dataUrlToBuffer(dataUrl) {
    if (!dataUrl) return null;

    const match = dataUrl.match(
        /^data:image\/(png|jpeg|jpg);base64,(.+)$/
    );

    if (!match) return null;

    return Buffer.from(
        match[2],
        "base64"
    );
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

            const imageBuffer =
                dataUrlToBuffer(
                    widget.value
                );

            if (!imageBuffer) {
                continue;
            }


            let image;

            if (
                widget.value.startsWith(
                    "data:image/png"
                )
            ) {
                image =
                    await pdfDoc.embedPng(
                        imageBuffer
                    );
            } else {
                image =
                    await pdfDoc.embedJpg(
                        imageBuffer
                    );
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