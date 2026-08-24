import React from 'react';
import { AuthProvider } from './AuthContext';
import { SocketProvider } from './SocketContext';
import { NotificationProvider } from './NotificationContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
};
