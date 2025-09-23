import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../redux/authSlice";
import { FaRegEnvelope } from "react-icons/fa";
import { CiLock } from "react-icons/ci";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Hand from "../components/svgs/Hand";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { IoArrowBackCircle } from "react-icons/io5";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const routes = {
    admin: "/admin",
    user: {
      incompleteProfile: "/business-profile",
      inactiveSubscription: "/subscribe?fromUserDashboard=true",
      activeUser: "/user-dashboard",
    },
  };

  // Clear previous session on mount
  useEffect(() => {
    dispatch(logout());
    localStorage.removeItem("token");
  }, [dispatch]);

  // Remember me functionality
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberMeEmail");
    const savedPassword = localStorage.getItem("rememberMePassword");
    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setPassword(savedPassword);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginAttempted(true);

    try {
      
      // Clear previous auth state
      dispatch(logout());
      localStorage.removeItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/member/login`,
        { email, password }
      );
      const { token, member } = response.data;
      const decodedToken = jwtDecode(token);
      const { id, role, subscriptionStatus, profileStatus } = decodedToken;

      const user = {
        id,
        role,
        subscriptionStatus: subscriptionStatus || "inactive",
        profileStatus: profileStatus || false,
        firstName: member.firstname,
        lastName: member.lastname,
        email: member.email,
      };

      localStorage.setItem("token", token);
      dispatch(login({ token, user }));
      toast.success(response.data.message || "Login successful!");

      if (rememberMe) {
        localStorage.setItem("rememberMeEmail", email);
        localStorage.setItem("rememberMePassword", password);
      } else {
        localStorage.removeItem("rememberMeEmail");
        localStorage.removeItem("rememberMePassword");
      }
    } catch (error) {
      dispatch(logout());
      localStorage.removeItem("token");

      const errorResponse = error.response?.data || {};
      if (errorResponse.status === 403) {
        toast.error(
          errorResponse.message || "Access denied. Please verify your email."
        );
      } else if (errorResponse.message) {
        toast.error(errorResponse.message);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
      console.error("Login error:", error.response?.data || error);
      setLoginAttempted(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && loginAttempted) {
      const route =
        user.role === "admin"
          ? routes.admin
          : !user.profileStatus
          ? routes.user.incompleteProfile
          : user.subscriptionStatus !== "active"
          ? routes.user.inactiveSubscription
          : routes.user.activeUser;

      console.log("Navigating after login:", {
        route,
        userRole: user.role,
        profileStatus: user.profileStatus,
        subscriptionStatus: user.subscriptionStatus,
      });

      toast.info("Redirecting to your dashboard...");
      setTimeout(() => {
        navigate(route, { replace: true });
        setLoginAttempted(false);
      }, 3000); // Small delay to allow toast to be visible
    }
  }, [isAuthenticated, user, loginAttempted, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div>
      <ToastContainer />
      <div className="w-full h-screen flex justify-center lg:grid grid-cols-2">
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
        <div className="relative max-lg:w-full flex flex-col items-center lg:justify-center bg-[#FEFEFF] max-md:bg-[url('/bg-login.svg')] bg-cover bg-center">
          <div className="container mx-auto px-[5vw] h-fit max-lg:mt-16">
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
              Log In <Hand />
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
                  placeholder="Email"
                  className="bg-transparent w-full h-full border-none focus:outline-none focus:border-transparent text-[#003087]"
                  required
                />
              </div>
              <div className="max-lg:w-full password border-[1px] rounded-[27px] px-8 border-[#363636] flex items-center gap-2 lg:h-[64px] h-[51px]">
                <CiLock className="text-[#003087]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="bg-transparent w-full h-full border-none focus:outline-none focus:border-transparent text-[#003087]"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-[#003087] ml-4 focus:outline-none"
                >
                  {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                </button>
              </div>
              <div className="max-lg:w-full remember flex items-center justify-between">
                <div className="checkbox flex gap-2 items-center">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="custom-checkbox"
                    id="rememberMe"
                  />
                  <label htmlFor="rememberMe" className="text-[#003087]">
                    Remember me
                  </label>
                </div>
                <Link to="/forgotten-password" className="text-[#003087]">
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="mt-8 w-full text-[#FEFEFF] password bg-[#003087] hover:bg-[#003087]/75 shadow-lg rounded-[27px] px-8 flex justify-center items-center lg:h-[64px] h-[51px]"
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>
              <Link
                to="/create-account"
                className="text-[#003087] text-[16px] text-center"
              >
                Don't have an account?{" "}
                <strong className="hover:text-[17px]">Register</strong>
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
