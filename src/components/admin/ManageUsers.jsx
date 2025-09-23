import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { CiUser } from "react-icons/ci";
import { BiSearch } from "react-icons/bi";
import { RiEqualizerLine } from "react-icons/ri";
import { BsThreeDots } from "react-icons/bs";
import {
  FiLock,
  FiTrash2,
  FiUser,
  FiMail,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [suspendedUsers, setSuspendedUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredSuspendedUsers, setFilteredSuspendedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [showResetButton, setShowResetButton] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [suspendUser, setSuspendUser] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [resetFormData, setResetFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState("");
  const [view, setView] = useState("active");
  const [profileData, setProfileData] = useState({
    firstname: "",
    lastname: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  const dropdownRef = useRef(null);
  const modalRef = useRef(null);
  const deleteModalRef = useRef(null);
  const suspendModalRef = useRef(null);
  const resetModalRef = useRef(null);
  const resetButtonRef = useRef(null);
  const dropdownRefs = useRef({});

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

    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/admin/all-members`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data && Array.isArray(response.data.members)) {
          setUsers(response.data.members);
          setFilteredUsers(response.data.members);
        } else {
          throw new Error("No user data found in the response.");
        }
      } catch (error) {
        console.error("❌ Error Fetching Users:", error);
        setError(error.response?.data?.message || "Failed to fetch user data.");
        toast.error(error.response?.data?.message || "Failed to fetch users");
      }
    };

    const fetchSuspendedUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/admin/suspended-members`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data && Array.isArray(response.data.members)) {
          setSuspendedUsers(response.data.members);
          setFilteredSuspendedUsers(response.data.members);
        } else {
          throw new Error("No suspended user data found in the response.");
        }
      } catch (error) {
        console.error("❌ Error Fetching Suspended Users:", error);
        setError(
          error.response?.data?.message || "Failed to fetch suspended users"
        );
        toast.error(
          error.response?.data?.message || "Failed to fetch suspended users"
        );
      }
    };

    Promise.all([fetchUsers(), fetchSuspendedUsers()])
      .then(() => {
        setTimeout(() => {
          console.log("User data loaded successfully!");
        }, 100);
      })
      .catch((error) => {
        console.error("❌ One or more fetch requests failed:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated, token, navigate, user]);

  useEffect(() => {
    const filterUsers = () => {
      if (!searchQuery.trim()) {
        setFilteredUsers(users);
        setFilteredSuspendedUsers(suspendedUsers);
        return;
      }

      const query = searchQuery.toLowerCase().trim();
      const filteredActive = users.filter((user) => {
        const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
        const email = user.email.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
      const filteredSuspended = suspendedUsers.filter((user) => {
        const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
        const email = user.email.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });

      setFilteredUsers(filteredActive);
      setFilteredSuspendedUsers(filteredSuspended);
    };

    const debounceTimeout = setTimeout(() => {
      filterUsers();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, users, suspendedUsers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !Object.values(dropdownRefs.current).some(
          (ref) => ref && ref.contains(event.target)
        )
      ) {
        setActiveMenuIndex(null);
      }
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
      if (
        deleteModalRef.current &&
        !deleteModalRef.current.contains(event.target)
      ) {
        setIsDeleteModalOpen(false);
        setDeleteUser(null);
      }
      if (
        suspendModalRef.current &&
        !suspendModalRef.current.contains(event.target)
      ) {
        setIsSuspendModalOpen(false);
        setSuspendUser(null);
      }
      if (
        resetModalRef.current &&
        !resetModalRef.current.contains(event.target)
      ) {
        setIsResetModalOpen(false);
        setResetUser(null);
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
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const toggleMenu = (id) => {
    console.log(
      "toggleMenu called with id:",
      id,
      "current activeMenuIndex:",
      activeMenuIndex
    );
    setActiveMenuIndex(activeMenuIndex === id ? null : id);
  };

  const toggleResetButton = () => {
    setShowResetButton((prev) => !prev);
  };

  const handleResetPassword = () => {
    setResetUser(user || { firstname: "Unknown", lastname: "User" });
    setIsResetModalOpen(true);
    setShowResetButton(false);
  };

  const openDeleteModal = (user) => {
    setDeleteUser(user);
    setIsDeleteModalOpen(true);
  };

  const openSuspendModal = (user) => {
    setSuspendUser(user);
    setIsSuspendModalOpen(true);
  };

  const handleViewProfile = (user) => {
    if (!user.profile || !user.profile.id) {
      toast.error("This user has no associated profile to view.");
      return;
    }
    navigate(`/community/profile/${user.profile.id}`);
    toast.success(`Viewing profile for ${user.firstname} ${user.lastname}`);
  };

  const handleRemoveUser = async () => {
    console.log("handleRemoveUser called with deleteUser:", deleteUser);
    if (!deleteUser?.id) {
      console.warn("No user selected for deletion");
      toast.error("No user selected for deletion.");
      return;
    }

    try {
      console.log("Sending delete request for user ID:", deleteUser.id);
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/admin/delete-member/${deleteUser.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Delete response:", response.data);
      toast.success(response.data.message);
      if (view === "active") {
        setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
        setFilteredUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      }
      setIsDeleteModalOpen(false);
      setDeleteUser(null);
    } catch (error) {
      console.error(
        "❌ Error Deleting User:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleSuspendUser = async () => {
    console.log("handleSuspendUser called with suspendUser:", suspendUser);
    if (!suspendUser?.id) {
      console.warn("No user selected for suspension");
      toast.error("No user selected for suspension.");
      return;
    }

    if (!suspendUser.profile || !suspendUser.profile.id) {
      console.warn("User has no profile to suspend");
      toast.error("This user has no profile to suspend.");
      setIsSuspendModalOpen(false);
      setSuspendUser(null);
      return;
    }

    try {
      console.log(
        "Sending suspend request for profile ID:",
        suspendUser.profile.id
      );
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/member/delete-profile/${
          suspendUser.profile.id
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Suspend response:", response.data);
      toast.success(response.data.message);
      const updatedUser = { ...suspendUser, profile: null };
      setUsers((prev) => prev.filter((u) => u.id !== suspendUser.id));
      setFilteredUsers((prev) => prev.filter((u) => u.id !== suspendUser.id));
      setSuspendedUsers((prev) => [...prev, updatedUser]);
      setFilteredSuspendedUsers((prev) => [...prev, updatedUser]);
      setIsSuspendModalOpen(false);
      setSuspendUser(null);
    } catch (error) {
      console.error(
        "❌ Error Suspending User:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || "Failed to suspend user.");
    }
  };

  const handleRestoreUser = async (user) => {
    console.log("handleRestoreUser called with user:", user); // Debug log
    if (!user) {
      console.warn("No user selected for restoration");
      toast.error("No user selected for restoration.");
      return;
    }

    if (!user.profile || !user.profile.id) {
      console.warn("User has no profile to restore");
      toast.error("This user has no profile to restore.");
      return;
    }

    try {
      console.log("Sending restore request for profile ID:", user.profile.id); // Debug log
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/admin/restore-profile/${
          user.profile.id
        }`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Restore response:", response.data); // Debug log
      toast.success(
        response.data.message || "User profile restored successfully."
      );
      const restoredUser = { ...user, profile: response.data.profile || {} };
      setSuspendedUsers((prev) => prev.filter((u) => u.id !== user.id));
      setFilteredSuspendedUsers((prev) => prev.filter((u) => u.id !== user.id));
      setUsers((prev) => [...prev, restoredUser]);
      setFilteredUsers((prev) => [...prev, restoredUser]);
    } catch (error) {
      console.error(
        "❌ Error Restoring User Profile:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message || "Failed to restore user profile."
      );
    }
  };

  const handleSendEmail = (user) => {
    const mailtoLink = `mailto:${encodeURIComponent(user.email)}`;
    window.location.href = mailtoLink;
    toast.success(`Email client opened for ${user.email}`);
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

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin/create-admin`,
        {
          firstName: formData.firstname,
          lastName: formData.lastname,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message);
      const newUser = {
        ...response.data.newMember,
        firstname: response.data.newMember.firstName,
        lastname: response.data.newMember.lastName,
      };
      setUsers((prev) => [...prev, newUser]);
      setFilteredUsers((prev) => [...prev, newUser]);
      setTimeout(closeModal, 2000);
    } catch (error) {
      console.error(
        "❌ Error Adding User:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || "Failed to add user.");
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

      toast.success("Password changed successfully!");
      setIsResetModalOpen(false);
      setResetUser(null);
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

  const getDropdownPosition = (id) => {
    const button = dropdownRefs.current[id];
    console.log("getDropdownPosition for id:", id, "button ref:", button);
    if (!button) {
      console.warn("No button ref found for id:", id);
      return { top: "100%", bottom: "auto" };
    }
    const rect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const dropdownHeight = 100;
    console.log("rect.bottom:", rect.bottom, "spaceBelow:", spaceBelow);
    if (spaceBelow < dropdownHeight) {
      return { top: "auto", bottom: "100%" };
    }
    return { top: "100%", bottom: "auto" };
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems =
    view === "active"
      ? filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
      : filteredSuspendedUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(
    (view === "active" ? filteredUsers.length : filteredSuspendedUsers.length) /
      itemsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
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

  if (error) {
    return (
      <div className="text-red-600 p-4 text-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 relative pb-16 px-4 sm:px-12 py-6 overflow-y-auto z-0 min-h-screen">
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
              placeholder="Search by name or email"
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
        <div className="intro flex flex-col items-start justify-between mb-6 gap-4">
          <p className="text-lg sm:text-[20px] font-semibold">Users</p>
          <div className="w-full flex justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                className={`border-[1px] border-[#6A7368] px-4 py-2 rounded-[40px] transition-colors shadow-md ${
                  view === "active"
                    ? "bg-[#003087] text-[#FEFEFF]"
                    : "bg-white hover:bg-[#003087] hover:text-[#FEFEFF]"
                } text-sm sm:text-base`}
                onClick={() => setView("active")}
              >
                Active
              </button>
              <button
                className={`border-[1px] border-[#6A7368] px-4 py-2 rounded-[40px] transition-colors shadow-md ${
                  view === "suspended"
                    ? "bg-[#003087] text-[#FEFEFF]"
                    : "bg-white hover:bg-[#003087] hover:text-[#FEFEFF]"
                } text-sm sm:text-base`}
                onClick={() => setView("suspended")}
              >
                Suspended
              </button>
            </div>
          </div>
        </div>

        {/* Table for Desktop */}
        <div className="hidden sm:block overflow-x-auto rounded-[11px] shadow-lg">
          <table className="w-full border-collapse text-[14px] bg-white">
            <thead>
              <tr className="bg-[#F0F5F2] border-b-2 border-[#6A7368]">
                <th className="py-3 px-6 text-left font-semibold w-1/5">
                  User
                </th>
                <th className="py-3 px-6 text-left font-semibold w-1/5">
                  Email
                </th>
                <th className="py-3 px-6 text-left font-semibold w-1/5">
                  Current Plan
                </th>
                <th className="py-3 px-6 text-left font-semibold w-1/5">
                  Last Login
                </th>
                <th className="py-3 px-6 text-left font-semibold w-1/5">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-b border-gray-200 ${
                      user.id % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition-colors`}
                  >
                    <td className="py-4 px-6">{`${user.firstname} ${user.lastname}`}</td>
                    <td className="py-4 px-6">{user.email}</td>
                    <td className="py-4 px-6">
                      {user.subscription ? user.subscription.name : "None"}
                    </td>
                    <td className="py-4 px-6">{formatDate(user.lastLogin)}</td>
                    <td className="py-4 px-6 flex justify-between items-center">
                      {formatDate(user.createdAt)}
                      <div
                        ref={(el) => (dropdownRefs.current[user.id] = el)}
                        className="relative"
                      >
                        <BsThreeDots
                          className="text-[18px] cursor-pointer hover:text-[#003087] transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(user.id);
                          }}
                        />
                        {activeMenuIndex === user.id && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 bg-white border border-gray-200 rounded-md shadow-lg z-[100] max-h-40 overflow-y-auto"
                            style={{
                              minWidth: "160px",
                              top: getDropdownPosition(user.id).top,
                              bottom: getDropdownPosition(user.id).bottom,
                            }}
                          >
                            {view === "active" && (
                              <button
                                className="w-full text-left px-4 py-2 text-[#003087] flex items-center gap-2 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProfile(user);
                                }}
                              >
                                <FiUser /> View Profile
                              </button>
                            )}
                            <button
                              className="w-full text-left px-4 py-2 text-[#003087] flex items-center gap-2 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendEmail(user);
                              }}
                            >
                              <FiMail /> Send Email
                            </button>
                            {view === "active" && (
                              <>
                                <button
                                  className="w-full text-left px-4 py-2 text-red-600 flex items-center gap-2 hover:bg-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openSuspendModal(user);
                                  }}
                                >
                                  <FiAlertCircle /> Suspend User
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-red-600 flex items-center gap-2 hover:bg-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteModal(user);
                                  }}
                                >
                                  <FiTrash2 /> Delete User
                                </button>
                              </>
                            )}
                            {view === "suspended" && (
                              <button
                                className="w-full text-left px-4 py-2 text-green-600 flex items-center gap-2 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestoreUser(user);
                                }}
                              >
                                <FiRefreshCw /> Restore User
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="py-4 px-6 text-center text-gray-500"
                  >
                    No {view === "active" ? "active" : "suspended"} users found
                    matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card Layout for Mobile */}
        <div className="sm:hidden space-y-4">
          {currentItems.length > 0 ? (
            currentItems.map((user) => (
              <div
                key={user.id}
                className="border border-gray-200 rounded-[11px] p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">{`${user.firstname} ${user.lastname}`}</span>
                  <div
                    ref={(el) => (dropdownRefs.current[user.id] = el)}
                    className="relative"
                  >
                    <BsThreeDots
                      className="text-lg cursor-pointer hover:text-[#003087]"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(user.id);
                      }}
                    />
                    {activeMenuIndex === user.id && (
                      <div
                        ref={dropdownRef}
                        className="mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-[100]"
                      >
                        {view === "active" && (
                          <button
                            className="w-full text-left px-3 py-2 text-[#003087] flex items-center gap-2 hover:bg-gray-100 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProfile(user);
                            }}
                          >
                            <FiUser /> View Profile
                          </button>
                        )}
                        <button
                          className="w-full text-left px-3 py-2 text-[#003087] flex items-center gap-2 hover:bg-gray-100 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendEmail(user);
                          }}
                        >
                          <FiMail /> Send Email
                        </button>
                        {view === "active" && (
                          <>
                            <button
                              className="w-full text-left px-3 py-2 text-red-600 flex items-center gap-2 hover:bg-gray-100 text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openSuspendModal(user);
                              }}
                            >
                              <FiAlertCircle /> Suspend User
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-red-600 flex items-center gap-2 hover:bg-gray-100 text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(user);
                              }}
                            >
                              <FiTrash2 /> Delete User
                            </button>
                          </>
                        )}
                        {view === "suspended" && (
                          <button
                            className="w-full text-left px-3 py-2 text-green-600 flex items-center gap-2 hover:bg-gray-100 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreUser(user);
                            }}
                          >
                            <FiRefreshCw /> Restore User
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-sm space-y-1">
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Plan:</strong>{" "}
                    {user.subscription ? user.subscription.name : "None"}
                  </p>
                  <p>
                    <strong>Last Login:</strong> {formatDate(user.lastLogin)}
                  </p>
                  <p>
                    <strong>Joined:</strong> {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 text-sm">
              No {view === "active" ? "active" : "suspended"} users found
              matching your search.
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

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div
            ref={modalRef}
            className="bg-white rounded-[11px] shadow-lg w-full max-w-md sm:w-[400px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-[20px] font-semibold text-[#003087]">
                New User
              </h2>
              <AiOutlineClose
                className="text-xl sm:text-[20px] text-[#003087] cursor-pointer hover:text-[#003087] transition-colors"
                onClick={closeModal}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {isDeleteModalOpen && deleteUser && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div
            ref={deleteModalRef}
            className="bg-white rounded-[11px] shadow-lg w-full max-w-md sm:w-[400px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-end mb-4">
              <AiOutlineClose
                className="text-xl sm:text-[20px] text-[#003087] cursor-pointer hover:text-[#003087] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteModalOpen(false);
                  setDeleteUser(null);
                }}
              />
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-[20px] font-semibold text-gray-700">
                {deleteUser.firstname.charAt(0)}
              </div>
            </div>
            <div className="text-center mb-4">
              <p className="text-sm sm:text-[16px] text-[#003087]">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {`${deleteUser.firstname} ${deleteUser.lastname}`}
                </span>
                ?
              </p>
            </div>
            <div className="flex justify-between gap-2">
              <button
                className="w-full px-4 py-2 bg-gray-200 text-[#003087] rounded-[11px] hover:bg-gray-300 transition-colors text-sm sm:text-base"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteModalOpen(false);
                  setDeleteUser(null);
                }}
              >
                Cancel
              </button>
              <button
                className="w-full px-4 py-2 bg-red-600 text-[#FEFEFF] rounded-[11px] hover:bg-red-700 transition-colors text-sm sm:text-base"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveUser();
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleRemoveUser();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend User Modal */}
      {isSuspendModalOpen && suspendUser && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div
            ref={suspendModalRef}
            className="bg-white rounded-[11px] shadow-lg w-full max-w-md sm:w-[400px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-end mb-4">
              <AiOutlineClose
                className="text-xl sm:text-[20px] text-[#003087] cursor-pointer hover:text-[#003087] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSuspendModalOpen(false);
                  setSuspendUser(null);
                }}
              />
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-[20px] font-semibold text-gray-700">
                {suspendUser.firstname.charAt(0)}
              </div>
            </div>
            <div className="text-center mb-4">
              <p className="text-sm sm:text-[16px] text-[#003087]">
                Are you sure you want to suspend{" "}
                <span className="font-semibold">
                  {`${suspendUser.firstname} ${suspendUser.lastname}`}
                </span>
                ?
              </p>
            </div>
            <div className="flex justify-between gap-2">
              <button
                className="w-full px-4 py-2 bg-gray-200 text-[#003087] rounded-[11px] hover:bg-gray-300 transition-colors text-sm sm:text-base"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSuspendModalOpen(false);
                  setSuspendUser(null);
                }}
              >
                Cancel
              </button>
              <button
                className="w-full px-4 py-2 bg-red-600 text-[#FEFEFF] rounded-[11px] hover:bg-red-700 transition-colors text-sm sm:text-base"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSuspendUser();
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleSuspendUser();
                }}
              >
                Suspend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && resetUser && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
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
                onClick={(e) => {
                  e.stopPropagation();
                  setIsResetModalOpen(false);
                  setResetUser(null);
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

export default ManageUsers;
