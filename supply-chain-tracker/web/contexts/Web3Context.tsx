'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { web3Service, User, UserStatus } from '@/lib/web3';

interface Web3ContextType {
  account: string | null;
  user: User | null;
  isConnected: boolean;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshUser: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserInfo = async (address: string) => {
    try {
      const userInfo = await web3Service.getUserInfo(address);
      setUser(userInfo);
      if (userInfo) {
        localStorage.setItem('supplychain_user', JSON.stringify(userInfo));
      }
    } catch (error) {
      console.error('Error loading user info:', error);
      setUser(null);
    }
  };

  const connect = async () => {
    try {
      setIsLoading(true);
      const address = await web3Service.connectWallet();
      setAccount(address);
      setIsConnected(true);
      localStorage.setItem('supplychain_account', address);
      
      await loadUserInfo(address);
    } catch (error: any) {
      console.error('Connection error:', error);
      alert(error.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    web3Service.disconnect();
    setAccount(null);
    setUser(null);
    setIsConnected(false);
    localStorage.removeItem('supplychain_account');
    localStorage.removeItem('supplychain_user');
  };

  const refreshUser = async () => {
    if (account) {
      await loadUserInfo(account);
    }
  };

  // Auto-reconnect on mount
  useEffect(() => {
    const savedAccount = localStorage.getItem('supplychain_account');
    if (savedAccount && typeof window !== 'undefined' && window.ethereum) {
      connect();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Listen to account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          localStorage.setItem('supplychain_account', accounts[0]);
          loadUserInfo(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  return (
    <Web3Context.Provider
      value={{
        account,
        user,
        isConnected,
        isLoading,
        connect,
        disconnect,
        refreshUser,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}
