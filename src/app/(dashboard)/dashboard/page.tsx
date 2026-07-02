'use client';

import React from 'react';
import { useAuthStore } from '@/store/hooks';
import { ShieldCheck, Package, Clock, Zap } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    { name: 'Active Orders', value: '0', icon: Package, color: 'text-blue-600' },
    { name: 'Offers Sent', value: '0', icon: Zap, color: 'text-amber-600' },
    { name: 'Saved Parts', value: '0', icon: ShieldCheck, color: 'text-emerald-600' },
    { name: 'Last Login', value: 'Just now', icon: Clock, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm">
        <h2 className="text-2xl font-display font-black text-steel-black uppercase tracking-tight">
          Welcome back, {user?.email?.split('@')[0]}
        </h2>
        <p className="text-zinc-500 font-sans mt-2">
          Track your orders, manage your profile, and see your saved parts all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-display font-bold text-zinc-400 tracking-widest">{stat.name}</p>
              <p className="text-2xl font-display font-black text-steel-black mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-zinc-50 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="font-display font-bold uppercase text-zinc-800 tracking-wider border-b border-zinc-100 pb-4 mb-4">
            Recent Activity
          </h3>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <Clock className="w-12 h-12 text-zinc-200" />
            <p className="text-zinc-400 text-sm font-sans">No recent activity found.</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="font-display font-bold uppercase text-zinc-800 tracking-wider border-b border-zinc-100 pb-4 mb-4">
            Saved Listings
          </h3>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <Zap className="w-12 h-12 text-zinc-200" />
            <p className="text-zinc-400 text-sm font-sans">You haven&apos;t saved any parts yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
