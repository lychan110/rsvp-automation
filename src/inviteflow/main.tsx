import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './styles/primereact-reset.css';
import './styles/tiptap.css';
import './theme.css';
import './styles/if.css';
import App from './App';

const root = document.getElementById('root');
if (!root) throw new Error('No #root element');
createRoot(root).render(<StrictMode><App /></StrictMode>);
