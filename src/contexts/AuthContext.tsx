
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('bbuser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('bbuser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would make an API call
      // For now, we'll simulate a login by checking localStorage
      const storedUsers = localStorage.getItem('bbuserdb') || '[]';
      const users = JSON.parse(storedUsers);
      
      const matchedUser = users.find((u: any) => 
        u.email === email && u.password === password
      );
      
      if (!matchedUser) {
        toast.error('Invalid email or password');
        return false;
      }
      
      // Remove password before storing in state/localStorage
      const { password: _, ...userWithoutPassword } = matchedUser;
      setUser(userWithoutPassword);
      localStorage.setItem('bbuser', JSON.stringify(userWithoutPassword));
      toast.success('Login successful');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would make an API call
      // For now, we'll simulate by storing in localStorage
      const storedUsers = localStorage.getItem('bbuserdb') || '[]';
      let users = JSON.parse(storedUsers);
      
      // Check if user already exists
      if (users.some((u: any) => u.email === email)) {
        toast.error('User with this email already exists');
        return false;
      }
      
      const newUser = {
        id: `user_${Date.now()}`,
        username,
        email,
        password // In a real app, this would be hashed
      };
      
      users.push(newUser);
      localStorage.setItem('bbuserdb', JSON.stringify(users));
      
      // Remove password before storing in state/localStorage
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('bbuser', JSON.stringify(userWithoutPassword));
      
      toast.success('Account created successfully');
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bbuser');
    toast.info('You have been logged out');
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated
      }}
    >
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
