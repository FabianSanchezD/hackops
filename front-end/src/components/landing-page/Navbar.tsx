"use client";
import React, { useState } from "react";
import Image from "next/image";

const Navbar: React.FC = () => {
	const [open, setOpen] = useState(false);
	return (
		<nav className="fixed top-0 left-0 w-full z-50 bg-[#0a174e]/90 backdrop-blur border-b border-blue-900 text-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				<a href="#" className="flex items-center gap-2 font-bold text-2xl tracking-tight">
					<Image
						src="/icons/Hackops_Logo_White.svg"
						alt="HackOps Logo"
						width={27}
						height={27}
						className="object-contain"
						priority
					/>
					<span className="leading-none m-0">HackOps</span>
				</a>
				<button
					className="md:hidden p-2 rounded hover:bg-white/10"
					aria-label="Toggle menu"
					onClick={() => setOpen(!open)}
				>
					<span className="block w-6 h-0.5 bg-white mb-1"></span>
					<span className="block w-6 h-0.5 bg-white mb-1"></span>
					<span className="block w-6 h-0.5 bg-white"></span>
				</button>
				<ul className="hidden md:flex gap-8 font-medium items-center">
					<li><a href="#features" className="hover:text-blue-300 transition">Features</a></li>
					<li><a href="#demo" className="hover:text-blue-300 transition">Demo</a></li>
					<li><a href="#integrations" className="hover:text-blue-300 transition">Integrations</a></li>
					<li><a href="#get-access" className="hover:text-blue-300 transition">Get Access</a></li>
					<li>
						<a href="/login" className="ml-2 inline-flex items-center rounded-md px-3 py-1.5 text-sm font-semibold bg-white text-[#0a174e] hover:bg-blue-50 transition">
							for the hackathon viewers
						</a>
					</li>
				</ul>
			</div>
			{open && (
				<ul className="md:hidden px-4 pb-4 space-y-2 bg-[#0a174e]/95">
					<li><a onClick={() => setOpen(false)} href="#features" className="block py-2 hover:text-blue-300">Features</a></li>
					<li><a onClick={() => setOpen(false)} href="#demo" className="block py-2 hover:text-blue-300">Demo</a></li>
					<li><a onClick={() => setOpen(false)} href="#integrations" className="block py-2 hover:text-blue-300">Integrations</a></li>
					<li><a onClick={() => setOpen(false)} href="#get-access" className="block py-2 hover:text-blue-300">Get Access</a></li>
					<li><a onClick={() => setOpen(false)} href="/login" className="block py-2 text-white/90 bg-white/5 rounded hover:bg-white/10">for the hackathon viewers</a></li>
				</ul>
			)}
		</nav>
	);
};

export default Navbar;
