import puppeteer from "puppeteer";

export const generateCertificatePDF = async (html) => {
    let browser = null;

    try {
        if (!html || typeof html !== "string") {
            throw new Error(
                "Certificate HTML is empty or invalid"
            );
        }

        console.log(
            "Starting Puppeteer..."
        );

        browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu"
            ]
        });

        console.log(
            "Puppeteer browser started"
        );

        const page =
            await browser.newPage();

        console.log(
            "Puppeteer page created"
        );

        await page.setViewport({
            width: 1200,
            height: 1600,
            deviceScaleFactor: 1
        });

        await page.setContent(
            html,
            {
                waitUntil: "domcontentloaded",
                timeout: 60000
            }
        );

        console.log(
            "Certificate HTML loaded"
        );

        await page.evaluate(async () => {
            if (document.fonts) {
                await document.fonts.ready;
            }
        });

        await page.evaluate(async () => {
            const images =
                Array.from(
                    document.images
                );

            await Promise.all(
                images.map((img) => {
                    if (img.complete) {
                        return Promise.resolve();
                    }

                    return new Promise(
                        (resolve) => {
                            img.addEventListener(
                                "load",
                                resolve,
                                {
                                    once: true
                                }
                            );

                            img.addEventListener(
                                "error",
                                resolve,
                                {
                                    once: true
                                }
                            );
                        }
                    );
                })
            );
        });

        console.log(
            "Certificate assets loaded"
        );

        const pdf =
            await page.pdf({
                format: "A4",
                printBackground: true,
                preferCSSPageSize: true,
                landscape: false,
                margin: {
                    top: "0",
                    right: "0",
                    bottom: "0",
                    left: "0"
                }
            });

        if (!pdf) {
            throw new Error(
                "Puppeteer returned empty PDF"
            );
        }

        const pdfBuffer =
            Buffer.from(pdf);

        if (!pdfBuffer.length) {
            throw new Error(
                "Generated PDF is empty"
            );
        }

        console.log(
            `Certificate PDF generated: ${pdfBuffer.length} bytes`
        );

        return pdfBuffer;

    } catch (error) {

        console.error(
            "Puppeteer PDF Generation Error:",
            error
        );

        throw new Error(
            `Failed to generate PDF: ${error.message}`
        );

    } finally {

        if (browser) {
            try {
                await browser.close();
            } catch (error) {
                console.error(
                    "Failed to close Puppeteer:",
                    error
                );
            }
        }
    }
};