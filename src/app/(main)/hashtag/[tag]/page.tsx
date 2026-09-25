import TrendsSidebar from "@/components/TrendsSidebar";
import { Hash } from "lucide-react";
import { Metadata } from "next";
import HashtagFeed from "./HashtagFeed";

interface PageProps {
  params: Promise<{ tag: string }> | { tag: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tag = decodeURIComponent(resolvedParams.tag || "");

  return {
    title: `#${tag} - Posts`,
    description: `Browse posts tagged with #${tag}`,
  };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const tag = decodeURIComponent(resolvedParams.tag || "");

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="flex items-center gap-3 rounded-2xl bg-card p-5 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Hash className="size-5" />
          </div>
          <div>
            <h1 className="line-clamp-1 break-all text-2xl font-bold">
              #{tag}
            </h1>
            <p className="text-sm text-muted-foreground">
              Trending topic & community discussions
            </p>
          </div>
        </div>
        <HashtagFeed tag={tag} />
      </div>
      <TrendsSidebar />
    </main>
  );
}
