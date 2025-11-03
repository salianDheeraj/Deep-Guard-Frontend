// src/components/Sidebar.tsx
"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, PlusSquare, History, User, LogOut, ShieldCheck, LucideIcon } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const Sidebar = () => {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'New Analysis', href: '/dashboard/new-analysis', icon: PlusSquare },
    { name: 'History', href: '/dashboard/history', icon: History },
    { name: 'Account', href: '/dashboard/account', icon: User },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="w-64 h-screen bg-white shadow-md flex flex-col justify-between flex-shrink-0">
      <div>
        {/* Logo/Title Section - Matches image */}
        <div className="flex items-center justify-start p-6 border-b border-gray-100">
          <ShieldCheck size={28} className="text-blue-600" />
          <h1 className="text-xl font-bold ml-2 text-blue-600">Deepfake Detector</h1>
        </div>
        <nav className="mt-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center py-3 px-6 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors
                ${isActive(item.href) ? 'bg-gray-100 text-gray-900 font-medium' : ''}`}
            >
              <item.icon size={20} className="mr-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-6 border-t border-gray-100">
        <Link
          href="/logout"
          className="flex items-center py-3 px-6 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
        >
          <LogOut size={20} className="mr-4" />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;