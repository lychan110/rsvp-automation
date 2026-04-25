import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './theme.css';
import App from './App';

const root = document.getElementById('root');
if (!root) throw new Error('No #root element');
createRoot(root).render(<StrictMode><App /></StrictMode>);
