// src/components/NetworkError.jsx
import React from "react";
import { motion } from "framer-motion";
import { FaRedo, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const NetworkError = ({ message, onRetry }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center space-y-4">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800">
          Oops! Something Went Wrong
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-sm">
          {message || "We couldn’t connect to the network. Please try again."}
        </p>

        {/* Actions */}
        <div className="flex gap-4 justify-center mt-6">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-[#003087] text-white rounded-lg hover:bg-[#002f87d5] transition-colors duration-200"
            >
              <FaRedo />
              Retry
            </button>
          )}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 border border-[#6A7368] text-[#003087] rounded-lg hover:bg-[#F5F7F5] transition-colors duration-200"
          >
            <FaHome />
            Go Home
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NetworkError;
