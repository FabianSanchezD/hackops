import React from "react";

const steps = [
	{ title: "Select Project", illustration: "🗂️", desc: "Choose your hackathon or event type." },
	{ title: "Run Agents", illustration: "🤖", desc: "Let AI agents automate the heavy lifting." },
	{ title: "Grow Your Community", illustration: "🌱", desc: "Watch your hackathon thrive and expand." },
];

const HowItWorks: React.FC = () => (
	<section className="py-20 bg-[#0a174e] text-white px-4">
		<h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
		<div className="flex flex-col md:flex-row justify-center items-center gap-12 max-w-5xl mx-auto">
			{steps.map((step, i) => (
				<div key={i} className="flex flex-col items-center text-center">
					<div className="text-5xl mb-4">{step.illustration}</div>
					<h3 className="font-semibold text-lg mb-2">{step.title}</h3>
					<p className="text-blue-100 text-sm max-w-xs">{step.desc}</p>
					{i < steps.length - 1 && (
						<div className="hidden md:block text-3xl mx-8 text-blue-300">→</div>
					)}
				</div>
			))}
		</div>
	</section>
);

export default HowItWorks;
