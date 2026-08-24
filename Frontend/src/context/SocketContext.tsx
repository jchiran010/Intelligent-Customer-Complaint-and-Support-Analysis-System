import React, { createContext, useContext, useEffect } from 'react';
import { socketClient } from '../api/socketClient';
import { useAuth } from './AuthContext';

interface SocketContextType {
  subscribe: (event: string, callback: (data: any) => void) => () => void;
  emitEvent: (event: string, data: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      socketClient.connect();
    } else {
      socketClient.disconnect();
    }

    return () => {
      socketClient.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider
      value={{
        subscribe: (event, cb) => socketClient.subscribe(event, cb),
        emitEvent: (event, data) => socketClient.emitLocalEvent(event, data),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
