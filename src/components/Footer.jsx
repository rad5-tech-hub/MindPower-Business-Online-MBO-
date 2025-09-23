import React from "react";
import { CiFacebook } from "react-icons/ci";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import MindPowerLogo from "../assets/mindpower-logo.svg";
import { Link } from "react-router-dom"; // Corrected import

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, staggerChildren: 0.2 },
  },
};

const Footer = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false }}
      className="bg-[#FEFEFF] w-full h-fit flex flex-col justify-center items-center text-[#003087]"
    >
      <motion.div
        variants={fadeInUp}
        className="container mx-auto px-[5vw] h-fit flex max-lg:flex-col max-lg:text-center justify-between py-8 gap-8"
      >
        <motion.div
          variants={fadeInUp}
          className="w-full flex flex-col gap-4 max-lg:items-center"
        >
          <Link to="/" className="logo">
            <img src={MindPowerLogo} alt="Mind-Power-Logo" className="h-16" />
          </Link>
          <p className="text-[16px] text-[#003087]">
            Your business deserves a platform designed for growth. Join a
            community where every connection is an opportunity.
          </p>
          <div className="socials flex items-center gap-2">
            {[CiFacebook, FaWhatsapp].map((Icon, index) => (
              <motion.a
                key={index}
                variants={fadeInUp}
                href="#"
                className="text-[#003087] text-[28px] hover:scale-110 transition-transform"
              >
                <Icon />
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="w-full max-md:w-[90%] mx-auto contact flex flex-col gap-4 max-lg:items-center"
        >
          <h4 className="text-[17px] font-bold">Contact Info</h4>
          <p className="text-[14px]">
            <strong>Address:</strong> 3 CONVENANT CLOSE BEHIND RUFUS OBI
            CHEMIST, ALONG ABA-OWERRI ROAD, Aba 450272
          </p>
          <ul className="flex max-sm:flex-col items-center gap-1">
            <li className="font-bold">Customer Support:</li>
            <li>09078987890</li>
          </ul>
          <ul className="flex max-sm:flex-col items-center gap-1 max-sm:w-[90%] max-sm:m-auto">
            <li className="font-bold">Email:</li>
            <li className="max-sm:px-4">admin@mindpowerbusinessonline.com</li>
          </ul>
        </motion.div>
        <motion.nav
          variants={fadeInUp}
          className="policies text-[14px] flex flex-col gap-2 w-full items-center"
        >
          <div className="max-lg:w-full flex flex-col max-lg:items-center gap-6">
            <Link className="hover:border-b-[1px] w-fit" to="/">
              Home
            </Link>
            <Link className="hover:border-b-[1px] w-fit" to="/community">
              Community
            </Link>
            <Link to="/privacy-policy" className="hover:border-b-[1px] w-fit">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:border-b-[1px] w-fit">
              Terms of service
            </Link>
            <Link to="/#faq" className="hover:border-b-[1px] w-fit">
              Help & Support
            </Link>
          </div>
        </motion.nav>
      </motion.div>
      <motion.div
        variants={fadeInUp}
        className="max-md:w-[90%] mx-auto lg:h-[10vh] h-[15vh] policies text-[14px] flex flex-col gap-2 w-full items-center justify-center border-t-[1px] border-[#043D12] py-4 max-md:text-center"
      >
        <p className="text-[#003087]">© 2025 MindPower. All rights reserved.</p>
        <a
          href="https://api.whatsapp.com/send?phone=2348188155501"
          className="border-b-[1px] hover:font-bold"
        >
          Designed by RAD5 Tech Hub
        </a>
      </motion.div>
    </motion.div>
  );
};

export default Footer;
