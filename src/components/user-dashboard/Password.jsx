import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import EditHeader from "./EditHeader";

// Custom Success Toast Component
const SuccessToast = ({ message }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      background: "#fff",
      color: "#333",
      borderLeft: "4px solid #07bc0c",
      padding: "10px",
      borderRadius: "4px",
      boxShadow: "0 1px 10px 0 rgba(0, 0, 0, 0.1)",
      width: "100%",
    }}
  >
    <span style={{ color: "#07bc0c", fontSize: "16px" }}>✓</span>
    <span>{message}</span>
  </div>
);

// Custom Error Toast Component
const ErrorToast = ({ message }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      background: "#fff",
      color: "#333",
      borderLeft: "4px solid #ff3333",
      padding: "10px",
      borderRadius: "4px",
      boxShadow: "0 1px 10px 0 rgba(0, 0, 0, 0.1)",
      width: "100%",
    }}
  >
    <span style={{ color: "#ff3333", fontSize: "16px" }}>✗</span>
    <span>{message}</span>
  </div>
);

const Password = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const { token } = useSelector((state) => state.auth);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validation
    if (
      !formData.oldPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      toast.error(<ErrorToast message="All fields are required." />, {
        progressStyle: { background: "#ff3333" },
        icon: false,
      });
      setSubmitting(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(
        <ErrorToast message="New password and confirm password do not match." />,
        {
          progressStyle: { background: "#ff3333" },
          icon: false,
        }
      );
      setSubmitting(false);
      return;
    }

    // Check if new password is the same as old password
    if (formData.oldPassword === formData.newPassword) {
      toast.error(
        <ErrorToast message="New password must be different from the old password." />,
        {
          progressStyle: { background: "#ff3333" },
          icon: false,
        }
      );
      setSubmitting(false);
      return;
    }

    if (!token) {
      toast.error(<ErrorToast message="No authentication token found!" />, {
        progressStyle: { background: "#ff3333" },
        icon: false,
      });
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      };
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/member/change-password`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message === "Password updated successfully") {
        toast.success(
          <SuccessToast
            message={response.data.message || "Password changed successfully!"}
          />,
          {
            progressStyle: { background: "#07bc0c" },
            icon: false,
          }
        );
        setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(
          <ErrorToast
            message={
              response.data.error ||
              response.data.message ||
              "Failed to change password."
            }
          />,
          {
            progressStyle: { background: "#ff3333" },
            icon: false,
          }
        );
      }
    } catch (error) {
      console.error("❌ Error Changing Password:", error);
      toast.error(
        <ErrorToast
          message={
            error.response?.data?.message ||
            "Failed to change password due to an error."
          }
        />,
        {
          progressStyle: { background: "#ff3333" },
          icon: false,
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Animated Loader Component
  const Loader = () => (
    <div className="flex space-x-2 items-center">
      <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce"></div>
      <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce delay-200"></div>
      <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce delay-400"></div>
    </div>
  );

  return (
    <div className="w-full text-[#003087] flex flex-col gap-10 justify-start">
      <EditHeader />
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
        theme="light"
        toastStyle={{
          padding: "0",
          background: "transparent",
          boxShadow: "none",
        }}
      />
      <div className="container px-[5vw] mx-auto">
        <form
          className="lg:w-[70%] lg:mx-auto flex flex-col gap-8 mt-4"
          onSubmit={handleSubmit}
        >
          <h2 className="text-[16px] text-[#003087] font-medium border-b-[1px] border-[#6A7368] py-1 w-fit">
            Change Password
          </h2>
          <div className="text-[#003087] flex flex-col gap-2">
            <label>Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.oldPassword ? "text" : "password"}
                value={formData.oldPassword}
                onChange={(e) =>
                  handleInputChange("oldPassword", e.target.value)
                }
                placeholder="Enter current password"
                className="w-full h-[46px] px-4 pr-10 rounded-[11px] border-[1px] border-[#6A7368] focus:ring-2 focus:ring-[#043D12] focus:border-[#043D12]"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("oldPassword")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#003087] hover:text-[#003087]"
              >
                {showPasswords.oldPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="text-[#003087] flex flex-col gap-2">
            <label>New Password</label>
            <div className="relative">
              <input
                type={showPasswords.newPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                placeholder="Enter new password"
                className="w-full h-[46px] px-4 pr-10 rounded-[11px] border-[1px] border-[#6A7368] focus:ring-2 focus:ring-[#043D12] focus:border-[#043D12]"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("newPassword")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#003087] hover:text-[#003087]"
              >
                {showPasswords.newPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="text-[#003087] flex flex-col gap-2">
            <label>Confirm Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                placeholder="Confirm new password"
                className="w-full h-[46px] px-4 pr-10 rounded-[11px] border-[1px] border-[#6A7368] focus:ring-2 focus:ring-[#043D12] focus:border-[#043D12]"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirmPassword")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#003087] hover:text-[#003087]"
              >
                {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={submitting}
              className={`border-[1px] border-[#6A7368] text-[#003087] rounded-[11px] text-[15px] px-2 lg:px-8 py-3 shadow-lg flex items-center gap-2 ${
                submitting
                  ? "cursor-not-allowed opacity-50"
                  : "hover:text-white hover:bg-[#003087]"
              }`}
            >
              {submitting ? "Saving..." : "Save Changes"}
              {submitting && <Loader />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Password;
