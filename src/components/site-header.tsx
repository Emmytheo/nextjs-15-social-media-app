import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Building2, Calendar, Home, LayoutDashboard, Wallet } from "lucide-react"
import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 flex h-14 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear bg-card/60 backdrop-blur">
      <div className="flex w-full items-center justify-between px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutDashboard className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Platform Console</h1>
              <p className="text-[10px] text-muted-foreground hidden sm:block">CommunityOS Core Command</p>
            </div>
          </div>
        </div>

        {/* Quick Nav Shortcut Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Home className="size-3.5" />
            <span className="hidden sm:inline">Feed</span>
          </Link>
          <Link
            href="/organization"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Building2 className="size-3.5" />
            <span className="hidden sm:inline">Guilds</span>
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Calendar className="size-3.5" />
            <span className="hidden sm:inline">Events</span>
          </Link>
          <Link
            href="/wallet"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Wallet className="size-3.5" />
            <span className="hidden sm:inline">Vault</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
