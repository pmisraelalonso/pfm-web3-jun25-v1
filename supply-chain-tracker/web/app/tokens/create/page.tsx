'use client';

import { useWeb3 } from "@/contexts/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { web3Service, Token } from "@/lib/web3";

export default function CreateTokenPage() {
  const { account, user, isConnected } = useWeb3();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    metadata: '',
    parentId: '0'
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

    // Only factories can use parent tokens
    if (user.role === 2) {
      loadAvailableTokens();
    }
  }, [isConnected, user, router]);

  const loadAvailableTokens = async () => {
    try {
      const tokenIds = await web3Service.getUserTokens(account!);
      const tokensData = await Promise.all(
        tokenIds.map(id => web3Service.getToken(Number(id)))
      );
      setAvailableTokens(tokensData.filter(t => t.totalSupply > 0));
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const web3Service = (await import('@/lib/web3')).web3Service;
      
      const amount = parseInt(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a positive number');
      }

      await web3Service.createToken(
        formData.name,
        amount,
        formData.metadata,
        Number(formData.parentId)
      );

      router.push('/tokens');
    } catch (err: any) {
      console.error('Token creation error:', err);
      setError(err.message || 'Failed to create token');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected || !user || user.status !== 1) {
    return null;
  }

  const getRoleInfo = () => {
    switch (user.role) {
      case 1:
        return {
          title: 'Create Raw Material',
          description: 'As a Producer, you can create raw material tokens.',
          example: 'Example: Cotton, Wheat, Steel, etc.'
        };
      case 2:
        return {
          title: 'Create Finished Product',
          description: 'As a Factory, you can transform raw materials into finished products.',
          example: 'Example: T-Shirt, Bread, Car Part, etc.'
        };
      case 3:
        return {
          title: 'Repackage Product',
          description: 'As a Retailer, you can repackage products for retail.',
          example: 'Example: Retail Package, Gift Box, etc.'
        };
      default:
        return {
          title: 'Create Token',
          description: 'Create a new token in the supply chain.',
          example: ''
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{roleInfo.title}</h1>
            <p className="text-gray-600 dark:text-gray-300">
              {roleInfo.description}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Token Information</CardTitle>
              <CardDescription>
                Fill in the details for your new token
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Token Name */}
                <div>
                  <Label htmlFor="name">Token Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={roleInfo.example}
                    required
                    className="mt-2"
                  />
                </div>

                {/* Amount */}
                <div>
                  <Label htmlFor="amount">Quantity *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Enter quantity"
                    required
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Total amount of tokens to create
                  </p>
                </div>

                {/* Parent Token (for Factories) */}
                {user.role === 2 && availableTokens.length > 0 && (
                  <div>
                    <Label htmlFor="parentId">Parent Material (Optional)</Label>
                    <Select
                      id="parentId"
                      value={formData.parentId}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      className="mt-2"
                    >
                      <option value="0">None - New Product</option>
                      {availableTokens.map((token) => (
                        <option key={token.id.toString()} value={token.id.toString()}>
                          {token.name} (Balance: {token.totalSupply.toString()})
                        </option>
                      ))}
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select a raw material to transform into a finished product
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div>
                  <Label htmlFor="metadata">Additional Information (Optional)</Label>
                  <Textarea
                    id="metadata"
                    value={formData.metadata}
                    onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                    placeholder="Enter additional details like origin, certifications, etc."
                    rows={4}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add any relevant information about this token
                  </p>
                </div>

                {/* Information Box */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    ℹ️ Important Information
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <li>• Token creation requires a blockchain transaction</li>
                    <li>• You'll need to confirm the transaction in MetaMask</li>
                    <li>• The token will be added to your inventory once created</li>
                    {user.role === 2 && (
                      <li>• Linking a parent token enables full traceability</li>
                    )}
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Creating...' : 'Create Token'}
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
