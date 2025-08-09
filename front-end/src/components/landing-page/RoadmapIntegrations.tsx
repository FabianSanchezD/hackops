import React from "react";
import Image from "next/image";

const integrations = [
	{ name: "LinkedIn", icon: <Image src="/icons/linkedin_logo.png" alt="LinkedIn" width={40} height={40} /> },
	{ name: "Discord", icon: <Image src="/icons/discord_logo_final.png" alt="Discord" width={40} height={40} /> },
	{ name: "Luma", icon: <Image src="/icons/luma_logo.svg" alt="Luma" width={40} height={40} /> },
];

const RoadmapIntegrations: React.FC = () => (
	<section id="integrations" className="py-20 bg-[#0a174e] text-white px-4">
		<h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Roadmap & Integrations</h2>
		<div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto justify-center items-center flex-wrap">
			{integrations.map((i, idx) => (
				<div key={idx} className="flex flex-col items-center bg-[#1b2a5b] rounded-xl p-6 shadow-md min-w-[140px]">
					<div className="text-4xl mb-2">{i.icon}</div>
					<div className="font-semibold">{i.name}</div>
				</div>
			))}
		</div>
		<div className="text-center text-blue-200 mt-3">- SendGrid</div>
		<div className="text-center text-blue-200 mt-2">- Google Meet</div>
		<div className="text-center text-blue-200 mt-2">More integrations coming soon…</div>
	</section>
);

export default RoadmapIntegrations;
