import React, { useEffect, useState } from "react";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Link, Outlet, useLocation } from "react-router-dom";
import { CiUser } from "react-icons/ci";
import { TbLayoutGrid } from "react-icons/tb";
import { BiSolidContact } from "react-icons/bi";
import { RiExchangeDollarFill, RiLockPasswordLine } from "react-icons/ri";
import { motion } from "framer-motion";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import BusinessImg from "../../assets/user-photo.svg"; // Fallback image

const EditHeader = () => {
  const location = useLocation();
  const { token } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({
    businessName: "User Name",
    category: "Category",
    businessImg: null, // Null until loaded, uses default icon
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      toast.error("No authentication token found!");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const API_URL = `${import.meta.env.VITE_BASE_URL}/member/my-profile`;
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.success && response.data.data) {
          const profile = response.data.data;
          setProfileData({
            businessName: profile.businessName || "User Name",
            category: profile.categories?.[0]?.name || "Category",
            businessImg: profile.businesImg || BusinessImg,
          });
        } else {
          toast.error("No profile data found in the response.");
        }
      } catch (error) {
        console.error("❌ Error Fetching Profile:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch profile data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const navItems = [
    { to: "/user-dashboard/profile", icon: <CiUser />, label: "About" },
    {
      to: "/user-dashboard/profile/products-and-services",
      icon: <TbLayoutGrid />,
      label: "Product & Services",
    },
    {
      to: "/user-dashboard/profile/contact-and-socials",
      icon: <BiSolidContact />,
      label: "Contact & Socials",
    },
    {
      to: "/user-dashboard/profile/subscription",
      icon: <RiExchangeDollarFill />,
      label: "Subscription",
    },
    {
      to: "/user-dashboard/profile/password",
      icon: <RiLockPasswordLine />,
      label: "Password",
    },
  ];

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-[10vh] p-8 text-[#003087] flex justify-between items-center w-full z-0 border-b-[1px] border-gray-200 bg-white shadow">
          <strong className="lg:text-[16px] text-[12px] pl-4 xl:pl-6">
            Edit Profile
          </strong>
          <div className="flex items-center md:gap-4 pr-8">
            <Link to="/user-dashboard/notification">
              <IoIosNotificationsOutline className="hidden text-[30px] text-[#003087] hover:text-[#003087] transition-colors" />
            </Link>
            <Link to="/user-dashboard/profile">
              <motion.figure
                className="flex items-center bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 "
                whileHover={{ scale: 1.05 }}
                animate={{ opacity: [1, 0.8, 1] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {profileData.businessImg ? (
                  <img
                    src={profileData.businessImg}
                    alt="Business-img"
                    className="rounded-full w-[32px] h-[32px] object-cover border-2 border-[#043D12]"
                    onError={(e) => (e.target.src = BusinessImg)}
                  />
                ) : (
                  <CiUser className="text-[32px] text-[#003087] bg-gray-100 rounded-full p-1" />
                )}
                <figcaption className="ml-2 text-[#003087] max-md:hidden">
                  <h3 className="text-[12px] font-semibold">
                    {profileData.businessName}
                  </h3>
                  <p className="text-[10px] italic">{profileData.category}</p>
                </figcaption>
              </motion.figure>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Navigation & Content */}
      {/* <div className="lg:w-full w-[90%] md:w-[80%] mx-auto mt-8 flex max-lg:flex-col justify-center lg:gap-20 lg:px-10">
        <nav className="md:w-[60%] lg:w-[40%] px-8 flex flex-col gap-4">
          {navItems.map(({ to, icon, label }) => (
            <motion.div
              key={to}
              whileHover={{ scale: 1.05 }}
              className="w-full"
            >
              <Link
                to={to}
                className={`text-[15px] flex items-center gap-4 px-6 py-2 rounded-[11px] transition-all duration-300 
                ${
                  location.pathname === to
                    ? "bg-[#003087] text-white shadow-lg scale-105"
                    : "text-[#003087] hover:bg-gray-200"
                }`}
              >
                <span className="text-[25px]">{icon}</span>
                {label}
              </Link>
            </motion.div>
          ))}
        </nav>
        <motion.main
          className="w-full h-[87vh] overflow-y-scroll pt-16"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.main>
      </div> */}
    </div>
  );
};

export default EditHeader;
