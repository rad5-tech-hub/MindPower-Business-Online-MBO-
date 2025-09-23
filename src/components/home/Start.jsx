import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectAuth } from "../../redux/authSlice"; // Import the auth selector

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

const Start = () => {
  // Access authentication state from Redux
  const auth = useSelector(selectAuth);
  const isAuthenticated = auth.isAuthenticated;
  const userRole = auth.user?.role;
  const lastDashboard = auth.lastDashboard;
  const isAdmin = userRole === "admin";

  // Determine the redirect path based on authentication and role
  const redirectPath = isAuthenticated
    ? lastDashboard || (isAdmin ? "/admin" : "/user-dashboard")
    : "/create-account";

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false }}
      variants={animations.scaleUp}
      className="w-full py-[10vh] flex justify-center items-center bg-[#003087]"
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
          className="lg:text-[35px] text-[25px]"
        >
          Your next customer is looking for you.
        </motion.h1>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          variants={animations.fadeIn}
          className="lg:text-[20px] text-[18px]"
        >
          Let them discover your business.
        </motion.p>
        <div className="w-fit h-fit mx-auto">
          <motion.div // Changed from motion.a to motion.div to wrap Link
            variants={animations.buttonHover}
            whileHover="hover"
            whileTap="tap"
            className="bg-[#FEFEFF] text-[#003087] rounded-[48px] shadow-lg lg:text-[18px] text-[14px] md:px-8 px-4 py-3 md:py-4 w-fit mx-auto font-medium"
          >
            <Link to={redirectPath}>Set Up My Business</Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Start;
