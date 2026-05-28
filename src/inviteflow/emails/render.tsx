import { render } from '@react-email/render';
import type { AppEvent, Invitee } from '../types';
import { TEMPLATES } from './index';

export interface RenderOptions {
  templateId: string;
  event: AppEvent;
  invitee: Invitee;
  params?: Record<string, string>;
}

export async function renderTemplate({ templateId, event, invitee, params = {} }: RenderOptions): Promise<string> {
  const meta = TEMPLATES[templateId];
  if (!meta) {
    throw new Error(`Unknown email template: "${templateId}"`);
  }
  const Template = meta.component;
  return render(<Template event={event} invitee={invitee} params={params} />);
}

export function listTemplates(): { id: string; name: string; description: string }[] {
  return Object.entries(TEMPLATES).map(([id, meta]) => ({ id, name: meta.name, description: meta.description }));
}
