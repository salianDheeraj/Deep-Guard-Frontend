"use client";

import React, { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, PlusSquare, History, User, LogOut, ShieldCheck, LucideIcon } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import UserProfileCard from './UserProfileCard'; // ✅ IMPORTED

interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

const Sidebar = () => {
    const pathname = usePathname();
    const sidebarRef = useRef<HTMLDivElement>(null); 
    const navRef = useRef<HTMLElement>(null);
    const indicatorRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    const navItems: NavItem[] = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'New Analysis', href: '/dashboard/new-analysis', icon: PlusSquare },
        { name: 'History', href: '/dashboard/history', icon: History },
        { name: 'Account', href: '/dashboard/account', icon: User },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard' && pathname === '/dashboard') return true;
        if (href !== '/dashboard' && pathname.startsWith(href)) return true;
        return false;
    };

    // --- 1. Initial Load Animations ---
    useGSAP(() => {
        gsap.from(sidebarRef.current, {
            x: -100,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
        });

        gsap.fromTo(".logo-shield-icon", 
            { scale: 0.5, opacity: 0, rotation: -45 }, 
            { 
                scale: 1, 
                opacity: 1, 
                rotation: 0,
                duration: 0.6, 
                ease: "back.out(2)", 
                delay: 0.2
            }
        );

        gsap.from(".nav-link-item", {
            opacity: 0,
            y: 10,
            stagger: 0.1,
            delay: 1.0,
            duration: 0.5,
            ease: "power2.out"
        });

    }, { scope: sidebarRef });

    // --- 2. Dynamic Indicator Movement ---
    useEffect(() => {
        if (navRef.current) {
            const activeIndex = navItems.findIndex(item => isActive(item.href));
            const activeElement = itemRefs.current[activeIndex];
            
            if (activeElement && indicatorRef.current) {
                const navTop = navRef.current.getBoundingClientRect().top;
                const elementTop = activeElement.getBoundingClientRect().top;
                const topPosition = elementTop - navTop;

                gsap.to(indicatorRef.current, {
                    y: topPosition,
                    height: activeElement.offsetHeight,
                    opacity: 1,
                    duration: 0.4,
                    ease: "power2.inOut",
                });
            } else if (indicatorRef.current) {
                gsap.to(indicatorRef.current, { opacity: 0, duration: 0.2 });
            }
        }
    }, [pathname, navItems]);


    // 3. Link Hover Animation
    const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>, isEntering: boolean) => {
        gsap.to(e.currentTarget, {
            scale: isEntering ? 1.02 : 1,
            x: isEntering ? 5 : 0,
            duration: 0.2,
            ease: "power1.inOut",
        });
    };
    
    itemRefs.current = [];

    return (
        <div ref={sidebarRef} className="w-64 h-screen bg-white shadow-md flex flex-col justify-between flex-shrink-0 border-r border-gray-100">
            <div>
                {/* Logo/Title Section */}
                <div className="flex items-center justify-start p-6 border-b border-gray-100">
                    <ShieldCheck size={28} className="text-blue-600 logo-shield-icon" /> 
                    <h1 className="text-xl font-bold ml-2 text-blue-600">Deep-Guard</h1>
                </div>
                
                {/* NAVIGATION CONTAINER */}
                <nav ref={navRef} className="mt-6 relative"> 
                    <div 
                        ref={indicatorRef} 
                        className="absolute left-0 w-1 h-1 bg-blue-600 rounded-r-lg opacity-0"
                        style={{ transform: 'translateY(0px)' }}
                    />
                    
                    {navItems.map((item, index) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            ref={el => { itemRefs.current[index] = el; }}
                            className={`flex items-center py-3 px-6 text-gray-600 transition-colors nav-link-item 
                                relative z-10 
                                ${isActive(item.href) 
                                    ? 'bg-gray-100 text-gray-900 font-medium active-link' 
                                    : 'hover:bg-gray-100 hover:text-gray-900'}`}
                            onMouseEnter={(e) => handleLinkHover(e, true)}
                            onMouseLeave={(e) => handleLinkHover(e, false)}
                        >
                            <item.icon size={20} className="mr-4" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>
            
            {/* ✅ Bottom Section (Profile + Logout) */}
            <div className="p-4 border-t border-gray-100 space-y-4">
                
                {/* ADDED User Profile Card */}
                <div className="p-2 bg-gray-50 rounded-lg">
                  <UserProfileCard />
                </div>

                {/* Logout Link */}
                <Link
                    href="/logout"
                    className="flex items-center py-2 px-3 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                    onMouseEnter={(e) => handleLinkHover(e, true)}
                    onMouseLeave={(e) => handleLinkHover(e, false)}
                >
                    <LogOut size={20} className="mr-4" />
                    <span>Logout</span>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;