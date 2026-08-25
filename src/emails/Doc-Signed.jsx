import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Heading,
  Hr,
  Link,
} from "@react-email/components";

// ---------------------------------------------------------------------------
// Same asset host / naming convention as VerifyEmail.jsx + ResetPasswordEmail.jsx.
//
// NOTE on the swirl: unlike the "9" and "e" swirls (static, no dynamic
// content behind them), this card wraps real per-document data — filename,
// page count, file size, signer names — none of which can be baked into a
// flattened image. So instead of a background-image swirl, this build
// approximates the curved left edge with CSS border-radius (robust in Apple
// Mail/Gmail/modern clients, degrades to square corners in Outlook desktop
// — no broken layout, just a less rounded corner). If you export the exact
// swirl shape as a PNG the way you did a.png/b.png, send me the filename +
// dimensions and I'll swap this to the same background-image technique.
// ---------------------------------------------------------------------------
const ASSET_URL = "https://prod.nexgn.cloud/template";
const HEART_ICON = `${ASSET_URL}/stamp.png`;
const LINKEDIN_ICON = `${ASSET_URL}/linkedin.png`;
const SECOND_SOCIAL_ICON = `${ASSET_URL}/instagram.png`;
const SECOND_SOCIAL_URL = "https://instagram.com/nexgn";
const PDF_ICON = `${ASSET_URL}/pdf.png`; // <-- confirm/replace filename
const CERT_SEAL_ICON = `${ASSET_URL}/seal.png`; // <-- confirm/replace filename (dashed-ring check seal)

const COLORS = {
  red: "#FF0915",
  redSoft: "#EF6E63",
  redPanel: "#FCE4E1",
  dark: "#1A1A1A",
  gray: "#6B7280",
  grayLight: "#9CA3AF",
  border: "#ECECEC",
  green: "#1FA35C",
};

const HEADING_FONT =
  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const BODY_FONT =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO_FONT =
  "'SFMono-Regular', 'Menlo', 'Consolas', 'Courier New', monospace";

const PX_DESKTOP = "40px";
const PX_MOBILE = "20px";

export default function DocumentSignedEmail({
  recipientName = "",
  documentName = "Service Agreement — Q3 2026.pdf",
  pageCount = 2,
  fileSizeLabel = "348 KB",
  signers = [{ name: "Alex Moreno" }, { name: "Sofia Martínez" }],
  downloadPdfUrl = "",
  downloadCertificateUrl = "",
  certificateId = "NXG-2026-847291-CERT",
  signedAt = "July 8, 2026 · 14:32 UTC",
  jurisdiction = "eIDAS · ESIGN · UETA",
  documentHash = "a3f2b1c4d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4",
  // "Your verification code" is what's in the reference design, but reads
  // like leftover copy carried over from the verify-email template — this
  // banner has no code in it, it's the signed-document panel. Left it as a
  // prop with that literal default so it's a one-line change once confirmed;
  // consider something like "Document signed" instead.
  bannerLabel = "Your verification code",
}) {
  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

          body { margin: 0; padding: 0; }
          table { border-collapse: collapse; }
          img { -ms-interpolation-mode: bicubic; }

          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .px { padding-left: ${PX_MOBILE} !important; padding-right: ${PX_MOBILE} !important; }
            .headline { font-size: 30px !important; line-height: 36px !important; }
            .wordmark-col { text-align: center !important; padding-bottom: 24px !important; }
            .trust-row { width: 100% !important; }
            .legal-block { text-align: left !important; }
            .drop-cap-col { width: 56px !important; }
            .drop-cap-img { width: 56px !important; height: 120px !important; }
            .doc-card-row { display: block !important; }
            .doc-icon-col { display: block !important; margin-bottom: 10px !important; }
            .btn-col { display: block !important; width: 100% !important; padding: 0 0 10px 0 !important; }
            .btn-link { display: block !important; text-align: center !important; }
            .signer-col { display: block !important; padding: 2px 0 !important; }
            .cert-row { display: block !important; }
            .cert-icon-col { display: block !important; margin-bottom: 12px !important; }
            .hash-value { word-break: break-all !important; }
          }
        `}</style>
      </Head>
      <Preview>
        Your document has been signed and certified — download your copy and
        certificate inside.
      </Preview>

      <Body style={{ ...styles.main, fontFamily: BODY_FONT }}>
        <Container style={styles.container} className="container">
          {/* ---------------- Logo ---------------- */}
          <Section style={{ textAlign: "center", marginBottom: 20, marginTop: 20 }} className="px">
            <Img
              src={`${ASSET_URL}/logo.png`}
              width="40"
              height="40"
              alt="Nexgn"
              style={{ margin: "0 auto" }}
            />
          </Section>

          {/* ---------------- Headline ---------------- */}
          <Section className="px">
            <Heading
              as="h1"
              style={{ ...styles.headline, fontFamily: HEADING_FONT }}
              className="headline"
            >
              Document signed
              <br />
              &amp; certified.
            </Heading>
            <Text style={styles.bodyText}>
              All parties have completed signing.
              {recipientName ? ` ${recipientName}, your` : " Your"} certified
              copy is attached and available for download. This document is
              legally binding.
            </Text>
          </Section>

          {/* ---------------- Signed-document panel ---------------- */}
          <Section style={{ marginTop: 28 }} className="px">
            {/* red label bar */}
            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={styles.bannerBar}>
              <tr>
                <td style={{ padding: "14px 20px" }}>
                  <Text style={styles.bannerLabel}>{bannerLabel}</Text>
                </td>
              </tr>
            </table>

            {/* pink panel with document card */}
            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={styles.panelBox}>
              <tr>
                <td style={{ padding: "20px" }}>
                  <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={styles.docCard}>
                    <tr className="doc-card-row">
                      <td className="doc-icon-col" style={{ width: 56, verticalAlign: "top", paddingRight: 14 }}>
                        <Img src={PDF_ICON} width="40" height="40" alt="PDF" style={styles.docIcon} />
                      </td>
                      <td style={{ verticalAlign: "top" }}>
                        <Text style={styles.docName}>{documentName}</Text>
                        <Text style={styles.docMeta}>
                          Signed · {pageCount} page{pageCount === 1 ? "" : "s"} · {fileSizeLabel}
                        </Text>
                        <table role="presentation" cellPadding="0" cellSpacing="0" style={{ marginTop: 6 }}>
                          <tr>
                            {signers.map((signer, i) => (
                              <td key={signer.name} className="signer-col" style={{ paddingRight: 16 }}>
                                <span style={styles.checkDot}>✓</span>
                                <span style={styles.signerName}>{signer.name}</span>
                              </td>
                            ))}
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            {/* red button bar */}
            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={styles.buttonBar}>
              <tr>
                <td style={{ padding: "14px 16px" }}>
                  <table role="presentation" cellPadding="0" cellSpacing="0">
                    <tr>
                      <td className="btn-col" style={{ paddingRight: 12 }}>
                        <Link href={downloadPdfUrl} className="btn-link" style={styles.pillButton}>
                          ⬇ Download PDF
                        </Link>
                      </td>
                      <td className="btn-col">
                        <Link href={downloadCertificateUrl} className="btn-link" style={styles.pillButton}>
                          ⬇ Download Certificate
                        </Link>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </Section>

          {/* ---------------- Completion Certificate ---------------- */}
          <Section style={{ marginTop: 24 }} className="px">
            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={styles.certBox}>
              <tr>
                <td style={{ padding: "20px" }}>
                  <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                    <tr className="cert-row">
                      <td className="cert-icon-col" style={{ width: 64, verticalAlign: "top", paddingRight: 16 }}>
                        <Img src={CERT_SEAL_ICON} width="48" height="48" alt="Certified" />
                      </td>
                      <td style={{ verticalAlign: "top" }}>
                        <Text style={styles.certTitle}>Completion Certificate</Text>

                        <table role="presentation" cellPadding="0" cellSpacing="0" style={{ marginTop: 4 }}>
                          <tr>
                            <td style={{ paddingRight: 8, verticalAlign: "top" }}>
                              <Text style={styles.certLabel}>CERTIFICATE ID</Text>
                            </td>
                            <td style={{ verticalAlign: "top" }}>
                              <Text style={styles.certValue}>{certificateId}</Text>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ paddingRight: 8, verticalAlign: "top" }}>
                              <Text style={styles.certLabel}>SIGNED AT</Text>
                            </td>
                            <td style={{ verticalAlign: "top" }}>
                              <Text style={styles.certValue}>{signedAt}</Text>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ paddingRight: 8, verticalAlign: "top" }}>
                              <Text style={styles.certLabel}>JURISDICTION</Text>
                            </td>
                            <td style={{ verticalAlign: "top" }}>
                              <Text style={styles.certValue}>{jurisdiction}</Text>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  {/* SHA-256 hash sub-box */}
                  <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ ...styles.hashBox, marginTop: 16 }}>
                    <tr>
                      <td style={{ padding: "12px 14px" }}>
                        <Text style={styles.hashLabel}>SHA-256 DOCUMENT HASH</Text>
                        <Text style={styles.hashValue} className="hash-value">
                          {documentHash}
                        </Text>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </Section>

          {/* ---------------- Testimonial / drop-cap ---------------- */}
          <Section style={{ marginTop: 56 }} className="px">
            <Row>
              <Column style={styles.dropCapCol} className="drop-cap-col">
                <Img
                  src={`${ASSET_URL}/S.png`}
                  width="88"
                  height="200"
                  alt=""
                  style={{ display: "block" }}
                  className="drop-cap-img"
                />
              </Column>
              <Column style={{ ...styles.testimonialCol, marginTop: 44 }}>
                <Text style={styles.testimonialText}>
                  If you have any questions, just reply to this email a real
                  person on our team will respond within a few hours.
                </Text>
                <Text style={styles.signatureName}>Sofia Martínez</Text>
                <Text style={styles.signatureTitle}>
                  Head of Customer Success · Nexgn
                </Text>
              </Column>
            </Row>
          </Section>

          {/* ---------------- Wordmark art + trust badges ---------------- */}
          <Section style={{ marginTop: 48 }} className="px">
            <Row>
              <Column
                style={{ width: "50%", verticalAlign: "middle" }}
                className="stack-col wordmark-col"
              >
                <Img
                  src={`${ASSET_URL}/Nexgn-X.png`}
                  width="230"
                  alt="Nexgn"
                  style={{ maxWidth: "100%", justifySelf: "center" }}
                />
              </Column>
              <Column
                style={{ width: "50%", verticalAlign: "middle" }}
                className="stack-col"
              >
                <Row className="trust-row">
                  <TrustBadge
                    icon={`${ASSET_URL}/SOC2.png`}
                    label={["SOC 2", "TYPE II"]}
                  />
                  <TrustBadge
                    icon={`${ASSET_URL}/AES256.png`}
                    label={["AES-256", "ENCRYPTED"]}
                    divider
                  />
                </Row>
                <Row className="trust-row">
                  <TrustBadge
                    icon={`${ASSET_URL}/ISO.png`}
                    label={["ISO/IEC", "27001"]}
                  />
                  <TrustBadge
                    icon={`${ASSET_URL}/GDPR.png`}
                    label={["GDPR", "COMPLIANT"]}
                    divider
                  />
                </Row>
              </Column>
            </Row>
          </Section>

          <Hr
            style={{
              ...styles.divider,
              marginLeft: PX_DESKTOP,
              marginRight: PX_DESKTOP,
            }}
            className="px"
          />

          {/* ---------------- Tagline ---------------- */}
          <Section className="px">
            <Row>
              <Column style={{ width: 32, verticalAlign: "middle" }}>
                <Img src={HEART_ICON} width="28" height="28" alt="" />
              </Column>
              <Column style={{ verticalAlign: "middle" }}>
                <Text style={styles.tagline}>
                  Saving tons of paper,{" "}
                  <span style={{ color: COLORS.red, fontStyle: "italic" }}>
                    one signature
                  </span>{" "}
                  at a time.
                </Text>
              </Column>
            </Row>
          </Section>

          {/* ---------------- Legal notice ---------------- */}
          <Section
            style={{ marginTop: 32, textAlign: "right" }}
            className="px legal-block"
          >
            <Text style={styles.legalHeading}>
              CONFIDENTIALITY &amp; LEGAL NOTICE
            </Text>
            <Text style={styles.legalBody}>
              This communication and its secure links are strictly confidential
              and intended solely for the designated recipient. Nexgn digital
              signatures are legally binding and comply with global frameworks
              including the ESIGN Act, UETA, and eIDAS. If you received this in
              error, please notify our security team and delete all copies
              immediately. Nexgn will never request your password or 2FA
              credentials via email.
            </Text>
          </Section>

          {/* ---------------- Social + copyright ---------------- */}
          <Section style={{ marginTop: 28, textAlign: "center" }} className="px">
            <Row style={{ width: "70px", margin: "0 auto" }}>
              <Column align="center" style={{ paddingRight: "10px" }}>
                <Link href="https://linkedin.com/company/nexgncloud">
                  <Img src={LINKEDIN_ICON} width="24" height="24" alt="LinkedIn" />
                </Link>
              </Column>
              <Column align="center">
                <Link href={SECOND_SOCIAL_URL}>
                  <Img src={SECOND_SOCIAL_ICON} width="24" height="24" alt="Social" />
                </Link>
              </Column>
            </Row>

            <Text style={styles.copyright}>
              © 2026 Nexgn, Inc. All rights reserved. <br /> Santa Fe · New Mexico 87501, USA
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function TrustBadge({ icon, label, divider }) {
  return (
    <Column
      align="center"
      style={{
        ...styles.trustCell,
        ...(divider ? { borderLeft: `1px solid ${COLORS.border}` } : {}),
      }}
    >
      <Img
        src={icon}
        width="26"
        height="26"
        alt={label.join(" ")}
        style={{ margin: "0 auto" }}
      />
      <Text style={styles.trustLabel}>
        {label[0]}
        <br />
        {label[1]}
      </Text>
    </Column>
  );
}

const styles = {
  main: {
    backgroundColor: "#ffffff",
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "44px 0",
  },
  headline: {
    color: COLORS.red,
    fontSize: "40px",
    lineHeight: "44px",
    fontWeight: 800,
    letterSpacing: "-0.5px",
    margin: "0 0 16px 0",
  },
  bodyText: {
    fontFamily: BODY_FONT,
    color: COLORS.redSoft,
    fontSize: "15px",
    lineHeight: "24px",
    margin: 0,
    maxWidth: "420px",
  },
  bannerBar: {
    backgroundColor: COLORS.red,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 6,
  },
  bannerLabel: {
    fontFamily: HEADING_FONT,
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: 800,
    margin: 0,
  },
  panelBox: {
    backgroundColor: COLORS.redPanel,
  },
  docCard: {
    borderRadius: 10,
  },
  docIcon: {
    display: "block",
  },
  docName: {
    fontFamily: BODY_FONT,
    color: COLORS.dark,
    fontSize: "14px",
    fontWeight: 700,
    margin: "0 0 2px 0",
  },
  docMeta: {
    fontFamily: BODY_FONT,
    color: COLORS.gray,
    fontSize: "12px",
    margin: 0,
  },
  checkDot: {
    display: "inline-block",
    color: COLORS.red,
    fontSize: "12px",
    fontWeight: 700,
    marginRight: "4px",
  },
  signerName: {
    fontFamily: BODY_FONT,
    color: COLORS.dark,
    fontSize: "12px",
  },
  buttonBar: {
    backgroundColor: COLORS.red,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 6,
  },
  pillButton: {
    display: "inline-block",
    backgroundColor: "#ffffff",
    color: COLORS.red,
    fontFamily: BODY_FONT,
    fontWeight: 700,
    fontSize: "13px",
    textDecoration: "none",
    padding: "10px 18px",
    borderRadius: "6px",
  },
  certBox: {
    backgroundColor: COLORS.redPanel,
    borderRadius: 12,
  },
  certTitle: {
    fontFamily: BODY_FONT,
    color: COLORS.dark,
    fontSize: "15px",
    fontWeight: 700,
    margin: "0 0 8px 0",
  },
  certLabel: {
    fontFamily: BODY_FONT,
    color: COLORS.gray,
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.4px",
    margin: "0 0 4px 0",
    whiteSpace: "nowrap",
  },
  certValue: {
    fontFamily: MONO_FONT,
    color: COLORS.dark,
    fontSize: "12px",
    margin: "0 0 4px 0",
  },
  hashBox: {
    backgroundColor: "#F9D2CD",
    borderRadius: 8,
  },
  hashLabel: {
    fontFamily: BODY_FONT,
    color: COLORS.redSoft,
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.4px",
    margin: "0 0 4px 0",
  },
  hashValue: {
    fontFamily: MONO_FONT,
    color: COLORS.red,
    fontSize: "11px",
    lineHeight: "16px",
    margin: 0,
    wordBreak: "break-all",
  },
  dropCapCol: {
    width: 88,
    verticalAlign: "top",
  },
  testimonialCol: {
    verticalAlign: "top",
    paddingLeft: "8px",
  },
  testimonialText: {
    fontFamily: BODY_FONT,
    color: COLORS.dark,
    fontSize: "16px",
    lineHeight: "26px",
    margin: "0 0 16px 0",
  },
  signatureName: {
    fontFamily: BODY_FONT,
    color: COLORS.dark,
    fontSize: "17px",
    fontWeight: 700,
    margin: 0,
  },
  signatureTitle: {
    fontFamily: BODY_FONT,
    color: COLORS.gray,
    fontSize: "14px",
    margin: "2px 0 0 0",
  },
  trustCell: {
    width: "50%",
    padding: "6px 4px 14px 12px",
    verticalAlign: "top",
  },
  trustLabel: {
    fontFamily: BODY_FONT,
    color: COLORS.gray,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.4px",
    textAlign: "center",
    margin: "6px 0 0 0",
  },
  divider: {
    borderColor: COLORS.border,
    margin: "36px 0 24px 0",
  },
  tagline: {
    fontFamily: BODY_FONT,
    color: COLORS.dark,
    fontSize: "15px",
    margin: 0,
  },
  legalHeading: {
    fontFamily: BODY_FONT,
    color: COLORS.dark,
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.5px",
    margin: "0 0 8px 0",
  },
  legalBody: {
    fontFamily: BODY_FONT,
    color: COLORS.grayLight,
    fontSize: "12px",
    lineHeight: "19px",
    margin: 0,
  },
  copyright: {
    fontFamily: BODY_FONT,
    color: COLORS.grayLight,
    fontSize: "12px",
    margin: "4px 0 0 0",
    textAlign: "center",
  },
};