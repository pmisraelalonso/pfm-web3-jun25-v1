import { ethers, BrowserProvider, Contract } from 'ethers';
import { CONTRACT_CONFIG, NETWORK_CONFIG } from '@/contracts/config';

export enum UserStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Canceled = 3,
}

export enum TransferStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
}

export interface User {
  id: bigint;
  userAddress: string;
  role: number; // Changed from string to number to match enum values
  status: UserStatus;
}

export interface Token {
  id: bigint;
  creator: string;
  name: string;
  totalSupply: bigint;
  features: string;
  parentId: bigint;
  dateCreated: bigint;
}

export interface Transfer {
  id: bigint;
  from: string;
  to: string;
  tokenId: bigint;
  dateCreated: bigint;
  amount: bigint;
  status: TransferStatus;
}

class Web3Service {
  private provider: BrowserProvider | null = null;
  private contract: Contract | null = null;
  private signer: any = null;

  async connectWallet(): Promise<string> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    try {
      this.provider = new BrowserProvider(window.ethereum);
      const accounts = await this.provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      await this.checkNetwork();
      this.signer = await this.provider.getSigner();
      this.contract = new Contract(
        CONTRACT_CONFIG.address,
        CONTRACT_CONFIG.abi,
        this.signer
      );

      return accounts[0];
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      throw new Error(error.message || 'Failed to connect wallet');
    }
  }

  async checkNetwork(): Promise<void> {
    if (!this.provider) throw new Error('Provider not initialized');

    const network = await this.provider.getNetwork();
    const chainId = Number(network.chainId);

    if (chainId !== NETWORK_CONFIG.chainId) {
      try {
        if (!window.ethereum) throw new Error('MetaMask not found');
        
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await this.addNetwork();
        } else {
          throw switchError;
        }
      }
    }
  }

  async addNetwork(): Promise<void> {
    if (!window.ethereum) throw new Error('MetaMask not found');
    
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
          chainName: NETWORK_CONFIG.chainName,
          rpcUrls: [NETWORK_CONFIG.rpcUrl],
          nativeCurrency: NETWORK_CONFIG.nativeCurrency,
        },
      ],
    });
  }

  getContract(): Contract {
    if (!this.contract) {
      throw new Error('Contract not initialized. Please connect wallet first.');
    }
    return this.contract;
  }

  // User Management Methods
  async requestUserRole(role: number): Promise<void> {
    const contract = this.getContract();
    const roleNames = ['Admin', 'Producer', 'Factory', 'Retailer', 'Consumer'];
    const roleName = roleNames[role] || 'Consumer';
    const tx = await contract.requestUserRole(roleName);
    await tx.wait();
  }

  async changeStatusUser(userAddress: string, newStatus: UserStatus): Promise<void> {
    const contract = this.getContract();
    const tx = await contract.changeStatusUser(userAddress, newStatus);
    await tx.wait();
  }

  async getUserInfo(userAddress: string): Promise<User | null> {
    const contract = this.getContract();
    try {
      const user = await contract.getUserInfo(userAddress);
      return {
        id: user.id,
        userAddress: user.userAddress,
        role: user.role,
        status: Number(user.status) as UserStatus,
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  async isAdmin(userAddress: string): Promise<boolean> {
    const contract = this.getContract();
    return await contract.isAdmin(userAddress);
  }

  // Token Management Methods
  async createToken(
    name: string,
    totalSupply: number,
    features: string,
    parentId: number = 0
  ): Promise<void> {
    const contract = this.getContract();
    const tx = await contract.createToken(name, totalSupply, features, parentId);
    await tx.wait();
  }

  async getToken(tokenId: number): Promise<Token> {
    const contract = this.getContract();
    const token = await contract.getToken(tokenId);
    return {
      id: token.id,
      creator: token.creator,
      name: token.name,
      totalSupply: token.totalSupply,
      features: token.features,
      parentId: token.parentId,
      dateCreated: token.dateCreated,
    };
  }

  async getTokenBalance(tokenId: number, userAddress: string): Promise<bigint> {
    const contract = this.getContract();
    return await contract.getTokenBalance(tokenId, userAddress);
  }

  async getUserTokens(userAddress: string): Promise<bigint[]> {
    const contract = this.getContract();
    return await contract.getUserTokens(userAddress);
  }

  // Transfer Management Methods
  async transfer(to: string, tokenId: number, amount: number): Promise<void> {
    const contract = this.getContract();
    const tx = await contract.transfer(to, tokenId, amount);
    await tx.wait();
  }

  async acceptTransfer(transferId: number): Promise<void> {
    const contract = this.getContract();
    const tx = await contract.acceptTransfer(transferId);
    await tx.wait();
  }

  async rejectTransfer(transferId: number): Promise<void> {
    const contract = this.getContract();
    const tx = await contract.rejectTransfer(transferId);
    await tx.wait();
  }

  async getTransfer(transferId: number): Promise<Transfer> {
    const contract = this.getContract();
    const transfer = await contract.getTransfer(transferId);
    return {
      id: transfer.id,
      from: transfer.from,
      to: transfer.to,
      tokenId: transfer.tokenId,
      dateCreated: transfer.dateCreated,
      amount: transfer.amount,
      status: Number(transfer.status) as TransferStatus,
    };
  }

  async getUserTransfers(userAddress: string): Promise<bigint[]> {
    const contract = this.getContract();
    return await contract.getUserTransfers(userAddress);
  }

  disconnect(): void {
    this.provider = null;
    this.contract = null;
    this.signer = null;
  }
}

export const web3Service = new Web3Service();
