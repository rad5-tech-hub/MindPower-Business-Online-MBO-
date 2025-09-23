import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { CiUser } from "react-icons/ci";
import { BiPlus, BiSearch } from "react-icons/bi";
import { IoFilter } from "react-icons/io5";
import { RiEqualizerLine } from "react-icons/ri";
import { BsThreeDots } from "react-icons/bs";
import {
  FiLock,
  FiTrash2,
  FiUser,
  FiMail,
  FiKey,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify"; // Added ToastContainer
import "react-toastify/dist/ReactToastify.css";

const ManageAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [showResetButton, setShowResetButton] = useState(false);
  const [deleteAdmin, setDeleteAdmin] = useState(null);
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
  const [profileData, setProfileData] = useState({
    firstname: "",
    lastname: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for loader
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [itemsPerPage] = useState(10); // Items per page

  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  const dropdownRef = useRef(null);
  const modalRef = useRef(null);
  const deleteModalRef = useRef(null);
  const resetModalRef = useRef(null);
  const resetButtonRef = useRef(null);
  const dropdownRefs = useRef([]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setError("Not authenticated or missing token!");
      setLoading(false);
      navigate("/login", { replace: true });
      toast.info("Redirecting to login...");
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

    const fetchAdmins = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/admin/all-admins`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data && Array.isArray(response.data.members)) {
          setAdmins(response.data.members);
          setFilteredAdmins(response.data.members);
          console.log("Admins fetched successfully!");
        } else {
          throw new Error("No admin data found in the response.");
        }
      } catch (error) {
        console.error("❌ Error Fetching Admins:", error);
        setError(
          error.response?.data?.message || "Failed to fetch admin data."
        );
        toast.error(
          error.response?.data?.message || "Failed to fetch admin data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, [isAuthenticated, token, navigate, user]);

  useEffect(() => {
    const filterAdmins = () => {
      if (!searchQuery.trim()) {
        setFilteredAdmins(admins);
        return;
      }

      const query = searchQuery.toLowerCase().trim();
      const filtered = admins.filter((admin) => {
        const fullName = `${admin.firstname} ${admin.lastname}`.toLowerCase();
        const email = admin.email.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });

      setFilteredAdmins(filtered);
    };

    const debounceTimeout = setTimeout(() => {
      filterAdmins();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, admins]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
        setDeleteAdmin(null);
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const toggleMenu = (index) => {
    setActiveMenuIndex(activeMenuIndex === index ? null : index);
  };

  const toggleResetButton = () => {
    setShowResetButton((prev) => !prev);
  };

  const handleResetPassword = () => {
    setResetUser(user || { firstname: "Unknown", lastname: "User" });
    setIsResetModalOpen(true);
    setShowResetButton(false);
  };

  const openDeleteModal = (admin) => {
    setDeleteAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const handleRemoveAdmin = async () => {
    if (!deleteAdmin?.id) return;

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/admin/delete-member/${
          deleteAdmin.id
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message || "Admin removed successfully!");
      setAdmins((prev) => prev.filter((a) => a.id !== deleteAdmin.id));
      setFilteredAdmins((prev) => prev.filter((a) => a.id !== deleteAdmin.id));
      setIsDeleteModalOpen(false);
      setDeleteAdmin(null);
    } catch (error) {
      console.error("❌ Error Deleting Admin:", error);
      toast.error(error.response?.data?.message || "Failed to remove admin.");
    }
  };

  const openModal = () => setIsModalOpen(true);
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
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleAddAdmin = async (e) => {
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

      toast.success(response.data.message || "Admin added successfully!");
      const newAdmin = {
        ...response.data.newMember,
        firstname: response.data.newMember.firstName,
        lastname: response.data.newMember.lastName,
      };

      setAdmins((prev) => [...prev, newAdmin]);
      setFilteredAdmins((prev) => [...prev, newAdmin]);
      setTimeout(closeModal, 2000);
    } catch (error) {
      console.error("❌ Error Adding Admin:", error);
      toast.error(error.response?.data?.message || "Failed to add admin.");
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

  const getDropdownPosition = (index) => {
    const button = dropdownRefs.current[index];
    if (!button) return { top: "100%", bottom: "auto" };

    const rect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const dropdownHeight = 100;

    if (spaceBelow < dropdownHeight) {
      return { top: "auto", bottom: "100%" };
    }
    return { top: "100%", bottom: "auto" };
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAdmins = filteredAdmins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

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
    <div className="flex flex-col gap-4 relative pb-16 px-4 sm:px-12 pt-6 overflow-y-auto z-0 min-h-screen">
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
      <main className="text-[#003087] container">
        <div className="intro flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <p className="text-lg sm:text-[20px] font-semibold">Admin</p>
          <button
            className="flex items-center gap-2 border-[1px] border-[#6A7368] px-4 py-2 rounded-[11px] bg-white hover:bg-[#003087] hover:text-[#FEFEFF] transition-colors shadow-md text-sm sm:text-base"
            onClick={openModal}
          >
            <BiPlus />
            Add Admin
          </button>
        </div>

        {/* Table for Desktop */}
        <div className="hidden sm:block overflow-x-auto rounded-[11px] shadow-lg">
          <table className="w-full border-collapse text-[14px] bg-white">
            <thead>
              <tr className="bg-[#F0F5F2] border-b-2 border-[#6A7368]">
                <th className="py-3 px-6 text-left font-semibold w-1/3">
                  User
                </th>
                <th className="py-3 px-6 text-left font-semibold w-1/3">
                  Email
                </th>
                <th className="py-3 px-6 text-left font-semibold w-1/3">
                  Last Login
                </th>
              </tr>
            </thead>
            <tbody>
              {currentAdmins.length > 0 ? (
                currentAdmins.map((admin, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition-colors`}
                  >
                    <td className="py-4 px-6">{`${admin.firstname} ${admin.lastname}`}</td>
                    <td className="py-4 px-6">{admin.email}</td>
                    <td className="py-4 px-6 flex justify-between items-center">
                      {formatDate(admin.lastLogin)}
                      <div
                        ref={(el) => (dropdownRefs.current[index] = el)}
                        className="relative"
                      >
                        <BsThreeDots
                          className="text-[18px] cursor-pointer hover:text-[#003087] transition-colors"
                          onClick={() => toggleMenu(index)}
                        />
                        {activeMenuIndex === index && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto"
                            style={{
                              minWidth: "160px",
                              top: getDropdownPosition(index).top,
                              bottom: getDropdownPosition(index).bottom,
                            }}
                          >
                            <button
                              className="w-full text-left px-4 py-2 text-red-600 flex items-center gap-2 hover:bg-gray-100"
                              onClick={() => openDeleteModal(admin)}
                            >
                              <FiTrash2 /> Remove Admin
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="py-4 px-6 text-center text-gray-500"
                  >
                    No admins found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card Layout for Mobile */}
        <div className="sm:hidden space-y-4">
          {currentAdmins.length > 0 ? (
            currentAdmins.map((admin, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-[11px] p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">{`${admin.firstname} ${admin.lastname}`}</span>
                  <BsThreeDots
                    className="text-lg cursor-pointer hover:text-[#003087]"
                    onClick={() => toggleMenu(index)}
                  />
                </div>
                <div className="mt-2 text-sm space-y-1">
                  <p>
                    <strong>Email:</strong> {admin.email}
                  </p>
                  <p>
                    <strong>Last Login:</strong> {formatDate(admin.lastLogin)}
                  </p>
                </div>
                {activeMenuIndex === index && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <button
                      className="w-full text-left px-3 py-2 text-red-600 flex items-center gap-2 hover:bg-gray-100 text-sm"
                      onClick={() => openDeleteModal(admin)}
                    >
                      <FiTrash2 /> Remove Admin
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 text-sm">
              No admins found matching your search.
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

      {/* Add Admin Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div
            ref={modalRef}
            className="bg-white rounded-[11px] shadow-lg w-full max-w-md sm:w-[400px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-[20px] font-semibold text-[#003087]">
                New Admin
              </h2>
              <AiOutlineClose
                className="text-xl sm:text-[20px] text-[#003087] cursor-pointer hover:text-[#003087] transition-colors"
                onClick={closeModal}
              />
            </div>
            <form onSubmit={handleAddAdmin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm sm:text-[14px] text-[#003087] mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      className="w-full h-10 sm:h-[42px] px-3 sm:px-4 border-[1px] border-[#6A7368] rounded-[11px] outline-0 bg-transparent text-sm sm:text-base"
                      required
                    />
                    <FiUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#003087]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm sm:text-[14px] text-[#003087] mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                      className="w-full h-10 sm:h-[42px] px-3 sm:px-4 border-[1px] border-[#6A7368] rounded-[11px] outline-0 bg-transparent text-sm sm:text-base"
                      required
                    />
                    <FiUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#003087]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm sm:text-[14px] text-[#003087] mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email"
                      className="w-full h-10 sm:h-[42px] px-3 sm:px-4 border-[1px] border-[#6A7368] rounded-[11px] outline-0 bg-transparent text-sm sm:text-base"
                      required
                    />
                    <FiMail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#003087]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm sm:text-[14px] text-[#003087] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      className="w-full h-10 sm:h-[42px] px-3 sm:px-4 border-[1px] border-[#6A7368] rounded-[11px] outline-0 bg-transparent text-sm sm:text-base"
                      required
                    />
                    <FiKey className="absolute right-10 top-1/2 transform -translate-y-1/2 text-[#003087]" />
                    <span
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#003087]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm sm:text-[14px] text-[#003087] mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      className="w-full h-10 sm:h-[42px] px-3 sm:px-4 border-[1px] border-[#6A7368] rounded-[11px] outline-0 bg-transparent text-sm sm:text-base"
                      required
                    />
                    <FiKey className="absolute right-10 top-1/2 transform -translate-y-1/2 text-[#003087]" />
                    <span
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#003087]"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 px-4 py-2 bg-[#003087] text-[#FEFEFF] rounded-[11px] hover:bg-[#003087] transition-colors text-sm sm:text-base"
                >
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Admin Modal */}
      {isDeleteModalOpen && deleteAdmin && (
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
                  setDeleteAdmin(null);
                }}
              />
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-[20px] font-semibold text-gray-700">
                {deleteAdmin.firstname.charAt(0)}
              </div>
            </div>
            <div className="text-center mb-4">
              <p className="text-sm sm:text-[16px] text-[#003087]">
                Are you sure you want to remove{" "}
                <span className="font-semibold">
                  {`${deleteAdmin.firstname} ${deleteAdmin.lastname}`}
                </span>
                ?
              </p>
            </div>
            <div className="flex justify-between gap-2">
              <button
                className="w-full px-4 py-2 bg-gray-200 text-[#003087] rounded-[11px] hover:bg-gray-300 transition-colors text-sm sm:text-base"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteAdmin(null);
                }}
              >
                Cancel
              </button>
              <button
                className="w-full px-4 py-2 bg-red-600 text-[#FEFEFF] rounded-[11px] hover:bg-red-700 transition-colors text-sm sm:text-base"
                onClick={handleRemoveAdmin}
              >
                Remove
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
                onClick={() => {
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
                    <FiKey className="absolute right-10 top-1/2 transform -translate-y-1/2 text-[#003087]" />
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
                    <FiKey className="absolute right-10 top-1/2 transform -translate-y-1/2 text-[#003087]" />
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
                    <FiKey className="absolute right-10 top-1/2 transform -translate-y-1/2 text-[#003087]" />
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

export default ManageAdmin;
