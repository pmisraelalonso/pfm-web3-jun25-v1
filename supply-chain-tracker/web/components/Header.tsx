'use client';

import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";

const roleColors = {
  Admin: 'bg-purple-500 hover:bg-purple-600',
  Producer: 'bg-green-500 hover:bg-green-600',
  Factory: 'bg-blue-500 hover:bg-blue-600',
  Retailer: 'bg-orange-500 hover:bg-orange-600',
  Consumer: 'bg-pink-500 hover:bg-pink-600'
};

export default function Header() {
  const { account, user, isConnected, disconnect } = useWeb3();
  const router = useRouter();

  const handleDisconnect = () => {
    disconnect();
    router.push('/');
  };

  const getRoleLabel = (roleNum: number) => {
    const roles = ['Producer', 'Factory', 'Retailer', 'Consumer'];
    return roles[roleNum - 1] || 'Unknown';
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-yellow-500'; // Pending
      case 1: return 'bg-green-500'; // Approved
      case 2: return 'bg-red-500'; // Rejected
      case 3: return 'bg-gray-500'; // Canceled
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: number) => {
    const labels = ['Pending', 'Approved', 'Rejected', 'Canceled'];
    return labels[status] || 'Unknown';
  };

  return (
    <header className="border-b bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Supply Chain
          </Link>
          
          {isConnected && user && user.status === 1 && (
            <nav className="hidden md:flex gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/tokens">
                <Button variant="ghost">Tokens</Button>
              </Link>
              <Link href="/transfers">
                <Button variant="ghost">Transfers</Button>
              </Link>
              {user.role === 0 && (
                <Link href="/admin">
                  <Button variant="ghost">Admin</Button>
                </Link>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isConnected && user ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                {user.role === 0 ? (
                  <Badge className={roleColors.Admin}>Admin</Badge>
                ) : (
                  <>
                    <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                    <Badge className={getStatusColor(user.status)}>
                      {getStatusLabel(user.status)}
                    </Badge>
                  </>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 hidden lg:block">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </div>
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </>
          ) : isConnected ? (
            <>
              <div className="text-sm text-gray-600 dark:text-gray-300 hidden lg:block">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </div>
              <Link href="/profile">
                <Button>Register Role</Button>
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
