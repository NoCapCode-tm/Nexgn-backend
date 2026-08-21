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
// Real asset host you're already using for the logo/badge/S/wordmark/trust
// icons. Heart + social icons weren't in your image set yet — they default
// to the same host/naming convention below. Update HEART_ICON / LINKEDIN_ICON
// / X_ICON if those live somewhere else or under different filenames.
// ---------------------------------------------------------------------------
const ASSET_URL = "https://prod.nexgn.cloud/template";
const HEART_ICON = `${ASSET_URL}/stamp.png`;
const LINKEDIN_ICON = `${ASSET_URL}/linkedin.png`;
const IG_ICON = `${ASSET_URL}/instagram.png`;

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

// Horizontal padding applied to every section except the full-width CTA row.
const PX_DESKTOP = "40px";
const PX_MOBILE = "20px";

export default function VerifyEmail({
  recipientName,
  verifyUrl,
  createdAt,
  expiresInMinutes = 15,
 
}) {
  
  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

          /* Most email clients strip @import/webfonts and fall back to the
             system stack below — that's expected and fine. Apple Mail,
             Gmail app (iOS/Android), and Outlook.com support it. */

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
        Confirm your email to finish setting up your Nexgn account — this code
        expires in {expiresInMinutes} minutes.
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
              Verify your
              <br />
              email address.
            </Heading>
            <Text style={styles.bodyText}>
              {recipientName ? `Hi ${recipientName}, complete` : "Complete"}{" "}
              your nexgn account setup by confirming your email. This
              one-time step keeps your account secure and enables all
              platform features.
            </Text>
          </Section>

          {/* ---------------- Countdown ring + CTA button ----------------
              This is a single flattened graphic (ring + "Verify Email
              Address" button both baked in). The whole image is wrapped in
              a Link so clicking anywhere on it — including where the visual
              button is drawn — goes to verifyUrl. No separate coded
              <Button> needed since the button already lives in the image. */}
          <Section style={{ marginTop: 8 }} className="px">
            <Link href={verifyUrl} style={{ display: "block", lineHeight: 0 }}>
              <Img
                src={`${ASSET_URL}/a.png`}
                width="520"
                height="196"
                alt={`Verify Email Address — code expires in ${expiresInMinutes} minutes`}
                style={styles.ctaGraphic}
                className="cta-image-mobile"
              />
            </Link>
          </Section>

          {/* ---------------- Testimonial / drop-cap ---------------- */}
          <Section style={{ marginTop: 44 }} className="px">
            <Row>
              <Column style={styles.dropCapCol } className="drop-cap-col">
                <Img
                  src={`${ASSET_URL}/S.png`}
                  width="88"
                  height="200"
                  alt=""
                  style={{ display: "block" }}
                  className="drop-cap-img"
                />
              </Column>
              <Column style={styles.testimonialCol, {marginTop: 44}}>
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
                style={{ width: "100%", verticalAlign: "middle", display: "flex !important", justifyContent: "center", alignItems: "center" }}
                className="stack-col wordmark-col"
              >
                <Img
                  src={`${ASSET_URL}/Nexgn-X.png`}
                  width="230"
                  alt="Nexgn"
                  style={{ maxWidth: "100%" }}
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
                <Img src={HEART_ICON} width="28" height="28" alt="S" />
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
            {/* Set a fixed width on the Row and margin auto to center the icon group */}
            <Row style={{ width: "70px", margin: "0 auto" }}>
              <Column align="center" style={{ paddingRight: "10px" }}>
                <Link
                  href="https://linkedin.com/company/nexgncloud"
                >
                  <Img src={LINKEDIN_ICON} width="24" height="24" alt="LinkedIn" />
                </Link>
              </Column>
              <Column align="center">
                <Link href="https://instagram.com/nexgn">
                  <Img src={IG_ICON} width="24" height="24" alt="Instagram" />
                </Link>
              </Column>
            </Row>
            
            {/* Combine the copyright and address into a single Text node */}
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
    maxWidth: "268px",
  },
  ctaGraphic: {
    display: "block",
    width: "100%",
    maxWidth: "586px",
    height: "auto",
    marginTop: "-156px",
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