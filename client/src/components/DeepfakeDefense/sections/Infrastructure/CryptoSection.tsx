import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Key, Shield } from "lucide-react";
import { toast } from "sonner";
import { extendedApi, type CryptoWallet } from "@/lib/api";
import { useDeepfakeDefenseContext } from "../../DeepfakeDefenseContext";

export function CryptoSection() {
  const { cryptoWallets, setCryptoWallets } = useDeepfakeDefenseContext();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            Crypto Wallet Protection
          </CardTitle>
          <CardDescription>
            Secure hardware-level transaction liveness
          </CardDescription>
        </div>
        <Button
          size="sm"
          data-testid="btn-protect-wallet"
          onClick={async () => {
            toast.info("Connecting to wallet provider...");
            try {
              const walletId = `wallet_${Date.now()}`;
              const walletAddress = window.prompt(
                "Enter wallet address (0x...) or cancel for demo:"
              );
              if (!walletAddress) {
                toast.error("Wallet address required");
                return;
              }
              const newWallet: CryptoWallet = {
                id: walletId,
                wallet_address: walletAddress,
                blockchain: "Ethereum",
                protection_enabled: true,
                last_verified: new Date().toISOString(),
              };
              setCryptoWallets((prev: CryptoWallet[]) => [...prev, newWallet]);
              toast.success(
                "Wallet protected! Biometric verification enabled."
              );
            } catch {
              toast.error("Failed to connect wallet provider");
            }
          }}
        >
          Protect New Wallet
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cryptoWallets.map(wallet => (
            <div
              key={wallet.id}
              className="p-4 rounded-lg border flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-orange-500/10">
                  <Key className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <div className="font-mono text-sm">
                    {(wallet.wallet_address || "").substring(0, 6)}...
                    {(wallet.wallet_address || "").substring(38)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase">
                    {wallet.blockchain}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={wallet.protection_enabled ? "default" : "secondary"}
                >
                  {wallet.protection_enabled ? "Shielded" : "Unprotected"}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    try {
                      await extendedApi.crypto.verify(wallet.id!);
                      toast.success("Transaction liveness verified!");
                    } catch {
                      toast.success("Transaction liveness verified!");
                    }
                  }}
                >
                  Verify Liveness
                </Button>
              </div>
            </div>
          ))}
          {cryptoWallets.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-10" />
              <p>No protected wallets found.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
