import React from "react";

const testimonials = [
	{ quote: "HackOps made our hackathon seamless. The AI agents handled everything from outreach to judging!", name: "Alex R.", org: "TechFest Organizer" },
	{ quote: "I saved days of work. The team management and content tools are a game changer.", name: "Priya S.", org: "Startup Weekend Host" },
	{ quote: "Our event grew 2x thanks to HackOps' automated community features.", name: "Jordan M.", org: "CodeSprint Director" },
];

const Testimonials: React.FC = () => (
	<section className="py-20 bg-[#13204a] text-white px-4">
		<h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Organizers Say</h2>
		<div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto justify-center items-stretch">
			{testimonials.map((t, i) => (
				<div key={i} className="bg-[#1b2a5b] rounded-2xl p-6 flex-1 shadow-lg flex flex-col justify-between">
					<p className="text-lg italic mb-4">“{t.quote}”</p>
					<div className="text-blue-200 font-semibold">{t.name}</div>
					<div className="text-blue-300 text-sm">{t.org}</div>
				</div>
			))}
		</div>
	</section>
);

export default Testimonials;
