import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  IoCallOutline,
  IoLocationOutline,
  IoLogoYoutube,
} from "react-icons/io5";
import { FaFacebook, FaWhatsapp } from "react-icons/fa6";
import { IoLogoInstagram, IoLogoTwitter, IoLogoLinkedin } from "react-icons/io";
import { IoLogoWhatsapp } from "react-icons/io5";
import { MdOutlineCategory } from "react-icons/md";
import { BsTiktok } from "react-icons/bs";
import { CiShare1 } from "react-icons/ci";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BusinessImg from "../../assets/user-photo.svg";
import NetworkError from "../NetworkError";
import { Player } from "@lottiefiles/react-lottie-player";
import { TfiEmail } from "react-icons/tfi";
import { FaXTwitter } from "react-icons/fa6";
import { useSelector } from "react-redux";

// Utility function to generate WhatsApp URL with predefined message
const getWhatsAppUrl = (profile, productName = null) => {
  if (!profile?.socialLinks?.whatsapp) return null;

  const baseUrl = profile.socialLinks.whatsapp;
  let message = `Hello ${profile.businessName}, I saw your profile on MBO`;

  if (productName) {
    message += ` and I'm interested in your "${productName}"`;
  } else {
    message += ` and I'm interested in your products/services`;
  }

  return `${baseUrl}${
    baseUrl.includes("?") ? "&" : "?"
  }text=${encodeURIComponent(message)}`;
};

// Function to track WhatsApp link clicks
const trackWhatsAppClick = async (profileId) => {
  if (!profileId) {
    console.error("❌ No profileId provided for WhatsApp tracking");
    return;
  }

  try {
    await axios.post(
      `${import.meta.env.VITE_BASE_URL}/member/track-click/${profileId}`,
      { platform: "whatsapp" },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "❌ Error tracking WhatsApp click:",
      error.response?.data || error
    );
  }
};

// Utility function to extract YouTube video ID from URL
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Video Modal Component
const VideoModal = ({ videoUrl, onClose }) => {
  const videoId = getYouTubeVideoId(videoUrl);
  if (!videoId) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 flex justify-center items-center z-[1000]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-4xl p-4 overflow-hidden"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-4 text-white bg-[#003087]/80 rounded-full p-2 hover:bg-[#003087] transition-colors z-50"
            whileHover={{ scale: 1.2, rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            ✕
          </motion.button>
          <motion.div
            className="relative w-full h-0 pb-[56.25%] rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Product Modal Component
const ProductModal = ({ product, profile, onClose }) => {
  if (!product || !profile) return null;

  const whatsappUrl = getWhatsAppUrl(profile, product.name);

  const socialIcons = [
    {
      key: "whatsapp",
      icon: IoLogoWhatsapp,
      url: whatsappUrl,
      onClick: () => trackWhatsAppClick(profile.id),
    },
    { key: "facebook", icon: FaFacebook, url: profile.socialLinks?.facebook },
    {
      key: "instagram",
      icon: IoLogoInstagram,
      url: profile.socialLinks?.instagram,
    },
    { key: "twitter", icon: FaXTwitter, url: profile.socialLinks?.twitter },
    {
      key: "linkedin",
      icon: IoLogoLinkedin,
      url: profile.socialLinks?.linkedin,
    },
  ].filter((item) => item.url);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 flex justify-center items-center z-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative bg-gradient-to-br from-[#FEFEFF] to-white rounded-2xl shadow-2xl w-[90%] max-w-lg p-8 overflow-hidden"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            onClick={onClose}
            className="absolute top-2 right-6 text-[#003087] hover:text-[#003087] text-xl z-10"
            whileHover={{ scale: 1.2, rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            ✕
          </motion.button>
          <motion.div
            className="w-full h-64 rounded-xl overflow-hidden mb-4 bg-white flex items-center justify-center relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <img
              src={product.imageUrl || BusinessImg}
              alt={product.name}
              className="max-w-full max-h-full object-contain p-2 z-10"
              onError={(e) => (e.target.src = BusinessImg)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-0" />
          </motion.div>
          <motion.h2
            className="text-2xl font-bold text-[#003087] mb-4"
            title={product.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {product.name || "Unnamed Product"}
          </motion.h2>
          <motion.p
            className="flex items-center gap-2 text-[#003087] text-sm mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <MdOutlineCategory />{" "}
            {profile.categories[0]?.name || "Unknown Category"}
          </motion.p>
          <motion.p
            className="text-[#003087] text-sm mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            {product.description || "No product description available"}
          </motion.p>
          {socialIcons.length > 0 && (
            <motion.div
              className="flex gap-4 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {socialIcons.map((social, index) => (
                <motion.a
                  key={social.key}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#003087] hover:text-white p-2 rounded-full bg-[#F5F7F5] hover:bg-[#003087] transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  onClick={social.onClick}
                >
                  <social.icon className="text-xl" />
                </motion.a>
              ))}
            </motion.div>
          )}
          {profile.member?.email && (
            <motion.a
              href={`mailto:${profile.member.email}`}
              className="flex items-center gap-2 text-[#003087] hover:text-[#003087] text-sm mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <TfiEmail /> {profile.member.email}
            </motion.a>
          )}
          {whatsappUrl && (
            <motion.a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full text-center bg-[#003087] text-white py-2 rounded-lg hover:bg-[#003087] transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={() => trackWhatsAppClick(profile.id)}
            >
              Contact {profile.businessName}
            </motion.a>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Report Modal Component
const ReportModal = ({ profile, onClose }) => {
  const [reportData, setReportData] = useState({
    fullName: "",
    email: "",
    issueType: "Report a Business",
    issueDescription: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL;
      const profileId = profile.id;
      const payload = {
        name: reportData.fullName,
        email: reportData.email,
        issue: reportData.issueDescription,
        issueType: reportData.issueType,
      };

      const response = await axios.post(
        `${BASE_URL}/admin/create-issue/${profileId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Report submitted successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        onClose();
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      console.error("❌ Error submitting report:", err.response?.data || err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to submit report. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/75 bg-opacity-50 flex justify-center items-center z-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[#FEFEFF] p-6 rounded-lg shadow-lg w-[90%] max-w-md"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Why do you want to report this profile
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-5 h-5"
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
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={reportData.fullName}
                  onChange={handleInputChange}
                  placeholder="Woody"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#043D12]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  EMAIL
                </label>
                <input
                  type="email"
                  name="email"
                  value={reportData.email}
                  onChange={handleInputChange}
                  placeholder="devplay@chibuke.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#043D12]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  ISSUE TYPE
                </label>
                <select
                  name="issueType"
                  value={reportData.issueType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#043D12]"
                  required
                >
                  <option value="Report a Business">Report a Business</option>
                  <option value="Feedback">Feedback</option>
                  <option value="System Glitch">System Glitch</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  TELL US THE ISSUE
                </label>
                <textarea
                  name="issueDescription"
                  value={reportData.issueDescription}
                  onChange={handleInputChange}
                  placeholder="Type your issue here..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#043D12]"
                  required
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                className={`w-full py-2 rounded-md text-white transition-colors ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#003087] hover:bg-[#003087]"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "SEND REPORT"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main ProfileMain Component
const ProfileMain = () => {
  const { identifier } = useParams();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Get profile data from Redux store
  const { profile, loading, error } = useSelector((state) => state.profile);

  const filterProducts = (products) => {
    if (!products || products.length === 0) return [];
    return products.filter((product) => {
      const matchesSearch =
        !searchQuery ||
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const filteredProducts = filterProducts(profile?.productImages || []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FEFEFF]">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce delay-200"></div>
          <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce delay-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <NetworkError message={error} onRetry={() => window.location.reload()} />
    );
  }

  if (!profile) {
    return <div>Profile not found.</div>;
  }

  const whatsappUrl = getWhatsAppUrl(profile);

  return (
    <div className="w-full min-h-screen bg-[#FEFEFF] flex flex-col items-center pt-[10vh]">
      <div className="container px-[5vw] mx-auto py-8">
        <div className="w-full text-[#003087] flex flex-col md:flex-row gap-8">
          <aside className="md:w-[25%] flex flex-col gap-8 text-[#003087]">
            <h3
              className="lg:text-[20px] text-[#003087] text-center md:text-left text-[18px] md:text-[28px] font-bold hover:whitespace-normal hover:overflow-visible hover:z-10"
              title={profile.businessName}
            >
              {profile.businessName}
            </h3>
            <div className="contact flex flex-col gap-8">
              <ul className="flex flex-col gap-4">
                <li className="text-[13px] flex items-center gap-2 justify-center md:justify-start md:text-[14px]">
                  <MdOutlineCategory />{" "}
                  {profile.categories[0]?.name || "Unknown Category"}
                </li>
                <li className="text-[13px] flex items-center gap-2 justify-center md:justify-start md:text-[14px]">
                  <IoCallOutline /> {profile.contactNo?.[0] || "Not specified"}
                </li>
                <li className="text-[13px] flex items-center gap-2 justify-center md:justify-start md:text-[14px]">
                  <IoLocationOutline /> {profile.location || "Not specified"}
                </li>
              </ul>
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border-[1px] border-[#043D12] hover:bg-[#003087] hover:text-white rounded-[28px] px-4 md:px-12 py-2 shadow text-[14px]"
                  onClick={() => trackWhatsAppClick(profile.id)}
                >
                  <FaWhatsapp />
                  Message
                </a>
              ) : (
                <p className="text-gray-600 text-[12px] text-center">
                  WhatsApp not available
                </p>
              )}
              <ul className="views text-[14px] flex justify-between items-center">
                <li>Profile Views</li>
                <li>{profile.views || 0}</li>
              </ul>
              <div className="web-share">
                <p className="text-[12px] text-[#003087] font-medium px-2 py-1 w-fit">
                  ON THE WEB
                </p>
                <div className="content border-[1px] border-[#6A7368] rounded-[11px] cursor-pointer">
                  {profile.socialLinks?.instagram && (
                    <a
                      href={profile.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-between items-center text-[14px] py-2 px-8 border-b-[1px] border-[#6A7368]"
                    >
                      <div className="flex items-center gap-4">
                        <IoLogoInstagram className="text-[25px]" />
                        Instagram
                      </div>
                      <span className="cursor-pointer text-[18px]">
                        <CiShare1 />
                      </span>
                    </a>
                  )}
                  {profile.socialLinks?.twitter && (
                    <a
                      href={profile.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-between items-center text-[14px] py-2 px-8 border-b-[1px] border-[#6A7368]"
                    >
                      <div className="flex items-center gap-4">
                        <FaXTwitter className="text-[25px]" />
                        Twitter
                      </div>
                      <span className="cursor-pointer text-[18px]">
                        <CiShare1 />
                      </span>
                    </a>
                  )}
                  {profile.socialLinks?.facebook && (
                    <a
                      href={profile.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-between items-center text-[14px] py-2 px-8 border-b-[1px] border-[#6A7368]"
                    >
                      <div className="flex items-center gap-4">
                        <FaFacebook className="text-[18px]" />
                        Facebook
                      </div>
                      <span className="cursor-pointer text-[18px]">
                        <CiShare1 />
                      </span>
                    </a>
                  )}
                  {profile.socialLinks?.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-between items-center text-[14px] py-2 px-8 border-b-[1px] border-[#6A7368]"
                    >
                      <div className="flex items-center gap-4">
                        <IoLogoLinkedin className="text-[25px]" />
                        LinkedIn
                      </div>
                      <span className="cursor-pointer text-[18px]">
                        <CiShare1 />
                      </span>
                    </a>
                  )}
                  {profile.socialLinks?.tiktok && (
                    <a
                      href={profile.socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-between items-center text-[14px] py-2 px-8 border-b-[1px] border-[#6A7368]"
                    >
                      <div className="flex items-center gap-4">
                        <BsTiktok className="text-[25px]" />
                        TikTok
                      </div>
                      <span className="cursor-pointer text-[18px]">
                        <CiShare1 />
                      </span>
                    </a>
                  )}
                  {profile.socialLinks?.youtube && (
                    <div
                      className="flex justify-between items-center text-[14px] py-2 px-8 cursor-pointer"
                      onClick={() => setIsVideoModalOpen(true)}
                    >
                      <div className="flex items-center gap-4">
                        <IoLogoYoutube className="text-[25px]" />
                        YouTube
                      </div>
                      <span className="cursor-pointer text-[18px]">
                        <CiShare1 />
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="description flex flex-col gap-2">
                <h5 className="text-[10px] text-[#003087]">
                  BUSINESS DESCRIPTION
                </h5>
                <p className="text-[13px] md:text-[14px]">
                  {profile.description || "No description available"}
                </p>
              </div>
              <div className="keywords flex flex-col gap-2">
                <h5 className="text-[10px] text-[#003087]">KEYWORDS</h5>
                <p className="text-[13px] md:text-[14px]">
                  {profile.keyword?.join(", ") || "No keywords available"}
                </p>
              </div>
              <div className="flex flex-col gap-4 pb-4">
                <p className="text-[12px] text-[#003087] font-medium px-2 py-1 w-fit">
                  CONTACT
                </p>
                <div className="content border-[1px] border-[#6A7368] rounded-[11px]">
                  {profile.contactNo?.[0] && (
                    <a
                      href={`tel:${profile.contactNo[0]}`}
                      className="flex justify-between items-center text-[14px] py-2 px-8 border-b-[1px] border-[#6A7368]"
                    >
                      <div className="flex items-center gap-4">Phone</div>
                      <span className="cursor-pointer text-[18px]">
                        <IoCallOutline />
                      </span>
                    </a>
                  )}
                  {profile.member?.email && (
                    <a
                      href={`mailto:${profile.member.email}`}
                      className="flex justify-between items-center text-[14px] py-2 px-8 border-b-[1px] border-[#6A7368]"
                    >
                      <div className="flex items-center gap-4">Email</div>
                      <span className="cursor-pointer text-[18px]">
                        <TfiEmail />
                      </span>
                    </a>
                  )}
                  {profile.socialLinks?.whatsapp && (
                    <a
                      href={getWhatsAppUrl(profile)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-between items-center text-[14px] py-2 px-8"
                      onClick={() => trackWhatsAppClick(profile.id)}
                    >
                      <div className="flex items-center gap-4">WhatsApp</div>
                      <IoLogoWhatsapp className="text-[18px]" />
                    </a>
                  )}
                </div>
                <div className="membership flex flex-col gap-2">
                  <h5 className="text-[10px] text-[#003087]">
                    Member Since:{" "}
                    {new Date(profile.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </h5>
                  <p
                    className="text-[16px] text-[#003087] cursor-pointer font-bold underline hover:text-[#003087]"
                    onClick={() => setIsReportModalOpen(true)}
                  >
                    Report business
                  </p>
                </div>
              </div>
            </div>
          </aside>
          <div className="md:w-[75%] flex flex-col gap-8">
            <h1 className="border-b-[1px] border-[#6A7368] text-[20px] text-[#003087] pb-1 text-center md:text-left">
              Products/Services
            </h1>
            {filteredProducts.length > 0 ? (
              <div className="w-full grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-2 max-[280px]:grid-cols-1 gap-4">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={index}
                    className="flex flex-col gap-1 cursor-pointer"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => handleProductClick(product)}
                  >
                    <figure>
                      <img
                        src={product.imageUrl || BusinessImg}
                        alt={product.name || "Product"}
                        className="rounded-lg w-full h-[250px] object-cover"
                        onError={(e) => (e.target.src = BusinessImg)}
                      />
                      <figcaption className="flex flex-col gap-4 text-[#003087] py-2">
                        <div className="flex flex-col gap-1">
                          <b
                            className="lg:text-[15px] text-[10px] md:text-[12px]"
                            title={product.name || "Unnamed Product"}
                          >
                            {product.name || "Unnamed Product"}
                          </b>
                        </div>
                      </figcaption>
                    </figure>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center gap-8 py-16">
                <Player
                  autoplay
                  loop
                  src="https://lottie.host/7fd33a4f-2e59-4f34-ba0c-4af37814586e/Cq1qkcf16G.lottie"
                  style={{ height: "300px", width: "300px" }}
                />
                <h2 className="text-md font-bold text-[#003087]">
                  No Products Available
                </h2>
                <p className="text-sm text-[#003087] text-center max-w-2xl">
                  It looks like this business hasn't added any products or
                  services yet. Check back later or explore other businesses in
                  the community!
                </p>
                <button
                  className="mt-4 bg-[#003087] text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-[#003087] transition-colors cursor-pointer"
                  onClick={() => navigate("/community")}
                >
                  Explore Community
                </button>
              </div>
            )}
            <ProductModal
              product={selectedProduct}
              profile={profile}
              onClose={() => setSelectedProduct(null)}
            />
          </div>
        </div>
      </div>
      {isReportModalOpen && (
        <ReportModal
          profile={profile}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
      {isVideoModalOpen && (
        <VideoModal
          videoUrl={profile.socialLinks?.youtube}
          onClose={() => setIsVideoModalOpen(false)}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default React.memo(ProfileMain);
