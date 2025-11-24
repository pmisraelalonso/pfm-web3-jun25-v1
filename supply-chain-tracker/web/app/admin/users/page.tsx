'use client';

import { useWeb3 } from "@/contexts/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UserInfo {
  address: string;
  role: number;
  status: number;
}

export default function AdminUsersPage() {
  const { account, user, isConnected } = useWeb3();
  const router = useRouter();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (!isConnected || !user) {
      router.push('/');
      return;
    }
    
    if (Number(user.role) !== 0) {
      router.push('/dashboard');
      return;
    }

    loadUsers();
  }, [isConnected, user, router]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would fetch all users from the contract
      // For demo purposes, using mock data
      const mockUsers: UserInfo[] = [
        { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', role: 1, status: 0 }, // Pending Producer
        { address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', role: 2, status: 1 }, // Approved Factory
        { address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', role: 3, status: 0 }, // Pending Retailer
        { address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', role: 4, status: 1 }, // Approved Consumer
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userAddress: string) => {
    try {
      const web3Service = (await import('@/lib/web3')).web3Service;
      await web3Service.changeStatusUser(userAddress, 1); // 1 = Approved
      await loadUsers(); // Reload users
    } catch (error: any) {
      console.error('Failed to approve user:', error);
      alert(error.message || 'Failed to approve user');
    }
  };

  const handleReject = async (userAddress: string) => {
    try {
      const web3Service = (await import('@/lib/web3')).web3Service;
      await web3Service.changeStatusUser(userAddress, 2); // 2 = Rejected
      await loadUsers(); // Reload users
    } catch (error: any) {
      console.error('Failed to reject user:', error);
      alert(error.message || 'Failed to reject user');
    }
  };

  const getRoleLabel = (roleNum: number) => {
    const roles = ['Admin', 'Producer', 'Factory', 'Retailer', 'Consumer'];
    return roles[roleNum] || 'Unknown';
  };

  const getRoleBadgeColor = (roleNum: number) => {
    const colors = ['bg-purple-500', 'bg-green-500', 'bg-blue-500', 'bg-orange-500', 'bg-pink-500'];
    return colors[roleNum] || 'bg-gray-500';
  };

  const getStatusLabel = (status: number) => {
    const labels = ['Pending', 'Approved', 'Rejected', 'Canceled'];
    return labels[status] || 'Unknown';
  };

  const getStatusBadgeColor = (status: number) => {
    const colors = ['bg-yellow-500', 'bg-green-500', 'bg-red-500', 'bg-gray-500'];
    return colors[status] || 'bg-gray-500';
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true;
    if (filter === 'pending') return u.status === 0;
    if (filter === 'approved') return u.status === 1;
    if (filter === 'rejected') return u.status === 2;
    return true;
  });

  const pendingCount = users.filter(u => u.status === 0).length;

  if (!isConnected || !user || user.role !== 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">👥 User Management</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Approve or reject user registrations
          </p>
        </div>

        {/* Pending Alert */}
        {pendingCount > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
              ⏳ You have {pendingCount} user registration{pendingCount > 1 ? 's' : ''} waiting for approval!
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All ({users.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            size="sm"
          >
            Pending ({pendingCount})
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
            size="sm"
          >
            Approved ({users.filter(u => u.status === 1).length})
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilter('rejected')}
            size="sm"
          >
            Rejected ({users.filter(u => u.status === 2).length})
          </Button>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {filter === 'all' 
                    ? 'No users have registered yet.' 
                    : `No users with ${filter} status.`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((userInfo) => (
                      <TableRow key={userInfo.address}>
                        <TableCell className="font-mono text-sm">
                          {userInfo.address.slice(0, 6)}...{userInfo.address.slice(-4)}
                          <br />
                          <span className="text-xs text-gray-500">{userInfo.address}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(userInfo.role)}>
                            {getRoleLabel(userInfo.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(userInfo.status)}>
                            {getStatusLabel(userInfo.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {userInfo.status === 0 ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(userInfo.address)}
                              >
                                ✓ Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(userInfo.address)}
                              >
                                ✗ Reject
                              </Button>
                            </div>
                          ) : userInfo.status === 2 ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(userInfo.address)}
                            >
                              Approve Now
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-500">No action needed</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            ℹ️ Admin Guidelines
          </h4>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>• Review user registrations carefully before approval</li>
            <li>• Approved users can create tokens and make transfers</li>
            <li>• Rejected users cannot use the platform</li>
            <li>• You can approve previously rejected users</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
