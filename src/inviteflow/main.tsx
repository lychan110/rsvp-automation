import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './styles/primereact-reset.css';
import './theme.css';
import './styles/if.css';
import App from './App';

// ── Local-only: auto-seed API keys from .env (Vite define) on first load ──
function seedLocalKeys() {
  const resend = (import.meta as any).env?.RESEND_API_KEY as string | undefined;
  if (resend && !localStorage.getItem('resend_api_key')) {
    localStorage.setItem('resend_api_key', resend);
  }
  const llmKey = (import.meta as any).env?.OPENAI_API_KEY as string | undefined;
  if (llmKey && !sessionStorage.getItem('cs_api_key')) {
    sessionStorage.setItem('cs_api_key', llmKey);
  }
  const llmEndpoint = (import.meta as any).env?.OPENAI_ENDPOINT as string | undefined;
  if (llmEndpoint && !sessionStorage.getItem('cs_endpoint')) {
    sessionStorage.setItem('cs_endpoint', llmEndpoint);
  }
  const serpKey = (import.meta as any).env?.SERPAPI_KEY as string | undefined;
  if (serpKey && !sessionStorage.getItem('cs_search_key')) {
    sessionStorage.setItem('cs_search_key', serpKey);
  }
}
seedLocalKeys();
// ───────────────────────────────────────────────────────────────────────────

const root = document.getElementById('root');
if (!root) throw new Error('No #root element');
createRoot(root).render(<StrictMode><App /></StrictMode>);
