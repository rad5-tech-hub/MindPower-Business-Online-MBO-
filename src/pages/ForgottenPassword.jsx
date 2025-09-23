import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegEnvelope } from "react-icons/fa";
import Hand from "../components/svgs/Hand";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoArrowBackCircle } from "react-icons/io5";

const ForgottenPassword = () => {
  const [email, setEmail] = useState(""); // Only email state
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/member/forgot-password`, // Use the VITE_ prefixed environment variable
        { email }
      );

      // Toast only the message field (or fallback if missing)
      toast.success(
        response.data.message || "Password reset instructions sent!",
        {
          autoClose: 5000,
        }
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      // Toast only the message field from the error response (or fallback if missing)
      const errorMessage =
        error.response?.data?.message || "Reset request failed. Try again.";
      toast.error(errorMessage, { autoClose: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
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
        className="z-50"
      />
      <div className="w-full h-screen flex justify-center lg:grid grid-cols-2">
        <div className="max-lg:hidden w-full h-full flex justify-center items-center bg-[url('/Group2.svg')] bg-cover bg-center bg-[#003087]">
          <div className="w-full h-[90%] flex flex-col items-center">
            <div className="w-[90%] text-[#FEFEFF] mt-12">
              <Link to="/" className="lg:text-[50px] text-[32px] font-medium">
                Welcome to <br /> MBO
              </Link>
              <p className="text-[18px]">
                It's okay if you've forgotten your password, we've got you fully
                covered.
              </p>
            </div>
          </div>
        </div>
        <div className="relative max-lg:w-full flex flex-col items-center lg:justify-center bg-[#FEFEFF] max-md:bg-[url('/bg-login.svg')] bg-cover bg-center">
          <div className="w-[80%] h-fit max-lg:mt-16">
            <Link
              to="/"
              className="lg:text-[50px] text-[32px] font-bold text-[#363636] absolute top-4 left-4"
            >
              <IoArrowBackCircle className="text-[#003087] text-[40px]" />
            </Link>
            <Link
              to="/"
              className="lg:text-[50px] text-[32px] font-bold text-[#363636]"
            >
              MBO
            </Link>
            <h4 className="lg:text-[32px] text-[20px] font-medium text-[#003087] flex items-center gap-2">
              Forgot Password <Hand />
            </h4>
            <form
              onSubmit={handleSubmit}
              className="max-lg:w-full flex flex-col gap-8 mt-8 max-lg:items-center"
            >
              <div className="max-lg:w-full email border-[1px] rounded-[27px] px-8 border-[#363636] flex items-center gap-2 lg:h-[64px] h-[51px]">
                <FaRegEnvelope className="text-[#003087]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  className="bg-transparent w-full h-full border-none focus:outline-none focus:border-transparent text-[#003087]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="mt-8 w-full text-[#FEFEFF] password bg-[#003087] hover:bg-[#003087]/75 shadow-lg rounded-[27px] px-8 flex justify-center items-center lg:h-[64px] h-[51px]"
              >
                {isLoading ? "Processing..." : "Continue"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgottenPassword;
