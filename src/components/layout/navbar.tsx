"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import Image from "next/image"
import logo from "@/assets/images/logo.png"

import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "About",
    href: "/about",
  },
  {
    title: "Services",
    href: "/services",
    children: [
      {
        title: "Visa Services",
        href: "/services/visa",
        description: "Comprehensive visa processing and consultation",
      },
      {
        title: "Document Assistance",
        href: "/services/documents",
        description: "Help with documentation and preparation",
      },
      {
        title: "Consultation",
        href: "/services/consultation",
        description: "Professional immigration consultation",
      },
    ],
  },
  {
    title: "Resources",
    href: "/resources",
    children: [
      {
        title: "Guides",
        href: "/resources/guides",
        description: "Detailed guides on visa application processes",
      },
      {
        title: "FAQ",
        href: "/resources/faq",
        description: "Frequently asked questions answered",
      },
      {
        title: "News",
        href: "/resources/news",
        description: "Latest updates on immigration policies",
      },
    ],
  },
  {
    title: "Contact",
    href: "/contact",
  },
]

interface NavbarProps {
  className?: string
}

export function Navbar({ className }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image src={logo} alt="SRRV" className="h-12 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                {item.children ? (
                  <>
                    <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {item.children.map((child) => (
                          <ListItem
                            key={child.href}
                            title={child.title}
                            href={child.href}
                          >
                            {child.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href}
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-bold transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[active]:text-accent-foreground"
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Trigger */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <div key={item.href} className="flex flex-col space-y-2">
                  <Link
                    href={item.href}
                    className="text-sm font-bold transition-colors hover:text-primary py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                  {item.children && (
                    <div className="ml-4 flex flex-col space-y-2 border-l pl-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="text-xs font-bold text-muted-foreground transition-colors hover:text-foreground py-1"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Separator className="my-4" />
              <div className="flex flex-col space-y-2">
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Log In
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start">
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

function ListItem({
  className,
  title,
  children,
  href,
  onSelect: _onSelect,  // ← extract and discard
  ...props
}: React.ComponentProps<typeof NavigationMenuLink> & {
  title: string
  href: string
  children?: React.ReactNode
}) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active]:bg-accent/50 data-[active]:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-bold leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}