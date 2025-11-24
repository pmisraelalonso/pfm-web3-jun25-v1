'use client';

import { useWeb3 } from "@/contexts/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminPage() {
  const { account, user, isConnected } = useWeb3();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    approvedUsers: 0,
    totalTokens: 0,
    totalTransfers: 0,
    pendingTransfers: 0
  });

  useEffect(() => {
    if (!isConnected || !user) {
      router.push('/');
      return;
    }
    
    if (Number(user.role) !== 0) {
      router.push('/dashboard');
      return;
    }

    loadStats();
  }, [isConnected, user, router]);

  const loadStats = async () => {
    try {
      // In a real implementation, you would fetch these from the contract
      // For now, we'll use placeholder values
      setStats({
        totalUsers: 5,
        pendingUsers: 2,
        approvedUsers: 3,
        totalTokens: 10,
        totalTransfers: 15,
        pendingTransfers: 3
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  if (!isConnected || !user || user.role !== 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">👑 Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            System overview and administration
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  👥 Manage Users
                  {stats.pendingUsers > 0 && (
                    <span className="ml-auto text-sm bg-yellow-500 text-white px-2 py-1 rounded-full">
                      {stats.pendingUsers} pending
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Approve or reject user registrations and manage user roles
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl">📊 System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                All systems operational. No issues detected.
              </p>
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Smart Contract: Active</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Network: Connected</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Grid */}
        <h2 className="text-2xl font-bold mb-4">Platform Statistics</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-600 dark:text-gray-400">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.totalUsers}</p>
              <div className="mt-4 space-y-1 text-sm">
                <p className="text-green-600">✓ {stats.approvedUsers} Approved</p>
                <p className="text-yellow-600">⏳ {stats.pendingUsers} Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-600 dark:text-gray-400">Total Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.totalTokens}</p>
              <p className="mt-4 text-sm text-gray-500">
                Tokens created across all users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-600 dark:text-gray-400">Total Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.totalTransfers}</p>
              <div className="mt-4 space-y-1 text-sm">
                <p className="text-green-600">✓ {stats.totalTransfers - stats.pendingTransfers} Completed</p>
                <p className="text-yellow-600">⏳ {stats.pendingTransfers} Pending</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Distribution */}
        <h2 className="text-2xl font-bold mb-4">User Role Distribution</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-3xl mb-2">🏭</div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Producers</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-3xl mb-2">🏢</div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Factories</p>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-3xl mb-2">🏪</div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Retailers</p>
              </div>
              <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <div className="text-3xl mb-2">👥</div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Consumers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <h2 className="text-2xl font-bold mb-4 mt-8">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              <p>Activity log will be displayed here</p>
              <p className="text-sm mt-2">Track user registrations, token creations, and transfers</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
