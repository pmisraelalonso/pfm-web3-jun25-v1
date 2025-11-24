'use client';

import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { account, isConnected, connect, user } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    if (isConnected && user) {
      router.push('/dashboard');
    }
  }, [isConnected, user, router]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container max-w-6xl px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Supply Chain Tracker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Blockchain-based supply chain traceability system
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏭 For Producers
              </CardTitle>
              <CardDescription>
                Create and manage raw materials and products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Register as a producer</li>
                <li>• Create raw material tokens</li>
                <li>• Transfer to factories</li>
                <li>• Track product journey</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏢 For Factories
              </CardTitle>
              <CardDescription>
                Process materials and create finished goods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Register as a factory</li>
                <li>• Receive raw materials</li>
                <li>• Create finished products</li>
                <li>• Transfer to retailers</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏪 For Retailers
              </CardTitle>
              <CardDescription>
                Sell products to consumers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Register as a retailer</li>
                <li>• Receive finished products</li>
                <li>• Sell to consumers</li>
                <li>• Maintain inventory</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👥 For Consumers
              </CardTitle>
              <CardDescription>
                Verify product authenticity and origin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Register as a consumer</li>
                <li>• Receive products</li>
                <li>• View complete history</li>
                <li>• Verify authenticity</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Connect your MetaMask wallet to begin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <>
                <Button onClick={handleConnect} className="w-full" size="lg">
                  Connect MetaMask
                </Button>
                <p className="text-xs text-center text-gray-500">
                  Make sure you're connected to the Anvil network (Chain ID: 31337)
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  ✓ Connected
                </p>
                <p className="text-xs text-gray-500 break-all">
                  {account}
                </p>
                {!user && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Please register your role to continue
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Built with Solidity, Foundry, Next.js, and ethers.js
          </p>
        </div>
      </div>
    </div>
  );
}
