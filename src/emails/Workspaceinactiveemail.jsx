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
  Button,
} from "@react-email/components";

/**
 * WorkspaceInactiveEmail.jsx
 * ---------------------------------------------------------------------------
 * Self-contained — no separate shared file. Same family as
 * SuperAdminSignInEmail (real coded button, no image) but:
 *   - Headline is two-tone: most of it dark, "inactive." in red
 *   - CTA button is centered instead of left-aligned
 * Footer uses LinkedIn + Instagram, matching the rest of the family.
 * ---------------------------------------------------------------------------
 */

const ASSET_URL = "https://prod.nexgn.cloud/template";
const HEART_ICON = `${ASSET_URL}/stamp.png`;
const LINKEDIN_ICON = `${ASSET_URL}/linkedin.png`;
const INSTAGRAM_ICON = `${ASSET_URL}/instagram.png`;

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
  table { border-collapse: collapse; }
  img { -ms-interpolation-mode: bicubic; }

  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; }
    .px { padding-left: ${PX_MOBILE} !important; padding-right: ${PX_MOBILE} !important; }
    .headline { font-size: 28px !important; line-height: 34px !important; }
    .cta-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
    .wordmark-col { text-align: center !important; padding-bottom: 24px !important; }
    .trust-row { width: 100% !important; }
    .legal-block { text-align: left !important; }
    .drop-cap-col { width: 56px !important; }
    .drop-cap-img { width: 56px !important; height: 120px !important; }
  }
`;

const styles = {
  main: { backgroundColor: "#ffffff" },
  container: { maxWidth: "600px", margin: "0 auto", padding: "44px 0" },
  headline: {
    color: COLORS.dark,
    fontSize: "40px",
    lineHeight: "44px",
    fontWeight: 700,
    letterSpacing: "-0.5px",
    margin: "0 0 16px 0",
  },
  bodyText: {
    fontFamily: BODY_FONT,
    color: COLORS.redSoft,
    fontSize: "15px",
    lineHeight: "24px",
    margin: 0,
    maxWidth: "460px",
  },
  ctaButton: {
    backgroundColor: COLORS.red,
    color: "#ffffff",
    fontFamily: BODY_FONT,
    fontSize: "15px",
    fontWeight: 600,
    textDecoration: "none",
    borderRadius: "8px",
    padding: "15px 60px",
    display: "inline-block",
    textAlign: "center",
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

export default function WorkspaceInactiveEmail({
  recipientName = "",
  signInUrl = "",
}) {
  return (
    <Html>
      <Head>
        <style>{emailHeadCss}</style>
      </Head>
      <Preview>Your Nexgn workspace is live but still inactive — sign in to activate it.</Preview>

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

          {/* ---------------- Headline (two-tone: dark + red "inactive.") ---------------- */}
          <Section className="px">
            <Heading
              as="h1"
              style={{ ...styles.headline, fontFamily: HEADING_FONT }}
              className="headline"
            >
              Your workspace
              <br />
              is now live, but{" "}
              <span style={{ color: COLORS.red }}>inactive.</span>
            </Heading>
            <Text style={styles.bodyText}>
              {recipientName ? `${recipientName}, you` : "You"} are invited to
              sign in to Nexgn to access and complete your pending request.
              Please use the provided button to proceed securely.
            </Text>
          </Section>

          {/* ---------------- CTA button (real coded button, centered) ---------------- */}
          <Section style={{ marginTop: 24, textAlign: "center" }} className="px">
            <Button href={signInUrl} style={styles.ctaButton} className="cta-btn">
              Sign-In
            </Button>
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