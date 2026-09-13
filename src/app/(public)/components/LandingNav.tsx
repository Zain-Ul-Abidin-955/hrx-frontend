"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CloseOutlined, MenuOutlined } from "@ant-design/icons";

interface LandingNavProps {
  onGetStarted: () => void;
  dashboardPath?: string | null;
}

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Platform", href: "#platform" },
  { label: "Why HRX", href: "#why" },
  { label: "Jobs", href: "/jobs" },
];

const LandingNav: React.FC<LandingNavProps> = ({
  onGetStarted,
  dashboardPath,
}) => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (href: string) => {
    setMenuOpen(false);
    if (href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(href);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled || menuOpen
          ? "border-b border-lineColor bg-nightColor/92 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accentColor to-glowColor text-sm font-bold text-white">
            H
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-lightColor">
            HRX <span className="text-mutedColor">AI</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => goTo(link.href)}
              className="rounded-lg px-3.5 py-2 text-sm text-mutedColor transition-colors hover:bg-white/5 hover:text-lightColor"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {dashboardPath ? (
            <button
              type="button"
              onClick={() => router.push(dashboardPath)}
              className="rounded-lg bg-accentColor px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accentDeepColor"
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="hidden rounded-lg px-3.5 py-2 text-sm text-mutedColor transition-colors hover:text-lightColor sm:block"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={onGetStarted}
                className="rounded-lg bg-lightColor px-4 py-2 text-sm font-medium text-nightColor transition-colors hover:bg-white"
              >
                Get started
              </button>
            </>
          )}

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="ml-1 rounded-lg p-2 text-mutedColor transition-colors hover:bg-white/5 hover:text-lightColor md:hidden"
          >
            {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-lineColor bg-nightColor/95 px-5 py-3 backdrop-blur-xl md:hidden">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => goTo(link.href)}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-mutedColor transition-colors hover:bg-white/5 hover:text-lightColor"
            >
              {link.label}
            </button>
          ))}
          {!dashboardPath && (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                router.push("/login");
              }}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-mutedColor transition-colors hover:bg-white/5 hover:text-lightColor sm:hidden"
            >
              Sign in
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default LandingNav;
