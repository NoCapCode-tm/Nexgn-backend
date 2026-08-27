import puppeteer from 'puppeteer';

export const generateCertificatePDF = async (htmlContent) => {
  // 1. Add Render-friendly arguments to prevent memory crashes
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
      '--single-process'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // 2. Switch to 'domcontentloaded' and increase timeout to 60 seconds
    await page.setContent(htmlContent, {
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    return pdfBuffer;
  } catch (error) {
    console.error('Puppeteer PDF Generation Error:', error.message);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
};