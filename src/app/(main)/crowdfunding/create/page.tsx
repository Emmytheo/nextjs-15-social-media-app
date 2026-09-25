"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Coins,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ImageUpload } from "@/components/ImageUpload";

const CATEGORIES = [
  { label: "Community Projects", value: "COMMUNITY_PROJECT" },
  { label: "Mutual Aid", value: "MUTUAL_AID" },
  { label: "Creative Grants", value: "CREATIVE_GRANT" },
  { label: "Tech Innovation", value: "TECH_INNOVATION" },
  { label: "Emergency Relief", value: "EMERGENCY_RELIEF" },
  { label: "Infrastructure", value: "INFRASTRUCTURE" },
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("COMMUNITY_PROJECT");
  const [targetAmount, setTargetAmount] = useState("2500");
  const [deadline, setDeadline] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [minPledge, setMinPledge] = useState("10");
  const [submitting, setSubmitting] = useState(false);

  // Dynamic milestones
  const [milestones, setMilestones] = useState([
    {
      title: "Phase 1: Project Setup & Sourcing",
      description: "Initial equipment acquisition, vendor onboarding, or foundational phase.",
      percentage: 40,
    },
    {
      title: "Phase 2: Execution & Implementation",
      description: "Core project development, community build-out, or milestone delivery.",
      percentage: 40,
    },
    {
      title: "Phase 3: Final Launch & Handover",
      description: "Final deliverables, inspection, community sign-off, and public launch.",
      percentage: 20,
    },
  ]);

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Phase ${milestones.length + 1}: Additional Deliverable`,
        description: "Milestone deliverable details and verification proof.",
        percentage: 10,
      },
    ]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length <= 1) {
      toast({ variant: "destructive", description: "Campaign must have at least one milestone." });
      return;
    }
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      toast({ variant: "destructive", description: "Please enter a valid target amount." });
      return;
    }

    // Validate milestone percentages sum to ~100
    const totalPercentage = milestones.reduce((sum, m) => sum + (parseFloat(m.percentage.toString()) || 0), 0);
    if (Math.abs(totalPercentage - 100) > 1) {
      toast({
        variant: "destructive",
        title: "Milestone Breakdown Error",
        description: `Milestone percentages must add up to 100%. Current sum: ${totalPercentage}%.`,
      });
      return;
    }

    try {
      setSubmitting(true);

      const calculatedMilestones = milestones.map((m, idx) => ({
        title: m.title,
        description: m.description,
        percentage: m.percentage,
        targetAmount: Math.round(((target * m.percentage) / 100) * 100) / 100,
        order: idx + 1,
      }));

      const res = await fetch("/api/crowdfunding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          tagline,
          description,
          category,
          targetAmount: target,
          deadline: deadline || null,
          coverUrl: coverUrl || "/img/logo.png",
          minPledge: parseFloat(minPledge) || 5,
          milestones: calculatedMilestones,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to create campaign");

      toast({
        title: "Campaign Launched!",
        description: "Your crowdfunding drive is live with milestone escrow protection.",
      });

      router.push(`/crowdfunding/${resData.campaign.slug || resData.campaign.id}`);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Launch Error",
        description: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-6 max-w-4xl mx-auto">
        {/* Back button */}
        <Link href="/crowdfunding" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Crowdfunding
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Launch a Community Campaign</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create an escrow-backed funding drive. Funds are unlocked in tranches as you submit verified deliverables.
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm space-y-8">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b pb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              1. Campaign Details
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Campaign Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Solar Energy Hub for Community Center"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Tagline / Short Pitch</label>
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Providing 24/7 clean power for 500+ daily visitors."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Campaign Cover Banner (Recommended)</label>
              <ImageUpload
                value={coverUrl}
                onChange={setCoverUrl}
                endpoint="campaignCover"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Full Story & Motivation *</label>
              <Textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what problem your project solves, how the funds will be used, and the community impact..."
                required
              />
            </div>
          </div>

          {/* Section 2: Financial Targets */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b pb-2 flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              2. Funding Goal & Schedule
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Funding Target ($) *</label>
                <Input
                  type="number"
                  step="1"
                  min="50"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="2500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Minimum Pledge ($)</label>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  value={minPledge}
                  onChange={(e) => setMinPledge(e.target.value)}
                  placeholder="10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Target Deadline</label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Escrow Milestones */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-500" />
                3. Milestone Escrow Release Roadmap
              </h2>
              <Button type="button" variant="outline" size="sm" onClick={addMilestone} className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Add Milestone
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Define the phases of your project. Pledges are held in escrow and released only after community trustees verify deliverables for each phase.
            </p>

            <div className="space-y-4">
              {milestones.map((m, idx) => (
                <div key={idx} className="p-4 rounded-2xl border bg-muted/30 space-y-3 relative">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Milestone #{idx + 1}
                    </span>
                    {milestones.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(idx)}
                        className="text-rose-500 hover:text-rose-600 h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-xs font-semibold">Milestone Title</label>
                      <Input
                        value={m.title}
                        onChange={(e) => updateMilestone(idx, "title", e.target.value)}
                        placeholder="e.g. Phase 1: Procurement"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Release %</label>
                      <Input
                        type="number"
                        min="5"
                        max="100"
                        value={m.percentage}
                        onChange={(e) => updateMilestone(idx, "percentage", parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Deliverables Description</label>
                    <Input
                      value={m.description}
                      onChange={(e) => updateMilestone(idx, "description", e.target.value)}
                      placeholder="What tangible proofs or receipts will you submit?"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t flex items-center justify-between">
            <Link href="/crowdfunding">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={submitting} className="gap-2 shadow-md">
              <ShieldCheck className="h-4 w-4" />
              {submitting ? "Deploying Escrow Campaign..." : "Launch Campaign"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
