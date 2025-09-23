import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { CiSearch, CiLocationOn } from "react-icons/ci";
import { MdOutlineCategory } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import {
  FaTimes,
  FaWhatsapp,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaFilter,
} from "react-icons/fa";
import { Player } from "@lottiefiles/react-lottie-player";
import BusinessImg from "../../assets/user-photo.svg";
import NetworkError from "../NetworkError";
import Start from "../home/Start";
import Footer from "../Footer";
import { BsBodyText } from "react-icons/bs";

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

// Contact Dropdown Component
const ContactDropdown = ({ socialLinks, profileId, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [positionAbove, setPositionAbove] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  if (!socialLinks || Object.keys(socialLinks).length === 0) {
    return (
      <p className="text-gray-500 text-sm py-2">No contact info available</p>
    );
  }

  const socialIcons = {
    whatsapp: { icon: FaWhatsapp, label: "WhatsApp", color: "#25D366" },
    twitter: { icon: FaTwitter, label: "Twitter", color: "#1DA1F2" },
    facebook: { icon: FaFacebook, label: "Facebook", color: "#1877F2" },
    instagram: { icon: FaInstagram, label: "Instagram", color: "#E1306C" },
    linkedin: { icon: FaLinkedin, label: "LinkedIn", color: "#0077B5" },
  };

  const validLinks = Object.entries(socialLinks).filter(
    ([platform, url]) => url && socialIcons[platform.toLowerCase()]
  );

  useEffect(() => {
    if (isOpen && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const dropdownHeight = dropdownRect.height;

      // Position above if not enough space below and enough space above
      if (spaceBelow < dropdownHeight && buttonRect.top > dropdownHeight) {
        setPositionAbove(true);
      } else {
        setPositionAbove(false);
      }
    }
  }, [isOpen]);

  return (
    <div className="relative flex-1">
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-fit cursor-pointer flex items-center justify-center gap-0 rounded-full bg-gradient-to-r from-[#043D12] to-[#002f87d5] px-4 py-2 text-white text-sm font-medium shadow-lg transition-transform duration-300 max-sm:w-full"
      >
        Contact Business
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <RiArrowDropDownLine className="text-lg" />
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: positionAbove ? 10 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: positionAbove ? 10 : -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute w-full max-w-[200px] rounded-lg bg-white shadow-xl z-[60] border border-gray-100 ${
              positionAbove ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"
            }`}
            style={{ maxHeight: "200px" }}
          >
            {validLinks.map(([platform, url]) => {
              const {
                icon: Icon,
                label,
                color,
              } = socialIcons[platform.toLowerCase()];
              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (platform.toLowerCase() === "whatsapp") {
                      trackWhatsAppClick(profileId);
                    }
                    setIsOpen(false);
                    onClose();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <Icon style={{ color }} className="text-lg" />
                  <span>{label}</span>
                </a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Modal Component
const Modal = ({ profile, onClose }) => {
  if (!profile) return null;

  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/community/profile/${profile.id}`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-white rounded-2xl w-[90%] max-w-4xl flex flex-col md:flex-row max-h-[90vh] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute z-50 top-4 right-4 text-gray-500 hover:text-[#003087] text-xl bg-white/80 rounded-full p-2 shadow-sm"
        >
          <FaTimes />
        </motion.button>
        <div className="md:w-1/2 p-6 md:p-8 bg-gradient-to-b from-[#FEFEFF] to-[#E8EFE5]">
          <img
            src={
              profile.productImages?.[0]?.imageUrl ||
              profile.businesImg ||
              BusinessImg
            }
            alt={profile.businessName}
            className="w-full h-[250px] md:h-[350px] object-cover rounded-xl shadow-md"
            onError={(e) => (e.target.src = BusinessImg)}
          />
        </div>
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col gap-4 bg-white overflow-y-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003087] truncate">
            {profile.businessName}
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong className="text-[#003087]">Category:</strong>{" "}
              {profile.categories?.[0]?.name || "No Category"}
            </p>
            <p>
              <strong className="text-[#003087]">Location:</strong>{" "}
              {profile.location || "Not specified"}
            </p>
            <p>
              <strong className="text-[#003087]">Description:</strong>{" "}
              {profile.description || "No description available"}
            </p>
          </div>
          <div className="flex max-sm:flex-col gap-4 mt-6 relative z-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewProfile}
              className="flex-1 cursor-pointer rounded-full bg-[#003087] text-white px-4 py-2 text-sm font-medium hover:bg-[#002f87d5] transition-colors shadow-md"
            >
              View Profile
            </motion.button>
            <ContactDropdown
              socialLinks={profile.socialLinks}
              profileId={profile.id}
              onClose={onClose}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Component
const AllBusiness = () => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [newProfiles, setNewProfiles] = useState([]);
  const [trendingProfiles, setTrendingProfiles] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const newURL = `${import.meta.env.VITE_BASE_URL}/member/all-profiles`;
      const newResponse = await axios.get(newURL);
      if (newResponse.data?.success && newResponse.data.profiles) {
        setNewProfiles(newResponse.data.profiles);
      } else {
        throw new Error("No businesses available on the platform yet.");
      }

      const trendingURL = `${
        import.meta.env.VITE_BASE_URL
      }/member/all-trending`;
      const trendingResponse = await axios.get(trendingURL);
      if (trendingResponse.data?.success && trendingResponse.data.profiles) {
        setTrendingProfiles(trendingResponse.data.profiles);
      } else {
        throw new Error("No businesses available on the platform yet.");
      }

      const allURL = `${import.meta.env.VITE_BASE_URL}/member/random-profiles`;
      const allResponse = await axios.get(allURL);
      if (allResponse.data?.success && allResponse.data.profiles) {
        setAllProfiles(allResponse.data.profiles);
      } else {
        throw new Error("No businesses available on the platform yet.");
      }
    } catch (error) {
      console.error("❌ Error Fetching Profiles:", error);
      setError(
        error.response?.data?.message ||
          "No businesses available on the platform yet."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const getUniqueCategories = useMemo(() => {
    const categories = [...newProfiles, ...trendingProfiles, ...allProfiles]
      .flatMap((profile) => profile.categories?.map((cat) => cat.name) || [])
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return ["All Categories", ...categories];
  }, [newProfiles, trendingProfiles, allProfiles]);

  const getUniqueLocations = useMemo(() => {
    const locations = [...newProfiles, ...trendingProfiles, ...allProfiles]
      .map((profile) => profile.location)
      .filter(
        (value, index, self) =>
          value && self.indexOf(value) === index && value !== "Not specified"
      )
      .sort();
    return ["All Locations", ...locations];
  }, [newProfiles, trendingProfiles, allProfiles]);

  const visibleCategories = showAllCategories
    ? getUniqueCategories
    : getUniqueCategories.slice(0, 5);
  const visibleLocations = showAllLocations
    ? getUniqueLocations
    : getUniqueLocations.slice(0, 5);

  const filterProfiles = useMemo(() => {
    return (profiles) => {
      return profiles.filter((profile) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          profile.businessName?.toLowerCase().includes(query) ||
          profile.description?.toLowerCase().includes(query) ||
          profile.categories?.some((cat) =>
            cat.name.toLowerCase().includes(query)
          );
        const matchesCategory =
          !filterCategory ||
          filterCategory === "All Categories" ||
          profile.categories?.some((cat) => cat.name === filterCategory);
        const matchesLocation =
          !filterLocation ||
          filterLocation === "All Locations" ||
          profile.location === filterLocation;
        return matchesSearch && matchesCategory && matchesLocation;
      });
    };
  }, [searchQuery, filterCategory, filterLocation]);

  const filteredNewProfiles = filterProfiles(newProfiles);
  const filteredTrendingProfiles = filterProfiles(trendingProfiles);
  const filteredAllProfiles = filterProfiles(allProfiles);

  const handleCardClick = (profile) => {
    setSelectedProfile({ profile });
  };

  const handleCloseModal = () => {
    setSelectedProfile(null);
  };

  const handleCategoryFilter = (category) => {
    setFilterCategory(category === "All Categories" ? "" : category);
    setIsCategoryOpen(false);
  };

  const handleLocationFilter = (location) => {
    setFilterLocation(location === "All Locations" ? "" : location);
    setIsLocationOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#FEFEFF] to-[#E8EFE5]">
        <div className="w-10 h-10 border-4 border-[#043D12] border-t-transparent rounded-full animate-spin"></div>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-[80vh] bg-gradient-to-b from-[#FEFEFF] to-[#E8EFE5] flex flex-col items-center justify-center px-[5vw]"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center">
            <Player
              autoplay
              loop
              src="https://lottie.host/7fd33a4f-2e59-4f34-ba0c-4af37814586e/Cq1qkcf16G.lottie"
              style={{ height: "150px", width: "150px", margin: "0 auto" }}
            />
            <h2 className="text-2xl font-bold text-[#003087] mt-6">
              No Businesses Available Yet
            </h2>
            <p className="text-sm text-gray-600 mt-3 max-w-md mx-auto">
              It looks like there are no businesses on the platform yet. Check
              back soon for exciting new listings or explore our products to
              discover what's available!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchProfiles}
                className="flex-1 bg-[#003087] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#002f87d5] transition-colors shadow-md"
              >
                Check Again
              </motion.button>
              <Link
                to="/community"
                className="flex-1 bg-white text-[#003087] px-6 py-3 rounded-full text-sm font-semibold border border-[#043D12] hover:bg-gray-100 transition-colors shadow-md"
              >
                Explore Products
              </Link>
            </div>
          </div>
        </motion.div>
        <Start />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FEFEFF] to-[#E8EFE5] font-sans">
      <div className="container px-[5vw] mx-auto py-8">
        {/* Responsive Header with Search and Filters */}
        <header
          className="flex flex-col gap-2 mb-6 sticky top-0 z-50 bg-white/80 backdrop-blur-md py-3 rounded-lg shadow-md px-3 border-[1px] border-gray-200"
          style={{ position: "sticky", zIndex: 50, overflow: "visible" }}
        >
          <div className="relative">
            <input
              type="text"
              className="w-full border-[1px] border-gray-200 pl-10 pr-4 py-2 text-sm rounded-full bg-white text-[#003087] placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-[#043D12] transition-all"
              placeholder="Search businesses or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#003087] text-lg" />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterCategory("");
                setFilterLocation("");
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#003087] bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition-colors"
            >
              <FaFilter className="text-xs" />
              Clear Filters
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  setIsCategoryOpen((prev) => {
                    const newState = !prev;
                    setIsLocationOpen(false);
                    return newState;
                  });
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#003087] bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition-colors active:bg-gray-200"
              >
                <MdOutlineCategory className="text-xs" />
                {filterCategory || "Category"}
                {isCategoryOpen ? (
                  <RiArrowDropUpLine className="text-base" />
                ) : (
                  <RiArrowDropDownLine className="text-base" />
                )}
              </button>
              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-0 top-[calc(100%+4px)] w-48 bg-white rounded-lg shadow-xl z-[100] border border-gray-100 max-h-96 overflow-y-auto"
                  >
                    {visibleCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryFilter(category)}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          filterCategory ===
                          (category === "All Categories" ? "" : category)
                            ? "bg-[#003087] text-white"
                            : "text-[#003087] hover:bg-[#FEFEFF]"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                    {getUniqueCategories.length > 5 && (
                      <button
                        onClick={() => setShowAllCategories(!showAllCategories)}
                        className="w-full text-left px-4 py-2 text-sm text-[#003087] hover:bg-gray-100 font-medium flex items-center gap-2"
                      >
                        {showAllCategories ? (
                          <span>
                            <RiArrowDropUpLine /> See Less
                          </span>
                        ) : (
                          <span>
                            <RiArrowDropDownLine /> See More
                          </span>
                        )}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setIsLocationOpen((prev) => {
                    const newState = !prev;
                    setIsCategoryOpen(false);
                    return newState;
                  });
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#003087] bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition-colors active:bg-gray-200"
              >
                <IoLocationOutline className="text-xs" />
                {filterLocation || "Location"}
                {isLocationOpen ? (
                  <RiArrowDropUpLine className="text-base" />
                ) : (
                  <RiArrowDropDownLine className="text-base" />
                )}
              </button>
              <AnimatePresence>
                {isLocationOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-0 top-[calc(100%+4px)] w-48 bg-white rounded-lg shadow-xl z-[100] border border-gray-100 max-h-96 overflow-y-auto"
                  >
                    {visibleLocations.map((location) => (
                      <button
                        key={location}
                        onClick={() => handleLocationFilter(location)}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          filterLocation ===
                          (location === "All Locations" ? "" : location)
                            ? "bg-[#003087] text-white"
                            : "text-[#003087] hover:bg-[#FEFEFF]"
                        }`}
                      >
                        {location}
                      </button>
                    ))}
                    {getUniqueLocations.length > 5 && (
                      <button
                        onClick={() => setShowAllLocations(!showAllLocations)}
                        className="w-full text-left px-4 py-2 text-sm text-[#003087] hover:bg-gray-100 font-medium flex items-center gap-2"
                      >
                        {showAllLocations ? (
                          <span>
                            <RiArrowDropUpLine /> See Less
                          </span>
                        ) : (
                          <span>
                            <RiArrowDropDownLine /> See More
                          </span>
                        )}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div>
              <Link
                to="/community"
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#003087] bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition-colors"
              >
                All Products
              </Link>
            </div>
          </div>
        </header>

        {/* Businesses Sections */}
        {filteredNewProfiles.length === 0 &&
        filteredTrendingProfiles.length === 0 &&
        filteredAllProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#043D12] border-t-transparent rounded-full animate-spin"></div>
            <style jsx>{`
              @keyframes spin {
                to {
                  transform: rotate(360deg);
                }
              }
              .animate-spin {
                animation: spin 1s linear infinite;
              }
            `}</style>
            <h2 className="text-xl font-bold text-[#003087] mt-4">
              No Results Found
            </h2>
            <p className="text-sm text-gray-600 text-center max-w-md mt-2">
              Try adjusting your search or filters to find businesses that match
              your needs.
            </p>
            <button
              className="mt-6 bg-[#003087] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#002f87d5] transition-colors"
              onClick={() => {
                setSearchQuery("");
                setFilterCategory("");
                setFilterLocation("");
              }}
            >
              Clear Search & Filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-24">
            {/* Newly Added Businesses */}
            {filteredNewProfiles.length > 0 && (
              <div>
                <h1 className="text-[#003087] text-2xl font-semibold">
                  Newly Added Businesses
                </h1>
                <div className="w-full grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-2 max-[280px]:grid-cols-1 gap-4">
                  {filteredNewProfiles.map((profile, index) => (
                    <div
                      key={profile.id}
                      className="flex flex-col gap-2 cursor-pointer h-[350px] my-4"
                      onClick={() => handleCardClick(profile)}
                    >
                      <div className="profile flex items-center gap-2">
                        <img
                          src={profile.businesImg || BusinessImg}
                          alt={profile.businessName}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => (e.target.src = BusinessImg)}
                        />
                        <p className="text-[12px] text-[#003087] truncate">
                          {profile.businessName}
                        </p>
                      </div>
                      <figure className="flex-1">
                        <img
                          src={
                            profile.productImages?.[0]?.imageUrl ||
                            profile.businesImg ||
                            BusinessImg
                          }
                          alt={profile.businessName}
                          className="w-full h-[300px] object-cover rounded-lg"
                          onError={(e) => (e.target.src = BusinessImg)}
                        />
                        <figcaption className="flex flex-col gap-2 text-[#003087] py-2">
                          <div className="flex flex-col gap-1">
                            <b className="lg:text-[15px] text-[10px] truncate">
                              {profile.businessName}
                            </b>
                            <p className="text-[10px]">
                              {profile.categories[0]?.name ||
                                "Unknown Category"}
                            </p>
                          </div>
                        </figcaption>
                      </figure>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Businesses */}
            {filteredTrendingProfiles.length > 0 && (
              <div>
                <h1 className="mt-2 text-[#003087] sticky text-2xl font-semibold">
                  Trending Businesses
                </h1>
                <div className="w-full grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-2 max-[280px]:grid-cols-1 gap-4">
                  {filteredTrendingProfiles.map((profile, index) => (
                    <div
                      key={profile.id}
                      className="flex flex-col gap-2 cursor-pointer h-[350px] my-4"
                      onClick={() => handleCardClick(profile)}
                    >
                      <div className="profile flex items-center gap-2">
                        <img
                          src={
                            profile.businesImg || BusinessImg.githubusercontent
                          }
                          alt={profile.businessName}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => (e.target.src = BusinessImg)}
                        />
                        <p className="text-[12px] text-[#003087] truncate">
                          {profile.businessName}
                        </p>
                      </div>
                      <figure className="flex-1">
                        <img
                          src={
                            profile.productImages?.[0]?.imageUrl ||
                            profile.businesImg ||
                            BusinessImg
                          }
                          alt={profile.businessName}
                          className="w-full h-[300px] object-cover rounded-lg"
                          onError={(e) => (e.target.src = BusinessImg)}
                        />
                        <figcaption className="flex flex-col gap-2 text-[#003087] py-2">
                          <div className="flex flex-col gap-1">
                            <b className="lg:text-[15px] text-[10px] truncate">
                              {profile.businessName}
                            </b>
                            <p className="text-[10px]">
                              {profile.categories[0]?.name ||
                                "Unknown Category"}
                            </p>
                          </div>
                        </figcaption>
                      </figure>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Businesses */}
            {filteredAllProfiles.length > 0 && (
              <div>
                <h1 className="mt-2 sticky text-2xl font-semibold text-[#003087]">
                  All Businesses
                </h1>
                <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-10 mb-12">
                  {filteredAllProfiles.map((profile, index) => (
                    <div
                      key={profile.id}
                      className="relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow p-4 my-4"
                    >
                      <div className="">
                        <div className="imgs w-full h-[80px] relative">
                          {!profile.productImages ||
                          profile.productImages.length === 0 ? (
                            <img
                              src={profile.businesImg || BusinessImg}
                              alt={profile.businessName}
                              className="w-full h-[80px] object-cover rounded-xl"
                              onError={(e) => (e.target.src = BusinessImg)}
                            />
                          ) : (
                            <div
                              className={`w-full h-[80px] grid gap-2 justify-center items-center ${
                                (profile.productImages || []).filter(
                                  (img) => img?.imageUrl
                                ).length === 1
                                  ? "grid-cols-1"
                                  : (profile.productImages || []).filter(
                                      (img) => img?.imageUrl
                                    ).length === 2
                                  ? "grid-cols-2"
                                  : "grid-cols-3"
                              }`}
                            >
                              {(profile.productImages || [])
                                .filter((img) => img?.imageUrl)
                                .slice(0, 3)
                                .map((img, i, arr) => {
                                  const imageCount = arr.length;
                                  return (
                                    <img
                                      key={i}
                                      src={
                                        img.imageUrl ||
                                        profile.businesImg ||
                                        BusinessImg
                                      }
                                      alt={profile.businessName}
                                      className={`w-full h-[80px] object-cover truncate ${
                                        imageCount === 1
                                          ? "rounded-xl"
                                          : i === 0
                                          ? "rounded-l-xl"
                                          : i === imageCount - 1
                                          ? "rounded-r-xl"
                                          : ""
                                      }`}
                                      onError={(e) =>
                                        (e.target.src = BusinessImg)
                                      }
                                    />
                                  );
                                })}
                            </div>
                          )}
                          <img
                            src={profile.businesImg || BusinessImg}
                            alt={profile.businessName}
                            className="absolute top-[45px] left-1/2 transform -translate-x-1/2 w-[70px] h-[70px] rounded-full object-cover border-2 border-[#FEFEFF] shadow-lg cursor-pointer"
                            onError={(e) => (e.target.src = BusinessImg)}
                            onClick={() => handleCardClick(profile)}
                          />
                        </div>

                        <figure className="flex flex-col gap-2 items-center mt-[40px] justify-center">
                          <figcaption className="name text-center flex flex-col gap-2">
                            <div className="text-[#003087] text-[16px] font-semibold line-clamp-1">
                              {profile.businessName}
                            </div>
                            <p className="flex items-center gap-2 justify-center text-[#003087] text-[12px]">
                              <CiLocationOn />
                              {profile.location || "Not specified"}
                            </p>
                            <p
                              className="text-[#003087] border-[1px] border-[#6A7368] rounded-[4px] w-fit mx-auto px-4 py-2 text-[10px] cursor-pointer"
                              onClick={() => handleCardClick(profile)}
                            >
                              {profile.categories[0]?.name ||
                                "Unknown Category"}
                            </p>
                            <div className="details flex items-center justify-center">
                              <div className="views px-4">
                                <h4 className="text-[12px] text-[#003087] font-bold truncate">
                                  {profile.views}
                                </h4>
                                <p className="text-[8px] text-[#003087]">
                                  Views
                                </p>
                              </div>
                            </div>
                            {profile.socialLinks?.whatsapp ? (
                              <a
                                href={profile.socialLinks.whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-fit text-[#003087] border-[1px] border-[#6A7368] rounded-[20px] hover:bg-[#003087] px-12 py-2 hover:text-white flex items-center gap-2 m-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  trackWhatsAppClick(profile.id);
                                }}
                              >
                                <FaWhatsapp className="text-[20px]" />
                                Message
                              </a>
                            ) : (
                              <p className="text-gray-600 text-[12px] text-center">
                                WhatsApp not available
                              </p>
                            )}
                          </figcaption>
                        </figure>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedProfile && (
        <Modal profile={selectedProfile.profile} onClose={handleCloseModal} />
      )}
      <Start />
      <Footer />
    </div>
  );
};

export default AllBusiness;
