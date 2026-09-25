import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import MenuBar from "./MenuBar";
import Navbar from "./Navbar";
import SessionProvider from "./SessionProvider";
import MobileNav from "@/components/MobileNav";

import { MenuBarProvider } from "@/components/MenuBarContext";
import MenuBarWrapper from "@/components/MenuBarWrapper";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  let unreadNotificationsCount = 0;
  if (session.user) {
    try {
      unreadNotificationsCount = await prisma.notification.count({
        where: {
          recipientId: session.user.id,
          read: false,
        },
      });
    } catch (e) {
      console.error("Error fetching notification count for MobileNav:", e);
    }
  }

  return (
    <SessionProvider value={session}>
      <MenuBarProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <div className="mx-auto flex w-full max-w-7xl grow gap-5 px-2.5 sm:px-4 md:px-5 py-3 md:py-5 pb-24 sm:pb-6">
            <MenuBarWrapper>
              <MenuBar className="space-y-3" />
            </MenuBarWrapper>
            <div className="w-full min-w-0 flex-1">
              {children}
            </div>
          </div>
          <MobileNav unreadNotificationsCount={unreadNotificationsCount} />
        </div>
      </MenuBarProvider>
    </SessionProvider>
  );
}
