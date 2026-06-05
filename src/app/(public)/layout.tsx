import React from 'react';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: We will eventually move the Navbar state logic here or into a specialized provider
  return (
    <div className="min-h-screen flex flex-col bg-base-cream text-steel-black">
      {/* 
          Standardized Navbar for public pages. 
          Initially, we'll use a simplified version or 
          migrate the existing one to handle Next.js navigation.
      */}
      <main className="flex-grow">
        {children}
      </main>
      <Footer 
        onChangeView={() => {}} // This will be handled by Next.js Links
        onOpenModal={() => {}} 
      />
    </div>
  );
}
