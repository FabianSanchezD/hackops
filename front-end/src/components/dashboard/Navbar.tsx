"use client";

import * as React from "react";
import { Card, CardContent } from "../ui/card";
import Button from "../ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDown, Settings, Plus, Settings2, LogOut } from "lucide-react";

export default function Navbar() {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl h-16 px-4 flex items-center justify-between">
        {/* Left: HackOps */}
        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
          <div className="text-2xl font-bold text-[#1e40af]">HackOps</div>
        </Link>

        {/* Center: Hackathon dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-lg font-semibold transition-colors hover:text-[#1e40af]">
              {"My Hackathon"}
              <ChevronDown size={16} className="transition-transform duration-200 data-[state=open]:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56 animate-in fade-in-0 zoom-in-95 duration-200">
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
              <Button variant="ghost" className="flex items-center gap-2 transition-colors hover:bg-neutral-100">
                <div className="flex items-center gap-2">
                  <img 
                    src="/placeholder_profilepic.png" 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full object-cover transition-transform hover:scale-105"
                  />
                  <span className="text-sm font-medium">Fabian Sanchez</span>
                  <ChevronDown size={14} className="transition-transform duration-200 data-[state=open]:rotate-180" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 animate-in fade-in-0 zoom-in-95 duration-200">
              <DropdownMenuItem className="hover:bg-blue-50 focus:bg-blue-50">
                <Settings2 size={16} className="mr-2 text-[#1e40af]" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-700">
                <LogOut size={16} className="mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="sm" className="p-2 transition-colors hover:bg-neutral-100 hover:text-[#1e40af]">
            <Settings size={20} className="text-neutral-600 transition-colors" />
          </Button>
        </div>
      </div>
    </div>
  );
}
