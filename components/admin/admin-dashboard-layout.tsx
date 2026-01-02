"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  CreditCard, 
  Users, 
  Package,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  TrendingUp,
  DollarSign,
  ShoppingCart as ShoppingCartIcon,
  User
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

const adminMenuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { title: "Portfolio", icon: BarChart3, href: "/admin/portfolio" },
  { title: "Services", icon: ShoppingCart, href: "/admin/services" },
  { title: "Products", icon: Package, href: "/admin/products" },
  { title: "Orders", icon: ShoppingCartIcon, href: "/admin/orders" },
  { title: "Payments", icon: CreditCard, href: "/admin/payments" },
  { title: "Users", icon: Users, href: "/admin/users" },
  { title: "Announcements", icon: Bell, href: "/admin/announcements" },
  { title: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-muted/40">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed md:static z-40 h-full bg-background border-r w-64 transition-transform duration-300 ease-in-out transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Admin Panel
          </h2>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <div 
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-background border-b p-4 flex items-center justify-between">
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-4 py-2 border rounded-lg text-sm w-64"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}