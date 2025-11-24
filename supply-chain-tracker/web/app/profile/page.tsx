'use client';

import { useWeb3 } from "@/contexts/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { account, user, isConnected, refreshUser } = useWeb3();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { web3Service } = await import('@/lib/web3');
      const roleNum = Number(selectedRole);
      await web3Service.requestUserRole(roleNum);
      
      // Refresh user data
      await refreshUser();
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register role');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  const getRoleLabel = (roleNum: number) => {
    const roles = ['Admin', 'Producer', 'Factory', 'Retailer', 'Consumer'];
    return roles[roleNum] || 'Unknown';
  };

  const getStatusLabel = (status: number) => {
    const labels = ['Pending Approval', 'Approved', 'Rejected', 'Canceled'];
    return labels[status] || 'Unknown';
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-yellow-500';
      case 1: return 'bg-green-500';
      case 2: return 'bg-red-500';
      case 3: return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Manage your account and role
          </p>

          {/* Account Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">Wallet Address</Label>
                  <p className="font-mono text-sm break-all mt-1">{account}</p>
                </div>
                
                {user && (
                  <>
                    <div>
                      <Label className="text-sm text-gray-600 dark:text-gray-400">Current Role</Label>
                      <p className="text-lg font-semibold mt-1">{getRoleLabel(user.role)}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600 dark:text-gray-400">Status</Label>
                      <div className="mt-1">
                        <Badge className={getStatusColor(user.status)}>
                          {getStatusLabel(user.status)}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role Registration */}
          {!user && (
            <Card>
              <CardHeader>
                <CardTitle>Register Your Role</CardTitle>
                <CardDescription>
                  Select your role in the supply chain. Admin approval required.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="role">Select Role</Label>
                  <Select
                    id="role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-2"
                  >
                    <option value="1">Producer - Create raw materials</option>
                    <option value="2">Factory - Process materials into products</option>
                    <option value="3">Retailer - Sell products to consumers</option>
                    <option value="4">Consumer - Purchase and verify products</option>
                  </Select>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Role Descriptions:
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li><strong>Producer:</strong> Create raw material tokens</li>
                    <li><strong>Factory:</strong> Transform raw materials into finished products</li>
                    <li><strong>Retailer:</strong> Distribute products to consumers</li>
                    <li><strong>Consumer:</strong> Receive and verify product authenticity</li>
                  </ul>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <Button 
                  onClick={handleRegister} 
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Registering...' : 'Register Role'}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Your registration will be reviewed by an administrator before approval
                </p>
              </CardContent>
            </Card>
          )}

          {/* Status Message for Existing Users */}
          {user && user.status === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">⏳</div>
                  <h3 className="text-2xl font-bold mb-2">Pending Approval</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Your registration is pending admin approval. You'll be notified once your account is approved.
                  </p>
                  <Button variant="outline" onClick={() => router.push('/')}>
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {user && user.status === 1 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold mb-2">Account Approved</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Your account has been approved! You can now use all platform features.
                  </p>
                  <Button onClick={() => router.push('/dashboard')}>
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {user && user.status === 2 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">❌</div>
                  <h3 className="text-2xl font-bold mb-2">Registration Rejected</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Your registration was rejected. Please contact the administrator for more information.
                  </p>
                  <Button variant="outline" onClick={() => router.push('/')}>
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
