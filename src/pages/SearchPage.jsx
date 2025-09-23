import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { CiSearch } from "react-icons/ci";
import { MdOutlineCategory } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import { Link, useNavigate, useLocation } from "react-router-dom";
import BusinessImg from "../assets/user-photo.svg";
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
import Start from "../components/home/Start";
import Footer from "../components/Footer";

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
const ContactDropdown = ({ socialLinks = {}, profileId, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [positionAbove, setPositionAbove] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Safely parse socialLinks
  const parsedSocialLinks = useMemo(() => {
    try {
      if (!socialLinks) return {};
      return typeof socialLinks === "string"
        ? JSON.parse(socialLinks)
        : socialLinks;
    } catch (error) {
      console.error("Error parsing socialLinks:", error);
      return {};
    }
  }, [socialLinks]);

  const socialIcons = {
    whatsapp: { icon: FaWhatsapp, label: "WhatsApp", color: "#25D366" },
    twitter: { icon: FaTwitter, label: "Twitter", color: "#1DA1F2" },
    facebook: { icon: FaFacebook, label: "Facebook", color: "#1877F2" },
    instagram: { icon: FaInstagram, label: "Instagram", color: "#E1306C" },
    linkedin: { icon: FaLinkedin, label: "LinkedIn", color: "#0077B5" },
    youtube: { icon: FaLinkedin, label: "YouTube", color: "#FF0000" },
  };

  const validLinks = Object.entries(parsedSocialLinks)
    .filter(([platform, url]) => url && socialIcons[platform.toLowerCase()])
    .map(([platform, url]) => {
      const platformKey = platform.toLowerCase();
      return {
        platform,
        url,
        ...(socialIcons[platformKey] || {
          icon: FaLinkedin,
          label: platform,
          color: "#333",
        }),
      };
    });

  useEffect(() => {
    if (isOpen && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const dropdownHeight = dropdownRect.height;

      setPositionAbove(
        spaceBelow < dropdownHeight && buttonRect.top > dropdownHeight
      );
    }
  }, [isOpen]);

  if (validLinks.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-3">No contact info available</p>
    );
  }

  return (
    <div className="relative flex-1">
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#043D12] to-[#002f87d5] px-6 py-3 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
      >
        Contact
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
            className={`absolute w-full rounded-lg bg-white shadow-xl z-[60] border border-gray-100 ${
              positionAbove ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"
            }`}
          >
            {validLinks.map(({ platform, url, icon: Icon, label, color }) => (
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
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Modal Component
const Modal = ({ product, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!product || !product.profile) {
    console.error("Modal rendered without required data", { product });
    return null;
  }

  const { profile, name, description, imageUrl, category } = product;

  const handleViewProfile = () => {
    if (!profile?.id) {
      console.error("Cannot navigate: Profile ID is missing", { profile });
      alert("Unable to view profile: Profile information not available");
      return;
    }
    navigate(`/community/profile/${profile.id}`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-white rounded-2xl w-full max-w-4xl flex flex-col md:flex-row max-h-[85vh] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute z-50 top-4 right-4 text-gray-600 hover:text-[#003087] text-xl bg-white/80 rounded-full p-2 shadow-sm"
        >
          <FaTimes />
        </motion.button>

        <div className="md:w-1/2 p-6 md:p-8 bg-gradient-to-b from-[#FEFEFF] to-[#E8EFE5]">
          <img
            src={imageUrl || profile.businesImg || BusinessImg}
            alt={name || profile.businessName || "Business"}
            className="w-full h-[250px] md:h-[350px] object-cover rounded-xl shadow-md"
            onError={(e) => (e.target.src = BusinessImg)}
          />
        </div>

        <div className="md:w-1/2 p-6 md:p-8 flex flex-col gap-5 bg-white overflow-y-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003087] leading-tight">
            {name || "Unnamed Product"}
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong className="text-[#003087]">Business:</strong>
              <span
                className="cursor-pointer underline hover:text-[#002f87d5] transition-colors"
                onClick={handleViewProfile}
              >
                {" "}
                {profile.businessName || "Unknown Business"}
              </span>
            </p>
            <p>
              <strong className="text-[#003087]">Category:</strong>{" "}
              {category?.name || "No Category"}
            </p>
            <p>
              <strong className="text-[#003087]">Location:</strong>{" "}
              {profile.location || "Not specified"}
            </p>
            <p className="leading-relaxed">
              <strong className="text-[#003087]">Description:</strong>{" "}
              {description || "No product description available"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 relative z-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewProfile}
              className="flex-1 rounded-full bg-[#003087] text-white px-6 py-3 text-sm font-semibold hover:bg-[#002f87d5] transition-colors shadow-md"
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

// SearchPage Component
const SearchPage = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const API_URL = `${import.meta.env.VITE_BASE_URL}/member/all-products`;
        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data?.success && response.data.products) {
          const parsedProducts = response.data.products
            .map((product) => {
              // Skip products with null profiles
              if (!product.profile) {
                console.warn("Skipping product with null profile:", product.id);
                return null;
              }

              return {
                ...product,
                profile: {
                  businessName: "Unknown Business",
                  businesImg: BusinessImg,
                  location: "Not specified",
                  description: "No description available",
                  socialLinks: {},
                  ...product.profile,
                  id: product.profileId,
                  socialLinks: product.profile.socialLinks
                    ? JSON.parse(product.profile.socialLinks)
                    : {},
                },
                category: {
                  name: "Uncategorized",
                  ...product.category,
                },
              };
            })
            .filter(Boolean); // Remove null entries

          if (parsedProducts.length === 0) {
            throw new Error("No products available on the platform yet.");
          }

          const shuffledProducts = parsedProducts.sort(
            () => Math.random() - 0.5
          );
          setProducts(shuffledProducts);
        } else {
          throw new Error("No products available on the platform yet.");
        }
      } catch (error) {
        console.error("❌ Error Fetching Products:", {
          message: error.message,
          response: error.response?.data,
        });
        setError(
          error.response?.data?.message ||
            "No products available on the platform yet."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const getUniqueCategories = useMemo(() => {
    const categories = products
      .map((product) => product.category?.name)
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    return ["All Categories", ...categories];
  }, [products]);

  const getUniqueLocations = useMemo(() => {
    const locations = products
      .map((product) => product.profile?.location)
      .filter(
        (value, index, self) =>
          value && self.indexOf(value) === index && value !== "Not specified"
      )
      .sort();
    return ["All Locations", ...locations];
  }, [products]);

  const visibleCategories = showAllCategories
    ? getUniqueCategories
    : getUniqueCategories.slice(0, 5);
  const visibleLocations = showAllLocations
    ? getUniqueLocations
    : getUniqueLocations.slice(0, 5);

  const filterProducts = useMemo(() => {
    return products.filter((product) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesCategory =
        !filterCategory ||
        filterCategory === "All Categories" ||
        product.category?.name === filterCategory;
      const matchesLocation =
        !filterLocation ||
        filterLocation === "All Locations" ||
        product.profile?.location === filterLocation;
      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.profile?.businessName?.toLowerCase().includes(query) ||
        product.profile?.description?.toLowerCase().includes(query) ||
        product.category?.name.toLowerCase().includes(query);
      return matchesCategory && matchesLocation && matchesSearch;
    });
  }, [products, searchQuery, filterCategory, filterLocation]);

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
              No Products Available Yet
            </h2>
            <p className="text-sm text-gray-600 mt-3 max-w-md mx-auto">
              It looks like there are no products on the platform yet. Check
              back soon for exciting new listings or explore our businesses to
              connect with your favourite businesses!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="flex-1 bg-[#003087] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#002f87d5] transition-colors shadow-md"
              >
                Check Again
              </motion.button>
              <Link
                to="/community/all-businesses"
                className="flex-1 bg-white text-[#003087] px-6 py-3 rounded-full text-sm font-semibold border border-[#043D12] hover:bg-gray-100 transition-colors shadow-md"
              >
                Explore Businesses
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
      <div className="container px-[5vw] mx-auto pb-8">
        <header className="border-[1px] border-gray-200 flex flex-col gap-2 mb-6 sticky top-0 z-50 bg-white/80 backdrop-blur-md py-4 md:pb-3 rounded-lg shadow-sm md:shadow-md px-2 md:px-3 md:mt-0">
          <div className="relative">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-gray-100 text-[#003087] placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#043D12]/50 transition-all duration-300"
              placeholder="Search products, businesses, or services聭
services..."
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
                    className="absolute left-0 top-[calc(100%+4px)] w-40 bg-white rounded-lg shadow-xl z-[100] border border-gray-100 max-h-96 overflow-y-auto"
                    style={{ backgroundColor: "#FFFDF2" }}
                  >
                    {visibleCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryFilter(category)}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          filterCategory ===
                          (category === "All Categories" ? "" : category)
                            ? "bg-[#003087] text-white"
                            : "text-[#003087] hover:bg-gray-100"
                        } transition-colors`}
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
                    className="absolute left-0 top-[calc(100%+4px)] w-40 bg-white rounded-lg shadow-xl z-[100] border border-gray-100 max-h-96 overflow-y-auto"
                    style={{ backgroundColor: "#FFFDF2" }}
                  >
                    {visibleLocations.map((location) => (
                      <button
                        key={location}
                        onClick={() => handleLocationFilter(location)}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          filterLocation ===
                          (location === "All Locations" ? "" : location)
                            ? "bg-[#003087] text-white"
                            : "text-[#003087] hover:bg-gray-100"
                        } transition-colors`}
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

            <Link
              to="/community/all-businesses"
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#003087] bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition-colors"
            >
              All Businesses
            </Link>
          </div>
        </header>

        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-[#003087] mb-6">
            All Products
          </h1>
          {filterProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filterProducts.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => setSelectedItem(product)}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src={product.profile.businesImg || BusinessImg}
                        alt={product.profile.businessName || "Business"}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => (e.target.src = BusinessImg)}
                      />
                      <h3 className="text-sm font-semibold text-[#003087] truncate">
                        {product.profile.businessName || "Unknown Business"}
                      </h3>
                    </div>
                    <img
                      src={
                        product.imageUrl ||
                        product.profile.businesImg ||
                        BusinessImg
                      }
                      alt={
                        product.name ||
                        product.profile.businessName ||
                        "Product"
                      }
                      className="w-full h-56 object-cover rounded-xl"
                      onError={(e) => (e.target.src = BusinessImg)}
                    />
                    <div className="mt-3">
                      <p className="text-base font-medium text-[#003087] truncate">
                        {product.name || "No Product Listed"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {product.category?.name || "No Category"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {product.description || "No product description"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Player
                autoplay
                loop
                src="https://lottie.host/7fd33a4f-2e59-4f34-ba0c-4af37814586e/Cq1qkcf16G.lottie"
                style={{ height: "200px", width: "200px" }}
              />
              <h2 className="text-xl font-bold text-[#003087] mt-4">
                No Results Found
              </h2>
              <p className="text-sm text-gray-600 text-center max-w-md mt-2">
                Try adjusting your search or filters to find products and
                businesses that match your needs.
              </p>
              <button
                className="mt-6 bg-[#003087] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#002f87d5] transition-colors"
                onClick={() => {
                  setSearchQuery("");
                  setFilterCategory("");
                  setFilterLocation("");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
      <Modal product={selectedItem} onClose={() => setSelectedItem(null)} />
      <Start />
      <Footer />
    </div>
  );
};

export default SearchPage;
