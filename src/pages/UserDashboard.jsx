import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout as reduxLogout } from "../redux/authSlice";
import { LuLayoutGrid } from "react-icons/lu";
import { PiUserCircle } from "react-icons/pi";
import { IoIosLogOut } from "react-icons/io";
import { CgMenuLeftAlt } from "react-icons/cg";
import BusinessImg from "../assets/user-photo.svg";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import {
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaShareAlt,
  FaCopy,
} from "react-icons/fa";
import { CiUser } from "react-icons/ci";
import { TbLayoutGrid } from "react-icons/tb";
import { BiSolidContact } from "react-icons/bi";
import { RiExchangeDollarFill, RiLockPasswordLine } from "react-icons/ri";

const navItems = [
  {
    to: "/user-dashboard",
    icon: <LuLayoutGrid className="text-[25px]" />,
    label: "Home",
  },
  {
    to: "/community",
    icon: <PiUserCircle className="text-[25px]" />,
    label: "Marketplace",
  },
  {
    to: "/user-dashboard/profile",
    icon: <CiUser className="text-[25px]" />,
    label: "About",
  },
  {
    to: "/user-dashboard/products-and-services",
    icon: <TbLayoutGrid className="text-[25px]" />,
    label: "Product & Services",
  },
  {
    to: "/user-dashboard/contact-and-socials",
    icon: <BiSolidContact className="text-[25px]" />,
    label: "Contact & Socials",
  },
  {
    to: "/user-dashboard/subscription",
    icon: <RiExchangeDollarFill className="text-[25px]" />,
    label: "Subscription",
  },
  {
    to: "/user-dashboard/password",
    icon: <RiLockPasswordLine className="text-[25px]" />,
    label: "Password",
  },
];

const helpItem = {
  to: "/user-dashboard/help-and-support",
  icon: <PiUserCircle className="text-[25px]" />,
  label: "Help & Support",
};

const shareVariants = {
  hidden: { opacity: 0, scale: 0, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0, y: 20 },
};

const UserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try {
      const isLargeScreen = window.innerWidth >= 1024;
      return (
        JSON.parse(sessionStorage.getItem("sidebarState")) || isLargeScreen
      );
    } catch (e) {
      console.warn("Cannot access sessionStorage for sidebarState:", e.message);
      return window.innerWidth >= 1024;
    }
  });

  const [profileData, setProfileData] = useState({
    businessName: "User Name",
    businesImg: BusinessImg,
    category: "Category",
    subscriptionStatus: "Unknown", // Added subscriptionStatus
  });
  const [loading, setLoading] = useState(true);
  const [shareableLink, setShareableLink] = useState("");
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareSubscriptionModal, setShowShareSubscriptionModal] =
    useState(false); // Added modal state
  const hasFetchedRef = useRef({ profile: false, share: false });

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      if (hasFetchedRef.current.profile) return;
      try {
        console.log("Fetching profile data in UserDashboard");
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/member/my-profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data && response.data.success && response.data.data) {
          const profile = response.data.data;
          const member = profile.member || {};
          setProfileData({
            businessName: profile.businessName || "User Name",
            businesImg: profile.businesImg || BusinessImg,
            category:
              profile.categories?.[0]?.name || profile.category || "Category",
            subscriptionStatus: member.subscriptionStatus || "Unknown", // Added subscriptionStatus
          });
        }
      } catch (error) {
        console.error("❌ Error Fetching Profile:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch profile data."
        );
      } finally {
        setLoading(false);
        hasFetchedRef.current.profile = true;
      }
    };

    const fetchShareableLink = async () => {
      if (hasFetchedRef.current.share) return;
      try {
        console.log("Fetching shareable link in UserDashboard");
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/member/share`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (
          response.data &&
          response.data.message === "Shareable link generated successfully"
        ) {
          setShareableLink(response.data.shareableLink);
        }
      } catch (error) {
        console.error("❌ Error Fetching Shareable Link:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch shareable link."
        );
      } finally {
        hasFetchedRef.current.share = true;
      }
    };

    fetchProfile();
    fetchShareableLink();

    try {
      sessionStorage.setItem("sidebarState", JSON.stringify(isSidebarOpen));
    } catch (e) {
      console.warn("Cannot write to sessionStorage:", e.message);
    }
  }, [isSidebarOpen, isAuthenticated, token, navigate]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleLogout = () => {
    dispatch(reduxLogout());
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn("Cannot clear sessionStorage:", e.message);
    }
    toast.success("Logged out successfully!");
    navigate("/login", { replace: true });
  };

  const handleShareClick = () => {
    if (profileData.subscriptionStatus !== "active") {
      setShowShareSubscriptionModal(true);
    } else {
      setShowShareOptions((prev) => !prev);
      setCopied(false);
      // Ensure shareable link is fetched if not already available
      if (!shareableLink && !hasFetchedRef.current.share) {
        fetchShareableLink();
      }
    }
  };

  const handleShareAction = (action, platform = null) => {
    if (profileData.subscriptionStatus !== "active") {
      setShowShareSubscriptionModal(true);
      setShowShareOptions(false);
    } else {
      if (action === "copy") {
        handleCopyLink();
      } else if (action === "social" && platform) {
        shareToSocialMedia(platform);
      }
      setShowShareOptions(false);
    }
  };

  const shareToSocialMedia = (platform) => {
    if (!shareableLink) {
      toast.error("No shareable link available!");
      return;
    }
    const encodedLink = encodeURIComponent(shareableLink);
    const message = `Check out my business profile: ${shareableLink}`;
    let url;
    switch (platform) {
      case "whatsapp":
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          message
        )}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
        break;
      case "instagram":
        navigator.clipboard.writeText(message);
        toast.info("Link copied to clipboard! Paste it in Instagram.");
        return;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          message
        )}`;
        break;
      default:
        return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    setShowShareOptions(false);
  };

  const handleCopyLink = () => {
    if (!shareableLink) {
      toast.error("No shareable link available!");
      return;
    }
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    toast.success("Profile link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to close sidebar on nav link click for small screens
  const handleNavLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row h-screen overflow-hidden relative">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{
          x: isSidebarOpen || window.innerWidth >= 1024 ? "0%" : "-100%",
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`fixed lg:static z-50 top-0 left-0 w-[84%] lg:w-[25%] max-md:h-screen overflow-y-auto py-14 px-10 md:h-full h-auto bg-white shadow-xl custom-scrollbar ${
          isSidebarOpen ? "absolute md:relative" : "absolute"
        } flex flex-col`}
      >
        <p
          onClick={toggleSidebar}
          className="text-gray-400 text-[25px] absolute top-4 right-4 cursor-pointer transition-transform hover:scale-110 lg:hidden"
        >
          x
        </p>
        <motion.strong
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="logo text-[32px] text-[#003087] mb-6"
        >
          MBO
        </motion.strong>

        <div className="flex-1 flex flex-col justify-between">
          <nav className="flex flex-col gap-4">
            {navItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Link
                  to={item.to}
                  onClick={handleNavLinkClick}
                  className={`text-[15px] flex items-center gap-4 px-6 py-2 rounded-[11px] transition-all duration-300 relative overflow-hidden ${
                    location.pathname === item.to
                      ? "bg-[#003087] text-white shadow-lg"
                      : "text-[#003087] hover:bg-gray-200"
                  }`}
                >
                  {item.icon}
                  <motion.span
                    whileHover={{
                      scale: 1.1,
                      x: 5,
                      transition: { type: "spring", stiffness: 300 },
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                  </motion.span>
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="flex flex-col gap-6 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="rounded-[16px] border border-[#6A7368] px-4 py-4 flex flex-col gap-6 relative"
            >
              <figure className="flex flex-col items-center">
                <motion.img
                  src={profileData.businesImg}
                  alt="Business-img"
                  className="rounded-full w-[77px] h-[77px] object-cover"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => (e.target.src = BusinessImg)}
                />
                <figcaption className="text-center text-[#003087]">
                  <h3 className="text-[12px]">{profileData.businessName}</h3>
                  <p className="text-[8px]">{profileData.category}</p>
                </figcaption>
              </figure>
              <motion.button
                className="relative text-white text-[14px] rounded-[14px] bg-[#003087] py-3 px-4 shadow-lg overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShareClick}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <FaShareAlt className="text-[16px]" />
                  Share Profile
                </span>
                <span className="absolute inset-0 bg-[#03500F] transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
              </motion.button>
              <AnimatePresence>
                {showShareOptions && (
                  <motion.div
                    variants={shareVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-[#6A7368] rounded-lg shadow-xl p-3 flex gap-3 z-20"
                  >
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleShareAction("social", "whatsapp")}
                      className="text-[#25D366] p-1"
                      title="Share on WhatsApp"
                    >
                      <FaWhatsapp size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleShareAction("social", "facebook")}
                      className="text-[#3b5998] p-1"
                      title="Share on Facebook"
                    >
                      <FaFacebook size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleShareAction("social", "instagram")}
                      className="text-[#E1306C] p-1"
                      title="Copy link for Instagram"
                    >
                      <FaInstagram size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleShareAction("social", "linkedin")}
                      className="text-[#0077B5] p-1"
                      title="Share on LinkedIn"
                    >
                      <FaLinkedin size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleShareAction("social", "twitter")}
                      className="text-[#1DA1F2] p-1"
                      title="Share on Twitter"
                    >
                      <FaTwitter size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleShareAction("copy")}
                      className={`p-1 ${
                        copied ? "text-green-500" : "text-[#003087]"
                      }`}
                      title={copied ? "Copied!" : "Copy Link"}
                    >
                      <FaCopy size={20} />
                      {copied && (
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#003087] text-white text-xs rounded px-2 py-1">
                          Copied!
                        </span>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            {/*
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Link
                to={helpItem.to}
                onClick={handleNavLinkClick}
                className={`text-[15px] flex items-center gap-4 px-6 py-2 rounded-[11px] transition-all duration-300 relative overflow-hidden ${
                  location.pathname === helpItem.to
                    ? "bg-[#003087] text-white shadow-lg"
                    : "text-[#003087] hover:bg-gray-200"
                }`}
              >
                {helpItem.icon}
                <motion.span
                  whileHover={{
                    scale: 1.1,
                    x: 5,
                    transition: { type: "spring", stiffness: 300 },
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {helpItem.label}
                </motion.span>
              </Link>
            </motion.div>
            */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <button
                onClick={handleLogout}
                className="text-[15px] flex items-center gap-4 px-6 py-2 rounded-[11px] transition-all duration-300 relative overflow-hidden text-[#003087] hover:bg-gray-200 w-full text-left"
              >
                <IoIosLogOut className="text-[25px]" />
                <motion.span
                  whileHover={{
                    scale: 1.1,
                    x: 5,
                    transition: { type: "spring", stiffness: 300 },
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.span>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.aside>
      <main
        className={`transition-all duration-500 ${
          isSidebarOpen ? "md:w-[calc(100%-16rem)] ml-auto" : "w-full"
        } h-screen overflow-y-scroll`}
      >
        {!isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute z-50 top-6 lg:left-4 right-4 cursor-pointer border w-fit rounded shadow p-1 bg-white lg:hidden"
          >
            <CgMenuLeftAlt
              onClick={toggleSidebar}
              className="text-[#003087] text-[25px] hover:scale-110 transition-transform"
            />
          </motion.div>
        )}
        <Outlet />
      </main>

      {/* Subscription Modal for Non-Subscribed Users Sharing Profile */}
      {showShareSubscriptionModal && (
        <div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in"
          role="dialog"
          aria-labelledby="subscription-modal-title"
          aria-modal="true"
        >
          <div className="bg-white p-8 rounded-2xl w-[32rem] max-w-[90%] shadow-2xl transform transition-all duration-300 scale-100 hover:scale-105">
            <h2
              id="subscription-modal-title"
              className="text-2xl font-semibold text-[#003087] mb-4"
            >
              Heads up!
            </h2>
            <p className="text-[#003087] mb-6">
              You cannot share your profile until you subscribe.
              <br />
              Want to share your profile with others? Unlock it with a
              subscription.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-6 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-[#003087] font-medium cursor-pointer"
                onClick={() => setShowShareSubscriptionModal(false)}
              >
                Close
              </button>
              <a
                href="/subscribe"
                className="px-6 py-2.5 bg-[#003087] text-white rounded-lg hover:bg-[#003087] transition-colors duration-200 font-medium cursor-pointer"
              >
                Subscribe Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
