import { createContext, useContext, useState, type ReactNode } from 'react';

export type RouteId =
  | 'events'
  | 'event-home'
  | 'event-setup'
  | 'invitees'
  | 'compose'
  | 'send'
  | 'tracker'
  | 'sync'
  | 'settings'
  | 'help'
  | 'scout';

interface RouterContextValue {
  route: RouteId;
  navigate: (page: RouteId) => void;
  goBack: () => void;
}

const RouterCtx = createContext<RouterContextValue>({
  route: 'events',
  navigate: () => {},
  goBack: () => {},
});

export function RouterProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<RouteId[]>(['events']);
  const route = stack[stack.length - 1];

  function navigate(page: RouteId) {
    setStack(s => [...s, page]);
  }

  function goBack() {
    setStack(s => (s.length > 1 ? s.slice(0, -1) : s));
  }

  return (
    <RouterCtx.Provider value={{ route, navigate, goBack }}>
      {children}
    </RouterCtx.Provider>
  );
}

export const useRouter = () => useContext(RouterCtx);
