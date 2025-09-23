import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectAuth } from "../../redux/authSlice"; // Import the auth selector
import HeroImg from "../../assets/mbo-heroImg.png";

const animations = {
  slideLeft: {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50 },
    },
  },
  slideRight: {
    hidden: { x: 100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50 },
    },
  },
  buttonHover: {
    hover: {
      scale: 1.03,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  },
  buttonTap: {
    tap: { scale: 0.98 },
  },
};

const HeroSection = () => {
  const location = useLocation();
  const [activeButton, setActiveButton] = useState(
    location.pathname.includes("community") ? "explore" : "create"
  );

  // Access authentication state from Redux
  const auth = useSelector(selectAuth);
  const isAuthenticated = auth.isAuthenticated;
  const userRole = auth.user?.role;
  const lastDashboard = auth.lastDashboard;
  const isAdmin = userRole === "admin";

  // Determine the redirect path for "Set Up My Business" button
  const redirectPath = isAuthenticated
    ? lastDashboard || (isAdmin ? "/admin" : "/user-dashboard")
    : "/create-account";

  return (
    <motion.div
      whileInView="visible"
      viewport={{ once: false }}
      className="w-full flex flex-col justify-center items-center bg-[#FEFEFF] overflow-hidden"
    >
      <div className="h-full container mx-auto px-[5vw] text-[#003087] grid md:grid-cols-2 grid-cols-1 justify-center">
        {/* Animated Text Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          variants={animations.slideLeft}
          className="details flex flex-col md:gap-4 gap-4 md:text-left md:py-12 h-full "
        >
          <div className="bg-[url('/carbon-growth.svg')] bg-no-repeat object-fit bg-cover bg-center flex flex-col justify-center items-center lg:gap-4 gap-2">
            <h1 className="text-[#003087] lg:text-[45px] lg:leading-[45px] text-[32px] max-w-full lg:mt-8 font-medium max-md:text-center">
              Elevate Your Business. Discover Great Products.
              <br className="" />
              <strong className="lg:text-[32px] text-[20px] italic">
                Connect. Showcase. Shop. Grow.
              </strong>
            </h1>
            <p className="lg:text-[22px] text-[14px] max-w-full mx-auto md:mx-0 text-[#003087] max-md:text-center">
              Whether you're a business owner or a shopper — this is your space.
              Build your online presence or explore unique brands and products.
            </p>
          </div>
          <div className="btns mt-6 flex max-lg:flex-col max-md:items-center lg:gap-4 gap-6">
            <motion.div
              variants={animations.buttonHover}
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                to={redirectPath}
                onClick={() => setActiveButton("create")}
                className={`block w-fit rounded-[48px] shadow-lg lg:text-[18px] text-[14px] font-bold px-6 py-4 transition-all duration-300 border-2 border-[#043D12] ${
                  activeButton === "create"
                    ? "bg-[#003087] text-white hover:bg-[#032a0d]"
                    : "bg-transparent text-[#003087] hover:bg-[#003087]/10"
                }`}
              >
                Set Up My Business
              </Link>
            </motion.div>

            <motion.div
              variants={animations.buttonHover}
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                to="/community"
                onClick={() => setActiveButton("explore")}
                className={`block w-fit rounded-[48px] shadow-lg lg:text-[18px] text-[14px] font-bold px-6 py-4 transition-all duration-300 border-2 border-[#043D12] ${
                  activeButton === "explore"
                    ? "bg-[#003087] text-white hover:bg-[#032a0d]"
                    : "bg-transparent text-[#003087] hover:bg-[#003087]/10"
                }`}
              >
                Browse Products
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Animated Image Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          variants={animations.slideRight}
          className="visual h-full overflow-hidden max-lg:mt-8"
        >
          <div className="w-full h-full">
            <img
              src={HeroImg}
              alt="Hero-Page-img"
              className="max-w-full h-full object-cover object-center mx-auto"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
