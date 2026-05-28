import type { FC } from 'react';
import type { AppEvent, Invitee } from '../types';
import { AsiaFestInvite } from './AsiaFestInvite';
import { GenericInvite } from './GenericInvite';

export interface TemplateProps {
  event: AppEvent;
  invitee: Invitee;
  params?: Record<string, string>;
}

export interface TemplateMeta {
  component: FC<TemplateProps>;
  name: string;
  description: string;
  paramFields: ParamField[];
}

export interface ParamField {
  key: string;
  label: string;
  type: 'text' | 'textarea';
  defaultValue: string;
  placeholder?: string;
}

export const TEMPLATES: Record<string, TemplateMeta> = {
  asiafest2026: {
    component: AsiaFestInvite,
    name: 'Asia Fest 2026',
    description: 'Festive red-themed VIP invitation for the Greater Triangle Dragon Boat Festival.',
    paramFields: [
      { key: 'greeting', label: 'Greeting', type: 'text', defaultValue: 'Dear Honorable', placeholder: 'Dear Honorable' },
      { key: 'closing', label: 'Closing', type: 'text', defaultValue: 'Respectfully yours,', placeholder: 'Respectfully yours,' },
      { key: 'customNote', label: 'Custom Note', type: 'textarea', defaultValue: '', placeholder: 'Optional additional paragraph...' },
    ],
  },
  generic: {
    component: GenericInvite,
    name: 'Generic Invitation',
    description: 'Simple, clean invitation suitable for any event.',
    paramFields: [
      { key: 'greeting', label: 'Greeting', type: 'text', defaultValue: 'Dear', placeholder: 'Dear' },
      { key: 'body', label: 'Body Text', type: 'textarea', defaultValue: 'You are cordially invited to {{EventName}} on {{EventDate}} at {{Venue}}.', placeholder: 'Main invitation message...' },
      { key: 'closing', label: 'Closing', type: 'text', defaultValue: 'Sincerely,', placeholder: 'Sincerely,' },
    ],
  },
};

export function getTemplateMeta(id: string): TemplateMeta | undefined {
  return TEMPLATES[id];
}
