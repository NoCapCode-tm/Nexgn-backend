import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
} from "@react-email/components";

const COLORS = {
  red: "#FF0915",
  dark: "#1A1A1A",
  gray: "#6B7280",
};

export default function NotificationAlertEmail({
  recipientName = "there",
  title = "Nexgn notification",
  message = "",
  actionUrl = "https://sign.nexgn.cloud",
}) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={{ backgroundColor: "#ffffff", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "32px 20px" }}>
          <Heading style={{ color: COLORS.red, fontSize: "24px", margin: "0 0 16px 0" }}>
            {title}
          </Heading>
          <Text style={{ color: COLORS.dark, fontSize: "15px", lineHeight: "24px", margin: "0 0 12px 0" }}>
            Hi {recipientName},
          </Text>
          <Text style={{ color: COLORS.gray, fontSize: "15px", lineHeight: "24px", margin: "0 0 24px 0" }}>
            {message}
          </Text>
          <Section>
            <Button
              href={actionUrl}
              style={{
                backgroundColor: COLORS.red,
                color: "#ffffff",
                borderRadius: "6px",
                padding: "12px 20px",
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              Open Nexgn
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
