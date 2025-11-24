'use client';

import { useWeb3 } from "@/contexts/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { web3Service, Token } from "@/lib/web3";

interface TokenWithBalance extends Token {
  balance: bigint;
}

export default function TokensPage() {
  const { account, user, isConnected } = useWeb3();
  const router = useRouter();
  const [tokens, setTokens] = useState<TokenWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isConnected || !user) {
      router.push('/');
      return;
    }
    
    loadTokens();
  }, [isConnected, user, router]);

  const loadTokens = async () => {
    setLoading(true);
    try {
      const tokenIds = await web3Service.getUserTokens(account!);
      const tokensData = await Promise.all(
        tokenIds.map(async (id: bigint) => {
          const token = await web3Service.getToken(Number(id));
          const balance = await web3Service.getTokenBalance(Number(id), account!);
          return { ...token, balance };
        })
      );
      setTokens(tokensData);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTokens = tokens.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isConnected || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Tokens</h1>
            <p className="text-gray-600 dark:text-gray-300">
              View and manage your token inventory
            </p>
          </div>
          
          {user.role !== 4 && user.status === 1 && (
            <Link href="/tokens/create">
              <Button size="lg">➕ Create Token</Button>
            </Link>
          )}
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Input
              placeholder="Search by token name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Tokens Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading tokens...</p>
          </div>
        ) : filteredTokens.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">No Tokens Found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {searchQuery ? 'No tokens match your search.' : 'You don\'t have any tokens yet.'}
              </p>
              {!searchQuery && user.role !== 4 && user.status === 1 && (
                <Link href="/tokens/create">
                  <Button>Create Your First Token</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTokens.map((token) => (
              <Card key={token.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{token.name}</span>
                    {token.parentId !== '0' && (
                      <Badge variant="outline" className="ml-2">Derived</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Token ID</p>
                    <p className="font-mono text-xs break-all">{token.id}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                      <p className="text-lg font-semibold">{token.amount.toString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Your Balance</p>
                      <p className="text-lg font-semibold text-green-600">{token.balance.toString()}</p>
                    </div>
                  </div>

                  {token.parentId !== '0' && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Parent Token</p>
                      <Link href={`/tokens/${token.parentId}`}>
                        <p className="text-xs font-mono text-blue-600 hover:underline cursor-pointer break-all">
                          {token.parentId}
                        </p>
                      </Link>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Link href={`/tokens/${token.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        View Details
                      </Button>
                    </Link>
                    {token.balance > 0 && user.role !== 4 && (
                      <Link href={`/tokens/${token.id}/transfer`} className="flex-1">
                        <Button className="w-full" size="sm">
                          Transfer
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
