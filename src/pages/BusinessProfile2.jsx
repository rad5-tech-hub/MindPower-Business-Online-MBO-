import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { BsPerson } from "react-icons/bs";
import { IoLocationOutline } from "react-icons/io5";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Hand from "../components/svgs/Hand";
import { motion } from "framer-motion";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

const BusinessProfile2 = () => {
  // State for input fields
  const [whatsappNumber, setWhatsappNumber] = useState(""); // WhatsApp number (required)
  const [phoneNumber, setPhoneNumber] = useState(""); // Alternative number (optional)
  const [location, setLocation] = useState(""); // Location (required)
  const [loading, setLoading] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState("");
  const [phoneStatus, setPhoneStatus] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);

  // Check authentication and existing profile
  useEffect(() => {
    console.log("Checking authentication, token:", !!token);
    if (!token) {
      console.log("No token found, redirecting to /login");
      toast.error("Please log in to create a profile.", { autoClose: 3000 });
      navigate("/login");
      return;
    }

    const checkProfile = async (retries = 3, delay = 1000) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`Checking profile, attempt ${attempt}`);
          const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/member/my-profile`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Profile check response:", response.data);
          if (response.data.success) {
            console.log("Profile exists, redirecting to /subscribe");
            toast.info("You already have a profile. Redirecting...", {
              autoClose: 2500,
            });
            setTimeout(
              () =>
                navigate("/subscribe", {
                  state: { fromBusinessProfile2: true },
                }),
              3000
            );
            return;
          }
        } catch (error) {
          if (error.response?.status === 404) {
            console.log("No profile found, proceeding to create one.");
            return;
          }
          console.error(
            `Error checking profile (attempt ${attempt}):`,
            error.response?.data || error
          );
          if (attempt === retries) {
            toast.error("An error occurred while checking your profile.", {
              autoClose: 3000,
            });
          }
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    };
    checkProfile();
  }, [token, navigate]);

  // Validate WhatsApp number
  useEffect(() => {
    if (whatsappNumber) {
      if (isValidPhoneNumber(whatsappNumber)) {
        setWhatsappStatus("valid");
      } else {
        setWhatsappStatus("invalid");
      }
    } else {
      setWhatsappStatus("");
    }
  }, [whatsappNumber]);

  // Validate alternative phone number
  useEffect(() => {
    if (phoneNumber) {
      if (isValidPhoneNumber(phoneNumber)) {
        setPhoneStatus("valid");
      } else {
        setPhoneStatus("invalid");
      }
    } else {
      setPhoneStatus("");
    }
  }, [phoneNumber]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!whatsappNumber || whatsappStatus !== "valid") {
      toast.error("Please enter a valid WhatsApp number.", { autoClose: 3000 });
      return;
    }

    if (phoneNumber && phoneStatus !== "valid") {
      toast.error(
        "Please enter a valid alternative phone number, or leave it blank.",
        { autoClose: 3000 }
      );
      return;
    }

    if (!location.trim()) {
      toast.error("Please enter your location (e.g., Lagos, Nigeria).", {
        autoClose: 3000,
      });
      return;
    }

    const whatsappLink = `https://wa.me/${whatsappNumber.replace("+", "")}`;
    const step1Data = JSON.parse(
      sessionStorage.getItem("businessProfileStep1") || "{}"
    );

    // Validate step1Data to ensure it contains required fields
    if (!step1Data.businessName || !step1Data.categoryId) {
      toast.error(
        "Incomplete data from previous step. Please go back and fill all required fields.",
        { autoClose: 3000 }
      );
      console.log("Invalid step1Data:", step1Data);
      return;
    }

    const payload = {
      businessName: step1Data.businessName || "",
      categoryIds: [step1Data.categoryId || ""],
      description: step1Data.description || "",
      keyword: step1Data.keyword
        ? step1Data.keyword.split(",").map((kw) => kw.trim())
        : [],
      contactNo: phoneNumber ? [phoneNumber] : [],
      location,
      socialLinks: { whatsapp: whatsappLink },
    };

    try {
      setLoading(true);
      console.log("Submitting profile with payload:", payload);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/member/create-profile`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Profile creation response:", response.data);

      const newToken = response.data.token;
      if (newToken) {
        const updatedUser = { ...user, profileStatus: true };
        dispatch(login({ token: newToken, user: updatedUser }));
        localStorage.setItem("token", newToken);
        console.log("Updated token and user in Redux and localStorage");
      }

      // Re-fetch profile to ensure server state is consistent
      try {
        console.log("Fetching profile after creation to confirm state");
        const profileResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/member/my-profile`,
          { headers: { Authorization: `Bearer ${newToken || token}` } }
        );
        console.log(
          "Post-creation profile fetch response:",
          profileResponse.data
        );
        if (!profileResponse.data.success) {
          console.warn(
            "Profile fetch after creation returned unsuccessful:",
            profileResponse.data
          );
          toast.warn(
            "Profile created, but unable to fetch latest profile data.",
            {
              autoClose: 3000,
              toastId: "profile-fetch-warning",
            }
          );
        }
      } catch (profileError) {
        console.error(
          "Error fetching profile after creation:",
          profileError.response?.data || profileError
        );
        toast.warn(
          "Profile created, but unable to fetch latest profile data.",
          {
            autoClose: 3000,
            toastId: "profile-fetch-warning",
          }
        );
      }

      // Show success toast immediately with debugging
      console.log("Triggering success toast for profile creation");
      toast.success("Business profile created successfully!", {
        autoClose: 2000,
        toastId: "profile-creation-success",
        position: "top-center", // Ensure visibility
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        zIndex: 9999, // High z-index to avoid overlap
      });

      sessionStorage.removeItem("businessProfileStep1");
      console.log(
        "Navigating to /subscribe with state: { fromBusinessProfile2: true, businessName: ",
        step1Data.businessName,
        "}"
      );
      setTimeout(
        () =>
          navigate("/subscribe", {
            state: {
              fromBusinessProfile2: true,
              businessName: step1Data.businessName,
            },
          }),
        3000 // Reverted to 3000ms since toast is triggered earlier
      );
    } catch (error) {
      const errorData = error.response?.data;
      const status = errorData?.status;
      const message = errorData?.message || "An error occurred.";
      console.error("Submission error:", errorData || error);

      if (status === 400 && message.includes("already exists")) {
        toast.error(message, { autoClose: 3000 });
        console.log(
          "Username already exists, staying on BusinessProfile2 page"
        );
      } else if (status === 403 && message === "You already have a profile.") {
        toast.error("You already have a profile. Redirecting...", {
          autoClose: 2000,
        });
        console.log(
          "Navigating to /subscribe with state: { fromBusinessProfile2: true } (profile exists)"
        );
        setTimeout(
          () =>
            navigate("/subscribe", { state: { fromBusinessProfile2: true } }),
          2000
        );
      } else if (status === 401) {
        toast.error("Session expired. Please log in again.", {
          autoClose: 2000,
        });
        console.log("Navigating to /login due to 401 error");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(message || "Failed to submit profile.", {
          autoClose: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Styling for validation feedback
  const statusColor = (status) => {
    switch (status) {
      case "valid":
        return "text-green-600";
      case "invalid":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const statusMessage = (status) => {
    switch (status) {
      case "valid":
        return "Valid phone number";
      case "invalid":
        return "Invalid phone number for the selected country";
      default:
        return "";
    }
  };

  return (
    <div className="w-full h-screen flex justify-center lg:grid grid-cols-2">
      {/* Inline CSS */}
      <style>
        {`
          /* Remove default outline and customize focus state for PhoneInput */
          .PhoneInputInput {
            outline: none !important; /* Remove default outline */
            border: none !important; /* Ensure no border appears */
            background: transparent; /* Keep background clean */
            color: #6A7368; /* Match text color */
            font-size: 14px; /* Consistent font size */
          }

          /* Custom focus indicator */
          .PhoneInputInput:focus {
            background: rgba(6, 61, 18, 0.05); /* Subtle background change on focus */
          }

          /* Ensure the container maintains consistent styling */
          .PhoneInputContainer {
            display: flex;
            align-items: center;
            width: 100%;
            height: 100%;
          }

          /* Style the country select dropdown */
          .PhoneInputCountry {
            margin-right: 8px;
          }

          /* Match placeholder color */
          .PhoneInputInput::placeholder {
            color: rgba(106, 115, 104, 0.7);
            font-size: 14px;
          }

          /* Ensure consistent input field styling */
          .PhoneInputCountrySelect {
            border: none;
            background: transparent;
            color: #6A7368;
          }
        `}
      </style>

      {/* Left Section (Hidden on Mobile) */}
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

      {/* Right Section (Form) */}
      <div className="relative max-lg:w-full flex flex-col items-center lg:justify-center bg-[#FEFEFF] max-md:bg-[url('/bg-login.svg')] bg-cover bg-center">
        <div className="container px-[5vw] mx-auto h-fit max-lg:mt-20">
          {/* Back Button */}
          <Link
            to="/business-profile"
            className="w-fit h-fit absolute top-0 left-0"
          >
            <motion.p
              className="text-white rounded-lg shadow-lg border border-[#043D12] bg-[#003087] m-2 px-2 py-1 text-[15px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back
            </motion.p>
          </Link>
          {/* Step Indicator */}
          <div className="absolute top-0 right-0 m-2 text-[#003087] font-medium">
            2 of 2
          </div>
          {/* Logo */}
          <Link
            to="/"
            className="lg:text-[50px] text-[32px] font-bold text-[#363636]"
          >
            MBO
          </Link>
          <h4 className="lg:text-[32px] text-[20px] font-medium text-[#003087] flex items-center gap-2">
            Set Up Business Profile <Hand />
          </h4>

          {/* Form */}
          <form
            className="max-lg:w-full flex flex-col gap-6 md:mt-8 mt-16 max-lg:items-center"
            onSubmit={handleSubmit}
          >
            {/* WhatsApp Number Input */}
            <div className="max-lg:w-full flex flex-col gap-2">
              <label className="text-[#003087] text-sm font-medium">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 border-[1px] rounded-[27px] px-4 border-[#363636] h-[48px] lg:h-[60px] bg-white shadow-sm">
                <BsPerson className="text-[#003087]" />
                <PhoneInput
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry="NG"
                  value={whatsappNumber}
                  onChange={setWhatsappNumber}
                  className="w-full h-full PhoneInputContainer"
                  placeholder="Enter WhatsApp number"
                />
              </div>
              {whatsappStatus && (
                <p className={`text-xs ${statusColor(whatsappStatus)}`}>
                  {statusMessage(whatsappStatus)}
                </p>
              )}
            </div>

            {/* Alternative Number Input */}
            <div className="max-lg:w-full flex flex-col gap-2">
              <label className="text-[#003087] text-sm font-medium">
                Alternative Number (Optional)
              </label>
              <div className="flex items-center gap-2 border-[1px] rounded-[27px] px-4 border-[#363636] h-[48px] lg:h-[60px] bg-white shadow-sm">
                <BsPerson className="text-[#003087]" />
                <PhoneInput
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry="NG"
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  className="w-full h-full PhoneInputContainer"
                  placeholder="Enter alternative number"
                />
              </div>
              {phoneStatus && (
                <p className={`text-xs ${statusColor(phoneStatus)}`}>
                  {statusMessage(phoneStatus)}
                </p>
              )}
            </div>

            {/* Location Input */}
            <div className="max-lg:w-full flex flex-col gap-2">
              <label className="text-[#003087] text-sm font-medium">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="border-[1px] rounded-[27px] px-8 border-[#363636] flex items-center gap-2 lg:h-[60px] h-[48px] bg-white shadow-sm">
                <IoLocationOutline className="text-[#003087]" />
                <input
                  type="text"
                  required
                  placeholder="e.g., Lagos, Nigeria"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-full border-none focus:outline-none text-[#003087] placeholder-[#6A7368]/70 text-[14px]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              className={`md:mt-6 mt-16 w-full text-[#FEFEFF] bg-[#003087] hover:bg-[#003087] shadow-lg rounded-[27px] px-8 flex justify-center items-center lg:h-[60px] h-[48px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-t-[#FEFEFF] border-[#043D12] rounded-full animate-spin"></div>
                  <span className="ml-2">Submitting...</span>
                </div>
              ) : (
                "Create Profile"
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile2;
