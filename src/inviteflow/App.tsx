import { AppProvider } from './state/AppContext';
import { RouterProvider, useRouter } from './state/RouterContext';
import EventsPage from './pages/EventsPage';
import EventDashboard from './pages/EventDashboard';
import EventSetupPage from './pages/EventSetupPage';
import InviteesPage from './pages/InviteesPage';
import ComposePage from './pages/ComposePage';
import SendPage from './pages/SendPage';
import TrackerPage from './pages/TrackerPage';
import SyncPage from './pages/SyncPage';
import SettingsPage from './pages/SettingsPage';

function PageContent() {
  const { route } = useRouter();
  switch (route) {
    case 'events':      return <EventsPage />;
    case 'event-home':  return <EventDashboard />;
    case 'event-setup': return <EventSetupPage />;
    case 'invitees':    return <InviteesPage />;
    case 'compose':     return <ComposePage />;
    case 'send':        return <SendPage />;
    case 'tracker':     return <TrackerPage />;
    case 'sync':        return <SyncPage />;
    case 'settings':    return <SettingsPage />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <RouterProvider>
        <div
          style={{
            height: '100dvh',
            overflow: 'hidden',
            background: 'var(--bg-root)',
            color: 'var(--text-base)',
            fontFamily: 'var(--rf-mono)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <PageContent />
        </div>
      </RouterProvider>
    </AppProvider>
  );
}
