import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BsPerson } from "react-icons/bs";
import { MdOutlineCategory } from "react-icons/md";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { FaPen, FaPlus, FaTimes } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Hand from "../components/svgs/Hand";
import { TbFileDescription } from "react-icons/tb";

const BusinessProfile = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({
    id: "",
    name: "",
  });
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isKeywordInputFocused, setIsKeywordInputFocused] = useState(false); // New state for input focus
  const [validationErrors, setValidationErrors] = useState({
    businessName: false,
    category: false,
    keywords: false,
    description: false,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const token = useSelector((state) => state.auth.token);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const dropdownRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/member/all-category`);
        setCategories(response.data.category || response.data.categories || []);
        setIsLoadingCategories(false);
      } catch (error) {
        toast.error("Failed to load categories. Please try again.", {
          position: "top-center",
          autoClose: 3000,
        });
        setCategories([]);
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [BASE_URL]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const handleCategorySelect = (id, name) => {
    setSelectedCategory({ id, name });
    setShowDropdown(false);
    setValidationErrors((prev) => ({ ...prev, category: false }));
  };

  const addKeyword = () => {
    if (currentKeyword.trim() && keywords.length < 5) {
      setKeywords([...keywords, currentKeyword.trim()]);
      setCurrentKeyword("");
      setValidationErrors((prev) => ({ ...prev, keywords: false }));
    } else if (keywords.length >= 5) {
      toast.error("Maximum of 5 keywords allowed.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const removeKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {
      businessName: !businessName.trim(),
      category: !selectedCategory.id,
      keywords: keywords.length < 3 || keywords.length > 5,
      description: !description.trim(),
    };

    setValidationErrors(errors);

    if (errors.businessName) {
      toast.error("Business name is required.", {
        position: "top-center",
        autoClose: 3000,
      });
      formRef.current?.querySelector('input[name="businessName"]')?.focus();
      return false;
    }

    if (errors.category) {
      toast.error("Please select a business category.", {
        position: "top-center",
        autoClose: 3000,
      });
      return false;
    }

    if (keywords.length < 3) {
      toast.error("Please enter at least 3 keywords.", {
        position: "top-center",
        autoClose: 3000,
      });
      formRef.current?.querySelector('input[name="keyword"]')?.focus();
      return false;
    }

    if (keywords.length > 5) {
      toast.error("Maximum of 5 keywords allowed.", {
        position: "top-center",
        autoClose: 3000,
      });
      return false;
    }

    if (errors.description) {
      toast.error("Description is required.", {
        position: "top-center",
        autoClose: 3000,
      });
      formRef.current?.querySelector('textarea[name="description"]')?.focus();
      return false;
    }

    if (!token) {
      toast.error("Token missing. Please log in again.", {
        position: "top-center",
        autoClose: 3000,
      });
      navigate("/login");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const step1Data = {
      businessName,
      categoryId: selectedCategory.id,
      keyword: keywords.join(", "),
      description,
    };

    sessionStorage.setItem("businessProfileStep1", JSON.stringify(step1Data));

    setTimeout(() => {
      setLoading(false);
      navigate("/business-profile2");
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <div className="w-full h-screen flex justify-center lg:grid grid-cols-2">
      <div className="max-lg:hidden w-full h-full flex justify-center items-center bg-[url('/Group2.svg')] bg-cover bg-center bg-[#003087]">
        <div className="w-full h-[90%] flex flex-col items-center">
          <div className="container px-[5vw] mx-auto text-[#FEFEFF] mt-8">
            <Link
              to="/"
              className="lg:text-[50px] text-[32px] font-medium leading-[70px]"
            >
              Tell us about <br /> your business
            </Link>
            <p className="text-[18px]">
              Step into a community that puts your business in the spotlight.
            </p>
          </div>
        </div>
      </div>
      <div className="relative max-lg:w-full flex flex-col items-center lg:justify-center bg-[#FEFEFF] max-md:bg-[url('/bg-login.svg')] bg-cover bg-center">
        <div className="container px-[5vw] mx-auto h-fit max-lg:mt-20">
          <div className="absolute top-0 right-0 m-2 text-[#003087] font-medium">
            1 of 2
          </div>
          <Link
            to="/"
            className="lg:text-[50px] text-[32px] font-bold text-[#363636]"
          >
            MBO
          </Link>
          <h4 className="lg:text-[32px] text-[20px] font-medium text-[#003087] flex items-center gap-2">
            Set Up Business Profile <Hand />
          </h4>
          <form
            ref={formRef}
            className="max-lg:w-full flex flex-col gap-6 md:mt-8 mt-16 max-lg:items-center"
            onSubmit={handleSubmit}
          >
            <div
              className={`max-lg:w-full border-[1px] rounded-[27px] px-8 border-${
                validationErrors.businessName ? "[#FF0000]" : "[#363636]"
              } flex items-center gap-2 lg:h-[60px] h-[48px]`}
            >
              <BsPerson className="text-[#003087]" />
              <input
                type="text"
                name="businessName"
                required
                placeholder="Business Name"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  setValidationErrors((prev) => ({
                    ...prev,
                    businessName: false,
                  }));
                }}
                className="w-full h-full border-none focus:outline-none text-[#003087]"
              />
            </div>

            <div
              className={`max-lg:w-full border-[1px] rounded-[27px] px-8 border-${
                validationErrors.category ? "[#FF0000]" : "[#363636]"
              } flex flex-col relative`}
              ref={dropdownRef}
            >
              <button
                type="button"
                className="flex items-center justify-between text-[#003087] w-full h-[48px] focus:outline-none cursor-pointer"
                onClick={toggleDropdown}
              >
                <div className="flex items-center gap-2">
                  <MdOutlineCategory className="text-[#003087] text-[18px]" />
                  <span className="text-sm md:text-base">
                    {selectedCategory.name || "Select Business Category"}
                  </span>
                </div>
                {showDropdown ? (
                  <IoMdArrowDropup className="text-[#003087]" />
                ) : (
                  <IoMdArrowDropdown className="text-[#003087]" />
                )}
              </button>
              {showDropdown && isLoadingCategories ? (
                <p className="absolute top-[50px] left-0 w-full bg-[#FEFEFF] text-[#003087] p-2">
                  Loading categories...
                </p>
              ) : showDropdown && categories.length > 0 ? (
                <ul className="absolute top-[50px] border-4 border-[#043D12] left-0 w-full bg-[#FEFEFF] text-[#003087] rounded-[25px] mt-2 p-2 shadow-lg max-h-[200px] overflow-y-auto z-10">
                  {categories.map((category) => (
                    <li
                      key={category.id}
                      className="py-2 px-4 cursor-pointer hover:bg-[#003087]/30 rounded-[20px]"
                      onClick={() =>
                        handleCategorySelect(category.id, category.name)
                      }
                    >
                      {category.name}
                      {category.description && (
                        <p className="text-xs text-[#003087]/90">
                          {category.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : showDropdown ? (
                <p className="absolute top-[50px] left-0 w-full bg-[#FEFEFF] text-[#003087] p-2">
                  No categories available.
                </p>
              ) : null}
            </div>

            <div className="max-lg:w-full flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="bg-[#003087] text-[#FEFEFF] rounded-full px-3 py-1 flex items-center gap-1 text-sm shadow-md transition-all duration-200 hover:bg-[#1A5A2C]"
                  >
                    {keyword}
                    <FaTimes
                      className="cursor-pointer text-[#FEFEFF] hover:text-red-300"
                      onClick={() => removeKeyword(index)}
                    />
                  </div>
                ))}
              </div>
              {keywords.length < 5 && (
                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <input
                      type="text"
                      name="keyword"
                      placeholder="Add keyword"
                      value={currentKeyword}
                      onChange={(e) => setCurrentKeyword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onFocus={() => setIsKeywordInputFocused(true)}
                      onBlur={() => setIsKeywordInputFocused(false)}
                      className="border-[1px] rounded-[20px] px-4 py-2 border-[#363636] text-[#003087] focus:outline-none w-40 h-10"
                    />
                    <div
                      className={`absolute left-0 top-12 w-64 bg-[#003087] text-[#FEFEFF] text-sm rounded-lg p-2 opacity-0 ${
                        !isKeywordInputFocused && "group-hover:opacity-100"
                      } transition-opacity duration-200 pointer-events-none shadow-lg z-10`}
                    >
                      Type up to 5 simple words or phrases that describe what
                      your business offers. Focus on what makes it special, like
                      what you sell, how it's made, or who it’s for. For
                      example: "coffee shop", "locally made", or "custom
                      clothes". Press Enter or click '+' to add each one.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="bg-[#003087] text-[#FEFEFF] rounded-full p-2 hover:bg-[#1A5A2C] transition-all duration-200"
                  >
                    <FaPlus />
                  </button>
                </div>
              )}
              <p
                className={`text-xs ${
                  validationErrors.keywords ? "text-red-500" : "text-[#003087]"
                } mt-1`}
              >
                {keywords.length}/5 keywords added (min 3, max 5)
              </p>
            </div>

            <div
              className={`max-lg:w-full border-[1px] rounded-[27px] px-8 py-4 border-${
                validationErrors.description ? "[#FF0000]" : "[#363636]"
              } flex items-start gap-2`}
            >
              <TbFileDescription className="text-[#003087] mt-1" />
              <textarea
                name="description"
                required
                placeholder="Tell us about your business"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setValidationErrors((prev) => ({
                    ...prev,
                    description: false,
                  }));
                }}
                className="w-full h-24 border-none focus:outline-none text-[#003087] resize-none bg-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer md:mt-6 mt-16 w-full text-[#FEFEFF] bg-[#003087] hover:bg-[#003087]/75 shadow-lg rounded-[27px] px-8 flex justify-center items-center lg:h-[60px] h-[48px] disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Next"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;
