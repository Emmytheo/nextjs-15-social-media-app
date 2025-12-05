import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PublicMusicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Simple public header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <div className="mr-4 flex">
                        <Link href="/preview" className="mr-6 flex items-center space-x-2">
                            <span className="font-bold">Music Preview</span>
                        </Link>
                    </div>
                    <div className="flex flex-1 items-center justify-end space-x-2">
                        <nav className="flex items-center space-x-2">
                            <Button asChild variant="ghost">
                                <Link href="/login">Sign In</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/signup">Get Started</Link>
                            </Button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1">{children}</main>

            {/* Simple footer */}
            <footer className="border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Sign in to like songs, create playlists, and more.
                    </p>
                </div>
            </footer>
        </div>
    );
}
