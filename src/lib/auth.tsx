
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isDeactivated: boolean;
  sessionExpired: boolean;
  setSessionExpired: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  const login = (role: UserRole) => {
    // Mock login
    const mockUser: User = {
      id: '1',
      firstName: role === 'Marketing Head' ? 'Admin' : 'Team',
      lastName: 'User',
      email: role === 'Marketing Head' ? 'admin@qlone.com' : 'team@qlone.com',
      mobile: '+91 9876543210',
      role: role,
      status: 'Active',
    };
    setUser(mockUser);
    setIsDeactivated(false);
    setSessionExpired(false);
    setLastActivity(Date.now());
  };

  const logout = () => {
    setUser(null);
    setSessionExpired(false);
  };

  // Inactivity tracking
  useEffect(() => {
    if (!user || sessionExpired) return;

    const INACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours session
    const CHECK_INTERVAL = 10000; // Check every 10 seconds

    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    // Events to track activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    events.forEach(event => document.addEventListener(event, handleActivity));

    const checkTimeout = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > INACTIVITY_TIMEOUT) {
        setSessionExpired(true);
      }
    }, CHECK_INTERVAL);

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivity));
      clearInterval(checkTimeout);
    };
  }, [user, sessionExpired, lastActivity]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isDeactivated, sessionExpired, setSessionExpired }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
