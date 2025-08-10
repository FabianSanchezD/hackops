"use client";

import * as React from "react";
import Image from "next/image";
import Button from "../ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDown, Settings, Plus, Settings2, LogOut } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [loggingOut, setLoggingOut] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setUserEmail(data?.user?.email ?? null);
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) setLoadingUser(false);
      }
    }
    loadUser();
    return () => { isMounted = false; };
  }, [API_BASE]);

  async function onLogout() {
    try {
      setLoggingOut(true);
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {
      // ignore
    } finally {
      setLoggingOut(false);
      router.push("/login");
    }
  }
  return (
    <div className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl h-16 px-4 flex items-center justify-between">
        {/* Left: HackOps */}
        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
          <Image 
            src="/icons/HackOps_Logo.svg" 
            alt="HackOps Logo" 
            width={27}
            height={27}
            className="object-contain"
            priority
          />
          <span className="text-2xl font-bold text-[#1e40af]">HackOps</span>
        </Link>

        {/* Center: Hackathon dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-lg font-semibold transition-colors hover:text-[#1e40af] focus:outline-none">
              {"My Hackathon"}
              <ChevronDown size={16} className="transition-transform duration-200 data-[state=open]:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56 animate-in fade-in-0 zoom-in-95 duration-200 border-0 shadow-lg">
            <DropdownMenuItem className="flex items-center gap-2 hover:bg-blue-50 focus:bg-blue-50">
              <Plus size={16} className="text-[#1e40af]" />
              Add New Hackathon
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Right: Profile dropdown + Settings */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 transition-colors hover:bg-neutral-100 focus:outline-none">
                <div className="flex items-center gap-2">
                  <Image
                    src="/placeholder_profilepic.svg" 
                    alt="Profile"
                    height={32}
                    width={32}
                    className="rounded-full object-cover transition-transform hover:scale-105"
                  />
                  <span className="text-sm font-medium" title={userEmail || undefined}>
                    {userEmail ? userEmail : (loadingUser ? "Loading..." : "Account")}
                  </span>
                  <ChevronDown size={14} className="transition-transform duration-200 data-[state=open]:rotate-180" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 animate-in fade-in-0 zoom-in-95 duration-200 border-0 shadow-lg">
              <DropdownMenuItem className="hover:bg-blue-50 focus:bg-blue-50">
                <Settings2 size={16} className="mr-2 text-[#1e40af]" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-700">
                <LogOut size={16} className="mr-2" />
                {loggingOut ? "Signing out…" : "Sign Out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="sm" className="p-2 transition-colors hover:bg-neutral-100 hover:text-[#1e40af] focus:outline-none">
            <Settings size={20} className="text-neutral-600 transition-colors" />
          </Button>
        </div>
      </div>
    </div>
  );
}
