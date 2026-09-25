"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Coins,
  ArrowLeft,
  Users,
  Clock,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Send,
  Upload,
  Calendar,
  Building2,
  Sparkles,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Award,
  HeartHandshake,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useSession } from "@/app/(main)/SessionProvider";

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  percentage: number | null;
  order: number;
  proofOfWork: string | null;
  status: "LOCKED" | "SUBMITTED" | "APPROVED" | "REJECTED" | "RELEASED";
  approvedBy: string | null;
  releasedAt: string | null;
}

interface Contribution {
  id: string;
  amount: number;
  anonymous: boolean;
  comment: string | null;
  status: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface CampaignDetail {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  coverUrl: string | null;
  category: string;
  targetAmount: number;
  raisedAmount: number;
  currency: string;
  deadline: string | null;
  status: string;
  escrowEnabled: boolean;
  minPledge: number | null;
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
  };
  organization: {
    id: string;
    name: string;
    logoUrl: string | null;
    description: string | null;
  } | null;
  milestones: Milestone[];
  contributions: Contribution[];
}

export default function CampaignDetailPage() {
  const { user } = useSession();
  const routeParams = useParams();
  const id = typeof routeParams?.id === "string" ? routeParams.id : Array.isArray(routeParams?.id) ? routeParams.id[0] : "";
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [permissions, setPermissions] = useState<{
    isCreator: boolean;
    isOrgAdmin: boolean;
    isBacker: boolean;
    canSubmitProof: boolean;
    canApproveRelease: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const { toast } = useToast();

  // Pledge modal state
  const [pledgeOpen, setPledgeOpen] = useState(false);
  const [pledgeAmount, setPledgeAmount] = useState("50");
  const [pledgeComment, setPledgeComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [pledgeSubmitting, setPledgeSubmitting] = useState(false);

  // Submit proof modal state
  const [proofOpen, setProofOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [proofText, setProofText] = useState("");
  const [proofSubmitting, setProofSubmitting] = useState(false);

  // Approve modal state
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveSubmitting, setApproveSubmitting] = useState(false);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/crowdfunding/${id}`);
      if (!res.ok) throw new Error("Failed to load campaign");
      const data = await res.json();
      setCampaign(data.campaign);
      if (data.permissions) {
        setPermissions(data.permissions);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to load campaign detail.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({ description: "Campaign link copied to clipboard!" });
    }
  };

  const handlePledge = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(pledgeAmount);
    if (isNaN(amt) || amt <= 0) {
      toast({ variant: "destructive", description: "Please enter a valid pledge amount." });
      return;
    }

    try {
      setPledgeSubmitting(true);
      const res = await fetch(`/api/crowdfunding/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          comment: pledgeComment || undefined,
          anonymous,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Pledge failed");

      toast({
        title: "Pledge Recorded!",
        description: `$${amt.toFixed(2)} safely locked in Escrow for this project.`,
      });

      setPledgeOpen(false);
      setPledgeComment("");
      fetchCampaign();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Pledge Error",
        description: err.message,
      });
    } finally {
      setPledgeSubmitting(false);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone || !proofText.trim()) return;

    try {
      setProofSubmitting(true);
      const res = await fetch(`/api/crowdfunding/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_proof",
          milestoneId: selectedMilestone.id,
          proofOfWork: proofText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit deliverables proof");

      toast({
        title: "Deliverables Submitted!",
        description: "Your proof of work has been submitted for community trustee verification.",
      });

      setProofOpen(false);
      setProofText("");
      fetchCampaign();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: err.message,
      });
    } finally {
      setProofSubmitting(false);
    }
  };

  const handleApproveRelease = async () => {
    if (!selectedMilestone) return;

    try {
      setApproveSubmitting(true);
      const res = await fetch(`/api/crowdfunding/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve_release",
          milestoneId: selectedMilestone.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve and release escrow");

      toast({
        title: "Tranche Released!",
        description: `$${selectedMilestone.targetAmount.toLocaleString()} released from Escrow to the project lead.`,
      });

      setApproveOpen(false);
      fetchCampaign();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Escrow Release Error",
        description: err.message,
      });
    } finally {
      setApproveSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex justify-center items-center min-h-[60vh] w-full">
        <div className="text-center text-muted-foreground space-y-2">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm">Loading campaign details & escrow roadmap...</p>
        </div>
      </main>
    );
  }

  if (!campaign) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <h2 className="text-xl font-bold">Campaign not found</h2>
        <Link href="/crowdfunding">
          <Button variant="outline" className="gap-2 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
            Back to Crowdfunding
          </Button>
        </Link>
      </main>
    );
  }

  const percent = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));
  const daysRemaining = campaign.deadline
    ? Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const releasedCount = campaign.milestones.filter((m) => m.status === "RELEASED").length;
  const milestonePercent = Math.round((releasedCount / Math.max(1, campaign.milestones.length)) * 100);

  const isCreator = user ? campaign.creator.id === user.id : (permissions?.isCreator ?? false);
  const canApprove = !isCreator && (permissions?.canApproveRelease ?? true);

  return (
    <main className="flex w-full min-w-0 flex-col gap-6">
      <div className="w-full min-w-0 space-y-6 max-w-5xl mx-auto">
        {/* Top Breadcrumb Bar */}
        <div className="flex items-center justify-between">
          <Link href="/crowdfunding" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to all campaigns
          </Link>
          <Button variant="outline" size="sm" onClick={copyShareLink} className="gap-1.5 text-xs rounded-xl">
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
            {copiedLink ? "Link Copied" : "Share Campaign"}
          </Button>
        </div>

        {/* Hero Visual & Funding Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Visual Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border bg-muted shadow-sm">
              <img
                src={campaign.coverUrl || "/img/logo.png"}
                alt={campaign.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-background/90 text-foreground backdrop-blur font-semibold shadow-sm text-xs">
                  {campaign.category.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {campaign.title}
              </h1>
              {campaign.tagline && (
                <p className="text-muted-foreground text-base sm:text-lg font-medium leading-relaxed">
                  {campaign.tagline}
                </p>
              )}
            </div>

            {/* Creator & Community attribution */}
            <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border bg-card/60">
              <div className="flex items-center gap-3">
                <img
                  src={campaign.creator.avatarUrl || "/img/icon.png"}
                  alt={campaign.creator.displayName}
                  className="h-10 w-10 rounded-full object-cover border"
                />
                <div>
                  <p className="text-xs text-muted-foreground">Project Lead</p>
                  <p className="text-sm font-bold">{campaign.creator.displayName}</p>
                </div>
              </div>

              {campaign.organization && (
                <div className="flex items-center gap-3 pl-4 border-l">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Host Community Hub</p>
                    <p className="text-sm font-bold">{campaign.organization.name}</p>
                  </div>
                </div>
              )}

              <div className="ml-auto inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full font-bold">
                <ShieldCheck className="h-4 w-4" />
                Escrow Protected
              </div>
            </div>
          </div>

          {/* Funding Action Column */}
          <div className="space-y-6">
            <div className="rounded-3xl border bg-card p-6 shadow-sm space-y-6">
              <div className="space-y-2">
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-primary">
                  ${campaign.raisedAmount.toLocaleString()}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>pledged of ${campaign.targetAmount.toLocaleString()} goal</span>
                  <span className="font-bold text-foreground font-mono">{percent}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div>
                  <div className="text-2xl font-bold">{campaign.contributions.length}</div>
                  <div className="text-xs text-muted-foreground">Community Backers</div>
                </div>
                {daysRemaining !== null && (
                  <div>
                    <div className="text-2xl font-bold">{daysRemaining}</div>
                    <div className="text-xs text-muted-foreground">Days Remaining</div>
                  </div>
                )}
              </div>

              <Button
                size="lg"
                onClick={() => setPledgeOpen(true)}
                className="w-full gap-2 text-base font-bold shadow-lg rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Coins className="h-5 w-5" />
                Back this Campaign
              </Button>

              {/* Tiered perks simulator */}
              <div className="space-y-2.5 pt-2 border-t">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Pledge Tiers</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Bronze", amt: "25", icon: "🥉" },
                    { label: "Silver", amt: "50", icon: "🥈" },
                    { label: "Gold", amt: "100", icon: "🥇" },
                  ].map((tier) => (
                    <button
                      key={tier.amt}
                      onClick={() => {
                        setPledgeAmount(tier.amt);
                        setPledgeOpen(true);
                      }}
                      className="p-2.5 rounded-2xl border bg-muted/30 hover:bg-primary/10 hover:border-primary/40 transition-all text-center group"
                    >
                      <span className="text-base block">{tier.icon}</span>
                      <span className="text-xs font-bold block mt-0.5 group-hover:text-primary">${tier.amt}</span>
                      <span className="text-[9px] text-muted-foreground block">{tier.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-muted/40 p-3.5 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-amber-500" />
                  Milestone Escrow Guarantee
                </p>
                <p>
                  Funds are never transferred up-front. They stay in the Escrow Vault and are disbursed only after verified proof of milestone completion.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Detailed Experience */}
        <Tabs defaultValue="roadmap" className="space-y-6">
          <TabsList className="flex sm:grid sm:grid-cols-3 overflow-x-auto no-scrollbar scrollbar-none flex-nowrap w-full max-w-md h-auto p-1 rounded-2xl justify-start sm:justify-center">
            <TabsTrigger value="roadmap" className="gap-1.5 text-xs font-semibold rounded-xl shrink-0 sm:shrink py-2">
              <Layers className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Escrow Roadmap</span>
            </TabsTrigger>
            <TabsTrigger value="story" className="gap-1.5 text-xs font-semibold rounded-xl shrink-0 sm:shrink py-2">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Project Story</span>
            </TabsTrigger>
            <TabsTrigger value="backers" className="gap-1.5 text-xs font-semibold rounded-xl shrink-0 sm:shrink py-2">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>Backers ({campaign.contributions.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Milestone Escrow Roadmap */}
          <TabsContent value="roadmap" className="space-y-6">
            <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Lock className="h-5 w-5 text-amber-500" />
                    Milestone Escrow Release Stepper
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tranches are disbursed in phases. Proof of work deliverables are verified by community trustees.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-primary">
                    {releasedCount} / {campaign.milestones.length} Phases Disbursed
                  </span>
                  <div className="h-2 w-32 bg-muted rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${milestonePercent}%` }} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {campaign.milestones.map((milestone) => {
                  const isReleased = milestone.status === "RELEASED";
                  const isSubmitted = milestone.status === "SUBMITTED";

                  return (
                    <div
                      key={milestone.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isReleased
                          ? "bg-emerald-500/5 border-emerald-500/30"
                          : isSubmitted
                          ? "bg-amber-500/5 border-amber-500/30"
                          : "bg-muted/20 border-muted"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Phase {milestone.order}
                            </span>
                            <Badge
                              className={
                                isReleased
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                                  : isSubmitted
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]"
                                  : "bg-muted text-muted-foreground text-[10px]"
                              }
                              variant="outline"
                            >
                              {isReleased ? "Tranche Released" : isSubmitted ? "Deliverables Under Review" : "Escrow Locked"}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-bold">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>

                          {milestone.proofOfWork && (
                            <div className="mt-3 p-3.5 rounded-xl bg-background border text-xs space-y-1">
                              <p className="font-semibold text-foreground flex items-center gap-1.5">
                                <FileCheck className="h-3.5 w-3.5 text-primary" />
                                Submitted Proof of Deliverables:
                              </p>
                              <p className="text-muted-foreground whitespace-pre-wrap">{milestone.proofOfWork}</p>
                            </div>
                          )}
                        </div>

                        <div className="text-right sm:shrink-0 space-y-3">
                          <div>
                            <div className="text-xl font-mono font-black text-primary">
                              ${milestone.targetAmount.toLocaleString()}
                            </div>
                            {milestone.percentage && (
                              <div className="text-xs text-muted-foreground font-mono">{milestone.percentage}% of goal</div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {/* Creator deliverable submission */}
                            {isCreator && !isReleased && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedMilestone(milestone);
                                  setProofText(milestone.proofOfWork || "");
                                  setProofOpen(true);
                                }}
                                className="text-xs gap-1.5 rounded-xl font-semibold"
                              >
                                <Upload className="h-3.5 w-3.5 text-primary" />
                                {isSubmitted ? "Update Proof" : "Submit Deliverables"}
                              </Button>
                            )}

                            {/* Trustee / Backer escrow tranche approval */}
                            {!isCreator && canApprove && isSubmitted && !isReleased && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedMilestone(milestone);
                                  setApproveOpen(true);
                                }}
                                className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm font-semibold"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approve Release
                              </Button>
                            )}

                            {/* Informational badges for other viewers */}
                            {!isReleased && !isCreator && !isSubmitted && (
                              <span className="text-[11px] text-muted-foreground italic px-2.5 py-1 bg-muted/40 rounded-lg">
                                Awaiting Deliverables
                              </span>
                            )}

                            {isCreator && isSubmitted && !isReleased && (
                              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold px-2.5 py-1 bg-amber-500/10 rounded-lg flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Under Review
                              </span>
                            )}

                            {isReleased && (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 bg-emerald-500/10 rounded-lg flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Disbursed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Project Story */}
          <TabsContent value="story">
            <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold border-b pb-3">About the Project</h2>
              <div className="text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-wrap">
                {campaign.description}
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Backers */}
          <TabsContent value="backers">
            <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Community Backers ({campaign.contributions.length})
                </h2>
                <span className="text-xs text-muted-foreground">Protected by CommunityOS Escrow</span>
              </div>

              {campaign.contributions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <HeartHandshake className="h-8 w-8 mx-auto opacity-40 text-primary" />
                  <p className="text-sm font-semibold">No pledges yet</p>
                  <p className="text-xs">Be the very first backer to fund this initiative!</p>
                </div>
              ) : (
                <div className="divide-y">
                  {campaign.contributions.map((contrib) => (
                    <div key={contrib.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={contrib.anonymous ? "/img/icon.png" : contrib.user.avatarUrl || "/img/icon.png"}
                          alt=""
                          className="h-9 w-9 rounded-full border object-cover"
                        />
                        <div>
                          <p className="text-sm font-bold">
                            {contrib.anonymous ? "Anonymous Citizen Backer" : contrib.user.displayName}
                          </p>
                          {contrib.comment && (
                            <p className="text-xs text-muted-foreground italic mt-0.5">&ldquo;{contrib.comment}&rdquo;</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black font-mono text-sm text-primary">+${contrib.amount.toFixed(2)}</span>
                        <p className="text-[10px] text-muted-foreground font-mono">{new Date(contrib.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Back Campaign Modal */}
      <Dialog open={pledgeOpen} onOpenChange={setPledgeOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <form onSubmit={handlePledge}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <Coins className="h-5 w-5 text-primary" />
                Back this Campaign
              </DialogTitle>
              <DialogDescription>
                Pledge funds directly from your CommunityOS Wallet into the Escrow Vault.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pledge Amount ($)</label>
                <Input
                  type="number"
                  step="1"
                  min={campaign.minPledge || 1}
                  value={pledgeAmount}
                  onChange={(e) => setPledgeAmount(e.target.value)}
                  className="font-mono text-lg font-bold rounded-xl"
                  required
                />
              </div>

              {/* Preset buttons */}
              <div className="flex gap-2">
                {[10, 25, 50, 100, 250].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs rounded-xl font-bold font-mono"
                    onClick={() => setPledgeAmount(preset.toString())}
                  >
                    ${preset}
                  </Button>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Encouragement / Comment (Optional)</label>
                <Input
                  value={pledgeComment}
                  onChange={(e) => setPledgeComment(e.target.value)}
                  placeholder="e.g. Fully backing this community milestone!"
                  className="rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="anon"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="anon" className="text-xs text-muted-foreground select-none cursor-pointer">
                  Display my pledge anonymously to the public
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPledgeOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={pledgeSubmitting} className="font-bold shadow-md rounded-xl">
                {pledgeSubmitting ? "Locking in Escrow..." : "Confirm Pledge"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Submit Proof Modal */}
      <Dialog open={proofOpen} onOpenChange={setProofOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSubmitProof}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <Upload className="h-5 w-5 text-primary" />
                Submit Milestone Deliverables
              </DialogTitle>
              <DialogDescription>
                Provide links to receipts, photos, deployed features, or proof documents for Phase {selectedMilestone?.order}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proof Details & Deliverable URLs</label>
                <Textarea
                  rows={4}
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="e.g. GitHub release URL, invoice photo link, or proof description..."
                  className="rounded-xl text-xs"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProofOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={proofSubmitting} className="font-bold shadow-md rounded-xl">
                {proofSubmitting ? "Submitting..." : "Submit for Verification"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Approve Release Modal */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600 font-bold">
              <CheckCircle2 className="h-5 w-5" />
              Approve Escrow Tranche Disbursement
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve Phase {selectedMilestone?.order} and release{" "}
              <strong>${selectedMilestone?.targetAmount.toLocaleString()}</strong> from Escrow to the project lead?
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl">
            This will immediately disburse funds from Escrow into the project creator&apos;s available wallet balance and record an immutable entry in the audit ledger.
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setApproveOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApproveRelease}
              disabled={approveSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
            >
              {approveSubmitting ? "Disbursing..." : "Confirm & Disburse Funds"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
