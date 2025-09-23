import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaRegEnvelope } from "react-icons/fa";
import { CiLock } from "react-icons/ci";
import { BsPerson } from "react-icons/bs";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Hand from "../components/svgs/Hand";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoArrowBackCircle } from "react-icons/io5";

// Reusable Modal Component
const SuccessModal = ({ onClose }) => {
  const navigate = useNavigate();

  const handleAcknowledge = () => {
    onClose(); // Close the modal
    navigate("/login"); // Redirect to the login page
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 bg-opacity-50 z-50">
      <div className="bg-[#FEFEFF] rounded-[27px] p-8 max-w-md w-full text-center shadow-lg max-sm:w-[90%]">
        <h2 className="text-[24px] font-bold text-[#003087] mb-4">
          🎉 Sign up successful.
        </h2>
        <p className="text-[#003087] mb-6">
          Please check your email to verify your account.
        </p>
        <button
          onClick={handleAcknowledge}
          className="bg-[#003087] text-[#FEFEFF] rounded-[27px] px-6 py-2 hover:bg-[#003087]/75 transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    symbol: false,
  });
  const [suggestedPassword, setSuggestedPassword] = useState("");

  // Generate a compliant password
  const generatePassword = () => {
    const chars = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      symbols: '!@#$%^&*(),.?":{}|<>',
      numbers: "0123456789",
    };
    const getRandomChar = (str) => str[Math.floor(Math.random() * str.length)];
    // Ensure at least one of each required type
    let password = [
      getRandomChar(chars.uppercase),
      getRandomChar(chars.lowercase),
      getRandomChar(chars.symbols),
      getRandomChar(chars.numbers),
    ];
    // Fill the rest to reach 12 characters
    const allChars =
      chars.uppercase + chars.lowercase + chars.symbols + chars.numbers;
    for (let i = 4; i < 12; i++) {
      password.push(getRandomChar(allChars));
    }
    // Shuffle the password
    password = password.sort(() => Math.random() - 0.5).join("");
    return password;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle password input changes with real-time validation
  const handlePasswordChange = (e) => {
    handleChange(e);
    const password = e.target.value;
    const validation = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordValidation(validation);
    // Generate a new suggestion if password is invalid
    if (
      !validation.length ||
      !validation.uppercase ||
      !validation.lowercase ||
      !validation.symbol
    ) {
      setSuggestedPassword(generatePassword());
    } else {
      setSuggestedPassword(""); // Clear suggestion if valid
    }
  };

  // Apply suggested password
  const applySuggestedPassword = () => {
    setFormData({
      ...formData,
      password: suggestedPassword,
      confirmPassword: suggestedPassword,
    });
    setPasswordValidation({
      length: true,
      uppercase: true,
      lowercase: true,
      symbol: true,
    });
    setSuggestedPassword(""); // Clear suggestion after applying
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check password requirements
    if (
      !passwordValidation.length ||
      !passwordValidation.uppercase ||
      !passwordValidation.lowercase ||
      !passwordValidation.symbol
    ) {
      const errors = [];
      if (!passwordValidation.length) errors.push("at least 8 characters");
      if (!passwordValidation.uppercase) errors.push("an uppercase letter");
      if (!passwordValidation.lowercase) errors.push("a lowercase letter");
      if (!passwordValidation.symbol) errors.push("a symbol (e.g., !@#$%)");
      toast.error(`Password must include ${errors.join(", ")}.`, {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_BASE_URL}/member/sign-up`;
      const response = await axios.post(apiUrl, formData);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setPasswordValidation({
        length: false,
        uppercase: false,
        lowercase: false,
        symbol: false,
      });
      setSuggestedPassword("");
      setShowSuccessModal(true); // Show the success modal
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        const errorData = error.response.data;
        if (errorData.error) {
          toast.error(errorData.error, {
            position: "top-center",
            autoClose: 3000,
          });
        } else if (errorData.message) {
          toast.error(errorData.message, {
            position: "top-center",
            autoClose: 3000,
          });
        } else if (errorData.errors) {
          Object.values(errorData.errors).forEach((errMsgArray) => {
            errMsgArray.forEach((errMsg) =>
              toast.error(errMsg, {
                position: "top-center",
                autoClose: 3000,
              })
            );
          });
        } else {
          toast.error("Signup failed! Unexpected error.", {
            position: "top-center",
            autoClose: 3000,
          });
        }
      } else {
        toast.error("Signup failed! Please check your network.", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex justify-center lg:grid grid-cols-2">
      {/* Left Section with Background Image */}
      <div className="max-lg:hidden w-full h-full flex justify-center items-center bg-[url('/Group2.svg')] bg-cover bg-center bg-[#003087]">
        <div className="w-full h-[90%] flex flex-col items-center">
          <div className="container mx-auto px-[5vw] text-[#FEFEFF]">
            <Link to="/" className="lg:text-[35px] text-[32px] font-medium">
              Welcome to <br /> MindPower Business Online
            </Link>
            <p className="text-[18px]">
              Step into a community that puts your business in the spotlight.
              Showcase your brand, find new customers, and grow together.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="relative max-lg:w-full flex flex-col items-center lg:justify-center bg-[#FEFEFF] max-md:bg-[url('/bg-login.svg')] bg-cover bg-center">
        <ToastContainer />
        <div className="container mx-auto px-[5vw] h-fit max-lg:mt-16">
          <Link
            to="/"
            className="lg:text-[50px] text-[32px] font-bold text-[#363636] absolute top-4 left-4"
          >
            <IoArrowBackCircle className="text-[#003087] text-[40px]" />
          </Link>
          <Link
            to="/"
            className="lg:text-[50px] text-[32px] font-bold text-[#363636] hover:border-b-1"
          >
            MBO
          </Link>
          <h4 className="lg:text-[32px] text-[20px] font-medium text-[#003087] flex items-center gap-2">
            Register <Hand />
          </h4>

          <form
            name="signup"
            className="max-lg:w-full flex flex-col gap-6 mt-8 max-lg:items-center"
            onSubmit={handleSubmit}
          >
            {/* First Name */}
            <div className="max-lg:w-full email border-[1px] rounded-[27px] px-8 border-[#363636] flex items-center gap-2 lg:h-[50px] h-[48px]">
              <BsPerson className="text-[#003087]" />
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                autoComplete="given-name"
                className="bg-transparent w-full h-full border-none focus:outline-none focus:border-transparent text-[#003087]"
              />
            </div>

            {/* Last Name */}
            <div className="max-lg:w-full email border-[1px] rounded-[27px] px-8 border-[#363636] flex items-center gap-2 lg:h-[50px] h-[48px]">
              <BsPerson className="text-[#003087]" />
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                autoComplete="family-name"
                className="bg-transparent w-full h-full border-none focus:outline-none focus:border-transparent text-[#003087]"
              />
            </div>

            {/* Email */}
            <div className="max-lg:w-full email border-[1px] rounded-[27px] px-8 border-[#363636] flex items-center gap-2 lg:h-[50px] h-[48px]">
              <FaRegEnvelope className="text-[#003087]" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="bg-transparent w-full h-full border-none focus:outline-none focus:border-transparent text-[#003087]"
              />
            </div>

            {/* Password */}
            <div>
              <div className="max-lg:w-full password border-[1px] rounded-[27px] px-8 border-[#363636] flex items-center gap-2 lg:h-[50px] h-[48px]">
                <CiLock className="text-[#003087]" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  required
                  autoComplete="new-password"
                  className="bg-transparent w-full h-full border-none focus:outline-none focus:border-transparent text-[#003087]"
                />
                <button
                  type="button"
                  className="text-[#003087]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
              {/* Password Requirements */}
              <div className="mt-2 text-sm" aria-live="polite">
                <p
                  className={
                    passwordValidation.length
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {passwordValidation.length ? "✓" : "✗"} At least 8 characters
                </p>
                <p
                  className={
                    passwordValidation.uppercase
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {passwordValidation.uppercase ? "✓" : "✗"} At least one
                  uppercase letter
                </p>
                <p
                  className={
                    passwordValidation.lowercase
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {passwordValidation.lowercase ? "✓" : "✗"} At least one
                  lowercase letter
                </p>
                <p
                  className={
                    passwordValidation.symbol
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {passwordValidation.symbol ? "✓" : "✗"} At least one symbol
                  (e.g., !@#$%)
                </p>
              </div>
              {/* Password Suggestion */}
              {suggestedPassword && (
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-[#003087] text-sm">
                    Suggested: <strong>{suggestedPassword}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={applySuggestedPassword}
                    className="bg-[#003087] text-[#FEFEFF] text-sm rounded-[20px] px-3 py-1 hover:bg-[#003087]/75 transition-colors"
                  >
                    Use this
                  </button>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="max-lg:w-full password border-[1px] rounded-[27px] px-8 border-[#363636] flex items-center gap-2 lg:h-[50px] h-[48px]">
              <CiLock className="text-[#003087]" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="bg-transparent w-full h-full border-none focus:outline-none focus:border-transparent text-[#003087]"
              />
              <button
                type="button"
                className="text-[#003087]"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible />
                ) : (
                  <AiOutlineEye />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <div className="text-center flex flex-col gap-4">
              <button
                type="submit"
                className="mt-6 w-full text-[#FEFEFF] password bg-[#003087] hover:bg-[#003087]/75 shadow-lg rounded-[27px] px-8 flex justify-center items-center lg:h-[60px] h-[48px] cursor-pointer"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
              <Link to="/login" className="text-center text-[#003087]">
                Already have an account? <strong>Log In</strong>
              </Link>
            </div>
          </form>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <SuccessModal onClose={() => setShowSuccessModal(false)} />
        )}
      </div>
    </div>
  );
};

export default Signup;
