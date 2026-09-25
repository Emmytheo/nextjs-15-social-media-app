"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Coins,
  PlusCircle,
  Search,
  Filter,
  Users,
  Clock,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Layers,
  Sparkles,
  Award,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface CampaignItem {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  coverUrl: string | null;
  category: string;
  targetAmount: number;
  raisedAmount: number;
  deadline: string | null;
  status: string;
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  organization: {
    id: string;
    name: string;
    logoUrl: string | null;
  } | null;
  milestones: Array<{
    id: string;
    title: string;
    targetAmount: number;
    status: string;
  }>;
  _count: {
    contributions: number;
  };
}

const CATEGORIES = [
  { label: "All Hubs", value: "ALL" },
  { label: "Community Projects", value: "COMMUNITY_PROJECT" },
  { label: "Mutual Aid", value: "MUTUAL_AID" },
  { label: "Creative Grants", value: "CREATIVE_GRANT" },
  { label: "Tech Innovation", value: "TECH_INNOVATION" },
  { label: "Emergency Relief", value: "EMERGENCY_RELIEF" },
  { label: "Infrastructure", value: "INFRASTRUCTURE" },
];

const SHOWCASE_CAMPAIGNS: CampaignItem[] = [
  {
    id: "showcase-clean-water-project",
    slug: "abia-clean-water-solar-borehole",
    title: "Abia Clean Water & Solar Borehole Project",
    tagline: "Providing clean solar-powered drinking water to 5,000 residents across rural farming clusters.",
    description: "This civic initiative delivers two deep-drilled solar boreholes with automated filtration and community tap stations. Funds are protected by milestone escrow and released in 3 verifiable phases.",
    coverUrl: "/img/logo.png",
    category: "COMMUNITY_PROJECT",
    targetAmount: 12500,
    raisedAmount: 8750,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 22).toISOString(),
    status: "ACTIVE",
    creator: {
      id: "alice-admin",
      username: "alice_admin",
      displayName: "Alice Chen",
      avatarUrl: "/img/icon.png",
    },
    organization: {
      id: "community-builders",
      name: "Community Builders Network",
      logoUrl: "/img/logo.png",
    },
    milestones: [
      { id: "m-1", title: "Geological Survey & Aquifer Drilling", targetAmount: 4000, status: "RELEASED" },
      { id: "m-2", title: "Solar Pump & Steel Tank Rigging", targetAmount: 5000, status: "APPROVED" },
      { id: "m-3", title: "Purification Filters & Community Taps", targetAmount: 3500, status: "LOCKED" },
    ],
    _count: { contributions: 64 },
  },
  {
    id: "showcase-financial-sdk",
    slug: "communityos-financial-sdk",
    title: "CommunityOS Open Source Financial Rails SDK",
    tagline: "Developer toolkit for bridging cooperative thrifts, ajo pools, and Copteller MFB escrow ledgers.",
    description: "A comprehensive TypeScript SDK enabling any community, church, or cooperative to deploy audited milestone escrow contracts and transparent treasury ledgers.",
    coverUrl: "/img/icon.png",
    category: "TECH_INNOVATION",
    targetAmount: 25000,
    raisedAmount: 19400,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35).toISOString(),
    status: "ACTIVE",
    creator: {
      id: "bob-organizer",
      username: "bob_organizer",
      displayName: "Bob Wilson",
      avatarUrl: "/img/logo.png",
    },
    organization: {
      id: "tech-innovation-hub",
      name: "Tech Innovation Hub",
      logoUrl: "/img/icon.png",
    },
    milestones: [
      { id: "m-4", title: "Double-Entry Ledger Core Engine", targetAmount: 7000, status: "RELEASED" },
      { id: "m-5", title: "Multi-Rail MFB Clearing Adapter", targetAmount: 8000, status: "RELEASED" },
      { id: "m-6", title: "Next.js 15 UI Component Library", targetAmount: 10000, status: "SUBMITTED" },
    ],
    _count: { contributions: 128 },
  },
  {
    id: "showcase-creative-audio",
    slug: "youth-creative-sound-lab",
    title: "Youth Creative Media & Podcast Lab",
    tagline: "Equipping young civic storytellers with acoustic recording gear and sound production training.",
    description: "Establishing an open-access podcast and sound recording lab powered by Sol2Snd acoustic tools for community journalists and musicians.",
    coverUrl: "/img/logo.png",
    category: "CREATIVE_GRANT",
    targetAmount: 6500,
    raisedAmount: 5200,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    status: "ACTIVE",
    creator: {
      id: "carol-member",
      username: "carol_member",
      displayName: "Carol Davis",
      avatarUrl: "/img/icon.png",
    },
    organization: {
      id: "tech-innovation-hub",
      name: "Creative Media Guild",
      logoUrl: "/img/logo.png",
    },
    milestones: [
      { id: "m-7", title: "Acoustic Treatment & Microphones", targetAmount: 3500, status: "RELEASED" },
      { id: "m-8", title: "Digital Audio Workstation & Masterclass", targetAmount: 3000, status: "APPROVED" },
    ],
    _count: { contributions: 42 },
  },
];

export default function CrowdfundingPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState<"MOST_FUNDED" | "NEWEST" | "ENDING_SOON">("MOST_FUNDED");
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const url = selectedCategory === "ALL" ? "/api/crowdfunding" : `/api/crowdfunding?category=${selectedCategory}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load campaigns");
      const data = await res.json();
      if (data.campaigns && data.campaigns.length > 0) {
        setCampaigns(data.campaigns);
      } else {
        setCampaigns(SHOWCASE_CAMPAIGNS);
      }
    } catch (err: any) {
      setCampaigns(SHOWCASE_CAMPAIGNS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [selectedCategory]);

  // Sorting and filtering
  const filteredCampaigns = campaigns
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        (c.tagline && c.tagline.toLowerCase().includes(q)) ||
        c.creator.displayName.toLowerCase().includes(q) ||
        (c.organization && c.organization.name.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === "MOST_FUNDED") return b.raisedAmount - a.raisedAmount;
      if (sortBy === "NEWEST") return b.id.localeCompare(a.id);
      if (sortBy === "ENDING_SOON") {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return 0;
    });

  // Calculate platform totals
  const totalRaisedAll = campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
  const totalBackersAll = campaigns.reduce((acc, c) => acc + c._count.contributions, 0);
  const spotlightCampaign = campaigns[0];

  return (
    <main className="flex w-full min-w-0 flex-col gap-6">
      <div className="w-full min-w-0 space-y-6 max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border bg-gradient-to-br from-card via-card to-primary/10 p-4 sm:p-8 shadow-sm">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              Community-Powered Funding & Escrow Grants
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Empower Ideas with <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">Milestone Escrow</span> Protection.
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Back initiatives within your living community hubs. Backer funds are locked securely in the CommunityOS Escrow Vault and disbursed only as project leads submit tangible proof of work.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/crowdfunding/create">
                <Button className="gap-2 shadow-md rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                  <PlusCircle className="h-4 w-4" />
                  Start a Campaign
                </Button>
              </Link>
              <Link href="/wallet">
                <Button variant="outline" className="gap-2 rounded-xl font-semibold">
                  <Coins className="h-4 w-4 text-primary" />
                  My Wallet & Escrow
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-border/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-black font-mono">${totalRaisedAll.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total Community Capital Raised</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-black font-mono">{totalBackersAll}</div>
                <p className="text-xs text-muted-foreground">Community Backer Pledges</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-black font-mono">100%</div>
                <p className="text-xs text-muted-foreground">Escrow Protected Delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Spotlight Featured Campaign */}
        {spotlightCampaign && (
          <div className="rounded-3xl border bg-card p-6 shadow-sm overflow-hidden relative">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs font-bold gap-1">
                <Award className="h-3.5 w-3.5" />
                Featured Community Initiative
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-1 aspect-[16/10] overflow-hidden rounded-2xl bg-muted border">
                <img
                  src={spotlightCampaign.coverUrl || "/img/logo.png"}
                  alt={spotlightCampaign.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{spotlightCampaign.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {spotlightCampaign.tagline || spotlightCampaign.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold font-mono text-primary text-base">
                      ${spotlightCampaign.raisedAmount.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      of ${spotlightCampaign.targetAmount.toLocaleString()} Goal (
                      {Math.round((spotlightCampaign.raisedAmount / spotlightCampaign.targetAmount) * 100)}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round((spotlightCampaign.raisedAmount / spotlightCampaign.targetAmount) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>{spotlightCampaign._count.contributions} Backers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Lock className="h-4 w-4 text-amber-500" />
                      <span>{spotlightCampaign.milestones.length} Milestone Phases</span>
                    </div>
                  </div>

                  <Link href={`/crowdfunding/${spotlightCampaign.slug || spotlightCampaign.id}`}>
                    <Button size="sm" className="gap-1.5 rounded-xl font-bold">
                      View Escrow Campaign
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter, Search & Sorting Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns, tags, or leaders..."
                className="pl-10 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="MOST_FUNDED">Sort: Most Funded</option>
                <option value="NEWEST">Sort: Newest</option>
                <option value="ENDING_SOON">Sort: Ending Soonest</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
                className="rounded-full text-xs shrink-0 font-medium"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Campaign Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading community campaigns...
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="py-16 text-center border rounded-3xl bg-card/50 space-y-4">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto text-primary">
              <Coins className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold">No campaigns match your filter</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Be the first in your community to launch a crowdfunding drive with milestone escrow protection.
              </p>
            </div>
            <Link href="/crowdfunding/create">
              <Button className="gap-2 rounded-xl">
                <PlusCircle className="h-4 w-4" />
                Start the First Campaign
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((c) => {
              const percent = Math.min(100, Math.round((c.raisedAmount / c.targetAmount) * 100));
              const daysRemaining = c.deadline
                ? Math.max(0, Math.ceil((new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                : null;

              return (
                <Link
                  key={c.id}
                  href={`/crowdfunding/${c.slug || c.id}`}
                  className="group flex flex-col overflow-hidden rounded-3xl border bg-card transition-all hover:shadow-xl hover:border-primary/40"
                >
                  {/* Image banner */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                    <img
                      src={c.coverUrl || "/img/logo.png"}
                      alt={c.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-background/90 text-foreground backdrop-blur font-semibold text-[11px] shadow-sm">
                        {c.category.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    {c.organization && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-background/90 backdrop-blur text-[10px]">
                          {c.organization.name}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-1">
                        {c.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {c.tagline || c.description}
                      </p>
                    </div>

                    {/* Progress Bar & Stats */}
                    <div className="space-y-3 pt-2">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-bold font-mono text-primary text-sm">${c.raisedAmount.toLocaleString()}</span>
                          <span className="text-muted-foreground font-mono">of ${c.targetAmount.toLocaleString()} ({percent}%)</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          <span>{c._count.contributions} Backers</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-amber-500" />
                          <span>{c.milestones.length} Milestones</span>
                        </div>
                        {daysRemaining !== null && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{daysRemaining}d left</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
