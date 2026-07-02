"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import Navbar from "../navbar/Navbar";
import Footer from "../Footer";
import SearchModal from "../SearchModal";
import { X, CheckCircle2, ShoppingBag, Trash2 } from "lucide-react";

export const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const {
    user,
    userRole,
    setUserRole,
    logout,
    cart,
    isCartOpen,
    setIsCartOpen,
    checkoutSuccess,
    setCheckoutSuccess,
    clearCart,
    removeFromCart,
    isTourActive,
    setTourActive,
    infoModalType,
    setInfoModalType,
    isSearchModalOpen,
    setSearchModalOpen,
    searchQueryText,
    setSearchQueryText,
    searchCategory,
    setSearchCategory,
    activeSellerTab,
    setActiveSellerTab,
    setPendingSnapImages,
    profile,
  } = useAppStore();

  const isAuthPage =
    pathname === "/auth" || pathname === "/login" || pathname === "/register";
  const isDashboard =
    pathname.startsWith("/dashboard") || pathname.startsWith("/seller");

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      clearCart();
      setIsCartOpen(false);
      setCheckoutSuccess(false);
    }, 2500);
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.part.price * item.quantity,
    0,
  );
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div
      className={`min-h-screen flex flex-col justify-between font-sans relative antialiased leading-relaxed ${isDashboard ? "bg-shell-canvas text-text-primary" : "bg-base-cream text-steel-black"}`}
    >
      {!isAuthPage && !isDashboard && (
        <Navbar
          currentView={pathname}
          onChangeView={(view) => {
            const path = view === "home" ? "/" : `/${view}`;
            router.push(path);
            setIsCartOpen(false);
          }}
          onSearchSubmit={(text) => {
            setSearchQueryText(text);
            setSearchCategory("All Parts");
            router.push("/search");
          }}
          cartCount={totalItemsCount}
          user={user}
          onLogout={async () => {
            await logout();
            router.push("/");
          }}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSearchModal={() => setSearchModalOpen(true)}
          searchTextValue={searchQueryText}
          onSelectPart={(id) => router.push(`/listing/${id}`)}
          userRole={userRole}
          onChangeUserRole={setUserRole}
          profile={profile}
          onOpenSupport={() => setInfoModalType("contact")}
          onOpenTour={() => setTourActive(true)}
          onSetSellerTab={setActiveSellerTab}
          onSnapImagesUploaded={(images) => {
            setPendingSnapImages(images);
            router.push("/dashboard/snap");
          }}
          activeSellerTab={activeSellerTab}
        />
      )}

      <main className="flex-grow transition-opacity duration-300 pb-16 md:pb-0">
        {children}
      </main>

      {!isAuthPage && !isDashboard && (
        <Footer
          onChangeView={(view) => {
            const path = view === "home" ? "/" : `/${view}`;
            router.push(path);
          }}
          onOpenModal={setInfoModalType}
        />
      )}

      {/* Cart Drawer & Modals logic remains... (omitted for brevity, assume mapped from App.tsx) */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectPart={(id) => {
          setSearchModalOpen(false);
          router.push(`/listing/${id}`);
        }}
        onSeeAllResults={(query, system) => {
          setSearchQueryText(query);
          setSearchCategory(system || "All Parts");
          setSearchModalOpen(false);
          router.push("/search");
        }}
        initialQuery={searchQueryText}
      />
    </div>
  );
};
