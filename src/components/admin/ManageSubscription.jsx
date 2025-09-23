import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { CiUser } from "react-icons/ci";
import { BiPlus, BiSearch } from "react-icons/bi";
import { IoArrowDown } from "react-icons/io5";
import { RiEqualizerLine } from "react-icons/ri";
import {
  FiLock,
  FiTrash2,
  FiUser,
  FiKey,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SubIcon from "../../assets/sub.svg";

const ManageSubscription = () => {
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [expiredSubscriptions, setExpiredSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("Active");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showResetButton, setShowResetButton] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [deletePlan, setDeletePlan] = useState(null);

  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: "", // Formatted string (e.g., "10,000")
    rawPrice: "", // Raw numeric string (e.g., "10000")
  });
  const [resetFormData, setResetFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState("");
  const [profileData, setProfileData] = useState({
    firstname: "",
    lastname: "",
  });
  const [dateFilter, setDateFilter] = useState("All Time");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  const resetModalRef = useRef(null);
  const resetButtonRef = useRef(null);
  const editModalRef = useRef(null);
  const deleteModalRef = useRef(null);
  const dateDropdownRef = useRef(null);

  // Utility function to format number with commas
  const formatNumberWithCommas = (value) => {
    if (!value) return "";
    const number = value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setError("Not authenticated or missing token!");
      setLoading(false);
      toast.info("Redirecting to login...");
      navigate("/login", { replace: true });
      return;
    }

    if (user && user.firstName && user.lastName) {
      setProfileData({
        firstname: user.firstName,
        lastname: user.lastName,
      });
    } else {
      console.warn("User data missing in Redux store, using defaults.", user);
      setProfileData({
        firstname: "Admin",
        lastname: "User",
      });
    }

    setLoading(true);

    const fetchSubscriptionsAndPlans = async () => {
      try {
        const activeResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/admin/active-suscribers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (
          activeResponse.data &&
          Array.isArray(activeResponse.data.activeMembers)
        ) {
          setActiveSubscriptions(activeResponse.data.activeMembers);
          if (activeFilter === "Active") {
            setFilteredSubscriptions(activeResponse.data.activeMembers);
          }
        } else {
          throw new Error("No active subscription data found in the response.");
        }

        const expiredResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/admin/expired-suscribers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (
          expiredResponse.data &&
          Array.isArray(expiredResponse.data.expiredMembers)
        ) {
          setExpiredSubscriptions(expiredResponse.data.expiredMembers);
          if (activeFilter === "Expired") {
            setFilteredSubscriptions(expiredResponse.data.expiredMembers);
          }
        } else {
          throw new Error(
            "No expired subscription data found in the response."
          );
        }

        const plansResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/admin/get-sub`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (plansResponse.data && Array.isArray(plansResponse.data.data)) {
          setPlans(plansResponse.data.data);
        } else {
          throw new Error("No plans found in the response.");
        }
      } catch (error) {
        console.error("❌ Error Fetching Data:", error);
        setError(error.response?.data?.message || "Failed to fetch data.");
        toast.error(error.response?.data?.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionsAndPlans();
  }, [isAuthenticated, token, navigate, user, activeFilter]);

  useEffect(() => {
    const filterSubscriptions = () => {
      let filtered = [];
      if (activeFilter === "Active") {
        filtered = [...activeSubscriptions];
      } else if (activeFilter === "Expired") {
        filtered = [...expiredSubscriptions];
      } else if (activeFilter === "Cancelled") {
        filtered = [];
      }

      filtered = applyDateFilter(filtered);

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter((sub) => {
          const planName = sub.subscription.name.toLowerCase();
          const email = sub.email.toLowerCase();
          return planName.includes(query) || email.includes(query);
        });
      }

      setFilteredSubscriptions(filtered);
    };

    const debounceTimeout = setTimeout(() => {
      filterSubscriptions();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [
    searchQuery,
    activeSubscriptions,
    expiredSubscriptions,
    activeFilter,
    dateFilter,
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        resetModalRef.current &&
        !resetModalRef.current.contains(event.target)
      ) {
        setIsResetModalOpen(false);
        setResetFormData({
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        setPasswordValidation("");
      }
      if (
        resetButtonRef.current &&
        !resetButtonRef.current.contains(event.target)
      ) {
        setShowResetButton(false);
      }
      if (
        editModalRef.current &&
        !editModalRef.current.contains(event.target)
      ) {
        setIsEditModalOpen(false);
        setActivePlan(null);
        setEditFormData({ name: "", description: "", price: "", rawPrice: "" });
      }
      if (
        deleteModalRef.current &&
        !deleteModalRef.current.contains(event.target)
      ) {
        setIsDeleteModalOpen(false);
        setDeletePlan(null);
      }
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(event.target)
      ) {
        setShowDateDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const applyDateFilter = (subscriptions) => {
    const now = new Date();
    return subscriptions.filter((sub) => {
      const endDate = new Date(sub.subscriptionEndDate);
      if (isNaN(endDate.getTime())) return false;

      switch (dateFilter) {
        case "Last Month":
          const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
          return endDate >= lastMonth && endDate <= now;
        case "Last 3 Months":
          const last3Months = new Date(now.setMonth(now.getMonth() - 3));
          return endDate >= last3Months && endDate <= now;
        case "Last 6 Months":
          const last6Months = new Date(now.setMonth(now.getMonth() - 6));
          return endDate >= last6Months && endDate <= now;
        case "Custom Range":
          return true;
        case "All Time":
        default:
          return true;
      }
    });
  };

  const toggleResetButton = () => {
    setShowResetButton((prev) => !prev);
  };

  const handleResetPassword = () => {
    setIsResetModalOpen(true);
    setShowResetButton(false);
  };

  const handleEditPlan = () => {
    setIsEditModalOpen(true);
    if (plans.length > 0) {
      setActivePlan(plans[0]);
      setEditFormData({
        name: plans[0].name,
        description: plans[0].description || "",
        price: formatNumberWithCommas(plans[0].price.toString()),
        rawPrice: plans[0].price.toString(),
      });
    }
  };

  const handleSelectPlan = (plan) => {
    setActivePlan(plan);
    setEditFormData({
      name: plan.name,
      description: plan.description || "",
      price: formatNumberWithCommas(plan.price.toString()),
      rawPrice: plan.price.toString(),
    });
  };

  const handleAddPlan = () => {
    setActivePlan(null);
    setEditFormData({ name: "", description: "", price: "", rawPrice: "" });
    setIsEditModalOpen(true);
  };

  const handleDeletePlan = async () => {
    if (!deletePlan?.id) {
      toast.error("No plan selected for deletion.");
      return;
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/admin/delete-sub/${deletePlan.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || "Plan deleted successfully.");
      setPlans((prev) => prev.filter((p) => p.id !== deletePlan.id));
      setActiveSubscriptions((prev) =>
        prev.filter((sub) => sub.subscription.id !== deletePlan.id)
      );
      setExpiredSubscriptions((prev) =>
        prev.filter((sub) => sub.subscription.id !== deletePlan.id)
      );
      setFilteredSubscriptions((prev) =>
        prev.filter((sub) => sub.subscription.id !== deletePlan.id)
      );
      setIsDeleteModalOpen(false);
      setDeletePlan(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("❌ Error Deleting Plan:", error);
      toast.error(error.response?.data?.message || "Failed to delete plan.");
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "price") {
      const rawValue = value.replace(/[^0-9]/g, ""); // Strip non-numeric characters
      const formattedValue = formatNumberWithCommas(rawValue);
      setEditFormData((prev) => ({
        ...prev,
        price: formattedValue,
        rawPrice: rawValue,
      }));
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.name || !editFormData.rawPrice) {
      toast.error("Plan name and price are required.");
      return;
    }

    setIsSubmittingEdit(true);
    try {
      if (activePlan) {
        const response = await axios.patch(
          `${import.meta.env.VITE_BASE_URL}/admin/edit-sub/${activePlan.id}`,
          {
            name: editFormData.name,
            price: parseFloat(editFormData.rawPrice),
            description: editFormData.description,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(response.data.message || "Plan updated successfully.");
        setPlans((prev) =>
          prev.map((p) =>
            p.id === activePlan.id
              ? {
                  ...p,
                  name: editFormData.name,
                  price: parseFloat(editFormData.rawPrice),
                  description: editFormData.description,
                }
              : p
          )
        );
        setActiveSubscriptions((prev) =>
          prev.map((sub) =>
            sub.subscription.id === activePlan.id
              ? {
                  ...sub,
                  subscription: {
                    ...sub.subscription,
                    name: editFormData.name,
                    price: parseFloat(editFormData.rawPrice),
                    description: editFormData.description,
                  },
                }
              : sub
          )
        );
        setExpiredSubscriptions((prev) =>
          prev.map((sub) =>
            sub.subscription.id === activePlan.id
              ? {
                  ...sub,
                  subscription: {
                    ...sub.subscription,
                    name: editFormData.name,
                    price: parseFloat(editFormData.rawPrice),
                    description: editFormData.description,
                  },
                }
              : sub
          )
        );
        setFilteredSubscriptions((prev) =>
          prev.map((sub) =>
            sub.subscription.id === activePlan.id
              ? {
                  ...sub,
                  subscription: {
                    ...sub.subscription,
                    name: editFormData.name,
                    price: parseFloat(editFormData.rawPrice),
                    description: editFormData.description,
                  },
                }
              : sub
          )
        );
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/admin/sub`,
          {
            name: editFormData.name,
            price: parseFloat(editFormData.rawPrice),
            description: editFormData.description,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(response.data.message || "Plan added successfully.");
        const newPlan = {
          id: response.data.newSubscription.id,
          name: response.data.newSubscription.name,
          price: parseFloat(editFormData.rawPrice),
          description: response.data.newSubscription.description,
          createdAt: response.data.newSubscription.createdAt,
          updatedAt: response.data.newSubscription.updatedAt,
          deletedAt: null,
        };
        setPlans((prev) => [...prev, newPlan]);
      }
      setTimeout(() => {
        setIsEditModalOpen(false);
        setActivePlan(null);
        setEditFormData({ name: "", description: "", price: "", rawPrice: "" });
      }, 1000);
    } catch (error) {
      console.error("❌ Error Saving Plan:", error);
      toast.error(error.response?.data?.message || "Failed to save plan.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleResetInputChange = (e) => {
    const { name, value } = e.target;
    setResetFormData((prev) => ({ ...prev, [name]: value }));

    const updatedFormData = { ...resetFormData, [name]: value };
    const newPass = (
      name === "newPassword" ? value : updatedFormData.newPassword
    ).trim();
    const confirmPass = (
      name === "confirmNewPassword" ? value : updatedFormData.confirmNewPassword
    ).trim();

    if (!newPass) {
      setPasswordValidation("");
    } else if (newPass.length <= 4) {
      setPasswordValidation("Password must be longer than 4 characters");
    } else if (confirmPass && newPass !== confirmPass) {
      setPasswordValidation("Passwords do not match");
    } else {
      setPasswordValidation("Password is valid");
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetFormData.oldPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (resetFormData.newPassword !== resetFormData.confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/member/change-password`,
        {
          oldPassword: resetFormData.oldPassword,
          newPassword: resetFormData.newPassword,
          confirmPassword: resetFormData.confirmNewPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || "Password changed successfully!");
      setIsResetModalOpen(false);
      setResetFormData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setPasswordValidation("");
    } catch (error) {
      console.error(
        "❌ Error Changing Password:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message || "Failed to change password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubscriptions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  if (error) {
    return (
      <div className="text-red-600 p-4 text-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-16 px-4 sm:px-12 pt-6 overflow-y-auto z-0 min-h-screen relative">
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
        style={{ zIndex: 9999 }}
      />

      {/* Header */}
      <div className="text-[#003087] flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4">
          <div className="border-[1px] border-[#6A7368] flex items-center gap-2 px-3 py-2 rounded-[11px] shadow-lg w-full sm:w-[350px]">
            <BiSearch className="text-lg" />
            <input
              type="text"
              placeholder="Search by plan name or email"
              className="h-10 w-full outline-0 border-0 bg-transparent text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <RiEqualizerLine className="text-lg" />
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 px-2 relative">
          <Link to="/admin/manage-notifications">
            <IoIosNotificationsOutline className="text-2xl sm:text-[30px] text-[#003087] hover:text-[#003087] transition-colors" />
          </Link>
          <div className="relative">
            <motion.figure
              className="flex items-center bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              onClick={toggleResetButton}
            >
              <CiUser className="text-2xl text-[#003087] bg-gray-100 rounded-full p-1" />
              <figcaption className="ml-2 text-[#003087] hidden sm:block">
                <h3 className="text-xs sm:text-[12px] font-semibold">
                  {profileData.firstname} {profileData.lastname}
                </h3>
              </figcaption>
            </motion.figure>
            {showResetButton && (
              <div
                ref={resetButtonRef}
                className="absolute right-0 mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
              >
                <button
                  className="w-full text-left px-3 py-2 text-[#003087] flex items-center gap-2 hover:bg-gray-100 text-sm"
                  onClick={handleResetPassword}
                >
                  <FiLock /> Change Password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="text-[#003087]">
        <p className="text-lg sm:text-[20px] font-semibold">Subscription</p>
        <div className="intro flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <button
              className={`w-full sm:w-auto border-[1px] border-[#6A7368] px-4 py-2 rounded-[40px] transition-colors shadow-md ${
                activeFilter === "Active"
                  ? "bg-[#003087] text-[#FEFEFF]"
                  : "bg-white hover:bg-[#003087] hover:text-[#FEFEFF]"
              } text-sm sm:text-base`}
              onClick={() => setActiveFilter("Active")}
            >
              Active
            </button>
            <button
              className={`w-full sm:w-auto border-[1px] border-[#6A7368] px-4 py-2 rounded-[40px] transition-colors shadow-md ${
                activeFilter === "Expired"
                  ? "bg-[#003087] text-[#FEFEFF]"
                  : "bg-white hover:bg-[#003087] hover:text-[#FEFEFF]"
              } text-sm sm:text-base`}
              onClick={() => setActiveFilter("Expired")}
            >
              Expired
            </button>
            <button
              className={`w-full sm:w-auto border-[1px] border-[#6A7368] px-4 py-2 rounded-[40px] transition-colors shadow-md ${
                activeFilter === "Cancelled"
                  ? "bg-[#003087] text-[#FEFEFF]"
                  : "bg-white hover:bg-[#003087] hover:text-[#FEFEFF]"
              } text-sm sm:text-base`}
              onClick={() => setActiveFilter("Cancelled")}
            >
              Cancelled
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <button
              className="w-full sm:w-auto border-[1px] border-[#6A7368] px-4 py-2 rounded-[40px] transition-colors shadow-md bg-white hover:bg-[#003087] hover:text-[#FEFEFF] text-sm sm:text-base"
              onClick={handleEditPlan}
            >
              Edit Plan
            </button>
            <div className="relative w-full sm:w-auto" ref={dateDropdownRef}>
              <button
                className="w-full sm:w-auto border-[1px] border-[#6A7368] px-4 py-2 rounded-[40px] transition-colors shadow-md bg-white hover:bg-[#003087] hover:text-[#FEFEFF] flex items-center gap-2 text-sm sm:text-base"
                onClick={() => setShowDateDropdown(!showDateDropdown)}
              >
                {dateFilter} <IoArrowDown />
              </button>
              {showDateDropdown && (
                <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {[
                    "All Time",
                    "Last Month",
                    "Last 3 Months",
                    "Last 6 Months",
                    "Custom Range",
                    `\]?`,
                  ].map((option) => (
                    <button
                      key={option}
                      className="w-full text-left px-3 py-2 text-[#003087] flex items-center gap-2 hover:bg-gray-100 text-sm"
                      onClick={() => {
                        setDateFilter(option);
                        setShowDateDropdown(false);
                        if (option === "Custom Range") {
                          toast.info("Custom Range not implemented yet.");
                        }
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table for Desktop */}
        <div className="hidden sm:block overflow-x-auto rounded-[11px] shadow-lg">
          <table className="w-full border-collapse text-[14px] bg-white">
            <thead>
              <tr className="bg-[#F0F5F2] border-b-2 border-[#6A7368]">
                <th className="py-3 px-4 sm:px-6 text-left font-semibold w-1/5">
                  Plan
                </th>
                <th className="py-3 px-4 sm:px-6 text-left font-semibold w-1/5">
                  Email
                </th>
                <th className="py-3 px-4 sm:px-6 text-left font-semibold w-1/5">
                  Status
                </th>
                <th className="py-3 px-4 sm:px-6 text-left font-semibold w-1/5">
                  Amount
                </th>
                <th className="py-3 px-4 sm:px-6 text-left font-semibold w-1/5">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((sub, index) => (
                  <tr
                    key={sub.id}
                    className={`border-b border-gray-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition-colors`}
                  >
                    <td className="py-4 px-4 sm:px-6 flex items-center gap-2">
                      <img src={SubIcon} alt="Subscribe_Icon" />
                      {sub.subscription.name}
                    </td>
                    <td className="py-4 px-4 sm:px-6">{sub.email}</td>
                    <td className="py-4 px-4 sm:px-6 flex items-center gap-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          sub.subscriptionStatus === "active"
                            ? "bg-[#003087]"
                            : "bg-red-600"
                        }`}
                      />
                      <span
                        className={
                          sub.subscriptionStatus === "active"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {sub.subscriptionStatus === "active"
                          ? "Active"
                          : "Expired"}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      ₦{sub.subscription.price}
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      {formatDate(sub.subscriptionEndDate)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="py-4 px-4 sm:px-6 text-center text-gray-500"
                  >
                    {activeFilter === "Cancelled"
                      ? "N/A"
                      : "No subscriptions found matching your criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card Layout for Mobile */}
        <div className="sm:hidden space-y-4">
          {currentItems.length > 0 ? (
            currentItems.map((sub) => (
              <div
                key={sub.id}
                className="border border-gray-200 rounded-[11px] p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-sm font-semibold">
                  {sub.subscription.name}
                </div>
                <div className="mt-2 text-sm space-y-1">
                  <p>
                    <strong>Email:</strong> {sub.email}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={
                        sub.subscriptionStatus === "active"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {sub.subscriptionStatus === "active"
                        ? "Active"
                        : "Expired"}
                    </span>
                  </p>
                  <p>
                    <strong>Amount:</strong> ₦{sub.subscription.price}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(sub.subscriptionEndDate)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 text-sm">
              {activeFilter === "Cancelled"
                ? "N/A (No endpoint available yet)"
                : "No subscriptions found matching your criteria."}
            </p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-[#003087] text-[#FEFEFF] rounded-[11px] disabled:bg-gray-300"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`px-3 py-1 rounded-[11px] ${
                  currentPage === page
                    ? "bg-[#003087] text-[#FEFEFF]"
                    : "bg-white text-[#003087] border border-[#6A7368]"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-[#003087] text-[#FEFEFF] rounded-[11px] disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-0 px-4">
          <div
            ref={editModalRef}
            className="bg-white rounded-[11px] shadow-lg w-full max-w-[600px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto flex flex-col sm:flex-row"
          >
            <div className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-gray-200 pb-4 sm:pb-0 sm:pr-4">
              <h2 className="text-lg sm:text-[20px] font-semibold text-[#003087] mb-4">
                Edit Plans
              </h2>
              <div className="space-y-2">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`flex justify-between items-center px-2 py-1 rounded cursor-pointer ${
                      activePlan?.id === plan.id ? "bg-gray-200" : ""
                    }`}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    <span className="text-sm">{plan.name}</span>
                    <FiTrash2
                      className="text-red-600 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletePlan(plan);
                        setIsDeleteModalOpen(true);
                      }}
                    />
                  </div>
                ))}
                <div
                  className="flex items-center gap-2 text-[#003087] cursor-pointer mt-4 text-sm"
                  onClick={handleAddPlan}
                >
                  <BiPlus />
                  <span>Add Plan</span>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-2/3 pt-4 sm:pt-0 sm:pl-4">
              <form onSubmit={handleEditSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm sm:text-[14px] text-[#003087] mb-1">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                      placeholder="Enter plan name"
                      className="w-full h-10 sm:h-[42px] px-3 sm:px-4 border-[1px] border-[#6A7368] rounded-[11px] outline-0 bg-transparent text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-[14px] text-[#003087] mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditFormChange}
                      placeholder="Enter description"
                      className="w-full h-10 sm:h-[42px] px-3 sm:px-4 border-[1px] border-[#6A7368] rounded-[11px] outline-0 bg-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-[14px] text-[#003087] mb-1">
                      Price
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditFormChange}
                        placeholder="Enter price"
                        className="w-full h-10 sm:h-[42px] px-3 sm:px-4 border-[1px] border-[#6A7368] rounded-[11px] outline-0 bg-transparent text-sm sm:text-base"
                        required
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#003087]">
                        ₦
                      </span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto mt-4 px-6 py-2 bg-[#003087] text-[#FEFEFF] rounded-full hover:bg-[#003087] transition-colors text-sm sm:text-base sm:float-right flex items-center justify-center"
                    disabled={isSubmittingEdit}
                  >
                    {isSubmittingEdit ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-[#FEFEFF]"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && deletePlan && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div
            ref={deleteModalRef}
            className="bg-white rounded-[11px] shadow-lg w-full max-w-md sm:w-[400px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-end mb-4">
              <AiOutlineClose
                className="text-xl sm:text-[20px] text-[#003087] cursor-pointer hover:text-[#003087] transition-colors"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletePlan(null);
                }}
              />
            </div>
            <div className="text-center mb-4">
              <p className="text-sm sm:text-[16px] text-[#003087]">
                Are you sure you want to delete the plan{" "}
                <span className="font-semibold">{deletePlan.name}</span>?
              </p>
            </div>
            <div className="flex justify-between gap-2">
              <button
                className="w-full px-4 py-2 bg-gray-200 text-[#003087] rounded-[11px] hover:bg-gray-300 transition-colors text-sm sm:text-base"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletePlan(null);
                }}
              >
                Cancel
              </button>
              <button
                className="w-full px-4 py-2 bg-red-600 text-[#FEFEFF] rounded-[11px] hover:bg-red-700 transition-colors text-sm sm:text-base"
                onClick={handleDeletePlan}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-0 px-4">
          <div
            ref={resetModalRef}
            className="bg-white rounded-[11px] shadow-lg w-full max-w-md sm:w-[400px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-[20px] font-semibold text-[#003087]">
                Change Password
              </h2>
              <AiOutlineClose
                className="text-xl sm:text-[20px] text-[#003087] cursor-pointer hover:text-[#003087] transition-colors"
                onClick={() => {
                  setIsResetModalOpen(false);
                  setResetFormData({
                    oldPassword: "",
                    newPassword: "",
                    confirmNewPassword: "",
                  });
                  setPasswordValidation("");
                }}
              />
            </div>
            <form onSubmit={handleResetPasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm sm:text-[14px] text-[#003087] mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="oldPassword"
                      value={resetFormData.oldPassword}
                      onChange={handleResetInputChange}
                      placeholder="Enter current password"
                      className="w-full h-10 sm:h-[42px] px-3 sm:px-4 border-[1px] border-[#6A7368] rounded-[11px] outline-0 bg-transparent text-sm sm:text-base"
                      required
                    />
                    <span
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#003087]"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm sm:text-[14px] text-[#003087] mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={resetFormData.newPassword}
                      onChange={handleResetInputChange}
                      placeholder="Enter new password"
                      className="w-full h-10 sm:h-[42px] px-3 sm:px-4 border-[1px] border-[#6A7368] rounded-[11px] outline-0 bg-transparent text-sm sm:text-base"
                      required
                    />
                    <span
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#003087]"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FiEyeOff /> : <FiEye />}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm sm:text-[14px] text-[#003087] mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      name="confirmNewPassword"
                      value={resetFormData.confirmNewPassword}
                      onChange={handleResetInputChange}
                      placeholder="Confirm new password"
                      className="w-full h-10 sm:h-[42px] px-3 sm:px-4 border-[1px] border-[#6A7368] rounded-[11px] outline-0 bg-transparent text-sm sm:text-base"
                      required
                    />
                    <span
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#003087]"
                      onClick={() =>
                        setShowConfirmNewPassword(!showConfirmNewPassword)
                      }
                    >
                      {showConfirmNewPassword ? <FiEyeOff /> : <FiEye />}
                    </span>
                  </div>
                </div>
                {passwordValidation && (
                  <div className="flex items-center gap-2">
                    {passwordValidation === "Password is valid" ? (
                      <FiCheckCircle className="text-green-600" />
                    ) : (
                      <FiAlertCircle className="text-red-600" />
                    )}
                    <span
                      className={
                        passwordValidation === "Password is valid"
                          ? "text-green-600 text-sm"
                          : "text-red-600 text-sm"
                      }
                    >
                      {passwordValidation}
                    </span>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full mt-4 px-4 py-2 bg-[#003087] text-[#FEFEFF] rounded-[11px] hover:bg-[#003087] transition-colors text-sm sm:text-base flex items-center justify-center"
                  disabled={
                    passwordValidation !== "Password is valid" || isSubmitting
                  }
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-[#FEFEFF]"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubscription;
