// src/components/VerifyEmail.js
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux"; // Add useDispatch
import { login } from "../redux/authSlice"; // Import login action
import Logo from "../assets/mindpower-logo.svg";
import bgImage from "../assets/verifybg.jpeg";

const animations = {
  slideUp: {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50, delay: 0.2 },
    },
  },
  buttonHover: {
    hover: {
      scale: 1.03,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  },
  buttonTap: {
    tap: { scale: 0.98 },
  },
};

const VerifyEmail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid verification link.");
      setVerificationFailed(true);
      setIsVerifying(false);
      return;
    }

    axios
      .get(
        `${import.meta.env.VITE_BASE_URL}/member/verify-email?token=${token}`
      )
      .then((response) => {
        toast.success(response.data.message || "Email verified successfully!");
        // Check if API returns token and user data
        if (response.data.token && response.data.user) {
          dispatch(
            login({ token: response.data.token, user: response.data.user })
          );
          setTimeout(() => navigate("/business-profile"), 2000);
        } else {
          // If no token, require login
          toast.warn("Please log in to continue.");
          setTimeout(() => navigate("/login"), 2000);
        }
      })
      .catch((error) => {
        toast.error(error.response?.data?.error || "Verification failed.");
        setVerificationFailed(true);
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, [token, navigate, dispatch]);

  const handleResendVerification = () => {
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    axios
      .post(`${import.meta.env.VITE_BASE_URL}/member/resend-verification`, {
        email,
      })
      .then(() => {
        toast.success("Verification email resent. Check your inbox.");
      })
      .catch(() => {
        toast.error("Failed to resend verification email.");
      });
  };

  return (
    <div
      className="min-h-screen bg-[#003087] w-full flex flex-col justify-center items-center p-4 bg-cover bg-center"

    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        variants={animations.slideUp}
        className="max-w-md w-full bg-white/90 rounded-2xl shadow-lg p-8 text-[#003087]"
      >
        <div className="flex justify-center mb-6">
          <img src={Logo} alt="Project Logo" className="h-12 object-contain" />
        </div>
        <h2 className="text-2xl font-medium text-center mb-2">
          Verify Your Email
        </h2>
        <p className="text-[#003087] text-center text-sm mb-6">
          Connect. Showcase. Shop. Grow.
        </p>

        {isVerifying ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#043D12] border-solid"></div>
            <p className="text-lg font-semibold text-[#003087] animate-pulse">
              Verifying your email...
            </p>
          </div>
        ) : verificationFailed ? (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-600">
              Verification Failed
            </h3>
            <p className="text-[#003087] text-sm">
              The verification link is invalid or has expired. Enter your email
              to receive a new link.
            </p>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-2 border-[#043D12]/20 rounded-lg focus:ring-2 focus:ring-[#043D12] focus:outline-none transition-all duration-300 text-[#003087]"
            />
            <motion.button
              variants={animations.buttonHover}
              whileHover="hover"
              whileTap="tap"
              onClick={handleResendVerification}
              className="w-full bg-[#003087] text-white py-3 rounded-[48px] font-semibold hover:bg-[#032a0d] transition-all duration-300 shadow-md border-2 border-[#043D12] cursor-pointer"
            >
              Resend Verification Email
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <svg
              className="w-12 h-12 text-[#003087] animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-lg font-semibold text-[#003087]">
              Email verified! Redirecting...
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
