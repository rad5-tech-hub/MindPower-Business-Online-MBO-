import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { CiUser } from "react-icons/ci";
import { RiArrowDropDownLine } from "react-icons/ri";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Display = () => {
  const [timeRange, setTimeRange] = useState("daily");
  const [metric, setMetric] = useState("profilesCreated");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [profileData, setProfileData] = useState({
    firstname: "",
    lastname: "",
  });
  const [analyticsData, setAnalyticsData] = useState([]);
  const [totals, setTotals] = useState({
    totalUsers: 0,
    totalActiveSubscribers: 0,
    totalWebsiteVisits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changePasswordFormData, setChangePasswordFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState("");

  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const profileDropdownRef = useRef(null);
  const changePasswordModalRef = useRef(null);

  const METRICS = [
    {
      title: "Total Users",
      key: "profilesCreated",
      label: "Number of people who successfully created a business profile",
      value: (data) => parseInt(data?.profilesCreated || 0, 10),
    },
    {
      title: "Active Users",
      key: "activeSubscribers",
      label: "Number of users that have active subscriptions",
      value: (data) => parseInt(data?.activeSubscribers || 0, 10),
    },
    {
      title: "Total Visitors",
      key: "websiteVisits",
      label: "Number of people that have visited the website",
      value: (data) => parseInt(data?.websiteVisits || 0, 10),
    },
  ];

  const TIME_RANGES = {
    daily: { label: "Daily", limit: 7, type: "day" },
    monthly: { label: "Monthly", limit: 6, type: "month" },
    yearly: { label: "Yearly", limit: 5, type: "year" },
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setError("Not authenticated or missing token!");
      setLoading(false);
      navigate("/login", { replace: true });
      toast.info("Redirecting to login...");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setAnalyticsData([]);
        setProfileData({
          firstname: user?.firstName || "Admin",
          lastname: user?.lastName || "Hello",
        });

        const currentType = TIME_RANGES[timeRange].type;
        const analyticsURL = `${
          import.meta.env.VITE_BASE_URL
        }/admin/admin-analytics?type=${currentType}`;
        const analyticsResponse = await axios.get(analyticsURL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (
          !analyticsResponse.data?.data ||
          !Array.isArray(analyticsResponse.data.data)
        ) {
          throw new Error("Invalid analytics data format.");
        }
        console.log(
          `Fetched data for ${currentType}:`,
          analyticsResponse.data.data
        );
        setTotals({
          totalUsers: parseInt(analyticsResponse.data.totalUsers || 0, 10),
          totalActiveSubscribers: parseInt(
            analyticsResponse.data.totalActiveSubscribers || 0,
            10
          ),
          totalWebsiteVisits: parseInt(
            analyticsResponse.data.totalWebsiteVisits || 0,
            10
          ),
        });
        setAnalyticsData(analyticsResponse.data.data);
      } catch (error) {
        console.error("❌ Error Fetching Data:", error);
        setError(error.response?.data?.error || "Failed to fetch admin data.");
        toast.error(
          error.response?.data?.error || "Failed to fetch admin data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token, navigate, timeRange, user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDropdownOpen && !e.target.closest(".dropdown-container"))
        setIsDropdownOpen(false);
      if (
        showProfileDropdown &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target)
      ) {
        setShowProfileDropdown(false);
      }
      if (
        isChangePasswordModalOpen &&
        changePasswordModalRef.current &&
        !changePasswordModalRef.current.contains(e.target)
      ) {
        setIsChangePasswordModalOpen(false);
        setChangePasswordFormData({
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        setPasswordValidation("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, showProfileDropdown, isChangePasswordModalOpen]);

  const formatDateForRange = (dateStr, range) => {
    if (!dateStr) {
      const now = new Date();
      switch (range) {
        case "daily":
          return now.toLocaleDateString("en-US", { weekday: "short" });
        case "monthly":
          return now.toLocaleString("default", { month: "short" });
        case "yearly":
          return now.getFullYear().toString();
        default:
          return now.toISOString().split("T")[0];
      }
    }

    if (typeof dateStr === "string" || typeof dateStr === "number") {
      if (range === "daily" && dateStr.includes("-")) {
        const date = new Date(dateStr);
        return isNaN(date.getTime())
          ? dateStr
          : date.toLocaleDateString("en-US", { weekday: "short" });
      } else if (range === "monthly" && dateStr.includes("-")) {
        const [year, month] = dateStr.split("-");
        const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1);
        return isNaN(date.getTime())
          ? dateStr
          : date.toLocaleString("default", { month: "short" });
      } else if (range === "yearly") {
        return String(dateStr);
      }
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return String(dateStr);
    switch (range) {
      case "daily":
        return date.toLocaleDateString("en-US", { weekday: "short" });
      case "monthly":
        return date.toLocaleString("default", { month: "short" });
      case "yearly":
        return date.getFullYear().toString();
      default:
        return date.toISOString().split("T")[0];
    }
  };

  const generateGraphData = useMemo(() => {
    const { limit, type } = TIME_RANGES[timeRange];
    const dateField =
      type === "month"
        ? "formattedMonth"
        : type === "day"
        ? "formattedDate"
        : "formattedYear";

    console.log("Generating graph data for:", {
      timeRange,
      type,
      limit,
      dateField,
    });
    console.log("Raw analytics data:", analyticsData);

    if (!analyticsData.length) {
      console.log("No analytics data, generating filler.");
      return Array.from({ length: limit }, (_, i) => {
        const date = new Date();
        if (type === "day") date.setDate(date.getDate() - i);
        else if (type === "month") date.setMonth(date.getMonth() - i);
        else if (type === "year") date.setFullYear(date.getFullYear() - i);
        return { date: formatDateForRange(date, timeRange), value: 0 };
      }).reverse();
    }

    const graphData = analyticsData
      .map((item, index) => {
        console.log(
          `Processing item at index ${index}:`,
          item,
          `dateField: ${dateField}`,
          `item[dateField]:`,
          item[dateField]
        );
        if (!item || typeof item[dateField] === "undefined") {
          console.warn(`Missing date field at index ${index}:`, item);
          return null;
        }
        const formattedDate = formatDateForRange(item[dateField], timeRange);
        const value = parseInt(item[metric] || 0, 10);
        return { date: formattedDate, value, originalDate: item[dateField] };
      })
      .filter(Boolean);

    console.log("Mapped graph data:", graphData);

    if (!graphData.length) {
      console.log("No valid data after mapping, generating filler.");
      return Array.from({ length: limit }, (_, i) => {
        const date = new Date();
        if (type === "day") date.setDate(date.getDate() - i);
        else if (type === "month") date.setMonth(date.getMonth() - i);
        else if (type === "year") date.setFullYear(date.getFullYear() - i);
        return { date: formatDateForRange(date, timeRange), value: 0 };
      }).reverse();
    }

    const sortedData = graphData.sort((a, b) => {
      if (type === "year") {
        return parseInt(a.originalDate, 10) - parseInt(b.originalDate, 10);
      } else if (type === "month") {
        const aDate = new Date(a.originalDate);
        const bDate = new Date(b.originalDate);
        return aDate - bDate;
      } else {
        const aDate = new Date(a.originalDate);
        const bDate = new Date(b.originalDate);
        return aDate - bDate;
      }
    });

    if (sortedData.length < limit) {
      const lastItem = sortedData[sortedData.length - 1];
      let lastDate = lastItem ? new Date(lastItem.originalDate) : new Date();
      if (isNaN(lastDate.getTime())) lastDate = new Date();

      const filler = Array.from(
        { length: limit - sortedData.length },
        (_, i) => {
          const newDate = new Date(lastDate);
          if (type === "day") newDate.setDate(lastDate.getDate() - (i + 1));
          else if (type === "month")
            newDate.setMonth(lastDate.getMonth() - (i + 1));
          else if (type === "year")
            newDate.setFullYear(lastDate.getFullYear() - (i + 1));
          return {
            date: formatDateForRange(newDate, timeRange),
            value: 0,
            originalDate:
              type === "day"
                ? newDate.toISOString().split("T")[0]
                : type === "month"
                ? `${newDate.getFullYear()}-${String(
                    newDate.getMonth() + 1
                  ).padStart(2, "0")}`
                : String(newDate.getFullYear()),
          };
        }
      ).reverse();
      console.log("Filler data:", filler);
      return [...filler, ...sortedData];
    }

    console.log("Final graph data:", sortedData.slice(-limit));
    return sortedData.slice(-limit);
  }, [analyticsData, metric, timeRange]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setIsDropdownOpen(false);
  };

  const handleMetricChange = (selectedMetric) => setMetric(selectedMetric);

  const toggleProfileDropdown = () => setShowProfileDropdown((prev) => !prev);

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
    setShowProfileDropdown(false);
  };

  const handleChangePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setChangePasswordFormData((prev) => ({ ...prev, [name]: value }));
    const updatedFormData = { ...changePasswordFormData, [name]: value };
    const newPass = updatedFormData.newPassword.trim();
    const confirmPass = updatedFormData.confirmNewPassword.trim();

    if (!newPass) setPasswordValidation("");
    else if (newPass.length <= 4)
      setPasswordValidation("Password must be longer than 4 characters");
    else if (confirmPass && newPass !== confirmPass)
      setPasswordValidation("Passwords do not match");
    else setPasswordValidation("Password is valid");
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!changePasswordFormData.oldPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (
      changePasswordFormData.newPassword !==
      changePasswordFormData.confirmNewPassword
    ) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/member/change-password`,
        {
          oldPassword: changePasswordFormData.oldPassword,
          newPassword: changePasswordFormData.newPassword,
          confirmPassword: changePasswordFormData.confirmNewPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || "Password changed successfully.");
      setIsChangePasswordModalOpen(false);
      setChangePasswordFormData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setPasswordValidation("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to change password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce delay-200"></div>
          <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce delay-400"></div>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-600 p-4 text-center">{error}</div>;

  return (
    <div className="flex flex-col gap-4 relative px-4 sm:px-8 min-h-screen bg-white overflow-y-auto">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        style={{ zIndex: 9999 }}
      />

      {/* Modern Marquee for Totals */}
      <div className="relative overflow-hidden bg-[#003087] text-[#FEFEFF] py-4 rounded-xl shadow-lg">
        <motion.div
          className="flex whitespace-nowrap lg:gap-20 gap-10"
          initial={{ x: "100%" }}
          animate={{ x: "-100%" }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          <div className="flex items-center lg:gap-20 gap-10 mx-4">
            <span className="text-sm sm:text-base font-semibold">
              Total Users:{" "}
              <span className="text-[#FFCF00]">{totals.totalUsers}</span>
            </span>
            <span className="text-sm sm:text-base font-semibold">
              Active Subscribers:{" "}
              <span className="text-[#FFCF00]">
                {totals.totalActiveSubscribers}
              </span>
            </span>
            <span className="text-sm sm:text-base font-semibold">
              Website Visits:{" "}
              <span className="text-[#FFCF00]">
                {totals.totalWebsiteVisits}
              </span>
            </span>
          </div>
          {/* Duplicate for seamless looping */}
          <div className="flex items-center lg:gap-20 gap-10 mx-4">
            <span className="text-sm sm:text-base font-semibold">
              Total Users:{" "}
              <span className="text-[#FFCF00]">{totals.totalUsers}</span>
            </span>
            <span className="text-sm sm:text-base font-semibold">
              Active Subscribers:{" "}
              <span className="text-[#FFCF00]">
                {totals.totalActiveSubscribers}
              </span>
            </span>
            <span className="text-sm sm:text-base font-semibold">
              Website Visits:{" "}
              <span className="text-[#FFCF00]">
                {totals.totalWebsiteVisits}
              </span>
            </span>
          </div>
        </motion.div>
        {/* Gradient overlays for fade effect */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#043D12] to-transparent pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#043D12] to-transparent pointer-events-none"></div>
      </div>

      <div className="h-[12vh] p-4 sm:p-8 text-[#003087] flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="welcome flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <h2 className="text-base sm:text-xl md:text-2xl">
            Welcome back, {profileData.firstname || "Admin"}
          </h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/admin/manage-notifications">
            <IoIosNotificationsOutline className="text-2xl sm:text-3xl text-[#003087] hover:text-[#003087] transition-colors" />
          </Link>
          <div className="relative">
            <motion.figure
              className="flex items-center bg-white rounded-full p-1 sm:p-2 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              onClick={toggleProfileDropdown}
            >
              <CiUser className="text-2xl text-[#003087] bg-gray-100 rounded-full p-1" />
              <figcaption className="ml-2 text-[#003087] hidden sm:block">
                <h3 className="text-xs sm:text-sm font-semibold">
                  {profileData.firstname} {profileData.lastname}
                </h3>
              </figcaption>
            </motion.figure>
            {showProfileDropdown && (
              <div
                ref={profileDropdownRef}
                className="absolute right-0 mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
              >
                <button
                  className="w-full text-left px-3 py-2 text-sm text-[#003087] flex items-center gap-2 hover:bg-gray-100"
                  onClick={handleChangePassword}
                >
                  <FiLock /> Change Password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`content-section transition-all duration-300 ${
          isVisible ? "opacity-100 visible" : "opacity-0 invisible h-0"
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {METRICS.map(({ title, key, label, value }) => (
            <div
              key={key}
              onClick={() => handleMetricChange(key)}
              className={`p-4 text-sm text-[#003087] hover:text-white hover:bg-[#003087] rounded-xl flex flex-col gap-2 text-center cursor-pointer ${
                metric === key ? "bg-[#003087] text-[#FEFEFF]" : "bg-gray-200"
              }`}
            >
              <h5 className="text-center text-xs sm:text-sm">{title}</h5>
              <figcaption className="text-xs">{label}</figcaption>
              <h3 className="count text-xl sm:text-2xl md:text-3xl">
                {value(analyticsData[0] || {})}
              </h3>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 border-[1px] border-[#6A7368] rounded-3xl shadow-lg p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base text-[#003087]">
              {METRICS.find((m) => m.key === metric)?.title}
            </h3>
            <div className="relative border-[1px] rounded-lg dropdown-container w-full sm:w-auto">
              <div
                className="flex items-center gap-2 sm:gap-4 cursor-pointer rounded-lg px-2 py-1"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-xs sm:text-sm text-[#003087]">
                  {TIME_RANGES[timeRange].label}
                </span>
                <RiArrowDropDownLine className="text-lg sm:text-xl" />
              </div>
              {isDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-md w-full sm:w-32 z-30">
                  {Object.entries(TIME_RANGES).map(([range, { label }]) => (
                    <div
                      key={range}
                      className="p-2 text-xs sm:text-sm cursor-pointer hover:bg-gray-100"
                      onClick={() => handleTimeRangeChange(range)}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 sm:mt-8 w-full h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {generateGraphData.length > 0 ? (
                <LineChart
                  data={generateGraphData}
                  margin={{ top: 20, right: 10, left: -20, bottom: 10 }}
                >
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip
                    content={({ payload }) =>
                      payload?.length ? (
                        <div className="bg-white p-2 border border-gray-300 rounded shadow text-xs">
                          <p>{payload[0].payload.date}</p>
                          <p>{payload[0].value}</p>
                        </div>
                      ) : null
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </LineChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  No data available
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {isChangePasswordModalOpen && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            ref={changePasswordModalRef}
            className="bg-white rounded-xl shadow-lg w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-[#003087]">
                Change Password
              </h2>
              <AiOutlineClose
                className="text-lg sm:text-xl text-[#003087] cursor-pointer hover:text-[#003087] transition-colors"
                onClick={() => {
                  setIsChangePasswordModalOpen(false);
                  setChangePasswordFormData({
                    oldPassword: "",
                    newPassword: "",
                    confirmNewPassword: "",
                  });
                  setPasswordValidation("");
                }}
              />
            </div>
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm text-[#003087] mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={changePasswordFormData.oldPassword}
                    onChange={handleChangePasswordInputChange}
                    placeholder="Enter current password"
                    className="w-full h-10 sm:h-11 px-3 sm:px-4 border-[1px] border-[#6A7368] rounded-xl outline-none bg-transparent text-sm"
                    required
                  />
                  <span
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#003087]"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? <FiEyeOff /> : <FiEye />}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-[#003087] mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={changePasswordFormData.newPassword}
                    onChange={handleChangePasswordInputChange}
                    placeholder="Enter new password"
                    className="w-full h-10 sm:h-11 px-3 sm:px-4 border-[1px] border-[#6A7368] rounded-xl outline-none bg-transparent text-sm"
                    required
                  />
                  <span
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#003087]"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-[#003087] mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    name="confirmNewPassword"
                    value={changePasswordFormData.confirmNewPassword}
                    onChange={handleChangePasswordInputChange}
                    placeholder="Confirm new password"
                    className="w-full h-10 sm:h-11 px-3 sm:px-4 border-[1px] border-[#6A7368] rounded-xl outline-none bg-transparent text-sm"
                    required
                  />
                  <span
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#003087]"
                    onClick={() =>
                      setShowConfirmNewPassword(!showConfirmNewPassword)
                    }
                  >
                    {showConfirmNewPassword ? <FiEyeOff /> : <FiEye />}
                  </span>
                </div>
              </div>
              {passwordValidation && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  {passwordValidation === "Password is valid" ? (
                    <FiCheckCircle className="text-green-600" />
                  ) : (
                    <FiAlertCircle className="text-red-600" />
                  )}
                  <span
                    className={
                      passwordValidation === "Password is valid"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {passwordValidation}
                  </span>
                </div>
              )}
              <button
                type="submit"
                className="w-full mt-4 px-4 py-2 bg-[#003087] text-[#FEFEFF] rounded-xl hover:bg-[#003087] transition-colors text-sm sm:text-base flex items-center justify-center"
                disabled={
                  passwordValidation !== "Password is valid" || isSubmitting
                }
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-2 border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Password"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Display;
