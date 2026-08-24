import puppeteer from "puppeteer";

export const generateCertificatePDF = async (html) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Highly recommended for Render/serverless environments to prevent memory crashes
      ],
    });

    const page = await browser.newPage();

    // Set a default timeout (e.g., 15 seconds) so it doesn't hang forever
    await page.setDefaultNavigationTimeout(15000); 

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    return pdfBuffer;
  } catch (error) {
    // This will print the exact reason for the failure in your Render logs
    console.error("Puppeteer PDF Generation Error:", error.message);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};