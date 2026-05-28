import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { TemplateProps } from './index';

const SLATE = '#1E293B';

export function GenericInvite({ event, invitee, params = {} }: TemplateProps) {
  const greeting = params.greeting || 'Dear';
  const body = params.body || `You are cordially invited to ${event.name} on ${event.date} at ${event.venue}.`;
  const closing = params.closing || 'Sincerely,';

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Invitation</title>
      </Head>
      <Preview>Invitation to {event.name}</Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: '#F3F4F6', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', backgroundColor: '#FFFFFF', padding: '32px' }}>
          <Heading as="h1" style={{ color: SLATE, fontSize: 24, margin: '0 0 16px' }}>
            {event.name}
          </Heading>
          <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#374151' }}>
            {greeting} {invitee.firstName} {invitee.lastName},
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#374151' }}>
            {body}
          </Text>
          {invitee.rsvpLink && (
            <Section style={{ textAlign: 'center', margin: '24px 0' }}>
              <Button
                href={invitee.rsvpLink}
                style={{
                  backgroundColor: SLATE,
                  color: '#FFFFFF',
                  padding: '12px 24px',
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                RSVP
              </Button>
            </Section>
          )}
          <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#374151' }}>
            {closing}<br />
            {event.contactName || 'Event Organizer'}<br />
            <Link href={`mailto:${event.contactEmail}`} style={{ color: '#2563EB', textDecoration: 'underline' }}>
              {event.contactEmail}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
