import { useState, useRef, useEffect } from 'react';

export const useNavbarState = (initialSearchText: string = '') => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isUserMenuDrawerOpen, setIsUserMenuDrawerOpen] = useState(false);
  const [navSearchText, setNavSearchText] = useState(initialSearchText);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [placeholderText, setPlaceholderText] = useState("Search parts, VIN...");

  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setPlaceholderText(window.innerWidth >= 1024 ? "Search part, make, model or VIN..." : "Search parts, VIN...");
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    // Only update if prop actually changes
    if (initialSearchText !== navSearchText) {
        setNavSearchText(initialSearchText);
    }
  }, [initialSearchText]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      function handleClickOutside(event: MouseEvent) {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
          setIsUserMenuOpen(false);
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  const handleAvatarClick = () => {
    if (typeof window !== 'undefined') {
      const isMobileOrTablet = window.innerWidth < 1024;
      if (isMobileOrTablet) {
        setIsUserMenuDrawerOpen(true);
      } else {
        setIsUserMenuOpen(!isUserMenuOpen);
      }
    }
  };

  return {
    isUserMenuOpen, setIsUserMenuOpen,
    isMobileDrawerOpen, setIsMobileDrawerOpen,
    isUserMenuDrawerOpen, setIsUserMenuDrawerOpen,
    navSearchText, setNavSearchText,
    isDropdownOpen, setIsDropdownOpen,
    toastMsg, setToastMsg,
    placeholderText,
    userMenuRef,
    showToast,
    handleAvatarClick
  };
};
