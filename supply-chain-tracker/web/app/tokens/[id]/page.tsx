'use client';

import { useWeb3 } from "@/contexts/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { web3Service, Token } from "@/lib/web3";

interface TokenDetails extends Token {
  balance: bigint;
}

interface Transfer {
  id: string;
  from: string;
  to: string;
  amount: bigint;
  status: number;
  dateCreated: bigint;
}

export default function TokenDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { account, user, isConnected } = useWeb3();
  const router = useRouter();
  const [token, setToken] = useState<TokenDetails | null>(null);
  const [parentToken, setParentToken] = useState<TokenDetails | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected || !user) {
      router.push('/');
      return;
    }
    
    loadTokenDetails();
  }, [isConnected, user, router, id]);

  const loadTokenDetails = async () => {
    setLoading(true);
    try {
      // Load token details
      const tokenData = await web3Service.getToken(Number(id));
      const balance = await web3Service.getTokenBalance(Number(id), account!);
      
      setToken({
        ...tokenData,
        balance
      });

      // Load parent token if exists
      if (tokenData.parentId !== BigInt(0)) {
        const parent = await web3Service.getToken(Number(tokenData.parentId));
        setParentToken({
          ...parent,
          balance: BigInt(0) // Parent balance not needed in this context
        });
      }

      // Load transfer history (simplified - you could get from events)
      // const allTransfers = await web3Service.getTokenTransfers(id);
      // setTransfers(allTransfers);
      
    } catch (error) {
      console.error('Failed to load token details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    const statuses = ['Pending', 'Accepted', 'Rejected'];
    const colors = ['bg-yellow-500', 'bg-green-500', 'bg-red-500'];
    return <Badge className={colors[status]}>{statuses[status]}</Badge>;
  };

  if (!isConnected || !user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading token details...</p>
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
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                The requested token does not exist.
              </p>
              <Link href="/tokens">
                <Button>Back to Tokens</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">{token.name}</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Token Details and Traceability
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/tokens">
              <Button variant="outline">← Back to Tokens</Button>
            </Link>
            {token.balance > 0 && user.role !== 4 && (
              <Link href={`/tokens/${id}/transfer`}>
                <Button>Transfer Token</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Token Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Token Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Token ID</p>
                    <p className="font-mono text-sm break-all">{token.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Creator</p>
                    <p className="font-mono text-xs break-all">{token.creator}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Supply</p>
                    <p className="text-2xl font-bold">{token.totalSupply.toString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your Balance</p>
                    <p className="text-2xl font-bold text-green-600">{token.balance.toString()}</p>
                  </div>
                </div>

                {token.features && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Features/Metadata</p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <pre className="text-xs overflow-auto">{token.features}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Traceability */}
            <Card>
              <CardHeader>
                <CardTitle>🔍 Traceability</CardTitle>
                <CardDescription>Track this token's origin and journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Token */}
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      📦
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{token.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Token</p>
                      <p className="text-xs font-mono text-gray-500 mt-1">ID: {token.id}</p>
                    </div>
                  </div>

                  {/* Parent Token */}
                  {parentToken && (
                    <>
                      <div className="ml-4 border-l-2 border-gray-300 h-8"></div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          🌱
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{parentToken.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Parent Material</p>
                          <p className="text-xs font-mono text-gray-500 mt-1">ID: {parentToken.id}</p>
                          <Link href={`/tokens/${parentToken.id}`}>
                            <Button variant="link" size="sm" className="p-0 h-auto">
                              View Details →
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </>
                  )}

                  {!parentToken && token.parentId === BigInt(0) && (
                    <>
                      <div className="ml-4 border-l-2 border-gray-300 h-8"></div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                          🌟
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">Origin</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            This is a raw material (no parent)
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transfer History */}
            <Card>
              <CardHeader>
                <CardTitle>📋 Transfer History</CardTitle>
                <CardDescription>Recent transfers of this token</CardDescription>
              </CardHeader>
              <CardContent>
                {transfers.length === 0 ? (
                  <p className="text-center text-gray-500 py-6">
                    No transfers recorded yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {transfers.map((transfer) => (
                      <div key={transfer.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-semibold">
                              Transfer #{transfer.id}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(Number(transfer.dateCreated) * 1000).toLocaleString()}
                            </p>
                          </div>
                          {getStatusBadge(transfer.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">From</p>
                            <p className="font-mono text-xs">{transfer.from.slice(0, 10)}...</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">To</p>
                            <p className="font-mono text-xs">{transfer.to.slice(0, 10)}...</p>
                          </div>
                        </div>
                        <p className="text-sm mt-2">
                          Amount: <span className="font-semibold">{transfer.amount.toString()}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {token.balance > 0 && user.role !== 4 && (
                  <Link href={`/tokens/${id}/transfer`}>
                    <Button className="w-full">
                      🔄 Transfer Token
                    </Button>
                  </Link>
                )}
                <Link href="/tokens">
                  <Button variant="outline" className="w-full">
                    📦 View All Tokens
                  </Button>
                </Link>
                <Link href="/transfers">
                  <Button variant="outline" className="w-full">
                    📋 View Transfers
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Token Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Holders</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Transfers</p>
                  <p className="text-2xl font-bold">{transfers.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ownership %</p>
                  <p className="text-2xl font-bold">
                    {token.totalSupply > 0
                      ? ((Number(token.balance) / Number(token.totalSupply)) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
