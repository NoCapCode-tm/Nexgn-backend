import puppeteer from "puppeteer";

// Shared browser instance across function invocations
let browserInstance = null;

const getBrowser = async () => {
    // Reuse the existing instance if it's still alive and connected
    if (browserInstance && browserInstance.isConnected()) {
        return browserInstance;
    }

    console.log("Launching new shared Puppeteer browser instance...");

    const launchOptions = {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
            "--disable-extensions"
        ]
    };

    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    browserInstance = await puppeteer.launch(launchOptions);

    // Reset reference if the browser disconnects or crashes unexpectedly
    browserInstance.once("disconnected", () => {
        console.warn("Shared Puppeteer browser disconnected.");
        browserInstance = null;
    });

    return browserInstance;
};

export const generateCertificatePDF = async (html) => {
    let page = null;

    try {
        if (!html || typeof html !== "string") {
            throw new Error("Certificate HTML is empty or invalid");
        }

        const browser = await getBrowser();
        page = await browser.newPage();

        // 1. Block unnecessary third-party requests (analytics, fonts, stylesheets, media)
        await page.setRequestInterception(true);
        page.on("request", (req) => {
            const resourceType = req.resourceType();
            // Allow essential document resources and images (for signatures/seals)
            if (["document", "image"].includes(resourceType)) {
                req.continue();
            } else {
                req.abort();
            }
        });

        // 2. Set viewport matched to typical A4 proportions
        await page.setViewport({
            width: 1200,
            height: 1600,
            deviceScaleFactor: 1
        });

        // 3. Wait for network to settle so external image assets finish loading
        await page.setContent(html, {
            waitUntil: "networkidle0",
            timeout: 30000
        });

        // 4. Fallback safeguard: Ensure all <img> tags have completely loaded
        await page.evaluate(async () => {
            const images = Array.from(document.images);
            await Promise.all(
                images.map((img) => {
                    if (img.complete) return Promise.resolve();
                    return new Promise((resolve) => {
                        img.addEventListener("load", resolve, { once: true });
                        img.addEventListener("error", resolve, { once: true });
                    });
                })
            );
        });

        // 5. Generate PDF buffer directly (Puppeteer returns a Uint8Array)
        const pdfUint8 = await page.pdf({
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

        const pdfBuffer = Buffer.from(pdfUint8);

        if (!pdfBuffer.length) {
            throw new Error("Generated PDF is empty");
        }

        return pdfBuffer;

    } catch (error) {
        console.error("Puppeteer PDF Generation Error:", error);
        throw new Error(`Failed to generate PDF: ${error.message}`);
    } finally {
        // Only close the individual page/tab, leaving the browser open for future jobs
        if (page) {
            try {
                await page.close();
            } catch (closeErr) {
                console.error("Failed to close page tab:", closeErr);
            }
        }
    }
};