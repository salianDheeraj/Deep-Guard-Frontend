"use client";

import React, { useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    LayoutGrid, 
    ScanEye, 
    FileClock, 
    CircleUser, 
    LogOut, 
    ShieldCheck, 
    LucideIcon 
} from 'lucide-react'; 
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import UserProfileCard from './UserProfileCard';
import ThemeToggleButton from './ThemeToggleButton';

import styles from '@/styles/Sidebar.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();

    const sidebarRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLElement>(null);
    const indicatorRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    const navItems: NavItem[] = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
        { name: 'New Analysis', href: '/dashboard/new-analysis', icon: ScanEye },
        { name: 'History', href: '/dashboard/history', icon: FileClock },
        { name: 'Account', href: '/dashboard/account', icon: CircleUser },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard' && pathname === '/dashboard') return true;
        if (href !== '/dashboard' && pathname.startsWith(href)) return true;
        return false;
    };

    // ... (Animations kept same as before) ...
    useGSAP(() => {
        gsap.from(sidebarRef.current, {
            x: -100,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
        });
        gsap.fromTo(".logo-shield-icon",
            { scale: 0.5, opacity: 0, rotation: -45 },
            { scale: 1, opacity: 1, rotation: 0, duration: 0.6, ease: "back.out(2)", delay: 0.2 }
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

    useEffect(() => {
        const activeIndex = navItems.findIndex(item => isActive(item.href));
        const activeElement = itemRefs.current[activeIndex];

        if (activeElement && indicatorRef.current && navRef.current) {
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
    }, [pathname, navItems]);

    const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>, isEntering: boolean) => {
        gsap.to(e.currentTarget, {
            scale: isEntering ? 1.02 : 1,
            x: isEntering ? 5 : 0,
            duration: 0.2,
            ease: "power1.inOut",
        });
    };

    itemRefs.current = [];

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
            router.push("/login");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <div ref={sidebarRef} className={styles.sidebar}>
            <div>
                {/* --- LOGO SECTION --- */}
                <div className={styles.logoContainer}>
                    {/* Icon: Solid Blue (Light) / Cyan (Dark) for visibility */}
                    <ShieldCheck size={28} className={`${styles.logoIcon} logo-shield-icon !text-blue-600 dark:!text-cyan-400`} />
                    
                    {/* Text: Gradient Blue+Pink (Light) / Cyan+Purple (Dark) */}
                    <h1 className={`${styles.logoText} !bg-clip-text !text-transparent !bg-gradient-to-r !from-blue-600 !to-pink-500 dark:!from-cyan-400 dark:!to-purple-500`}>
                        Deep-Guard
                    </h1>
                </div>

                {/* --- NAV SECTION --- */}
                <nav ref={navRef} className={styles.nav}>
                    {/* Active Indicator: Gradient Background */}
                    <div
                        ref={indicatorRef}
                        className={`${styles.indicator} !bg-gradient-to-b !from-blue-600 !to-pink-500 dark:!from-cyan-400 dark:!to-purple-500`}
                        style={{ transform: 'translateY(0px)' }}
                    />

                    {navItems.map((item, index) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                ref={(el) => { itemRefs.current[index] = el; }}
                                className={`${styles.navItem} nav-link-item group`}
                                onMouseEnter={(e) => handleLinkHover(e, true)}
                                onMouseLeave={(e) => handleLinkHover(e, false)}
                            >
                                {/* Icon: Solid Color if active, Gray if inactive (hover effect handled via CSS/GSAP usually) */}
                                <item.icon 
                                    size={20} 
                                    className={`${styles.navIcon} 
                                        ${active 
                                            ? '!text-blue-600 dark:!text-cyan-400' 
                                            : 'group-hover:!text-blue-500 dark:group-hover:!text-cyan-300'
                                        }`} 
                                />
                                
                                {/* Text: Gradient if active */}
                                <span className={
                                    active 
                                        ? `!bg-clip-text !text-transparent !bg-gradient-to-r !from-blue-600 !to-pink-500 dark:!from-cyan-400 dark:!to-purple-500 font-medium`
                                        : `group-hover:!text-blue-600 dark:group-hover:!text-cyan-400`
                                }>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* --- BOTTOM SECTION --- */}
            <div className={styles.bottomSection}>
                <div className={styles.themeToggleContainer}>
                    <ThemeToggleButton />
                </div>

                <div className={styles.userProfileContainer}>
                    <UserProfileCard />
                </div>

                {/* Logout Button: Hover Gradient */}
                <button
                    onClick={handleLogout}
                    className={`${styles.logoutButton} group transition-all duration-300`}
                >
                    <LogOut 
                        size={20} 
                        className="mr-4 group-hover:!text-blue-600 dark:group-hover:!text-cyan-400" 
                    />
                    <span className="group-hover:!bg-clip-text group-hover:!text-transparent group-hover:!bg-gradient-to-r group-hover:!from-blue-600 group-hover:!to-pink-500 dark:group-hover:!from-cyan-400 dark:group-hover:!to-purple-500">
                        Logout
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;