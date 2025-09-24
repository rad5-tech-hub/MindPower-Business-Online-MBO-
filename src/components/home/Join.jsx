import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import group1 from "../../assets/group1.png";
import subscribe from "../../assets/subscribe.png";
import group3 from "../../assets/group3.png";

const animations = {
  scaleUp: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } },
  },
  slideUp: {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  },
  slideLeft: {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
  },
  slideRight: {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
  },
  buttonHover: {
    hover: { scale: 1.1, transition: { type: "spring", stiffness: 300 } },
  },
};

const Join = () => {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false }}
      variants={animations.fadeIn}
      className="w-full flex justify-center items-center bg-[#FEFEFF] lg:py-18 py-14 overflow-h-auto"
    >
      <div className="container mx-auto px-[5vw] flex flex-col gap-10 text-center overflow-hidden">
        {/* Title Section */}
        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          variants={animations.scaleUp}
          className="mt-12 lg:text-[35px] text-[25px] text-[#003087] font-semibold"
        >
          Join our growing network
        </motion.h1>

        {/* Cards Section */}
        <div className="w-full grid md:grid-cols-3 lg:gap-10 gap-24 overflow-hidden">
          {[
            {
              image: <img src={group1} alt="Sign Up" style={{ height: 182, width: 136 }} />,
              title: <Link to="/create-account">SIGN UP</Link>,
              description:
                "Create your business profile in just a few minutes.",
              animationVariant: animations.slideLeft,
            },
            {
              image: <img src={subscribe} alt="Subscribe" style={{ height: 182, width: 136 }} />,
              title: <Link to="/create-account">SUBSCRIBE</Link>,
              description:
                "Choose a single annual plan for access and promotion.",
              animationVariant: animations.slideUp,
            },
            {
              image: <img src={group3} alt="Grow" style={{ height: 182, width: 136 }} />,
              title: <Link to="/create-account">GROW</Link>,
              description:
                "Share your profile, connect with customers, and track your growth.",
              animationVariant: animations.slideRight,
            },
          ].map((card, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
              variants={card.animationVariant}
              className="flex flex-col items-center justify-center text-center gap-6 overflow-hidden"
            >
              {card.image}
              <figcaption className="text-[24px] text-[#003087]">
                <h5 className="font-bold">{card.title}</h5>
                <p className="text-[18px] lg:px-16 px-8 text-[#003087]">
                  {card.description}
                </p>
              </figcaption>
            </motion.div>
          ))}
        </div>

        {/* Call-to-Action Button */}
        <Link
          to="/community/all-businesses"
          className="w-fit mx-auto border bg-transparent text-[#003087] border-[#043D12] rounded-[48px] shadow-lg lg:text-[18px] text-[16px] px-8 py-4 hover:bg-[#003087] hover:text-white"
        >
          Explore Businesses
        </Link>
      </div>
    </motion.section>
  );
};

export default Join;