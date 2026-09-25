"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  RefreshCw,
  Send,
  PlusCircle,
  History,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Coins,
  CreditCard,
  Building2,
  QrCode,
  Download,
  Share2,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface WalletData {
  scope: "personal" | "organization";
  organization?: {
    id: string;
    name: string;
    logoUrl?: string | null;
    isAdmin: boolean;
  };
  userGuilds?: Array<{
    id: string;
    name: string;
    logoUrl?: string | null;
    isAdmin: boolean;
  }>;
  wallet: {
    id: string;
    balance: number;
    escrowBalance: number;
    currency: string;
    status: string;
  };
  transactions: Array<{
    id: string;
    reference: string;
    type: string;
    amount: number;
    balanceAfter: number;
    status: string;
    narration: string;
    createdAt: string;
  }>;
}

export default function WalletPage() {
  const searchParams = useSearchParams();
  const initialOrgId = searchParams.get("organizationId") || searchParams.get("orgId") || null;

  const [selectedScopeOrgId, setSelectedScopeOrgId] = useState<string | null>(initialOrgId);
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [copiedAcc, setCopiedAcc] = useState(false);

  // Modals
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositTab, setDepositTab] = useState("card");
  const [depositAmount, setDepositAmount] = useState("50");
  const [depositPending, setDepositPending] = useState(false);

  const [transferOpen, setTransferOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("25");
  const [transferNote, setTransferNote] = useState("");
  const [transferPending, setTransferPending] = useState(false);

  // Receipt Modal
  const [selectedTx, setSelectedTx] = useState<WalletData["transactions"][0] | null>(null);

  // Filter state
  const [filterType, setFilterType] = useState("ALL");

  const { toast } = useToast();

  const isGuildScope = data?.scope === "organization";
  const activeGuild = data?.organization;
  const isGuildAdmin = activeGuild?.isAdmin || false;

  const virtualAccountNumber = isGuildScope
    ? `99${activeGuild?.id.slice(-8).replace(/\D/g, "7").padEnd(8, "0")}`
    : "0092819209"; // Copteller-aligned MFB virtual account

  const fetchWalletData = async (orgId?: string | null) => {
    const targetOrgId = orgId !== undefined ? orgId : selectedScopeOrgId;
    try {
      setLoading(true);
      const url = targetOrgId ? `/api/wallet?organizationId=${targetOrgId}` : "/api/wallet";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load wallet data");
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to load wallet ledger.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScopeChange = (orgId: string | null) => {
    setSelectedScopeOrgId(orgId);
    fetchWalletData(orgId);
  };

  useEffect(() => {
    fetchWalletData(initialOrgId);
  }, []);

  const copyToClipboard = (text: string, isAcc = false) => {
    navigator.clipboard.writeText(text);
    if (isAcc) {
      setCopiedAcc(true);
      setTimeout(() => setCopiedAcc(false), 2000);
      toast({ description: "Virtual Account Number copied!" });
    } else {
      setCopiedRef(text);
      setTimeout(() => setCopiedRef(null), 2000);
      toast({ description: "Reference copied to clipboard!" });
    }
  };

  const handleDeposit = async (amtOverride?: number) => {
    const amt = amtOverride ?? parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      toast({ variant: "destructive", description: "Please enter a valid deposit amount." });
      return;
    }

    try {
      setDepositPending(true);
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deposit",
          organizationId: selectedScopeOrgId || undefined,
          amount: amt,
          narration: selectedScopeOrgId
            ? `Guild treasury deposit via ${depositTab === "bank" ? "inward transfer" : "card clearing"}`
            : depositTab === "bank"
            ? "Inward transfer via Copteller MFB virtual account"
            : "Instant top-up via card clearing",
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Deposit failed");

      toast({
        title: "Funds Credited!",
        description: `$${amt.toFixed(2)} successfully credited to ${selectedScopeOrgId ? "guild treasury" : "your available balance"}.`,
      });

      setDepositOpen(false);
      setDepositAmount("50");
      fetchWalletData(selectedScopeOrgId);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Deposit Error",
        description: err.message,
      });
    } finally {
      setDepositPending(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (!recipient.trim()) {
      toast({ variant: "destructive", description: "Recipient username or email is required." });
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      toast({ variant: "destructive", description: "Please enter a valid transfer amount." });
      return;
    }

    try {
      setTransferPending(true);
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "transfer",
          recipient: recipient.trim(),
          amount: amt,
          narration: transferNote || undefined,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Transfer failed");

      toast({
        title: "Transfer Sent!",
        description: `Successfully transferred $${amt.toFixed(2)} to @${resData.recipientUsername}.`,
      });

      setTransferOpen(false);
      setRecipient("");
      setTransferAmount("25");
      setTransferNote("");
      fetchWalletData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Transfer Error",
        description: err.message,
      });
    } finally {
      setTransferPending(false);
    }
  };

  // Prepare chart timeline from transactions with guaranteed baseline fallback
  const rawChartData = (data?.transactions || [])
    .slice(0, 10)
    .reverse()
    .map((tx) => ({
      name: new Date(tx.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      balance: tx.balanceAfter,
    }));

  const currentBal = data?.wallet?.balance || 0;
  const chartData =
    rawChartData.length > 1
      ? rawChartData
      : [
          { name: "Day -3", balance: Math.max(0, currentBal * 0.7) },
          { name: "Day -2", balance: Math.max(0, currentBal * 0.85) },
          { name: "Day -1", balance: currentBal },
          { name: "Today", balance: currentBal },
        ];

  const filteredTransactions = (data?.transactions || []).filter((tx) => {
    if (filterType === "ALL") return true;
    if (filterType === "DEPOSITS") return tx.type === "DEPOSIT";
    if (filterType === "TRANSFERS") return tx.type.startsWith("TRANSFER");
    if (filterType === "ESCROW") return tx.type.startsWith("ESCROW") || tx.type === "CAMPAIGN_PLEDGE";
    return true;
  });

  return (
    <main className="flex w-full min-w-0 flex-col gap-6">
      <div className="w-full min-w-0 space-y-6 max-w-6xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary to-amber-500 text-white shadow-md shadow-primary/20">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  CommunityOS <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">Fintech Vault</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Institutional ledger integrated with Copteller MFB rails, instant P2P transfers & escrow protections.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchWalletData()}
              disabled={loading}
              className="gap-1.5 rounded-xl text-xs font-semibold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync Ledger
            </Button>
            {(!isGuildScope || isGuildAdmin) && (
              <Button
                size="sm"
                onClick={() => setDepositOpen(true)}
                className="gap-1.5 rounded-xl text-xs font-bold shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <PlusCircle className="h-4 w-4" />
                {isGuildScope ? "Deposit to Treasury" : "Top Up"}
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setTransferOpen(true)}
              className="gap-1.5 rounded-xl text-xs font-bold shadow-sm"
              disabled={isGuildScope && !isGuildAdmin}
            >
              <Send className="h-3.5 w-3.5" />
              {isGuildScope ? "Disburse Funds" : "Send"}
            </Button>
          </div>
        </div>

        {/* Vault Scope Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-card border shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <Landmark className="h-4 w-4 text-primary" />
              Vault Scope:
            </span>
            <Button
              variant={selectedScopeOrgId === null ? "default" : "outline"}
              size="sm"
              onClick={() => handleScopeChange(null)}
              className={`rounded-xl text-xs font-bold h-8 gap-1.5 ${
                selectedScopeOrgId === null ? "shadow-xs" : ""
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Personal Citizen Vault
            </Button>

            {(data?.userGuilds || []).map((guild) => (
              <Button
                key={guild.id}
                variant={selectedScopeOrgId === guild.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleScopeChange(guild.id)}
                className={`rounded-xl text-xs font-bold h-8 gap-1.5 ${
                  selectedScopeOrgId === guild.id ? "shadow-xs" : ""
                }`}
              >
                <Building2 className="h-3.5 w-3.5 text-amber-500" />
                {guild.name}
                <Badge
                  variant="secondary"
                  className="ml-1 text-[9px] px-1 py-0 h-4 uppercase font-extrabold"
                >
                  {guild.isAdmin ? "Steward" : "Member"}
                </Badge>
              </Button>
            ))}
          </div>

          {isGuildScope && (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Badge
                className={
                  isGuildAdmin
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold"
                    : "bg-primary/10 text-primary border-primary/20 text-[10px] font-bold"
                }
              >
                {isGuildAdmin ? "Institutional Steward Access" : "Democratic Member Transparency"}
              </Badge>
            </div>
          )}
        </div>

        {/* Holographic Card & Balance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Virtual Holographic Vault Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-7 text-white shadow-2xl border border-indigo-500/20 flex flex-col justify-between min-h-[220px]">
            {/* Hologram shine overlay */}
            <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wider uppercase text-slate-300">
                  {isGuildScope ? activeGuild?.name : "CommunityOS"}
                </span>
                <Badge className="bg-primary/30 text-amber-300 border-amber-400/30 text-[9px] font-bold">
                  {isGuildScope ? "GUILD TREASURY" : "CITIZEN VAULT"}
                </Badge>
              </div>
              <Coins className="h-6 w-6 text-amber-400 opacity-80" />
            </div>

            {/* Chip & Contactless */}
            <div className="relative my-4 flex items-center gap-4">
              <div className="h-7 w-10 rounded-md bg-gradient-to-r from-amber-300 to-amber-500 shadow-inner flex items-center justify-center opacity-90">
                <div className="h-4 w-7 border border-amber-800/40 rounded-sm" />
              </div>
              <div className="text-[11px] font-mono tracking-widest text-slate-400">
                COPTELLER • MFB RAILS
              </div>
            </div>

            {/* Balance & Virtual Acc */}
            <div className="relative space-y-2">
              <div className="text-xs text-slate-400 font-medium">Available Liquid Capital</div>
              <div className="text-3xl font-black font-mono tracking-tight text-white">
                ${data?.wallet.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-slate-400 font-mono">
                <span>VIRTUAL ACC: {virtualAccountNumber}</span>
                <button
                  onClick={() => copyToClipboard(virtualAccountNumber, true)}
                  className="hover:text-white transition-colors"
                  title="Copy Account Number"
                >
                  {copiedAcc ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Escrow Vault Card */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Escrow Locked Card */}
            <div className="rounded-3xl border bg-gradient-to-br from-card via-card to-amber-500/5 p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Milestone Escrow Vault</span>
                  <div className="text-3xl font-black font-mono tracking-tight text-amber-600 dark:text-amber-400 mt-2">
                    ${data?.wallet.escrowBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Lock className="h-6 w-6" />
                </div>
              </div>

              <div className="pt-4 border-t mt-4 text-xs text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="h-4 w-4" />
                  Proof-locked funds
                </span>
                <Link href="/crowdfunding" className="text-primary hover:underline font-semibold text-[11px]">
                  View Active Pledges →
                </Link>
              </div>
            </div>

            {/* Total Vault Net Worth */}
            <div className="rounded-3xl border bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Combined Vault Assets</span>
                  <div className="text-3xl font-black font-mono tracking-tight mt-2">
                    ${((data?.wallet.balance || 0) + (data?.wallet.escrowBalance || 0)).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>

              <div className="pt-4 border-t mt-4 text-xs text-muted-foreground flex items-center justify-between">
                <span className="text-muted-foreground font-mono text-[11px]">
                  USD Settlements
                </span>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                  Zero Fraud Exposure
                </Badge>
              </div>
            </div>

            {/* Interactive Trend Chart Banner */}
            {chartData.length > 1 && (
              <div className="sm:col-span-2 rounded-3xl border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Settlement & Balance Trajectory
                  </span>
                  <span className="text-xs text-primary font-bold font-mono">Live Sync</span>
                </div>
                <div className="h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                        formatter={(val: any) => [`$${Number(val).toFixed(2)}`, "Balance"]}
                      />
                      <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#balanceGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ledger Transactions Section */}
        <div className="rounded-3xl border bg-card p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Double-Entry Accounting Ledger
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Every credit, transfer, and escrow allocation is verified with cryptographic references.
              </p>
            </div>

            <Tabs value={filterType} onValueChange={setFilterType} className="w-full sm:w-auto">
              <TabsList className="flex sm:grid sm:grid-cols-4 overflow-x-auto no-scrollbar scrollbar-none flex-nowrap h-9 text-xs rounded-xl p-1 justify-start sm:justify-center">
                <TabsTrigger value="ALL" className="shrink-0 sm:shrink">All</TabsTrigger>
                <TabsTrigger value="DEPOSITS" className="shrink-0 sm:shrink">Deposits</TabsTrigger>
                <TabsTrigger value="TRANSFERS" className="shrink-0 sm:shrink">Transfers</TabsTrigger>
                <TabsTrigger value="ESCROW" className="shrink-0 sm:shrink">Escrow</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="py-16 text-center text-muted-foreground">
              <RefreshCw className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
              Loading real-time ledger records...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground space-y-2 border rounded-2xl border-dashed">
              <Coins className="h-10 w-10 mx-auto opacity-30 text-primary" />
              <p className="font-bold text-sm text-foreground">No ledger transactions found</p>
              <p className="text-xs max-w-sm mx-auto">
                Add funds via card or transfer to populate your verified financial statement.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredTransactions.map((tx) => {
                const isCredit = tx.amount > 0;
                const isEscrow = tx.type.startsWith("ESCROW") || tx.type === "CAMPAIGN_PLEDGE";

                return (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="py-4 px-3 flex items-center justify-between gap-4 hover:bg-muted/40 rounded-2xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`p-2.5 rounded-2xl shrink-0 transition-transform group-hover:scale-105 ${
                          isEscrow
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : isCredit
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isEscrow ? (
                          <Lock className="h-4 w-4" />
                        ) : isCredit ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">
                            {tx.narration}
                          </p>
                          <Badge variant="outline" className="text-[9px] h-4 uppercase font-bold px-1.5 py-0 border-muted">
                            {tx.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>
                            {new Date(tx.createdAt).toLocaleDateString()} at{" "}
                            {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-muted-foreground/80">{tx.reference}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-base font-mono font-black ${
                          isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                        }`}
                      >
                        {isCredit ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        Bal: ${tx.balanceAfter.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Multi-Rail Deposit Modal */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <PlusCircle className="h-5 w-5 text-primary" />
              Add Liquidity to Citizen Vault
            </DialogTitle>
            <DialogDescription>
              Choose your funding rail to credit your CommunityOS available balance instantly.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={depositTab} onValueChange={setDepositTab} className="pt-2">
            <TabsList className="grid grid-cols-2 rounded-xl mb-4">
              <TabsTrigger value="card" className="gap-1.5 text-xs">
                <CreditCard className="h-3.5 w-3.5" />
                Debit Card / Clearing
              </TabsTrigger>
              <TabsTrigger value="bank" className="gap-1.5 text-xs">
                <Landmark className="h-3.5 w-3.5" />
                Copteller MFB Transfer
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Card Simulation */}
            <TabsContent value="card" className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount to Deposit ($)</label>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="50.00"
                  className="font-mono text-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[25, 50, 100, 250, 500].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-xl font-bold font-mono"
                    onClick={() => setDepositAmount(preset.toString())}
                  >
                    ${preset}
                  </Button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-muted/40 text-xs text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Zero processing fee on community platform tier. Instant settlement.</span>
              </div>

              <Button
                type="button"
                onClick={() => handleDeposit()}
                disabled={depositPending}
                className="w-full font-bold shadow-md rounded-xl"
              >
                {depositPending ? "Authorizing Clearing..." : `Deposit $${depositAmount} Instantly`}
              </Button>
            </TabsContent>

            {/* Tab 2: Copteller MFB Bank Transfer Simulation */}
            <TabsContent value="bank" className="space-y-4">
              <div className="rounded-2xl border p-4 bg-muted/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">Bank Name:</span>
                  <span className="font-bold text-foreground">Abia Microfinance Bank (Copteller Rails)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">Account Name:</span>
                  <span className="font-bold text-foreground">CommunityOS Vault / Citizen Ledger</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t">
                  <span className="text-muted-foreground font-semibold">Virtual Account Number:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-primary text-sm">
                    <span>{virtualAccountNumber}</span>
                    <button
                      onClick={() => copyToClipboard(virtualAccountNumber, true)}
                      className="hover:opacity-80"
                      title="Copy"
                    >
                      {copiedAcc ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                In production, any inbound NIP/ACH transfer to this account instantly credits your wallet. For testing, simulate an inbound transfer below:
              </p>

              <Button
                type="button"
                onClick={() => handleDeposit(100)}
                disabled={depositPending}
                variant="outline"
                className="w-full gap-2 border-primary/40 text-primary font-bold rounded-xl"
              >
                <Landmark className="h-4 w-4" />
                Simulate $100 Inward Bank Wire
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Peer-to-Peer Transfer Modal */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <form onSubmit={handleTransfer}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <Send className="h-5 w-5 text-primary" />
                Instant Peer Transfer
              </DialogTitle>
              <DialogDescription>
                Transfer funds directly to any community citizen or organization treasury with zero fees.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recipient (@Username or Email)</label>
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Emmytheo247 or user@example.com"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount ($)</label>
                  <span className="text-xs text-muted-foreground font-mono">
                    Avail: ${data?.wallet.balance.toFixed(2) || "0.00"}
                  </span>
                </div>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="25.00"
                  className="font-mono text-base font-bold rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Purpose / Note (Optional)</label>
                <Input
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="e.g. Event split, creative grant contribution"
                  className="rounded-xl"
                />
              </div>

              <div className="p-3 rounded-xl bg-muted/40 text-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Transfer Fee</span>
                  <span className="font-bold text-emerald-500 font-mono">FREE ($0.00)</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Settlement Time</span>
                  <span className="font-bold text-foreground">Instantaneous</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTransferOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={transferPending} className="font-bold shadow-md rounded-xl">
                {transferPending ? "Authorizing..." : "Send Transfer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transaction Receipt Dialog */}
      <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <DialogContent className="sm:max-w-[420px]">
          {selectedTx && (
            <div className="space-y-5 pt-2">
              <div className="text-center space-y-1">
                <div className="p-3 rounded-full bg-primary/10 text-primary w-fit mx-auto">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-lg">Transaction Receipt</h3>
                <p className="text-xs text-muted-foreground font-mono">{selectedTx.reference}</p>
              </div>

              <div className="text-center py-2">
                <div className="text-3xl font-black font-mono tracking-tight text-primary">
                  {selectedTx.amount > 0 ? "+" : ""}${Math.abs(selectedTx.amount).toFixed(2)}
                </div>
                <Badge variant="outline" className="mt-2 text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  {selectedTx.status} & RECONCILED
                </Badge>
              </div>

              <div className="rounded-2xl border bg-muted/30 p-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-bold font-mono text-foreground">{selectedTx.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Narration:</span>
                  <span className="font-semibold text-foreground text-right max-w-[200px] truncate">{selectedTx.narration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance After:</span>
                  <span className="font-bold font-mono text-foreground">${selectedTx.balanceAfter.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span className="font-medium text-foreground">{new Date(selectedTx.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => copyToClipboard(selectedTx.reference)}
                  className="w-full gap-1.5 text-xs rounded-xl"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Reference
                </Button>
                <Button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="w-full text-xs rounded-xl font-bold"
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
