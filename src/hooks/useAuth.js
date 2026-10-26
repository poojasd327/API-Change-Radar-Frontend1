import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context-base';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext } from '@/context/auth-context-base';
export { AuthProvider } from '@/context/AuthProvider';
