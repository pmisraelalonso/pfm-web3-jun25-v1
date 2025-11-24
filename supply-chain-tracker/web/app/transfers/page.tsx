'use client';

import { useWeb3 } from "@/contexts/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

interface Transfer {
  id: string;
  from: string;
  to: string;
  tokenId: string;
  tokenName: string;
  amount: bigint;
  status: number;
  dateCreated: bigint;
}

export default function TransfersPage() {
  const { account, user, isConnected } = useWeb3();
  const router = useRouter();
  const [incomingTransfers, setIncomingTransfers] = useState<Transfer[]>([]);
  const [outgoingTransfers, setOutgoingTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');

  useEffect(() => {
    if (!isConnected || !user) {
      router.push('/');
      return;
    }
    
    loadTransfers();
  }, [isConnected, user, router]);

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const web3Service = (await import('@/lib/web3')).web3Service;
      const allTransfers = await web3Service.getUserTransfers(account!);
      
      // Separate incoming and outgoing
      const incoming = allTransfers.filter((t: Transfer) => 
        t.to.toLowerCase() === account!.toLowerCase()
      );
      const outgoing = allTransfers.filter((t: Transfer) => 
        t.from.toLowerCase() === account!.toLowerCase()
      );

      setIncomingTransfers(incoming);
      setOutgoingTransfers(outgoing);
    } catch (error) {
      console.error('Failed to load transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (transferId: string) => {
    try {
      const web3Service = (await import('@/lib/web3')).web3Service;
      await web3Service.acceptTransfer(parseInt(transferId));
      await loadTransfers(); // Reload after accepting
    } catch (error: any) {
      console.error('Failed to accept transfer:', error);
      alert(error.message || 'Failed to accept transfer');
    }
  };

  const handleReject = async (transferId: string) => {
    try {
      const web3Service = (await import('@/lib/web3')).web3Service;
      await web3Service.rejectTransfer(parseInt(transferId));
      await loadTransfers(); // Reload after rejecting
    } catch (error: any) {
      console.error('Failed to reject transfer:', error);
      alert(error.message || 'Failed to reject transfer');
    }
  };

  const getStatusBadge = (status: number) => {
    const statuses = ['Pending', 'Accepted', 'Rejected'];
    const colors = ['bg-yellow-500', 'bg-green-500', 'bg-red-500'];
    return <Badge className={colors[status]}>{statuses[status]}</Badge>;
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  if (!isConnected || !user) {
    return null;
  }

  const pendingIncoming = incomingTransfers.filter(t => t.status === 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Transfers</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your incoming and outgoing token transfers
          </p>
        </div>

        {/* Pending Alert */}
        {pendingIncoming.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
              ⏳ You have {pendingIncoming.length} pending transfer{pendingIncoming.length > 1 ? 's' : ''} waiting for your action!
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={activeTab === 'incoming' ? 'default' : 'outline'}
            onClick={() => setActiveTab('incoming')}
          >
            Incoming ({incomingTransfers.length})
          </Button>
          <Button
            variant={activeTab === 'outgoing' ? 'default' : 'outline'}
            onClick={() => setActiveTab('outgoing')}
          >
            Outgoing ({outgoingTransfers.length})
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading transfers...</p>
          </div>
        ) : activeTab === 'incoming' ? (
          <Card>
            <CardHeader>
              <CardTitle>📥 Incoming Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              {incomingTransfers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-semibold mb-2">No Incoming Transfers</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    You don't have any incoming transfers yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>Token</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomingTransfers.map((transfer) => (
                        <TableRow key={transfer.id}>
                          <TableCell className="font-mono text-sm">#{transfer.id}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {transfer.from.slice(0, 6)}...{transfer.from.slice(-4)}
                          </TableCell>
                          <TableCell>
                            <Link href={`/tokens/${transfer.tokenId}`}>
                              <span className="text-blue-600 hover:underline cursor-pointer">
                                {transfer.tokenName || `Token #${transfer.tokenId}`}
                              </span>
                            </Link>
                          </TableCell>
                          <TableCell className="font-semibold">{transfer.amount.toString()}</TableCell>
                          <TableCell className="text-sm">{formatDate(transfer.dateCreated)}</TableCell>
                          <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                          <TableCell>
                            {transfer.status === 0 && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAccept(transfer.id)}
                                >
                                  ✓ Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(transfer.id)}
                                >
                                  ✗ Reject
                                </Button>
                              </div>
                            )}
                            {transfer.status !== 0 && (
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>📤 Outgoing Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              {outgoingTransfers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-semibold mb-2">No Outgoing Transfers</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    You haven't initiated any transfers yet.
                  </p>
                  <Link href="/tokens">
                    <Button>View Your Tokens</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Token</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outgoingTransfers.map((transfer) => (
                        <TableRow key={transfer.id}>
                          <TableCell className="font-mono text-sm">#{transfer.id}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {transfer.to.slice(0, 6)}...{transfer.to.slice(-4)}
                          </TableCell>
                          <TableCell>
                            <Link href={`/tokens/${transfer.tokenId}`}>
                              <span className="text-blue-600 hover:underline cursor-pointer">
                                {transfer.tokenName || `Token #${transfer.tokenId}`}
                              </span>
                            </Link>
                          </TableCell>
                          <TableCell className="font-semibold">{transfer.amount.toString()}</TableCell>
                          <TableCell className="text-sm">{formatDate(transfer.dateCreated)}</TableCell>
                          <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
