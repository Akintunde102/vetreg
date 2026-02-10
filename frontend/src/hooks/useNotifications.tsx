import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface NotificationsContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <NotificationsContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (ctx === undefined) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
