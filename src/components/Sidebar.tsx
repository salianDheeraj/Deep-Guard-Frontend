"use client";

import React, { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, PlusSquare, History, User, LogOut, ShieldCheck, LucideIcon } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface NavItem {
	name: string;
	href: string;
	icon: LucideIcon;
}

const Sidebar = () => {
	const pathname = usePathname();
	const sidebarRef = useRef<HTMLDivElement>(null); 
	const navRef = useRef<HTMLElement>(null); // Ref for the <nav> element (for measurement)
	const indicatorRef = useRef<HTMLDivElement>(null); // Ref for the sliding bar element
	const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]); // Array ref for measuring link positions

	const navItems: NavItem[] = [
		{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
		{ name: 'New Analysis', href: '/dashboard/new-analysis', icon: PlusSquare },
		{ name: 'History', href: '/dashboard/history', icon: History },
		{ name: 'Account', href: '/dashboard/account', icon: User },
	];

	// Helper to determine the active route.
	const isActive = (href: string) => {
        // If the path is exactly /dashboard
        if (href === '/dashboard' && pathname === '/dashboard') return true;
        // For sub-paths, check if the current path starts with the link's href
        if (href !== '/dashboard' && pathname.startsWith(href)) return true;
        return false;
    };

	// --- 1. Initial Load Animations (Sidebar Slide-in, Logo Pulse, Link Stagger) ---
	useGSAP(() => {
		// A. Sidebar Slide-in
		gsap.from(sidebarRef.current, {
			x: -100,
			opacity: 0,
			duration: 0.6,
			ease: "power3.out",
		});

        // B. LOGO PULSE ANIMATION (The focused animation)
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

		// C. Link Stagger (Runs after the logo pulse settles)
		gsap.from(".nav-link-item", {
			opacity: 0,
			y: 10,
			stagger: 0.1,
			delay: 1.0, // Start after logo pulse settles
			duration: 0.5,
			ease: "power2.out"
		});

	}, { scope: sidebarRef });

	// --- 2. Dynamic Indicator Movement (Runs on route change) ---
	useEffect(() => {
		// This must run after the initial render to get accurate DOM measurements
		if (navRef.current) {
			const activeIndex = navItems.findIndex(item => isActive(item.href));
			const activeElement = itemRefs.current[activeIndex];
			
			if (activeElement && indicatorRef.current) {
				
				// Calculate position relative to the <nav> element
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
				// Hide indicator if no link is active
				gsap.to(indicatorRef.current, { opacity: 0, duration: 0.2 });
			}
		}
	}, [pathname]);


	// 3. Link Hover Animation
	const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>, isEntering: boolean) => {
		gsap.to(e.currentTarget, {
			scale: isEntering ? 1.02 : 1,
			x: isEntering ? 5 : 0,
			duration: 0.2,
			ease: "power1.inOut",
		});
	};
    
    // Reset the array ref to prevent measurement issues on re-render
    itemRefs.current = [];

	return (
		<div ref={sidebarRef} className="w-64 h-screen bg-white shadow-md flex flex-col justify-between flex-shrink-0">
			<div>
				{/* Logo/Title Section */}
				<div className="flex items-center justify-start p-6 border-b border-gray-100">
					{/* TARGETED BY GSAP FOR PULSE */}
					<ShieldCheck size={28} className="text-blue-600 logo-shield-icon" /> 
					<h1 className="text-xl font-bold ml-2 text-blue-600">Deepfake Detector</h1>
				</div>
				
				{/* NAVIGATION CONTAINER */}
				<nav ref={navRef} className="mt-6 relative"> 
					{/* INDICATOR BAR ELEMENT (GSAP TARGET) */}
					<div 
						ref={indicatorRef} 
						className="absolute left-0 w-1 h-1 bg-blue-600 rounded-r-lg opacity-0"
						style={{ transform: 'translateY(0px)' }}
					/>
					
					{navItems.map((item, index) => (
						<Link
							key={item.name}
							href={item.href}
                            // Store the ref for accurate position measurement
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
			
			{/* Logout Section */}
			<div className="p-6 border-t border-gray-100">
				<Link
					href="/logout"
					className="flex items-center py-3 px-6 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
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