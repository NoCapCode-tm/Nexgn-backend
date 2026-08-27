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
  Button,
  Hr,
  Link,
} from "@react-email/components";

/**
 * DocumentSignedCertifiedEmail.jsx
 * ---------------------------------------------------------------------------
 * Self-contained. The biggest visual departure from the source design: the
 * red backdrop behind the file card + download buttons is an organic
 * blob/curve shape in the screenshot (bleeding past both edges, similar to
 * the ring shapes in the verify/reset emails). That shape isn't reliably
 * buildable in table-based email HTML — no background image asset for it
 * exists yet (unlike a.png for verify), and Outlook desktop ignores
 * border-radius + mishandles negative-margin bleeds. Built as a clean
 * rounded-corner card instead (same red, same content, same button
 * behavior). Swap in a background-image asset later for exact-shape
 * fidelity if you export one, same as was done for the verify email's ring.
 * Footer uses LinkedIn + Instagram.
 * ---------------------------------------------------------------------------
 */

const ASSET_URL = "https://prod.nexgn.cloud/template";
const HEART_ICON = `${ASSET_URL}/stamp.png`;
const LINKEDIN_ICON = `${ASSET_URL}/linkedin.png`;
const INSTAGRAM_ICON = `${ASSET_URL}/instagram.png`;
const PDF_ICON = `${ASSET_URL}/pdf.png`;
const DOWNLOAD_ICON = `${ASSET_URL}/download.png`;
const CERT_SEAL_ICON = `${ASSET_URL}/Seal.png`;

const SOCIAL_LINKS = [
  { href: "https://linkedin.com/company/nexgncloud", icon: LINKEDIN_ICON, alt: "LinkedIn" },
  { href: "https://instagram.com/nexgn", icon: INSTAGRAM_ICON, alt: "Instagram" },
];

const COLORS = {
  red: "#FF0915",
  redSoft: "#EF6E63",
  dark: "#1A1A1A",
  gray: "#6B7280",
  grayLight: "#9CA3AF",
  border: "#ECECEC",
};

const HEADING_FONT =
  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const BODY_FONT =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const PX_DESKTOP = "40px";
const PX_MOBILE = "20px";

// One breakpoint (600px) is intentional: the container caps at max-width
// 600px, so tablet (768px+) and desktop already render identically. Only
// viewports narrower than the design itself (phones) need different rules.
const emailHeadCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

  body { margin: 0; padding: 0; }
  // table { border-collapse: collapse; }
  img { -ms-interpolation-mode: bicubic; }

  .px { padding-left: ${PX_DESKTOP}; padding-right: ${PX_DESKTOP}; }

  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; }
    .px { padding-left: ${PX_MOBILE} !important; padding-right: ${PX_MOBILE} !important; }
    .headline { font-size: 26px !important; line-height: 36px !important; }
    .wordmark-col { text-align: center !important; padding-bottom: 24px !important; }
    .trust-row { width: 100% !important; }
    .legal-block { text-align: left !important; }
    .drop-cap-col { width: 56px !important; }
    .drop-cap-img { width: 56px !important; height: 120px !important; }
    .doc-card-top { border-radius: 20px 20px 0 0 !important; }
    .doc-card-top-inner { padding: 10px 0px 0px 16px !important; }
    .doc-card-bottom { border-radius: 0 0 20px 20px !important; }
    .doc-btn-link { font-size: 13px !important; }
    .file-card-inner { padding: 12px !important; }
    .cert-card-inner { padding: 16px !important; }
    .cert-icon-col { width: 40px !important; }
    .cert-icon-img { width: 88px !important; height: 88px !important; margin-top: 68px !important; }
    .cert-label { display: block !important; width: auto !important; margin-bottom: 2px !important; }
    .hash-value { font-size: 11px !important; }
  
`;

const styles = {
  main: { backgroundColor: "#ffffff" },
  container: { maxWidth: "600px", margin: "0 auto", padding: "44px 0" },
  headline: {
    color: COLORS.red,
    fontSize: "42px",
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
  docCardTop: {
    backgroundColor: COLORS.red,
    borderRadius: "75px 0px 0px 60px",
  },
  // Padding lives here, applied to a real <td> via Column — Section/Container
  // put `style` on the outer <table>, and padding on a bare <table> is
  // silently dropped by many real email clients (Outlook, some webmail
  // sanitizers) even though it renders "correctly" in a plain browser
  // preview. Column renders style directly on its <td>, which is honored
  // everywhere. Same fix applied to every *Inner style below.
  docCardTopInner: {
    padding: "10px 0px 0px 30px",
  },
  docCardLabel: {
    fontFamily: BODY_FONT,
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 700,
    marginLeft: "35px",
    marginTop:0,
    marginBottom:0,
  },
  fileCard: {
    backgroundColor: "#FBEAE7",
    borderTopLeftRadius:"45px",
    borderBottomLeftRadius:"45px",
    marginTop: "3px",
  },
  fileCardInner: {
    padding: "16px",
  },
  fileIconBoxInner: {
    padding: "8px 4px",
    textAlign: "center",
  },
  fileName: {
    fontFamily: BODY_FONT,
    color: COLORS.dark,
    fontSize: "15px",
    fontWeight: 700,
    margin: 0,
  },
  fileMeta: {
    fontFamily: BODY_FONT,
    color: COLORS.gray,
    fontSize: "13px",
    margin: "3px 0 0 0",
  },
  signersRow: {
    fontFamily: BODY_FONT,
    color: COLORS.red,
    fontSize: "13px",
    fontWeight: 600,
    margin: "8px 0 0 0",
  },
  docCardBottom: {
    backgroundColor: COLORS.red,
    borderBottomLeftRadius:"1000px !important"
    // borderRadius: "0 0 28px 28px",
  },
  docButtonCol: {
    verticalAlign: "middle",
    textAlign: "center",
    padding: "8px 10px",
  },
  docButtonLink: {
    fontFamily: BODY_FONT,
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 700,
    textDecoration: "none",
    display: "inline-block",
  },
  certCard: {
    backgroundColor: "#FBEAE7",
    borderRadius: "16px",
  },
  certCardInner: {
    padding: "20px",
    
  },
  certTitle: {
    fontFamily: BODY_FONT,
    color: COLORS.dark,
    fontSize: "16px",
    fontWeight: 700,
    margin: "0 0 10px 0",
  },
  certRow: {
    margin: "6px 0",
  },
  certLabel: {
    fontFamily: BODY_FONT,
    color: COLORS.gray,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.4px",
    display: "inline-block",
    width: "118px",
    verticalAlign: "middle",
  },
  certValue: {
    fontFamily: BODY_FONT,
    color: COLORS.dark,
    fontSize: "13px",
    fontWeight: 700,
    verticalAlign: "middle",
  },
  hashBox: {
    backgroundColor: "#F6D8D3",
    borderRadius: "10px",
    marginTop: "16px",
  },
  hashBoxInner: {
    padding: "12px 14px",
  },
  hashLabel: {
    fontFamily: BODY_FONT,
    color: "#B5453C",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.4px",
    margin: "0 0 5px 0",
  },
  hashValue: {
    fontFamily:
      "SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
    color: "#C8443A",
    fontSize: "12px",
    lineHeight: "18px",
    margin: 0,
    wordBreak: "break-all",
  },
  dropCapCol: { width: 88, verticalAlign: "top" },
  testimonialCol: { verticalAlign: "top", paddingLeft: "8px" },
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
  trustCell: { width: "50%", padding: "6px 4px 14px 12px", verticalAlign: "top" },
  trustLabel: {
    fontFamily: BODY_FONT,
    color: COLORS.gray,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.4px",
    textAlign: "center",
    margin: "6px 0 0 0",
  },
  divider: { borderColor: COLORS.border, margin: "36px 0 24px 0" },
  tagline: { fontFamily: BODY_FONT, color: COLORS.dark, fontSize: "15px", margin: 0 },
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

function TrustBadge({ icon, label, divider }) {
  return (
    <Column
      align="center"
      style={{
        ...styles.trustCell,
        ...(divider ? { borderLeft: `1px solid ${COLORS.border}` } : {}),
      }}
    >
      <Img src={icon} width="26" height="26" alt={label.join(" ")} style={{ margin: "0 auto" }} />
      <Text style={styles.trustLabel}>
        {label[0]}
        <br />
        {label[1]}
      </Text>
    </Column>
  );
}

function CertRow({ label, value }) {
  return (
    <Text style={styles.certRow}>
      <span className="cert-label" style={styles.certLabel}>
        {label}
      </span>
      <span style={styles.certValue}>{value}</span>
    </Text>
  );
}

export default function DocumentSignedCertifiedEmail({
  verificationLabel = "Your verification code",
  fileName = "Service Agreement — Q3 2026.pdf",
  fileMeta = "Signed · 2 pages · 348 KB",
  signers = ["Alex Moreno", "Sofia Martínez"],
  pdfUrl = "https://app.nexgn.com/documents/doc123/download",
  certificateUrl = "https://app.nexgn.com/documents/doc123/certificate",
  certificateId = "NXG-2026-847291-CERT",
  signedAt = "July 8, 2026 · 14:32 UTC",
  jurisdiction = "eIDAS · ESIGN · UETA",
  documentHash = "a3f2b1c4d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4",
}) {
  return (
    <Html>
      <Head>
        <style>{emailHeadCss}</style>
      </Head>
      <Preview>
        {fileName} has been signed by all parties. Your certified copy is
        ready.
      </Preview>

      <Body style={{ ...styles.main, fontFamily: BODY_FONT }}>
        <Container style={styles.container} className="container">
          {/* ---------------- Logo ---------------- */}
          <Section style={{ textAlign: "center", marginBottom: 36, marginTop: 20 }} className="px">
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
              <br />& certified.
            </Heading>
            <Text style={styles.bodyText}>
              All parties have completed signing. Your certified copy is
              attached and available for download. This document is legally
              binding.
            </Text>
          </Section>

          {/* ---------------- Document card: label + file + signers ---------------- */}
          <Section style={{ marginTop: 28 }} className="px">
            <Section style={styles.docCardTop} className="doc-card-top">
              <Row>
                <Column style={styles.docCardTopInner} className="doc-card-top-inner">
                  <Text style={styles.docCardLabel}>{verificationLabel}</Text>

                  <Section style={styles.fileCard} className="file-card">
                    <Row>
                      <Column style={styles.fileCardInner} className="file-card-inner">
                        <Row>
                          <Column style={{ width: 56, verticalAlign: "top" }}>
                            <Section style={styles.fileIconBox}>
                              <Row>
                                <Column style={styles.fileIconBoxInner}>
                                  <Img
                                    src={PDF_ICON}
                                    width="55"
                                    height="55"
                                    alt=""
                                    style={{ margin: "0 auto", display: "block" }}
                                  />
                                </Column>
                              </Row>
                            </Section>
                          </Column>
                          <Column style={{ verticalAlign: "top", paddingLeft: 12 }}>
                            <Text style={styles.fileName}>{fileName}</Text>
                            <Text style={styles.fileMeta}>{fileMeta}</Text>
                            <Text style={styles.signersRow}>
                              {signers.map((signer, i) => (
                                <React.Fragment key={signer}>
                                  &#10003; {signer}
                                  {i < signers.length - 1 ? "    " : ""}
                                </React.Fragment>
                              ))}
                            </Text>
                          </Column>
                        </Row>
                      </Column>
                    </Row>
                    
                  </Section>
                     <Row>
                <Column
                  style={{
                    ...styles.docButtonCol,
                    borderRight: "1px solid rgba(255,255,255,0.35)",
                  }}
                >
                  <Link href={pdfUrl} style={styles.docButtonLink} className="doc-btn-link">
                    <Img
                      src={DOWNLOAD_ICON}
                      width="14"
                      height="14"
                      alt=""
                      style={{ display: "inline-block", verticalAlign: "middle", marginRight: 6 }}
                    />
                    Download PDF
                  </Link>
                </Column>
                <Column style={styles.docButtonCol}>
                  <Link href={certificateUrl} style={styles.docButtonLink} className="doc-btn-link">
                    <Img
                      src={DOWNLOAD_ICON}
                      width="14"
                      height="14"
                      alt=""
                      style={{ display: "inline-block", verticalAlign: "middle", marginRight: 6 }}
                    />
                    Download Certificate
                  </Link>
                </Column>
              </Row>
                </Column>
              </Row>
           
            </Section>

            {/* ---------------- Download PDF / Download Certificate ---------------- *
                Real coded links, split by a divider — same red block as
                above, just the bottom corners rounded to close the shape.
                docButtonCol is a Column (real td), so its padding was never
                broken — only the Section-level cards above needed fixing. */}
            {/* <Section style={styles.docCardBottom} className="doc-card-bottom">
              <Row>
                <Column
                  style={{
                    ...styles.docButtonCol,
                    borderRight: "1px solid rgba(255,255,255,0.35)",
                  }}
                >
                  <Link href={pdfUrl} style={styles.docButtonLink} className="doc-btn-link">
                    <Img
                      src={DOWNLOAD_ICON}
                      width="14"
                      height="14"
                      alt=""
                      style={{ display: "inline-block", verticalAlign: "middle", marginRight: 6 }}
                    />
                    Download PDF
                  </Link>
                </Column>
                <Column style={styles.docButtonCol}>
                  <Link href={certificateUrl} style={styles.docButtonLink} className="doc-btn-link">
                    <Img
                      src={DOWNLOAD_ICON}
                      width="14"
                      height="14"
                      alt=""
                      style={{ display: "inline-block", verticalAlign: "middle", marginRight: 6 }}
                    />
                    Download Certificate
                  </Link>
                </Column>
              </Row>
            </Section> */}
          </Section>

          {/* ---------------- Completion certificate card ---------------- */}
          <Section style={{ marginTop: 28 }} className="px">
            <Section style={styles.certCard} className="cert-card">
              <Row>
                <Column style={styles.certCardInner} className="cert-card-inner">
                  <Row>
                    <Column style={{ width: 64, verticalAlign: "top" }} className="cert-icon-col">
                      <Img
                        src={CERT_SEAL_ICON}
                        width="88"
                        height="88"
                        alt=""
                        className="cert-icon-img"
                      />
                    </Column>
                    <Column style={{ verticalAlign: "top", paddingLeft: 16 }}>
                      <Text style={styles.certTitle}>Completion Certificate</Text>
                      <CertRow label="CERTIFICATE ID" value={certificateId} />
                      <CertRow label="SIGNED AT" value={signedAt} />
                      <CertRow label="JURISDICTION" value={jurisdiction} />
                    </Column>
                  </Row>

                  <Section style={styles.hashBox}>
                    <Row>
                      <Column style={styles.hashBoxInner}>
                        <Text style={styles.hashLabel}>SHA-256 DOCUMENT HASH</Text>
                        <Text style={styles.hashValue} className="hash-value">
                          {documentHash}
                        </Text>
                      </Column>
                    </Row>
                  </Section>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* ---------------- Testimonial / drop-cap ---------------- */}
          <Section style={{ marginTop: 64 }} className="px">
            <Row>
              <Column style={styles.dropCapCol} className="drop-cap-col">
                <Img
                  src={`${ASSET_URL}/S.png`}
                  width="88"
                  height="200"
                  alt="Seal Stamp"
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
                  style={{ maxWidth: "100%" }}
                />
              </Column>
              <Column style={{ width: "50%", verticalAlign: "middle" }} className="stack-col">
                <Row className="trust-row">
                  <TrustBadge icon={`${ASSET_URL}/SOC2.png`} label={["SOC 2", "TYPE II"]} />
                  <TrustBadge
                    icon={`${ASSET_URL}/AES256.png`}
                    label={["AES-256", "ENCRYPTED"]}
                    divider
                  />
                </Row>
                <Row className="trust-row">
                  <TrustBadge icon={`${ASSET_URL}/ISO.png`} label={["ISO/IEC", "27001"]} />
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
            style={{ ...styles.divider, marginLeft: PX_DESKTOP, marginRight: PX_DESKTOP }}
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
            <Text style={styles.legalHeading}>CONFIDENTIALITY &amp; LEGAL NOTICE</Text>
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
            {/* Setting a fixed width and margin auto centers the icons side-by-side */}
            <Row style={{ width: `${SOCIAL_LINKS.length * 34}px`, margin: "0 auto", marginBottom: "16px" }}>
              {SOCIAL_LINKS.map((social, i) => (
                <Column
                  align="center"
                  key={social.alt}
                  style={{ paddingRight: i < SOCIAL_LINKS.length - 1 ? "10px" : "0" }}
                >
                  <Link href={social.href}>
                    <Img src={social.icon} width="24" height="24" alt={social.alt} />
                  </Link>
                </Column>
              ))}
            </Row>
            <Text style={styles.copyright}>© 2026 Nexgn, Inc. All rights reserved.</Text>
            <Text style={styles.copyright}>Santa Fe · New Mexico 87501, USA</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}