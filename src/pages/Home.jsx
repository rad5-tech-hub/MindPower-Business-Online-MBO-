import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import HeroSection from "../components/home/HeroSection";
import Join from "../components/home/Join";
import Benefits from "../components/home/Benefits";
import Faq from "../components/home/Faq";
import Start from "../components/home/Start";
import Footer from "../components/Footer";
// import UploadToCloudinary from "../components/UploadCloudinary";
const Home = () => {
  const faqRef = useRef(null);
  const location = useLocation();

  // Scroll to FAQ section when the hash is #faq
  useEffect(() => {
    if (location.hash === "#faq" && faqRef.current) {
      faqRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  return (
    <div className="w-full bg-[#FEFEFF]">
      <HeroSection />
      <Join />
      {/* <UploadToCloudinary /> */}
      <Benefits />
      <div ref={faqRef} id="faq">
        <Faq />
      </div>
      <Start />
      <Footer />
    </div>
  );
};

export default Home;
