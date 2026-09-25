import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Coins,
  ShieldCheck,
  Lock,
  ArrowRight,
  PlusCircle,
  FileCheck,
  Users,
  Layers,
  Sparkles,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TreasuryMilestoneApproval } from "./TreasuryActions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TreasuryPage({ params }: PageProps) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const { id } = await params;

  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      wallet: true,
      crowdfundingCampaigns: {
        include: {
          creator: {
            select: { id: true, username: true, displayName: true, avatarUrl: true },
          },
          milestones: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: { contributions: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      admins: {
        where: { userId: user.id },
      },
    },
  });

  if (!organization) notFound();

  // Find all pending milestone proofs awaiting verification across this community's campaigns
  const pendingMilestones = await prisma.campaignMilestone.findMany({
    where: {
      campaign: { organizationId: id },
      status: "SUBMITTED",
    },
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          creator: {
            select: { displayName: true },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Calculate totals
  const totalCampaigns = organization.crowdfundingCampaigns.length;
  const totalRaised = organization.crowdfundingCampaigns.reduce((sum, c) => sum + c.raisedAmount, 0);
  const totalTarget = organization.crowdfundingCampaigns.reduce((sum, c) => sum + c.targetAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Coins className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Community Treasury & Escrow</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Financial command center for {organization.name}. Manage community campaigns, escrow locks, and tranche approvals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/crowdfunding/create">
            <Button size="sm" className="gap-2 shadow-sm">
              <PlusCircle className="h-4 w-4" />
              Launch Community Drive
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Funds Raised
            </CardTitle>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-mono text-primary">
              ${totalRaised.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              across {totalCampaigns} community drive{totalCampaigns !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-amber-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pending Escrow Reviews
            </CardTitle>
            <Lock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
              {pendingMilestones.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              tranche proofs awaiting verification
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-emerald-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Community Goal
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-mono text-foreground">
              ${totalTarget.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              accumulated project capital targets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Deliverables Verification Console */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-amber-500" />
                Pending Milestone Deliverables (Awaiting Release)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review submitted deliverables and approve escrow release directly to project leads.
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {pendingMilestones.length} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {pendingMilestones.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-1">
              <ShieldCheck className="h-8 w-8 mx-auto text-emerald-500 opacity-60 mb-2" />
              <p className="text-sm font-semibold">All deliverables up to date</p>
              <p className="text-xs">No pending milestone proof submissions require review right now.</p>
            </div>
          ) : (
            <div className="divide-y">
              {pendingMilestones.map((m) => (
                <div key={m.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/40 transition-colors">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        Phase {m.order}
                      </Badge>
                      <h4 className="font-bold text-sm truncate">{m.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Campaign: <span className="font-semibold text-foreground">{m.campaign.title}</span> • Lead:{" "}
                      <span className="font-semibold">{m.campaign.creator.displayName}</span>
                    </p>
                    {m.proofOfWork && (
                      <p className="text-xs bg-muted p-2 rounded-lg text-muted-foreground line-clamp-2 mt-1">
                        Proof: &ldquo;{m.proofOfWork}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 sm:shrink-0">
                    <div className="text-right">
                      <div className="font-bold font-mono text-sm text-primary">
                        ${m.targetAmount.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-muted-foreground">Tranche Amount</span>
                    </div>

                    <TreasuryMilestoneApproval milestone={m} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Community Hosted Campaigns */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Hosted Community Campaigns
            </CardTitle>
            <span className="text-xs text-muted-foreground">{totalCampaigns} total</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {organization.crowdfundingCampaigns.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <p className="text-sm">No campaigns currently hosted by this community.</p>
              <Link href="/crowdfunding/create">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <PlusCircle className="h-3.5 w-3.5" />
                  Launch the First Campaign
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {organization.crowdfundingCampaigns.map((c) => {
                const percent = Math.min(100, Math.round((c.raisedAmount / c.targetAmount) * 100));

                return (
                  <div key={c.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/40 transition-colors">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm truncate">{c.title}</h4>
                        <Badge variant="outline" className="text-[10px]">
                          {c.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Lead: {c.creator.displayName} • {c._count.contributions} Backers • {c.milestones.length} Milestones
                      </p>
                    </div>

                    <div className="flex items-center gap-6 sm:shrink-0">
                      <div className="text-right">
                        <div className="font-bold font-mono text-sm text-primary">
                          ${c.raisedAmount.toLocaleString()} / ${c.targetAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{percent}% funded</div>
                      </div>

                      <Link href={`/crowdfunding/${c.slug || c.id}`}>
                        <Button size="sm" variant="outline" className="text-xs gap-1">
                          View Campaign
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
