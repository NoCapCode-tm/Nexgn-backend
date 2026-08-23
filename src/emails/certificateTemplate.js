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

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  color: #1a1a1a;
}

.certificate {
  background-color: #ffffff;
  width: 100%;
  max-width: 850px;
  padding: 50px 60px;
  border: 2px solid #cc0000;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
}

.brand-container {
  display: flex;
  align-items: center;
}

.brand-container img {
  max-height: 55px;
  width: auto;
  object-fit: contain;
}

.generation-info {
  font-size: 12px;
  color: #555;
  margin-top: 10px;
  text-align: right;
}

.title-section {
  text-align: center;
  margin-bottom: 50px;
}

.title-section h2 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 15px;
}

.title-section h2 .highlight {
  color: #cc0000;
}

.title-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.title-divider::before,
.title-divider::after {
  content: "";
  display: block;
  width: 250px;
  height: 1px;
  background-color: #e0e0e0;
}

.title-dot {
  width: 6px;
  height: 6px;
  background-color: #cc0000;
  border-radius: 50%;
}

.section {
  margin-bottom: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #cc0000;
  margin-bottom: 25px;
}

.section-title svg {
  fill: none;
  stroke: #cc0000;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  width: 24px;
  height: 24px;
}

.section-title h3 {
  font-size: 20px;
  font-weight: 600;
}

.data-grid {
  display: grid;
  grid-template-columns: 180px 20px 1fr;
  row-gap: 16px;
  font-size: 14px;
  color: #1a1a1a;
  padding-left: 34px;
}

.data-label {
  font-weight: 600;
  color: #333;
}

.data-value {
  word-wrap: break-word;
  color: #1a1a1a;
}

.section-divider {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 35px 0;
}

.signature-box {
  border: 1px solid #cc0000;
  width: 180px;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 2px;
  background-color: #fafafa;
}

.signature-box img {
  max-width: 90%;
  max-height: 90%;
}

.legal-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  font-size: 11px;
  color: #777;
  text-align: justify;
  line-height: 1.5;
}

@media (max-width: 768px) {

  .header {
    flex-direction: column;
    gap: 20px;
  }

  .generation-info {
    text-align: left;
  }

  .data-grid {
    grid-template-columns: 140px 10px 1fr;
    padding-left: 0;
  }

  .title-divider::before,
  .title-divider::after {
    width: 100px;
  }

  .certificate {
    padding: 30px 20px;
  }

}

</style>

</head>

<body>

<div class="certificate">

  <!-- Header -->

  <div class="header">

    <div class="brand-container">

      <img
        src="https://nexgn.cloud/assests/nexgn.png"
        alt="Nexgn Logo"
      />

    </div>

    <div class="generation-info">

      <strong>Generated On:</strong>
      ${completedOn}

      <br />

      <strong>System ID:</strong>
      ${certificateId}

    </div>

  </div>


  <!-- Title -->

  <div class="title-section">

    <h2>
      Certificate of
      <span class="highlight">Completion</span>
    </h2>

    <div class="title-divider">
      <div class="title-dot"></div>
    </div>

  </div>


  <!-- Document Summary -->

  <div class="section">

    <div class="section-title">

      <svg viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>

      <h3>Document Summary</h3>

    </div>


    <div class="data-grid">

      <div class="data-label">Document ID</div>
      <div>:</div>
      <div class="data-value">
        ${documentId}
      </div>


      <div class="data-label">Document Name</div>
      <div>:</div>
      <div class="data-value">
        ${documentName}
      </div>


      <div class="data-label">Document Hash (SHA-256)</div>
      <div>:</div>
      <div class="data-value">
        ${documentHash}
      </div>


      <div class="data-label">Issuing Organization</div>
      <div>:</div>
      <div class="data-value">
        ${organizationName}
      </div>


      <div class="data-label">Created On</div>
      <div>:</div>
      <div class="data-value">
        ${createdOn}
      </div>


      <div class="data-label">Completed On</div>
      <div>:</div>
      <div class="data-value">
        ${completedOn}
      </div>


      <div class="data-label">Total Signers</div>
      <div>:</div>
      <div class="data-value">
        ${totalSigners}
      </div>

    </div>

  </div>


  <hr class="section-divider" />


  <!-- Document Originator -->

  <div class="section">

    <div class="section-title">

      <svg viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>

      <h3>Document Originator</h3>

    </div>


    <div class="data-grid">

      <div class="data-label">Originator Name</div>
      <div>:</div>

      <div class="data-value">
        ${originatorName || "N/A"}
      </div>


      <div class="data-label">Originator Email</div>
      <div>:</div>

      <div class="data-value">
        ${originatorEmail || "N/A"}
      </div>


      <div class="data-label">IP Address</div>
      <div>:</div>

      <div class="data-value">
        ${originatorIp || "N/A"}
      </div>

    </div>

  </div>


  <hr class="section-divider" />


  <!-- Signer -->

  ${signers
    .map(
      (signer, index) => `
      
      <div class="section">

        <div class="section-title">

          <svg viewBox="0 0 24 24">
            <path d="M20.5 3.5a2.121 2.121 0 0 1 0 3L7.5 19.5l-4 1 1-4 13-13a2.121 2.121 0 0 1 3 0z"></path>
            <path d="M15.5 5.5l3 3"></path>
          </svg>

          <h3>
            Signer Details (${index + 1} of ${signers.length})
          </h3>

        </div>


        <div class="data-grid">

          <div class="data-label">
            Signer Name
          </div>

          <div>:</div>

          <div class="data-value">
            ${signer.name || "N/A"}
          </div>


          <div class="data-label">
            Signer Email
          </div>

          <div>:</div>

          <div class="data-value">
            ${signer.email || "N/A"}
          </div>


          <div class="data-label">
            Signed On
          </div>

          <div>:</div>

          <div class="data-value">
            ${signer.signedAt || "N/A"}
          </div>


          <div class="data-label">
            IPv4 Address
          </div>

          <div>:</div>

          <div class="data-value">
            ${signer.ipv4 || "N/A"}
          </div>


          <div class="data-label">
            IPv6 Address
          </div>

          <div>:</div>

          <div class="data-value">
            ${signer.ipv6 || "N/A"}
          </div>


          ${
            signer.signatureImage
              ? `
                <div class="data-label">
                  Digital Signature
                </div>

                <div>:</div>

                <div class="data-value">

                  <div class="signature-box">

                    <img
                      src="${signer.signatureImage}"
                      alt="Digital Signature"
                    />

                  </div>

                </div>
              `
              : ""
          }

        </div>

      </div>

      ${
        index !== signers.length - 1
          ? `<hr class="section-divider" />`
          : ""
      }

    `
    )
    .join("")}


  <!-- Legal Footer -->

  <div class="legal-footer">

    <strong>
      Compliance &amp; Audit Trail Notice:
    </strong>

    This Certificate of Completion serves as a verified
    cryptographic audit trail for the associated document.
    Signatures executed via the Nexgn platform are legally
    binding and comply with applicable electronic-signature
    frameworks.

    The Document Hash (SHA-256) provided above can be used
    to verify the integrity and unmodified state of the
    original signed document.

  </div>

</div>

</body>
</html>
  `;
};