import React from "react";

const features = [
	{ title: "Global Outreach & Recruitment", icon: "🌍", desc: "AI-driven participant discovery and invitations." },
	{ title: "Team Management", icon: "👥", desc: "Automated team formation and collaboration tools." },
	{ title: "Speaker & Jury Orchestration", icon: "🎤", desc: "Seamless onboarding and scheduling for experts." },
	{ title: "Content Creation", icon: "📝", desc: "Generate agendas, emails, and event content." },
	{ title: "Challenge Creation", icon: "💡", desc: "AI-assisted challenge design and curation." },
	{ title: "Live Event Moderation", icon: "🛡️", desc: "Real-time support and moderation for smooth events." },
	{ title: "Fundraising", icon: "💸", desc: "Automate sponsor outreach and fundraising." },
	{ title: "Mission Tracking", icon: "📈", desc: "Monitor progress and impact with analytics." },
];

const FeatureGrid: React.FC = () => (
	<section id="features" className="py-20 bg-[#13204a] text-white px-4">
		<h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Features</h2>
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
			{features.map((f, i) => (
				<div key={i} className="bg-[#1b2a5b] rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transition-transform">
					<div className="text-4xl mb-4">{f.icon}</div>
					<h3 className="font-semibold text-lg mb-2 text-center">{f.title}</h3>
					<p className="text-blue-100 text-sm text-center">{f.desc}</p>
				</div>
			))}
		</div>
	</section>
);

export default FeatureGrid;
