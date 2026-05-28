import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { TemplateProps } from './index';

const CRIMSON = '#991B1B';
const CRIMSON_LIGHT = '#FEE2E2';
const GOLD = '#B45309';

export function AsiaFestInvite({ event, invitee, params = {} }: TemplateProps) {
  const greeting = params.greeting || 'Dear Honorable';
  const closing = params.closing || 'Respectfully yours,';
  const customNote = params.customNote || '';

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Asia Fest VIP Invitation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Preview>You are cordially invited to Asia Fest 2026 — {event.name}</Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: '#FAFAFA', fontFamily: 'Georgia, serif' }}>
        <Container style={{ maxWidth: 700, margin: '0 auto', backgroundColor: '#FFFFFF' }}>
          {/* Header Band */}
          <Section style={{ backgroundColor: CRIMSON, padding: '24px 32px', textAlign: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0, fontFamily: 'Helvetica, Arial, sans-serif' }}>
              VIP Invitation
            </Text>
          </Section>

          {/* Emblem */}
          <Section style={{ textAlign: 'center', padding: '24px 32px 12px' }}>
            <Img
              src="https://asianfocusnc.org/wp-content/uploads/2023/05/cropped-cropped-cropped-Asian-Focus-Logo-1.png"
              alt="Asian Focus"
              width={160}
              height="auto"
              style={{ margin: '0 auto' }}
            />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: CRIMSON, margin: '12px 0 0', fontFamily: 'Georgia, serif' }}>
              11th Annual Greater Triangle Dragon Boat Festival
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ padding: '12px 32px 24px' }}>
            <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#1a1a1a', margin: '0 0 12px' }}>
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>

            <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#1a1a1a', margin: '0 0 12px' }}>
              {greeting} {invitee.firstName} {invitee.lastName},
            </Text>

            <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#1a1a1a', margin: '0 0 12px' }}>
              On behalf of Asian Focus and Asian community leaders and constituents, we are pleased to invite you to{' '}
              <strong style={{ color: CRIMSON }}>Asia Fest</strong>, featuring the{' '}
              <strong>11th Annual Dragon Boat Festival</strong>, on{' '}
              <strong>Saturday, September 19, 2026</strong>, at the Koka Booth Amphitheatre in Cary, North Carolina.
            </Text>

            <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#1a1a1a', margin: '0 0 12px' }}>
              We would be honored to welcome you as our distinguished guest. The VIP program, including the opening
              ceremony and reception, runs from <strong>9:15 a.m. until 12:00 noon</strong>, featuring stage performances
              and cultural festivities. This celebration brings together thousands of residents from across the Triangle
              to enjoy dragon boat racing, vibrant performances, and diverse Asian cuisines.
            </Text>

            {customNote && (
              <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#1a1a1a', margin: '0 0 12px' }}>
                {customNote}
              </Text>
            )}

            <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#1a1a1a', margin: '0 0 12px' }}>
              To help us prepare for the opening ceremony, please RSVP your attendance using the link below. If you are
              unable to attend, you are welcome to send a representative. If an in‑person appearance is not possible,
              a congratulatory letter commemorating this occasion would be sincerely appreciated.
            </Text>

            {/* CTA */}
            <Section style={{ textAlign: 'center', margin: '20px 0' }}>
              <Button
                href={invitee.rsvpLink || '#'}
                style={{
                  backgroundColor: CRIMSON,
                  color: '#FFFFFF',
                  padding: '12px 32px',
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  display: 'inline-block',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}
              >
                RSVP for Asia Fest 2026
              </Button>
            </Section>

            <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#1a1a1a', margin: '0 0 12px' }}>
              For any questions, please contact {event.contactName || 'Yu‑Chin Chan'}, Asian Focus Outreach Liaison, at{' '}
              <Link href={`mailto:${event.contactEmail || 'AF.VIP@asianfocusnc.org'}`} style={{ color: '#0645AD', textDecoration: 'underline' }}>
                {event.contactEmail || 'AF.VIP@asianfocusnc.org'}
              </Link>.
            </Text>

            <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#1a1a1a', margin: '20px 0 6px' }}>
              {closing}
            </Text>

            <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#1a1a1a', margin: '0 0 20px' }}>
              Yun‑Lieh Chuu, Asian Focus President<br />
              <Link href="mailto:yun.chuu@asianfocusnc.org" style={{ color: '#0645AD', textDecoration: 'underline' }}>
                yun.chuu@asianfocusnc.org
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: CRIMSON_LIGHT, padding: '20px 32px', textAlign: 'center' }}>
            <Img
              src="https://asianfocusnc.org/wp-content/uploads/2023/05/cropped-cropped-cropped-Asian-Focus-Logo-1.png"
              alt="Asian Focus"
              width={100}
              height="auto"
              style={{ margin: '0 auto 8px' }}
            />
            <Text style={{ fontSize: 12, lineHeight: 1.4, color: '#444444', margin: 0, fontFamily: 'Helvetica, Arial, sans-serif' }}>
              ASIAN FOCUS CORPORATION<br />
              Triangle Area, Raleigh Metro, NC<br />
              P.O. Box 1206, Morrisville, NC 27560<br />
              <Link href="https://AsianFocusNC.org" style={{ color: CRIMSON, textDecoration: 'underline' }}>AsianFocusNC.org</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
