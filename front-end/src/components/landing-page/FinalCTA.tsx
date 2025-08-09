"use client";
import React, { useState } from "react";

const FinalCTA: React.FC = () => {
	const [email, setEmail] = useState("");
	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: wire up to backend or service
		alert(`We'll contact you at ${email} if you're in!`);
		setEmail("");
	};
	return (
		<section id="get-access" className="py-20 bg-gradient-to-b from-[#19376d] to-[#0a174e] text-white px-4 flex flex-col items-center">
			<h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Run Your Next Hackathon on Autopilot</h2>
			<form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
				<input
					type="email"
					placeholder="Enter your email"
					className="px-4 py-3 rounded-full bg-white text-[#0a174e] focus:outline-none flex-1"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<button
					type="submit"
					className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold px-8 py-3 rounded-full shadow hover:opacity-90 transition"
				>
					Get Early Access
				</button>
			</form>
			<div className="text-blue-200 text-sm mt-4">No spam. Only launch updates.</div>
		</section>
	);
};

export default FinalCTA;
