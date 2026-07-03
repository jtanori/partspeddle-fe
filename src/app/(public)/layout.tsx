"use client";

import React from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-base-cream text-steel-black">
      {children}
    </div>
  );
}
