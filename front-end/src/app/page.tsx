import Navbar from "../components/landing-page/Navbar";
import HeroSection from "../components/landing-page/HeroSection";
import FeatureGrid from "../components/landing-page/FeatureGrid";
import HowItWorks from "../components/landing-page/HowItWorks";
import DemoPreview from "../components/landing-page/DemoPreview";
import Testimonials from "../components/landing-page/Testimonials";
import RoadmapIntegrations from "../components/landing-page/RoadmapIntegrations";
import FinalCTA from "../components/landing-page/FinalCTA";
import Footer from "../components/landing-page/Footer";

export default function Home() {
  return (
    <div className="font-sans bg-[#0a174e] min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <FeatureGrid />
        <HowItWorks />
        <DemoPreview />
        <Testimonials />
        <RoadmapIntegrations />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
