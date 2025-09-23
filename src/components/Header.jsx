import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { logout, selectAuth, setLastDashboard } from "../redux/authSlice";
import { fetchProfile, clearProfile } from "../redux/profileSlice";
import { persistor } from "../redux/store";
import MindPowerLogo from "../assets/mbo-logo.png";
import MenuIcon from "../assets/menu.svg";
import ProfilePic from "../assets/user-photo.svg";
import DefaultBackgroundImg from "../assets/businessImg.jpeg";

const navItemVariants = {
  hidden: { opacity: 0, scale: 0.5, y: -20 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.4, ease: "easeOut" },
  }),
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { identifier } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasBusinessProfile, setHasBusinessProfile] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [isRehydrated, setIsRehydrated] = useState(false);

  const auth = useSelector(selectAuth);
  const { profile, loading, error } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const isAuthenticated = auth.isAuthenticated;
  const userRole = auth.user?.role;
  const lastDashboard = auth.lastDashboard;
  const isAdmin = userRole === "admin";

  // Wait for redux-persist to rehydrate
  useEffect(() => {
    const unsubscribe = persistor.subscribe(() => {
      const { bootstrapped } = persistor.getState();
      if (bootstrapped) {
        setIsRehydrated(true);
        console.log("Rehydration complete, auth state:", auth);
        unsubscribe();
      }
    });

    if (persistor.getState().bootstrapped) {
      setIsRehydrated(true);
      console.log("Rehydration already complete, auth state:", auth);
      unsubscribe();
    }

    return () => unsubscribe();
  }, [auth]);

  // Validate token on mount, but only after rehydration
  useEffect(() => {
    const validateToken = async () => {
      if (!isRehydrated) {
        console.log("Waiting for rehydration, skipping token validation");
        return;
      }

      if (!isAuthenticated || !auth.token) {
        console.log("No authentication or token, skipping validation:", {
          isAuthenticated,
          token: auth.token,
        });
        return;
      }

      // Temporarily disable token validation due to 404 error
      /*
      try {
        console.log("Validating token:", auth.token);
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/member/validate-token`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        console.log("Token validation successful:", response.data);
      } catch (error) {
        console.error("Token validation failed:", error.response?.data || error.message);
        dispatch(logout());
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("lastDashboard");
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      }
      */
      console.log(
        "Token validation disabled due to missing endpoint. Please implement /member/validate-token on https://mbo.bookbank.com.ng."
      );
    };
    validateToken();
  }, [isRehydrated, isAuthenticated, auth.token, dispatch, navigate]);

  // Fetch user's subscription and business profile status
  useEffect(() => {
    if (isRehydrated && isAuthenticated) {
      if (isAdmin) {
        setIsSubscribed(true);
        setHasBusinessProfile(true);
        setIsStatusLoading(false);
      } else {
        const fetchMyProfile = async () => {
          setIsStatusLoading(true);
          try {
            const API_URL = `${
              import.meta.env.VITE_BASE_URL
            }/member/my-profile`;
            const response = await axios.get(API_URL, {
              headers: { Authorization: `Bearer ${auth.token}` },
            });

            const { data } = response.data;
            const isSubActive =
              data.member.subscriptionStatus === "active" &&
              new Date() >= new Date(data.member.subscriptionStartDate) &&
              new Date() <= new Date(data.member.subscriptionEndDate);

            setIsSubscribed(isSubActive);
            setHasBusinessProfile(!!data.businessName?.trim());
          } catch (error) {
            console.error("Error fetching profile:", error);
            setIsSubscribed(false);
            setHasBusinessProfile(false);
          } finally {
            setIsStatusLoading(false);
          }
        };
        fetchMyProfile();
      }
    } else {
      setIsSubscribed(false);
      setHasBusinessProfile(false);
      setIsStatusLoading(false);
    }
  }, [isRehydrated, isAuthenticated, auth.token, isAdmin]);

  // Fetch business profile data for profile pages using Redux
  useEffect(() => {
    if (location.pathname.startsWith("/community/profile/") && identifier) {
      const isUUID = identifier.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      dispatch(fetchProfile({ identifier, isUUID }));
    } else {
      dispatch(clearProfile());
    }
  }, [location.pathname, identifier, dispatch]);

  // Handle errors with toast notifications
  useEffect(() => {
    if (error) {
      if (error.includes("not found")) {
        toast.error(
          `Profile '${identifier}' not found. The link may be invalid or not yet available. Contact support for assistance.`
        );
      } else {
        toast.error(
          "An error occurred while loading the profile. Please try again later."
        );
      }
    }
  }, [error, identifier]);

  // Track dashboard visits
  useEffect(() => {
    if (location.pathname === "/admin" && lastDashboard !== "/admin") {
      dispatch(setLastDashboard("/admin"));
    } else if (
      location.pathname === "/user-dashboard" &&
      lastDashboard !== "/user-dashboard"
    ) {
      dispatch(setLastDashboard("/user-dashboard"));
    }
  }, [location.pathname, lastDashboard, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastDashboard");
    toast.success("Logged out successfully!");
    navigate("/login");
    setIsOpen(false);
  };

  const dashboardRoute =
    lastDashboard || (isAdmin ? "/admin" : "/user-dashboard");

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Marketplace", path: "/community" },
    isAuthenticated &&
    (isAdmin || isSubscribed || hasBusinessProfile) &&
    !isStatusLoading
      ? {
          name: "Dashboard",
          path: dashboardRoute,
          className:
            "border border-white rounded-[39px] lg:ml-8 px-8 py-2 hover:bg-white hover:text-[#002f87d5]",
        }
      : {
          name: "Log In",
          path: "/login",
          className:
            "border border-white rounded-[39px] lg:ml-8 px-8 py-2 hover:bg-white hover:text-[#002f87d5]",
        },
  ].filter(Boolean);

  return (
    <div
      className={`global-header relative bg-[#FEFEFF] py-[3vh] z-[70] ${
        location.pathname.startsWith("/community/profile/") ? "pb-[40px]" : ""
      }`}
    >
      {profile && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: `url(${
              profile?.backgroundImg || DefaultBackgroundImg
            })`,
          }}
          onError={(e) =>
            console.error(
              "Background image failed to load:",
              profile?.backgroundImg || DefaultBackgroundImg
            )
          }
        />
      )}

      {location.pathname.startsWith("/community/profile/") && (
        <img
          src={profile?.businesImg || ProfilePic}
          alt="Business Profile"
          className="absolute bottom-[-60px] w-[120px] h-[120px] rounded-full border-4 border-[#FFCF00] shadow-lg lg:left-[12%] left-[calc(50%-60px)] z-20 object-cover"
          onError={(e) => {
            console.warn(
              "Business image failed to load, using fallback:",
              profile?.businesImg
            );
            e.target.src = ProfilePic;
          }}
        />
      )}

      <div className="container mx-auto px-[5vw]">
        <div
          className={`bg-[#003087] px-5 md:px-12 py-4 flex justify-between items-center rounded-[48px] shadow-lg relative z-[110] ${
            location.pathname.startsWith("/community/profile/")
              ? "mb-[50px]"
              : ""
          }`}
        >
          <Link to="/">
            <img
              src={MindPowerLogo}
              alt="Logo"
              className="w-8 md:w-12 object-contain"
            />
          </Link>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="absolute top-[13vh] left-0 w-full bg-[#FEFEFF] flex flex-col items-center py-6 shadow-lg md:hidden rounded-b-[40px] z-[120]"
              >
                <nav className="flex flex-col items-center gap-6 w-full">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      variants={navItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      custom={index}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`text-xl font-medium px-8 py-2 ${
                          (item.path === "/community" &&
                            location.pathname.startsWith("/community")) ||
                          location.pathname === item.path
                            ? "text-[#002f87d5] font-bold border-b-2 border-[#002f87d5]"
                            : "text-[#003087] hover:text-[#002f87d5]"
                        } ${item.className || ""}`}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="hidden md:flex gap-8 items-center text-white">
            {navItems.map((item) => (
              <motion.div key={item.path} className="relative group">
                <Link
                  to={item.path}
                  className={`text-xl ${item.className || ""} ${
                    (item.path === "/community" &&
                      location.pathname.startsWith("/community")) ||
                    location.pathname === item.path
                      ? "text-[#FFCF00] font-bold"
                      : "hover:text-[#FFCF00]"
                  }`}
                >
                  {item.name}
                  {item.path !== "/login" && (
                    <motion.div
                      className="absolute bottom-[-3px] left-0 h-[3px] bg-[#FFCF00]"
                      initial={{ width: 0 }}
                      animate={{
                        width:
                          (item.path === "/community" &&
                            location.pathname.startsWith("/community")) ||
                          location.pathname === item.path
                            ? "100%"
                            : "0%",
                      }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          <button
            className="md:hidden cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <img src={MenuIcon} alt="Menu" className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
