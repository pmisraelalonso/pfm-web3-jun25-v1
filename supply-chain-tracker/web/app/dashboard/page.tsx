'use client';

import { useWeb3 } from "@/contexts/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function DashboardPage() {
  const { account, user, isConnected } = useWeb3();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalTokens: 0,
    pendingTransfers: 0,
    completedTransfers: 0
  });

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    } else if (!user) {
      router.push('/profile');
    }
  }, [isConnected, user, router]);

  if (!isConnected || !user) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome back, {account?.slice(0, 6)}...{account?.slice(-4)}
          </p>
        </div>

        {/* User Status Card */}
        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Your current role and approval status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                  <p className="text-lg font-semibold">{getRoleLabel(user.role)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <Badge className={getStatusColor(user.status)}>
                    {getStatusLabel(user.status)}
                  </Badge>
                </div>
                <div className="ml-auto">
                  <Link href="/profile">
                    <Button variant="outline">View Profile</Button>
                  </Link>
                </div>
              </div>
              
              {user.status === 0 && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⏳ Your account is pending admin approval. You'll be able to use the platform once approved.
                  </p>
                </div>
              )}
              
              {user.status === 2 && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    ❌ Your account has been rejected. Please contact the administrator.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {user.status === 1 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Admin Actions */}
              {user.role === 0 && (
                <>
                  <Link href="/admin/users">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">👥 Manage Users</CardTitle>
                        <CardDescription>Approve or reject user registrations</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                  <Link href="/admin">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">📊 System Stats</CardTitle>
                        <CardDescription>View platform statistics</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                </>
              )}

              {/* Producer Actions */}
              {user.role === 1 && (
                <Link href="/tokens/create">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">➕ Create Token</CardTitle>
                      <CardDescription>Create new raw material</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )}

              {/* Factory Actions */}
              {user.role === 2 && (
                <Link href="/tokens/create">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">🏭 Create Product</CardTitle>
                      <CardDescription>Transform materials into products</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )}

              {/* All Non-Consumer Roles */}
              {user.role !== 4 && (
                <>
                  <Link href="/tokens">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">📦 My Tokens</CardTitle>
                        <CardDescription>View your inventory</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                  <Link href="/transfers">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">🔄 Transfers</CardTitle>
                        <CardDescription>Manage incoming & outgoing transfers</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                </>
              )}

              {/* Consumer Actions */}
              {user.role === 4 && (
                <>
                  <Link href="/transfers">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">📦 My Products</CardTitle>
                        <CardDescription>View received products</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                  <Link href="/tokens">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">🔍 Verify Products</CardTitle>
                        <CardDescription>Check product authenticity</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                </>
              )}
            </div>

            {/* Statistics */}
            <h2 className="text-2xl font-bold mb-4">Statistics</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalTokens}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Transfers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingTransfers}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Completed Transfers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{stats.completedTransfers}</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
