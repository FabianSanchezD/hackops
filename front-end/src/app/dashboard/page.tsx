import React from "react";
import Navbar from "../../components/dashboard/Navbar";
import FeatureGrid from "../../components/dashboard/FeatureGrid";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50/30">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8">
        <div className="mb-2 px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Dashboard
              </h1>
              <p className="text-neutral-600">
                Manage your hackathon operations from one central hub.
              </p>
            </div>
        
          </div>
        </div>
        <FeatureGrid />
        
        {/* Quick Stats */}
        <div className="mt-6 px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-neutral-200 text-center">
              <div className="text-2xl font-bold text-blue-600">127</div>
              <div className="text-sm text-neutral-600">Participants</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-neutral-200 text-center">
              <div className="text-2xl font-bold text-green-600">23</div>
              <div className="text-sm text-neutral-600">Team Members</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-neutral-200 text-center">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-sm text-neutral-600">Challenge Tracks</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-neutral-200 text-center">
              <div className="text-2xl font-bold text-orange-600">72h</div>
              <div className="text-sm text-neutral-600">Time Remaining until Hackathon</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}