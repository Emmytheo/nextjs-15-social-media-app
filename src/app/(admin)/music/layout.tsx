import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider from "../../(main)/SessionProvider";
import { AppSidebar } from "./components/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollBar } from "@/components/ui/scroll-area";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { Menu } from "./components/menu";
import { AlbumArtwork } from "./components/album-artwork";
import { PodcastEmptyPlaceholder } from "./components/podcast-empty-placeholder";
import { listenNowAlbums, madeForYouAlbums } from "./data/albums";
import { playlists } from "./data/playlists";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  

  return (
    <SidebarProvider>
      <AppSidebar playlists={playlists} className="block" variant="inset" />
      <SidebarInset>
      <div className="flex flex-1 flex-col rounded-lg border bg-background">
        <Menu />
        {children}
      </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
