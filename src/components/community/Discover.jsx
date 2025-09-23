import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import HeroImg from "../../assets/Woman.svg";

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
    hover: { scale: 1.1, transition: { type: "spring", stiffness: 300 } },
  },
};

const Discover = () => {
  return (
    <motion.div
      whileInView="visible"
      viewport={{ once: false }}
      className="w-full h-fit flex flex-col items-center bg-[#003087] overflow-hidden justify-center lg:pt-16"
    >
      <div className="container mx-auto px-[5vw] text-[#003087] grid grid-cols-1 lg:grid-cols-2 max-lg:gap-8 max-lg:items-baseline max-lg:pt-10">
        {/* Animated Text Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          variants={animations.slideLeft}
          className="details flex flex-col md:gap-10 gap-8 text-center md:text-left max-lg:items-center"
        >
          <h1 className=" text-[#FEFEFF] max-w-full mt-8 font-medium max-lg:mx-auto max-lg:text-center md:text-[40px] max-md:text-[32px] min-2xl:text-[40px] text-[100px]">
            Discover Businesses Near <br className="max-md:hidden" />
            You Within the MindPower Network
          </h1>

          <div className="btns flex  justify-center md:justify-start mt-4">
            <motion.div variants={animations.buttonHover} whileHover="hover">
              <Link
                to="/community/all-businesses"
                className="w-fit text-[#003087] bg-[#FEFEFF] rounded-[48px] shadow-lg lg:text-[18px] text-[12px] md:px-8 font-bold px-4 py-4 md:py-5"
              >
                Explore all Businesses
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
          className="visual h-full overflow-hidden max-lg:mt-8 "
        >
          <div className="w-full flex items-center">
            <img
              src={HeroImg}
              alt="Hero-Page-img"
              className="max-w-full object-center object-fill"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Discover;
