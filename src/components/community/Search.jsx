import React, { useState, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook

const dropdownOptions = {
  category: ["Clothing", "Footwear", "Accessories"],
  location: ["New York", "Los Angeles", "Chicago"],
  visibility: ["Public", "Private", "Restricted"],
};

const Search = () => {
  const [dropdowns, setDropdowns] = useState({
    category: false,
    location: false,
    visibility: false,
  });

  const toggleDropdown = (type) => {
    setDropdowns((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Refs to track viewport visibility
  const containerRef = useRef(null);
  const searchButtonRef = useRef(null);
  const filterRef = useRef(null);

  // Check when items are in view
  const containerInView = useInView(containerRef, { once: false });
  const searchButtonInView = useInView(searchButtonRef, { once: false });
  const filterInView = useInView(filterRef, { once: false });

  // Initialize the useNavigate hook
  const navigate = useNavigate();

  // Handle search button click to navigate to /search page
  const handleSearchButtonClick = () => {
    navigate("/community/search");
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 50 }}
      animate={containerInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full h-fit pt-20 pb-10 flex justify-center bg-[#FEFEFF]"
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
    >
      <div className="container mx-auto px-[5vw] flex flex-col gap-12">
        {/* Search Button */}
        <motion.button
          ref={searchButtonRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={searchButtonInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-[#D6E2D98C] md:h-[70px] h-[60px] rounded-[39px] flex justify-between items-center text-[#003087] sm:text-[16px] text-[12px] px-8 max-[280px]:px-4 lg:w-[80%] w-full shadow-lg max-lg:mx-auto cursor-pointer"
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          onClick={handleSearchButtonClick} // Add onClick handler
        >
          <p>
            Search Businesses
            <b className="max-[300px]:hidden font-normal"> or Services</b>
          </p>
          <CiSearch className="text-[22px] font-bold max-[200px]:hidden" />
        </motion.button>

        {/* <motion.div
          ref={filterRef}
          initial={{ opacity: 0, x: -50 }}
          animate={filterInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="w-full hidden lg:flex gap-12 relative"
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
        >
          {Object.keys(dropdownOptions).map((type, index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={filterInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: 0.1 * index,
              }}
              className="relative"
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
            >
              <button
                onClick={() => toggleDropdown(type)}
                className="bg-[#9DB7A4] h-[46px] rounded-[39px] flex justify-between items-center text-[#003087] text-[16px] px-6 font-bold gap-8 shadow-lg"
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
                {dropdowns[type] ? (
                  <RiArrowDropUpLine className="text-[30px] font-bold" />
                ) : (
                  <RiArrowDropDownLine className="text-[30px] font-bold" />
                )}
              </button>

              
              <AnimatePresence>
                {dropdowns[type] && (
                  <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-12 left-0 w-48 bg-white shadow-lg rounded-lg py-2 z-10"
                  >
                    {dropdownOptions[type].map((option, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: "easeOut",
                          delay: 0.05 * index,
                        }}
                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => toggleDropdown(type)}
                      >
                        {option}
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div> */}
      </div>
    </motion.div>
  );
};

export default Search;
