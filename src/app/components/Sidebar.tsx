
"use client"; // Added: Mark as a client component

import React from 'react'; // Added: Good practice to explicitly import React
import Link from 'next/link';
import { LayoutDashboard, History, User, LogOut, PlusCircle, LucideIcon } from 'lucide-react'; // Import LucideIcon type if needed for stronger typing

// 1. Defined type for navigation items for better type safety
interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon; // Using LucideIcon type for the icon component
}

const navItems: NavItem[] = [ // Applied the NavItem type to the array
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'New Analysis', href: '/dashboard/new-analysis', icon: PlusCircle },
  { name: 'History', href: '/dashboard/history', icon: History },
  { name: 'Account', href: '/dashboard/account', icon: User },
];

export default function Sidebar() {
  return (
    // You might want to define a fixed width for the sidebar, e.g., w-64
    // And ensure it has a height (e.g., h-screen or min-h-screen)
    <div className="flex h-screen flex-col justify-between border-r border-gray-200 bg-white p-4 w-64"> {/* Added w-64 and h-screen */}
      <div>
        {/* Logo/Title Section */}
        <div className="mb-8 flex items-center p-2">
          {/* You could add a logo image here */}
          <span className="text-xl font-bold text-blue-600">Deepfake Detector</span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon; // Already correctly extracting the icon component
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 rounded-lg p-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600"
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Link */}
      <Link
        href="/logout" // Consider making this a button with an actual logout function
        className="flex items-center space-x-3 rounded-lg p-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </Link>
    </div>
  );
}