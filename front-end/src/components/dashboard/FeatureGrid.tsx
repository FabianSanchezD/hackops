"use client";

import * as React from "react";
import { Card, CardContent } from "../ui/card";
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
    badge: "Essential",
  },
  {
    title: "Team Management",
    icon: UsersRound,
    description: "Organize and manage teams",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    hoverBg: "group-hover:bg-indigo-100",
    badge: "Core",
  },
  {
    title: "Speaker Jury Orchestration",
    icon: Mic,
    description: "Coordinate speakers and judges",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    hoverBg: "group-hover:bg-purple-100",
    badge: "Premium",
  },
  {
    title: "Community Growth",
    icon: TrendingUp,
    description: "Build and expand community",
    color: "text-green-600",
    bgColor: "bg-green-50",
    hoverBg: "group-hover:bg-green-100",
    badge: "Growth",
  },
  {
    title: "Agenda/Todos",
    icon: CheckSquare,
    description: "Schedule and track tasks",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    hoverBg: "group-hover:bg-orange-100",
    badge: "Daily",
  },
  {
    title: "Challenge Track Creation",
    icon: Trophy,
    description: "Design competition tracks",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    hoverBg: "group-hover:bg-yellow-100",
    badge: "Creative",
  },
  {
    title: "Live Event Support",
    icon: Headphones,
    description: "Real-time event assistance",
    color: "text-red-600",
    bgColor: "bg-red-50",
    hoverBg: "group-hover:bg-red-100",
    badge: "24/7",
  },
  {
    title: "Fundraising Partnerships",
    icon: Handshake,
    description: "Secure funding and sponsors",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    hoverBg: "group-hover:bg-teal-100",
    badge: "Business",
  },
  {
    title: "Mission Tracking",
    icon: Target,
    description: "Monitor goals and progress",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    hoverBg: "group-hover:bg-pink-100",
    badge: "Analytics",
  },
];

export default function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <Card
            key={index}
            className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-neutral-200 hover:border-[#1e40af]/30 relative overflow-hidden"
          >
            <div className="absolute top-3 right-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${feature.bgColor} ${feature.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                {feature.badge}
              </span>
            </div>
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
        );
      })}
    </div>
  );
}
