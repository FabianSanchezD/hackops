import React from "react";
import Image from "next/image";
import Link from "next/link";

const DemoPreview: React.FC = () => (
	<section id="demo" className="py-20 bg-[#19376d] text-white px-4 flex flex-col items-center">
		<h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Dashboard Demo Preview</h2>
		<div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-900 bg-[#0a174e] flex justify-center items-center min-h-[320px]">
			<Link
				href="/dashboard"
				role="button"
				aria-label="Open the HackOps Dashboard from the preview"
				className="flex flex-col items-center justify-center w-full h-full py-16 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900"
			>
				<Image
					src="/demo_preview.png"
					alt="Dashboard UI preview. Click to open the Dashboard."
					width={800}
					height={600}
					className="rounded-xl transition-transform duration-200 group-hover:scale-[1.01] cursor-pointer"
				/>
				<span className="sr-only">Open Dashboard</span>
			</Link>
		</div>
	</section>
);

export default DemoPreview;
