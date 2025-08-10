"use client";

import * as React from "react";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import {
  Users,
  UsersRound,
  Mic,
  TrendingUp,
  CheckSquare,
  Trophy,
  Headphones,
  Handshake,
  Target,
} from "lucide-react";

const features = [
  {
    title: "Outreach Recruitment",
    icon: Users,
    description: "Attract and recruit participants",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    hoverBg: "group-hover:bg-blue-100",
    href: "/dashboard/outreach",
  },
  {
    title: "Team Management",
    icon: UsersRound,
    description: "Organize and manage teams",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    hoverBg: "group-hover:bg-indigo-100",
    href: "/dashboard/team-management",
  },
  {
    title: "Speaker Jury Orchestration",
    icon: Mic,
    description: "Coordinate speakers and judges",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    hoverBg: "group-hover:bg-purple-100",
    href: "/dashboard/speaker-jury-management",
  },
  {
    title: "Community Growth",
    icon: TrendingUp,
    description: "Build and expand community",
    color: "text-green-600",
    bgColor: "bg-green-50",
    hoverBg: "group-hover:bg-green-100",
    href: "/dashboard/growth",
  },
  {
    title: "Agenda/Todos",
    icon: CheckSquare,
    description: "Schedule and track tasks",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    hoverBg: "group-hover:bg-orange-100",
    href: "/dashboard/todos-agenda",
  },
  {
    title: "Challenge Track Creation",
    icon: Trophy,
    description: "Design competition tracks",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    hoverBg: "group-hover:bg-yellow-100",
    href: "/dashboard/track-creation",
  },
  {
    title: "Live Event Support",
    icon: Headphones,
    description: "Real-time event assistance",
    color: "text-red-600",
    bgColor: "bg-red-50",
    hoverBg: "group-hover:bg-red-100",
    href: "/dashboard/live-support",
  },
  {
    title: "Fundraising Partnerships",
    icon: Handshake,
    description: "Secure funding and sponsors",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    hoverBg: "group-hover:bg-teal-100",
    href: "/dashboard/partnerships",
  },
  {
    title: "Mission Tracking",
    icon: Target,
    description: "Monitor goals and progress",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    hoverBg: "group-hover:bg-pink-100",
    href: "/dashboard/tracking",
  },
];

export default function FeatureGrid() {
  const [showUnavailable, setShowUnavailable] = React.useState(false);
  const [vibratingCard, setVibratingCard] = React.useState<number | null>(null);

  const handleCardClick = (e: React.MouseEvent, feature: any, index: number) => {
    if (feature.title === "Fundraising Partnerships") {
      e.preventDefault();
      setVibratingCard(index);
      setShowUnavailable(true);
      
      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      
      // Reset vibration and hide overlay after animation
      setTimeout(() => setVibratingCard(null), 600);
      setTimeout(() => setShowUnavailable(false), 2000);
    }
  };

  return (
    <>
      {/* Red overlay for unavailable feature */}
      {showUnavailable && (
        <div className="fixed inset-0 bg-red-500/20 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in-0 duration-300">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          const isPartnerships = feature.title === "Fundraising Partnerships";
          const isVibrating = vibratingCard === index;
          
          if (isPartnerships) {
            return (
              <div 
                key={index} 
                onClick={(e) => handleCardClick(e, feature, index)}
                className="block group cursor-pointer"
              >
                <Card className={`hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-neutral-200 hover:border-[#1e40af]/30 relative overflow-hidden ${isVibrating ? 'animate-pulse' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${feature.bgColor} ${feature.hoverBg} group-hover:scale-110 transition-all duration-300 shadow-sm ${isVibrating ? 'animate-bounce' : ''}`}>
                        <IconComponent className={`h-6 w-6 ${feature.color} transition-transform group-hover:rotate-6`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-neutral-900 mb-2 group-hover:text-[#1e40af] transition-colors leading-tight">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-neutral-600 leading-relaxed group-hover:text-neutral-700 transition-colors">
                          {feature.description}
                        </p>
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-xs font-medium text-[#1e40af] flex items-center gap-1">
                            Coming soon →
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          }

          return (
            <Link key={index} href={feature.href} className="block group" aria-label={`${feature.title} page`}>
              <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-neutral-200 hover:border-[#1e40af]/30 relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${feature.bgColor} ${feature.hoverBg} group-hover:scale-110 transition-all duration-300 shadow-sm`}>
                      <IconComponent className={`h-6 w-6 ${feature.color} transition-transform group-hover:rotate-6`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-neutral-900 mb-2 group-hover:text-[#1e40af] transition-colors leading-tight">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-neutral-600 leading-relaxed group-hover:text-neutral-700 transition-colors">
                        {feature.description}
                      </p>
                      <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-xs font-medium text-[#1e40af] flex items-center gap-1">
                          Explore →
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
