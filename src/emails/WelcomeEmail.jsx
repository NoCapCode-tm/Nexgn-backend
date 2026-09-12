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
 * WelcomeEmail.jsx
 * ---------------------------------------------------------------------------
 * Self-contained. Biggest visual departure from the source design: the
 * headline has a white box irregularly overlapping the gradient hero,
 * splitting "workspace" into white-on-gradient + red-on-white mid-word —
 * that's a hand-placed overlapping shape in the original, not a grid, and
 * isn't reliably reproducible in table-based email HTML. Built as a clean
 * two-line white headline on the gradient instead (with the closing period
 * kept red as a small nod to the original accent). The gradient itself
 * degrades to a solid dark fallback color in Outlook desktop, which ignores
 * CSS gradients entirely. Footer uses LinkedIn + X (not Instagram, per this
 * design).
 * ---------------------------------------------------------------------------
 */

const ASSET_URL = "https://nexgn.cloud/template";
const HEART_ICON = `${ASSET_URL}/stamp.png`;
const LINKEDIN_ICON = `${ASSET_URL}/linkedin.png`;
const X_ICON = `${ASSET_URL}/instagram.png`;

const SOCIAL_LINKS = [
  { href: "https://linkedin.com/company/nexgncloud", icon: LINKEDIN_ICON, alt: "LinkedIn" },
  { href: "https://x.com/nexgn", icon: X_ICON, alt: "X" },
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

  .px { padding-left: ${PX_DESKTOP}; padding-right: ${PX_DESKTOP}; }

  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; }
    .px { padding-left: ${PX_MOBILE} !important; padding-right: ${PX_MOBILE} !important; }
    .headline { font-size: 30px !important; line-height: 34px !important; }
    .wordmark-col { text-align: center !important; padding-bottom: 24px !important; }
    .trust-row { width: 100% !important; }
    .legal-block { text-align: left !important; }
    .drop-cap-col { width: 56px !important; }
    .drop-cap-img { width: 56px !important; height: 120px !important; }
    .hero-inner { padding: 24px 20px 26px 20px !important; }
    .welcome-col { text-align: left !important; padding-left: 0 !important; }
    .cta-col { text-align: left !important; padding-left: 0 !important; margin-top: 20px !important; }
    .cta-title, .cta-subtext { text-align: left !important; }
    .feature-cell { width: 100% !important; display: block !important; text-align: left !important; padding: 0 0 22px 0 !important; }
    .section-heading { font-size: 19px !important; }
    /* Step 2's mirror (numeral on the right, text right-aligned) is kept at
       every width — DOM order already puts the pieces in the right visual
       spot, so nothing needs to un-flip, just shrink so it doesn't dominate
       a narrow screen. */
    .step-number-col { width: 68px !important; }
    .step-number { font-size: 56px !important; line-height: 56px !important; }
  }
`;

const styles = {
  main: { backgroundColor: "#ffffff" },
  container: { maxWidth: "600px", margin: "0 auto", padding: "44px 0" },
  // ---- Hero (gradient banner + split headline) ----
  hero: {
    // Outlook desktop ignores the `background` gradient below entirely and
    // falls back to this solid backgroundColor — pick one that reads fine
    // as a flat banner on its own, not just as a gradient stop.
    backgroundColor: "#1a0000",
    background:
      "linear-gradient(135deg, #FF0000 0%, #8B0000 45%, #0a0000 100%)",
    borderRadius: "0",
  },
  heroInner: {
    padding: "28px 32px 32px 32px",
  },
  headline: {
    color: "#ffffff",
    fontSize: "42px",
    lineHeight: "44px",
    fontWeight: 800,
    letterSpacing: "-0.5px",
    margin: "20px 0 0 0",
  },
  welcomeText: {
    fontFamily: BODY_FONT,
    color: COLORS.redSoft,
    fontSize: "16px",
    lineHeight: "25px",
    margin: "20px 0 0 0",
  },
  // ---- Intro paragraph + mini dashboard CTA row ----
  introText: {
    fontFamily: BODY_FONT,
    color: COLORS.dark,
    fontSize: "15px",
    lineHeight: "24px",
    margin: 0,
  },
  ctaTitle: {
    fontFamily: HEADING_FONT,
    color: COLORS.dark,
    fontSize: "18px",
    fontWeight: 700,
    margin: 0,
    textAlign: "right",
  },
  ctaSubtext: {
    fontFamily: BODY_FONT,
    color: COLORS.gray,
    fontSize: "13px",
    lineHeight: "19px",
    margin: "4px 0 12px 0",
    textAlign: "right",
  },
  ctaButton: {
    backgroundColor: COLORS.red,
    color: "#ffffff",
    fontFamily: BODY_FONT,
    fontSize: "14px",
    fontWeight: 700,
    textDecoration: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    display: "inline-block",
  },
  // ---- Section headings ----
  sectionHeading: {
    fontFamily: HEADING_FONT,
    color: COLORS.dark,
    fontSize: "22px",
    fontWeight: 800,
    letterSpacing: "0.2px",
    margin: 0,
  },
  // ---- Feature grid (2x2, alternating alignment) ----
  featureCell: {
    width: "50%",
    verticalAlign: "top",
    padding: "0 12px 28px 0",
  },
  featureTitle: {
    fontFamily: HEADING_FONT,
    color: COLORS.dark,
    fontSize: "19px",
    fontWeight: 700,
    margin: "0 0 8px 0",
  },
  featureDesc: {
    fontFamily: BODY_FONT,
    color: COLORS.gray,
    fontSize: "14px",
    lineHeight: "21px",
    margin: 0,
  },
  // ---- Quick start steps ----
  stepNumber: {
    fontFamily: HEADING_FONT,
    fontSize: "84px",
    fontWeight: 800,
    lineHeight: "84px",
    margin: 0,
  },
  stepTitle: {
    fontFamily: HEADING_FONT,
    fontSize: "17px",
    fontWeight: 700,
    margin: "0 0 6px 0",
  },
  stepDesc: {
    fontFamily: BODY_FONT,
    color: COLORS.gray,
    fontSize: "14px",
    lineHeight: "21px",
    margin: 0,
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

function FeatureItem({ title, description, align }) {
  return (
    <Column style={{ ...styles.featureCell, textAlign: align }} className="feature-cell">
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{description}</Text>
    </Column>
  );
}

// Steps 1 & 3: numeral column first (left), text column second (right).
// Step 2 ("mirrored"): the two columns swap DOM order so the numeral
// visually lands on the right and text on the left, right-aligned — no
// exotic CSS direction tricks needed, just literally rendering them in the
// other order, which every table-based email client handles natively.
function StepRow({ number, title, description, mirrored }) {
  const numberCol = (
    <Column style={{ width: 90, verticalAlign: "top", paddingBottom: 32 }} className="step-number-col">
      <Text style={{ ...styles.stepNumber, color: mirrored ? COLORS.red : COLORS.dark }}>
        {number}
      </Text>
    </Column>
  );
  const textCol = (
    <Column
      style={{
        verticalAlign: "top",
        textAlign: mirrored ? "right" : "left",
        paddingLeft: mirrored ? 0 : 16,
        paddingRight: mirrored ? 16 : 0,
        paddingBottom: 32,
      }}
    >
      <Text style={{ ...styles.stepTitle, color: mirrored ? COLORS.red : COLORS.dark }}>
        {title}
      </Text>
      <Text style={styles.stepDesc}>{description}</Text>
    </Column>
  );

  return (
    <Row>
      {mirrored ? (
        <>
          {textCol}
          {numberCol}
        </>
      ) : (
        <>
          {numberCol}
          {textCol}
        </>
      )}
    </Row>
  );
}

export default function WelcomeEmail({
  recipientName = "Alex",
  dashboardUrl = "https://app.nexgn.com/dashboard",
}) {
  return (
    <Html>
      <Head>
        <style>{emailHeadCss}</style>
      </Head>
      <Preview>
        Welcome to nexgn, {recipientName}. Your workspace is live and ready to
        go.
      </Preview>

      <Body style={{ ...styles.main, fontFamily: BODY_FONT }}>
        <Container style={styles.container} className="container">
          {/* ---------------- Hero: gradient banner, logo, split headline ---------------- */}
          <Section style={styles.hero}>
            <Row>
              <Column style={styles.heroInner} className="hero-inner">
                <Section style={{ textAlign: "center", marginBottom: 8 }}>
                  <Img
                    src={`${ASSET_URL}/logo.png`}
                    width="40"
                    height="40"
                    alt="Nexgn"
                    style={{ margin: "0 auto" }}
                  />
                </Section>

                <Heading
                  as="h1"
                  style={{ ...styles.headline, fontFamily: HEADING_FONT }}
                  className="headline"
                >
                  Your workspace
                  <br />
                  is now live<span style={{ color: COLORS.red }}>.</span>
                </Heading>

                {/* Positioned/indented to echo the original's right-shifted
                    placement under the split headline; collapses to a
                    normal full-width paragraph on mobile. */}
                <Row>
                  <Column style={{ width: "38%" }} className="stack-col" />
                  <Column className="stack-col welcome-col">
                    <Text style={styles.welcomeText}>
                      Welcome to nexgn, {recipientName}. Your account is
                      fully set up and ready. Here&rsquo;s everything you
                      need to hit the ground running.
                    </Text>
                  </Column>
                </Row>
              </Column>
            </Row>
          </Section>

          {/* ---------------- Intro paragraph + mini dashboard CTA ---------------- */}
          <Section style={{ marginTop: 32 }} className="px">
            <Row>
              <Column style={{ width: "56%", verticalAlign: "top" }} className="stack-col">
                <Text style={styles.introText}>
                  Hi {recipientName}, we built nexgn for professionals who
                  can&rsquo;t afford to slow down for paperwork. Your
                  workspace is ready and everything below is live from day
                  one.
                </Text>
              </Column>
              <Column
                style={{ width: "44%", verticalAlign: "top", paddingLeft: 20 }}
                className="stack-col cta-col"
              >
                <Text style={styles.ctaTitle} className="cta-title">
                  Open your dashboard
                </Text>
                <Text style={styles.ctaSubtext} className="cta-subtext">
                  Send your first document in under 60 seconds.
                </Text>
                <Row>
                  <Column align="right" style={{ textAlign: "right" }}>
                    <Button href={dashboardUrl} style={styles.ctaButton}>
                      Get started &rarr;
                    </Button>
                  </Column>
                </Row>
              </Column>
            </Row>
          </Section>

          {/* ---------------- Everything in your plan ---------------- */}
          <Section style={{ marginTop: 44 }} className="px">
            <Heading
              as="h2"
              style={{ ...styles.sectionHeading, fontFamily: HEADING_FONT }}
              className="section-heading"
            >
              EVERYTHING IN YOUR PLAN
            </Heading>
          </Section>

          <Section style={{ marginTop: 20 }} className="px">
            <Row>
              <FeatureItem
                align="left"
                title="E-Signature"
                description="Send, sign & track documents legally from anywhere in the world."
              />
              <FeatureItem
                align="right"
                title="Enterprise Security"
                description="SOC 2 · eIDAS · GDPR compliant. 256-bit AES encryption."
              />
            </Row>
            <Row>
              <FeatureItem
                align="left"
                title="Document Hub"
                description="Centralised inbox with smart filters, version history & audit logs."
              />
              <FeatureItem
                align="right"
                title="Team Management"
                description="Invite teammates, assign roles, manage permissions at scale."
              />
            </Row>
          </Section>

          {/* ---------------- Quick start – 3 steps ---------------- */}
          <Section style={{ marginTop: 12 }} className="px">
            <Heading
              as="h2"
              style={{ ...styles.sectionHeading, fontFamily: HEADING_FONT }}
              className="section-heading"
            >
              QUICK START &ndash; 3 STEPS
            </Heading>
          </Section>

          <Section style={{ marginTop: 20 }} className="px">
            <StepRow
              number="1"
              title="Complete your profile"
              description="Add your name, company, logo, tagline, contact details, brand colors, and digital signature to personalize documents."
            />
            <StepRow
              number="2"
              mirrored
              title="Upload your first document"
              description="Drag & drop any PDF or Word file to get started. Add your name, company, logo, tagline, and contact details."
            />
            <StepRow
              number="3"
              title="Invite your team"
              description="Add teammates and assign roles, takes 30 seconds. Collaborate seamlessly with shared access and permissions."
            />
          </Section>

          {/* ---------------- Testimonial / drop-cap ---------------- */}
          <Section style={{ marginTop: 64 }} className="px">
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