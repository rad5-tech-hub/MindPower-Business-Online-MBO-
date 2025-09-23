import React from "react";
import { Link } from "react-router-dom"; // Fixed import
import { motion } from "framer-motion";

const animations = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } },
  },
  scaleUp: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
  },
  slideTop: {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50 },
    },
  },

  slideBottom: {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50 },
    },
  },

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
  rotate: {
    hidden: { rotate: -180, opacity: 0 },
    visible: { rotate: 0, opacity: 1, transition: { duration: 1 } },
  },
  buttonHover: {
    hover: { scale: 1.1, transition: { type: "spring", stiffness: 300 } },
  },
  buttonTap: { tap: { scale: 0.9 } },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
  },
};

const AddBusiness = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false }}
      variants={animations.scaleUp}
      className="w-full lg:h-[50vh] max-lg:py-[7vh] flex justify-center items-center bg-[#003087]"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        variants={animations.fadeIn}
        className="container mx-auto px-[5vw] h-fit flex flex-col gap-10 text-[#FEFEFF] text-center lg:leading-6"
      >
        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          variants={animations.fadeIn}
          className="lg:text-[40px] text-[30px]"
        >
          Don't see your business here?
        </motion.h1>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          variants={animations.fadeIn}
          className="lg:text-[20px] text-[18px] md:w-[60%] sm:w-[80%] w-full  mx-auto leading-9"
        >
          Stand out and connect with potential customers today. Create your
          profile and let the world discover you!
        </motion.p>
        <div className="w-fit h-fit mx-auto">
          <a
            href="/create-account"
            className="bg-[#FEFEFF] text-[#003087] rounded-[48px] shadow-lg lg:text-[18px] text-[14px] md:px-8 px-4 py-3 md:py-4 w-fit mx-auto font-medium"
          >
            Add Your Business
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddBusiness;
