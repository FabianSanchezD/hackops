import React from "react";

const HeroSection: React.FC = () => (
	<section className="relative flex flex-col items-center justify-center min-h-[80vh] text-center bg-gradient-to-b from-[#0a174e] to-[#19376d] text-white px-4 pt-24 pb-16">
		<h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
			Your AI Co-Organizer for Any Hackathon
		</h1>
		<p className="text-lg md:text-2xl mb-8 max-w-2xl mx-auto text-blue-100">
			From outreach to jury onboarding to community growth. HackOps automates it all.
		</p>
		<div className="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="#demo" className="bg-white text-[#0a174e] font-semibold px-8 py-3 rounded-full shadow hover:bg-blue-100 transition">Try the Demo</a>
			<a href="#get-access" className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold px-8 py-3 rounded-full shadow hover:opacity-90 transition">Get Early Access</a>
		</div>
	</section>
);

export default HeroSection;
