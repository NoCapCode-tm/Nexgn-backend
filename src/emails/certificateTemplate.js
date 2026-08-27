export const certificateTemplate = ({
  certificateId,
  documentId,
  documentName,
  documentHash,
  organizationName,
  createdOn,
  completedOn,
  totalSigners,
  originatorName,
  originatorEmail,
  originatorIp,
  signers = [],
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Certificate of Completion - Nexgn</title>

<style>
  /* --- Fonts --- */
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=MuseoModerno:ital,wght@0,100..900;1,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');

  /* --- Reset & Base Styles --- */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Plus Jakarta Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #f0f2f5; 
    display: flex;
    justify-content: center;
    padding: 40px 20px;
    -webkit-font-smoothing: antialiased;
  }

  .certificate-page {
    background-color: #ffffff;
    width: 100%;
    max-width: 800px;
    padding: 40px;
    color: #4a4a4a;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05); 
  }

  /* --- Top Bar --- */
  .top-bar {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    font-weight: 500;
    color: #555;
    margin-bottom: 50px;
  }

  /* --- Logo Section --- */
  .logo-section {
    margin-bottom: 50px;
    display: inline-block;
  }

  .brand-name {
    font-family: 'MuseoModerno', cursive, sans-serif;
    font-size: 130px; 
    font-weight: 400;
    color: #ff002b; 
    line-height: 0.9;
    letter-spacing: -2px;
  }

  .brand-subtitle {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 21.5px;
    font-weight: 500;
    color: #222;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: -6px;
  }

  /* --- Data Sections --- */
  .section {
    margin-bottom: 35px;
  }

  .section h3 {
    font-size: 18px;
    font-weight: 480;
    color: #444;
    margin-bottom: 12px;
  }

  .data-row {
    font-size: 13px;
    line-height: 1.8;
    color: #555;
  }

  /* --- Signature --- */
  .signature-label {
    margin-top: 15px;
    margin-bottom: 5px;
  }

  .signature-img {
    max-width: 180px;
    height: auto;
    display: block;
  }

  /* --- Footer --- */
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 70px;
    gap: 30px;
  }

  .footer-text {
    flex: 1;
    font-size: 11px;
    color: #666;
    line-height: 1.5;
  }

  .footer-text p {
    margin-top: 2px;
  }

  .footer-text strong {
    color: #333;
  }

  .footer-icon {
    width: 100px;
    height: 100px;
    object-fit: contain;
  }

  /* --- Mobile Responsiveness --- */
  @media (max-width: 600px) {
    .certificate-page { padding: 30px 20px; }
    .top-bar { flex-direction: column; gap: 10px; }
    .footer { flex-direction: column-reverse; align-items: flex-start; }
    .footer-icon { margin-bottom: 20px; }
    .brand-name { font-size: 60px; }
    .brand-subtitle { font-size: 14px; }
  }
</style>
</head>

<body>

<div class="certificate-page">

  <!-- Top Bar -->
  <div class="top-bar">
    <div>Generated On: ${completedOn}</div>
    <div>System ID: ${certificateId}</div>
  </div>

  <!-- Logo Section -->
  <div class="logo-section">
    <div class="brand-name">Nexgn</div>
    <div class="brand-subtitle">
      Certificate of Completion
    </div>
  </div>

  <!-- Document Summary -->
  <div class="section">
    <h3>Document Summary</h3>
    <div class="data-row">Document ID : ${documentId}</div>
    <div class="data-row">Document Name : ${documentName}</div>
    <div class="data-row">Document Hash (SHA-256) : ${documentHash}</div>
    <div class="data-row">Issuing Organization : ${organizationName}</div>
    <div class="data-row">Created On : ${createdOn}</div>
    <div class="data-row">Completed On : ${completedOn}</div>
    <div class="data-row">Total Signers : ${totalSigners}</div>
  </div>

  <!-- Document Originator -->
  <div class="section">
    <h3>Document Originator</h3>
    <div class="data-row">Originator Name : ${originatorName || "N/A"}</div>
    <div class="data-row">Originator Email : ${originatorEmail || "N/A"}</div>
    <div class="data-row">IP Address : ${originatorIp || "N/A"}</div>
  </div>

  <!-- Signer Details -->
  ${signers
    .map(
      (signer, index) => `
  <div class="section">
    <h3>Signer Details (${index + 1} of ${signers.length})</h3>
    <div class="data-row">Signer Name : ${signer.name || "N/A"}</div>
    <div class="data-row">Signer Email : ${signer.email || "N/A"}</div>
    <div class="data-row">Signed On : ${signer.signedAt || "N/A"}</div>
    <div class="data-row">IPv4 Address : ${signer.ipv4 || "N/A"}</div>
    <div class="data-row">IPv6 Address : ${signer.ipv6 || "N/A"}</div>
    
    ${
      signer.signatureImage
        ? `
    <div class="data-row signature-label">Digital Signature :</div>
    <img 
      src="${signer.signatureImage}" 
      class="signature-img" 
      alt="Digital Signature"
    />
        `
        : ""
    }
  </div>
    `
    )
    .join("")}

  <!-- Footer -->
  <div class="footer">
    <div class="footer-text">
      <p><strong>Compliance &amp; Audit Trail Notice:</strong> This Certificate of Completion serves as a verified cryptographic audit trail for the associated document.</p>
      <p>Signatures executed via the Nexgn platform are legally binding and comply with applicable electronic-signature frameworks.</p>
      <p>The Document Hash (SHA-256) provided above can be used to verify the integrity and unmodified state of the original signed document.</p>
    </div>
    <!-- Nexgn red square icon -->
    <img 
      src="https://sign.nexgn.cloud/stack/og-logo.png" 
      class="footer-icon" 
      alt="Nexgn Icon"
    />
  </div>

</div>

</body>
</html>
  `;
};