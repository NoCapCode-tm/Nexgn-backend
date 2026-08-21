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
// Same asset host / naming convention as VerifyEmail.jsx. RESET_CTA_IMG is a
// guess at the filename for the new "e" swirl + expiry bar + button graphic
// (built the same flattened way as a.png was for the verify email — swirl,
// "15 min", the red bar, and the "Reset My Password" button all baked into
// one image). Swap the filename below once you've exported/uploaded it.
// Social icons reused from VerifyEmail.jsx (LinkedIn + Instagram) — your
// reference design shows an "X" icon instead; change SECOND_SOCIAL_ICON /
// SECOND_SOCIAL_URL if you want X here instead of Instagram.
// ---------------------------------------------------------------------------
const ASSET_URL = "https://prod.nexgn.cloud/template";
const HEART_ICON = `${ASSET_URL}/stamp.png`;
const LINKEDIN_ICON = `${ASSET_URL}/linkedin.png`;
const SECOND_SOCIAL_ICON = `${ASSET_URL}/instagram.png`;
const SECOND_SOCIAL_URL = "https://instagram.com/nexgn";
const RESET_CTA_IMG = `${ASSET_URL}/a.png`; // <-- confirm/replace filename

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

export default function ResetPasswordEmail({
  resetUrl,
  createdAt,
  expiresInMinutes = 15,
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
            .cta-image-mobile {margin-top: -120px !important;}
          }
        `}</style>
      </Head>
      <Preview>
        Reset your Nexgn password — this link expires in {expiresInMinutes}{" "}
        minutes.
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
              Reset your
              <br />
              password.
            </Heading>
            <Text style={styles.bodyText}>
              We received a request to reset the password associated with
              your nexgn account.
              Use the button below this link is valid for {expiresInMinutes}{" "}
              minutes only.
            </Text>
          </Section>
          
          {/* ---------------- Expiry swirl + CTA bar/button ----------------
              Same pattern as VerifyEmail.jsx's a.png: swirl, "15 min", the
              red bar, and the button are one flattened graphic wrapped in a
              Link, so the whole thing is clickable. */}
          <Section style={{ marginTop: 4 }} className="px">
            <Link href={resetUrl} style={{ display: "block", lineHeight: 0 }}>
              <Img
                src={RESET_CTA_IMG}
                width="520"
                height="196"
                alt={`Reset My Password — link expires in ${expiresInMinutes} minutes`}
                style={styles.ctaGraphic}
                className="cta-image-mobile"
              />
            </Link>
          </Section>

          {/* ---------------- Testimonial / drop-cap ---------------- */}
          <Section style={{ marginTop: 44 }} className="px">
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
    maxWidth: "265px",
  },
  expiresLabel: {
    color: COLORS.dark,
    fontSize: "17px",
    fontWeight: 800,
    margin: 0,
  },
  ctaGraphic: {
    display: "block",
    width: "100%",
    maxWidth: "586px",
    height: "auto",
    marginTop: "-180px",
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