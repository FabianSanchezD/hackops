import React from "react";

const DemoPreview: React.FC = () => (
	<section id="demo" className="py-20 bg-[#19376d] text-white px-4 flex flex-col items-center">
		<h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Dashboard Demo Preview</h2>
		<div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-900 bg-[#0a174e] flex justify-center items-center min-h-[320px]">
			{/* Placeholder for dashboard mockup */}
			<div className="flex flex-col items-center justify-center w-full h-full py-16">
				<div className="flex gap-4 mb-6">
					<div className="bg-blue-500/80 rounded-lg px-4 py-2 text-white font-bold shadow">Agent Card</div>
					<div className="bg-purple-500/80 rounded-lg px-4 py-2 text-white font-bold shadow">Kanban View</div>
				</div>
				<span className="text-blue-200">(Dashboard UI mockup coming soon)</span>
			</div>
		</div>
	</section>
);

export default DemoPreview;
