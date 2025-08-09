import React from "react";

const Footer: React.FC = () => (
	<footer className="bg-[#0a174e] text-white py-8 px-4 border-t border-blue-900">
		<div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
			<div className="font-semibold">HackOps © {new Date().getFullYear()}</div>
			<div className="text-blue-200 text-sm">Made for the Global AI Hackathon 2nd Edition.</div>
		</div>
	</footer>
);

export default Footer;
