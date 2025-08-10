"use client";

import * as React from "react";
import Image from "next/image";
import Button from "../ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, API_BASE } from "../../lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDown, Settings, Plus, Settings2, LogOut } from "lucide-react";

export default function GrowthNavbar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [showUnavailable, setShowUnavailable] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      try {
  const res = await apiFetch('/auth/me');
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
  await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      setLoggingOut(false);
      router.push("/login");
    }
  }

  function handleAddHackathonClick() {
    setShowUnavailable(true);
    
    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    
    // Hide overlay after animation
    setTimeout(() => setShowUnavailable(false), 2000);
  }
  return (
    <>
      {/* Red overlay for unavailable feature */}
      {showUnavailable && (
        <div className="fixed inset-0 bg-red-500/20 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in-0 duration-250">
          <div className="bg-white rounded-xl p-6 shadow-2xl border border-red-200 max-w-sm mx-4 animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-red-600 text-xl">🚧</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Not Available Yet</h3>
              <p className="text-sm text-neutral-600">This feature is coming soon!</p>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-50 w-full bg-[#0a174e]/90 backdrop-blur border-b border-blue-900">
      <div className="mx-auto max-w-7xl h-16 px-4 flex items-center justify-between">
        {/* Left: HackOps */}
        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
          <Image 
            src="/icons/HackOps_Logo_White.svg" 
            alt="HackOps Logo" 
            width={27}
            height={27}
            className="object-contain"
            priority
          />
          <span className="text-2xl font-bold text-white">HackOps</span>
        </Link>

        {/* Center: Hackathon dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-lg font-semibold text-white hover:text-blue-300 transition-colors focus:outline-none">
              {"My Hackathon"}
              <ChevronDown size={16} className="transition-transform duration-200 data-[state=open]:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56 animate-in fade-in-0 zoom-in-95 duration-200 bg-white/95 backdrop-blur border border-blue-200 shadow-xl">
            <DropdownMenuItem onClick={handleAddHackathonClick} className="flex items-center gap-2 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
              <Plus size={16} className="text-[#1e40af]" />
              Add New Hackathon
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Right: Profile dropdown + Settings */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10 transition-colors focus:outline-none">
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
            <DropdownMenuContent align="end" className="w-48 animate-in fade-in-0 zoom-in-95 duration-200 bg-white/95 backdrop-blur border border-blue-200 shadow-xl">
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
          
          <Button variant="ghost" size="sm" className="p-2 text-white hover:bg-white/10 hover:text-blue-300 transition-colors focus:outline-none">
            <Settings size={20} className="transition-colors" />
          </Button>
        </div>
      </div>
      </div>
    </>
  );
}
