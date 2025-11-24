'use client';

import { useWeb3 } from "@/contexts/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import Link from "next/link";

import { web3Service, Token } from "@/lib/web3";

interface TokenDetails extends Token {
  balance: bigint;
}

export default function TransferTokenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { account, user, isConnected } = useWeb3();
  const router = useRouter();
  const [token, setToken] = useState<TokenDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    recipient: '',
    amount: ''
  });

  useEffect(() => {
    if (!isConnected || !user) {
      router.push('/');
      return;
    }
    
    if (user.status !== 1) {
      router.push('/dashboard');
      return;
    }

    loadTokenDetails();
  }, [isConnected, user, router, id]);

  const loadTokenDetails = async () => {
    setLoading(true);
    try {
      const tokenData = await web3Service.getToken(Number(id));
      const balance = await web3Service.getTokenBalance(Number(id), account!);
      
      setToken({
        ...tokenData,
        balance
      });

      if (balance === 0n) {
        setError('You do not have any balance of this token to transfer');
      }
    } catch (error) {
      console.error('Failed to load token:', error);
      setError('Failed to load token details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const web3Service = (await import('@/lib/web3')).web3Service;
      
      const amount = parseInt(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a positive number');
      }

      if (BigInt(amount) > token!.balance) {
        throw new Error('Insufficient balance');
      }

      if (!formData.recipient || formData.recipient.length !== 42) {
        throw new Error('Invalid recipient address');
      }

      if (formData.recipient.toLowerCase() === account?.toLowerCase()) {
        throw new Error('Cannot transfer to yourself');
      }

      await web3Service.transfer(formData.recipient, Number(id), amount);
      
      router.push('/transfers');
    } catch (err: any) {
      console.error('Transfer error:', err);
      setError(err.message || 'Failed to initiate transfer');
    } finally {
      setSubmitting(false);
    }
  };

  const getNextRoleInfo = () => {
    switch (user?.role) {
      case 1: // Producer
        return {
          role: 'Factory',
          description: 'You can only transfer to Factory addresses',
          example: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
        };
      case 2: // Factory
        return {
          role: 'Retailer',
          description: 'You can only transfer to Retailer addresses',
          example: '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
        };
      case 3: // Retailer
        return {
          role: 'Consumer',
          description: 'You can only transfer to Consumer addresses',
          example: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'
        };
      default:
        return {
          role: 'Unknown',
          description: 'Role not recognized',
          example: ''
        };
    }
  };

  if (!isConnected || !user || user.status !== 1) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Token Not Found</h3>
              <Link href="/tokens">
                <Button>Back to Tokens</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const roleInfo = getNextRoleInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Transfer Token</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Send {token.name} to another address
            </p>
          </div>

          {/* Token Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Token Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Token Name</p>
                  <p className="text-lg font-semibold">{token.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your Balance</p>
                  <p className="text-lg font-semibold text-green-600">
                    {token.balance.toString()}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Token ID</p>
                  <p className="font-mono text-xs break-all">{token.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Form */}
          <Card>
            <CardHeader>
              <CardTitle>Transfer Details</CardTitle>
              <CardDescription>
                {roleInfo.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Recipient */}
                <div>
                  <Label htmlFor="recipient">Recipient Address ({roleInfo.role}) *</Label>
                  <Input
                    id="recipient"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    placeholder={roleInfo.example}
                    required
                    className="mt-2 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the Ethereum address of the {roleInfo.role}
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    max={token.balance.toString()}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Enter amount to transfer"
                    required
                    className="mt-2"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Available: {token.balance.toString()}
                    </p>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0"
                      onClick={() => setFormData({ ...formData, amount: token.balance.toString() })}
                    >
                      Use Max
                    </Button>
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    ℹ️ Transfer Flow
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <li>• Your role: <strong>{['Admin', 'Producer', 'Factory', 'Retailer', 'Consumer'][user.role]}</strong></li>
                    <li>• Can transfer to: <strong>{roleInfo.role}</strong></li>
                    <li>• The recipient must accept the transfer</li>
                    <li>• You'll need to confirm the transaction in MetaMask</li>
                    <li>• Transfer will be pending until accepted</li>
                  </ul>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4">
                  <Link href={`/tokens/${id}`} className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={submitting || !token || token.balance === 0n}
                    className="flex-1"
                  >
                    {submitting ? 'Initiating Transfer...' : 'Initiate Transfer'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
