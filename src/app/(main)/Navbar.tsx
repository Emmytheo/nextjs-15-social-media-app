"use client";
import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Link from "next/link";
import { useState, useEffect } from "react";


export default function Navbar() {
  const [logoSrc, setLogoSrc] = useState("/logo.svg");

  useEffect(() => {
    if (window.innerWidth >= 768) {
      // setLogoSrc("img/logo.png");
    }
    else{
      setLogoSrc("/logo.svg");
    }
  }, []);
  
  return (
    <header className="sticky top-0 z-10 bg-card shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-3 py-2">
        <Link href="/" className="text-2xl font-bold text-primary">
          {/* bugbook */}
        {(
          <img src={logoSrc} alt="" className="h-6" />
        )}
        </Link>
        <SearchField />
        <UserButton className="sm:ms-auto" />
      </div>
    </header>
  );
}
