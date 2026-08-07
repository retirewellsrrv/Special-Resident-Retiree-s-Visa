"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import Image from "next/image";
import logo from "@/assets/images/logo.jpg";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import { LogoutBtn } from "@/components/auth/logout-btn";
import {
  isNavigationLocked,
  subscribeNavigationLock,
} from "@/lib/navigation-lock";

interface NavbarProps {
  className?: string;
  user: User | null;
}

const navItems = [
  { title: "Services", href: "/services" },
  { title: "Packages", href: "/packages" },
  { title: "Contact", href: "/contact" },
  { title: "FAQs", href: "/faqs" },
  { title: "About Us", href: "/about" },
];

export function Navbar({ className, user }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const isLocked = React.useSyncExternalStore(
    subscribeNavigationLock,
    isNavigationLocked,
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.06),0_4px_6px_-1px_rgba(0,0,0,0.07),0_2px_4px_-2px_rgba(0,0,0,0.05)]",
        className,
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image src={logo} alt="SRRV" className="h-14 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-x-8 pr-4">
            {navItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    aria-disabled={isLocked}
                    onClick={(e) => isLocked && e.preventDefault()}
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-[#81001C] focus:bg-accent focus:text-[#81001C] focus:outline-none",
                      isLocked &&
                        "pointer-events-none opacity-50 hover:bg-transparent hover:text-[#81001C]",
                    )}
                  >
                    {item.title}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <LogoutBtn />
          ) : (
            <>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Log In</Link>
              </Button>

              <Button size="lg" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
            <div className="flex h-full flex-col">
              {/* Brand header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Image src={logo} alt="SRRV" className="h-12 w-auto" />
                </Link>
              </div>

              {/* Navigation links */}
              <nav className="flex-1 overflow-y-auto px-3 pt-3">
                <div className="space-y-0.5">
                  <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    Menu
                  </p>
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-disabled={isLocked}
                      onClick={(e) => {
                        if (isLocked) {
                          e.preventDefault();
                          return;
                        }
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-primary-50 hover:text-brand-primary-600",
                        isLocked && "pointer-events-none opacity-50",
                      )}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Footer actions */}
              <div className="border-t border-gray-100 px-5 py-4">
                {user ? (
                  <LogoutBtn
                    className="w-full justify-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="lg"
                      asChild
                      className="w-full"
                    >
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Log In
                      </Link>
                    </Button>
                    <Button size="lg" asChild className="w-full">
                      <Link
                        href="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
