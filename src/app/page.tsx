import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import AssessmentTest from "../components/home/AssessmentTest";
import IBAResources from "../components/home/IBAResources";
import PersonalBatch from "../components/home/PersonalBatch";
import Community from "../components/home/Community";
import Testimonials from "../components/home/Testimonials";
import About from "../components/home/About";
import Footer from "@/components/shared/Footer";

export default function HomePage(): React.ReactElement {
  return (
    <div className="responsive-bg w-full overflow-x-hidden">
      <div className="min-h-screen">
        <Hero />
        <div className="h-80 md:h-60 lg:h-30" />
        <Features />
        <AssessmentTest />
        <IBAResources />
        <PersonalBatch />
        <About />
        <Testimonials />
        <Community />
        {/* <Footer /> */}
      </div>
    </div>
  );
}
