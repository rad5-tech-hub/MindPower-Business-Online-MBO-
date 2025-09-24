import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { FlutterWaveButton, closePaymentModal } from "flutterwave-react-v3";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Good from "../components/svgs/Good";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import MboLogo from "../../src/assets/mindpower-logo.svg";
import bgImage from "../../src/assets/verifybg.jpeg";
import {
  CheckCircleIcon,
  RocketLaunchIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { login } from "../redux/authSlice";
import { IoArrowBackCircle } from "react-icons/io5";
import { Link } from "react-router-dom";

const formatPrice = (price) => {
  if (!price) return "N/A";
  return Number(price)
    .toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    .replace("NGN", "");
};

const PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
const MAIN_URL = import.meta.env.VITE_BASE_URL_MAIN;
const SUBACCOUNT_ID = "RS_3B38D8439E07F7FACC77DEDC01FACE59";

const IntroModal = ({
  onClose,
  onProceed,
  subscriptions,
  isFirstVisit = true,
  subscriptionStatus,
}) => {
  const navigate = useNavigate();
  const hasMultiple = subscriptions.length > 1;
  const dynamicPrice = subscriptions[0]?.price
    ? formatPrice(subscriptions[0].price)
    : "15,000";

  console.log("IntroModal rendered:", {
    isFirstVisit,
    subscriptionStatus,
    subscriptions,
    isFirstVisitType: typeof isFirstVisit,
  });

  console.log("IntroModal content selected:", {
    isFirstVisit,
    willRenderFirstContent: isFirstVisit,
    willRenderSecondContent: !isFirstVisit && subscriptionStatus !== "active",
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4">
      <motion.div
        className="bg-[#FEFEFF] rounded-[20px] p-6 sm:p-8 w-full max-w-[90vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto text-center shadow-xl border border-[#E8F5E9]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          className="flex justify-center mb-4 sm:mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        >
          <img
            src={MboLogo}
            alt="MindPower Logo"
            className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 animate-pulse-subtle"
          />
        </motion.div>

        {isFirstVisit ? (
          <>
            <h2 className="text-[20px] sm:text-[24px] md:text-[28px] font-serif font-bold text-[#003087] mb-2 tracking-tight text-center">
              MindPower Business Online
            </h2>
            <p className="text-[#003087] text-[13px] sm:text-[15px] font-medium mb-3 sm:mb-4 italic text-center">
              {hasMultiple
                ? "Choose the right plan for your business"
                : "Elevate your business with MBO"}
            </p>
            <p className="text-[#003087] text-[12px] sm:text-[14px] mb-4 sm:mb-6 leading-relaxed text-center">
              {hasMultiple
                ? "Select from our subscription plans to unlock visibility, networking, and growth opportunities."
                : "Join the MindPower Business Network with an annual subscription to unlock all benefits."}
            </p>
            <div className="mb-6">
              <h3 className="text-[#003087] text-[14px] sm:text-[16px] font-semibold tracking-wide mb-3 text-center">
                {hasMultiple ? "Available Plans:" : "Subscription Plan:"}
              </h3>
              <div
                className={`space-y-4 ${
                  hasMultiple ? "" : "max-w-[500px] mx-auto"
                }`}
              >
                {subscriptions.length > 0 ? (
                  subscriptions.map((subscription) => (
                    <motion.div
                      key={subscription.id}
                      className={`bg-white p-4 rounded-lg border border-[#E8F5E9] shadow-sm hover:shadow-md transition-all ${
                        hasMultiple ? "" : "w-full"
                      }`}
                      whileHover={{ scale: hasMultiple ? 1.02 : 1 }}
                    >
                      <div className="flex justify-center items-center">
                        <div className="text-center">
                          <h4 className="text-[#003087] font-bold text-[16px] sm:text-[18px]">
                            {subscription.name || "Business Plan"}
                          </h4>
                          <div className="flex items-center mt-1">
                            <span className="text-[#003087] font-bold text-[20px] sm:text-[24px] ml-1">
                              {formatPrice(subscription.price)}
                            </span>
                            <span className="text-[#003087] text-[12px] ml-2">
                              /year
                            </span>
                          </div>
                        </div>
                        {hasMultiple && (
                          <div className="bg-[#003087]/10 text-[#003087] text-[10px] sm:text-[12px] px-2 py-1 rounded-full text-center">
                            {subscription.duration || "12 months"}
                          </div>
                        )}
                      </div>
                      {subscription.description && (
                        <p className="text-[#003087] text-[12px] sm:text-[13px] mt-2 text-center">
                          {subscription.description}
                        </p>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-[#003087] text-[12px] sm:text-[14px] py-PAD text-center">
                    No plans available at the moment. Please try again later.
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4 mb-6 flex flex-col items-center">
              <h3 className="text-[#003087] text-[14px] sm:text-[16px] font-semibold tracking-wide text-center">
                All Plans Include:
              </h3>
              <div className="flex flex-col items-center gap-2 max-w-[500px] w-full">
                <div className="flex items-start gap-2 w-full justify-center">
                  <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 text-[#003087] mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-[#003087] text-[12px] sm:text-[14px]">
                      <strong>Business Profile</strong>
                    </p>
                    <ul className="text-[#003087] text-[11px] sm:text-[13px] list-disc ml-4">
                      <li>Maintain an active business presence</li>
                      <li>Be discoverable within our network</li>
                      <li>Collaborate with fellow entrepreneurs</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-2 w-full justify-center">
                  <RocketLaunchIcon className="w-4 sm:w-5 h-4 sm:h-5 text-[#003087] mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-[#003087] text-[12px] sm:text-[14px]">
                      <strong>Promotion & Visibility</strong>
                    </p>
                    <ul className="text-[#003087] text-[11px] sm:text-[13px] list-disc ml-4">
                      <li>Amplify your business reach</li>
                      <li>Feature in premium listings</li>
                      <li>Attract more customers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : subscriptionStatus !== "active" ? (
          <>
            <h2 className="text-[20px] sm:text-[24px] md:text-[28px] font-serif font-bold text-[#003087] mb-2 tracking-tight text-center">
              Boost Your Business on MBO!
            </h2>
            <p className="text-[#003087] text-[13px] sm:text-[15px] font-medium mb-3 sm:mb-4 italic text-center">
              Your business is live on MBO — customers can now find you!
            </p>
            <p className="text-[#003087] text-[12px] sm:text-[14px] mb-2 leading-relaxed text-center">
              Want more visibility, more trust, and more sales?
            </p>
            <p className="text-[#003087] text-[12px] sm:text-[14px] mb-4 sm:mb-6 leading-relaxed text-center">
              Upgrade your profile for just <strong>{dynamicPrice}/year</strong>{" "}
              and enjoy:
            </p>
            <ul className="text-[#003087] text-[12px] sm:text-[14px] mb-4 sm:mb-6 text-left max-w-[400px] mx-auto space-y-3">
              <li className="flex items-center gap-2">
                <StarIcon className="w-4 sm:w-5 h-4 sm:h-5 text-[#003087] flex-shrink-0" />
                <span>Full product exposure to reach more customers</span>
              </li>
              <li className="flex items-center gap-2">
                <RocketLaunchIcon className="w-4 sm:w-5 h-4 sm:h-5 text-[#003087] flex-shrink-0" />
                <span>Priority listing on product page</span>
              </li>
              <li className="flex items-center gap-2">
                <RocketLaunchIcon className="w-4 sm:w-5 h-4 sm:h-5 text-[#003087] flex-shrink-0" />
                <span>Verified badge to build instant trust</span>
              </li>
              <li className="flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-4 sm:w-5 h-4 sm:h-5 text-[#003087] flex-shrink-0" />
                <span>Direct WhatsApp contact for buyers</span>
              </li>
            </ul>
            <p className="text-[#003087] text-[12px] sm:text-[14px] mb-4 sm:mb-6 leading-relaxed text-center">
              Take your business to the next level — upgrade now!
            </p>
          </>
        ) : null}

        {(isFirstVisit || subscriptionStatus !== "active") && (
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
            <motion.button
              onClick={onClose}
              className="bg-transparent border-2 border-[#043D12] text-[#003087] rounded-[48px] px-5 sm:px-6 py-2 sm:py-2.5 font-medium text-[13px] sm:text-[14px] hover:bg-[#003087]/10 transition-all duration-300 w-full sm:w-auto cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isFirstVisit ? "Continue without Payment" : "Back to Dashboard"}
            </motion.button>
            <motion.button
              onClick={onProceed}
              className="bg-[#003087] text-[#FEFEFF] rounded-[48px] px-5 sm:px-6 py-2 sm:py-2.5 font-medium text-[13px] sm:text-[14px] shadow-md hover:bg-[#003087] transition-all duration-300 w-full sm:w-auto cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isFirstVisit
                ? hasMultiple
                  ? "View Plans"
                  : "Subscribe Now"
                : "Upgrade Now"}
            </motion.button>
          </div>
        )}

        <p className="text-[#003087] text-[10px] sm:text-[12px] mt-4 sm:mt-6 italic text-center">
          {isFirstVisit
            ? "Grow your network and elevate your business with MBO."
            : "Join thousands of businesses thriving on MBO."}
        </p>
      </motion.div>
    </div>
  );
};

const SuccessModal = ({ onCloseAndNavigate, userName }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 px-4">
      <motion.div
        className="bg-[#FEFEFF] rounded-[20px] p-6 sm:p-8 w-full max-w-[90vw] sm:max-w-[600px] md:max-w-[700px] max-h-[90vh] overflow-y-auto text-center shadow-xl border border-[#E8F5E9]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          className="flex justify-center mb-4 sm:mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        >
          <div className="w-20 h-20 bg-[#003087]/10 rounded-full flex items-center justify-center">
            <CheckCircleIcon className="w-12 h-12 text-[#003087]" />
          </div>
        </motion.div>

        <h2 className="text-[20px] sm:text-[24px] md:text-[28px] font-serif font-bold text-[#003087] mb-2 tracking-tight text-center">
          Welcome Aboard, {userName}!
        </h2>

        <p className="text-[#003087] text-[13px] sm:text-[15px] font-medium mb-3 sm:mb-4 italic text-center">
          Your MBO subscription is live!
        </p>

        <p className="text-[#003087] text-[12px] sm:text-[14px] mb-4 sm:mb-6 leading-relaxed text-center">
          You’re now part of the MindPower Business Network. Complete your
          profile to maximize your impact:
        </p>

        <div className="text-left space-y-3 sm:space-y-4 mb-6 max-w-[400px] mx-auto">
          <div className="flex items-start gap-2">
            <UserCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 text-[#003087] mt-0.5 flex-shrink-0" />
            <p className="text-[#003087] text-[12px] sm:text-[14px]">
              <strong>Build your profile</strong> to showcase your brand
            </p>
          </div>
          <div className="flex items-start gap-2">
            <MagnifyingGlassIcon className="w-4 sm:w-5 h-4 sm:h-5 text-[#003087] mt-0.5 flex-shrink-0" />
            <p className="text-[#003087] text-[12px] sm:text-[14px]">
              <strong>Get discovered</strong> by customers and partners
            </p>
          </div>
          <div className="flex items-start gap-2">
            <UsersIcon className="w-4 sm:w-5 h-4 sm:h-5 text-[#003087] mt-0.5 flex-shrink-0" />
            <p className="text-[#003087] text-[12px] sm:text-[14px]">
              <strong>Network with members</strong> in the MBO community
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
          <motion.button
            onClick={() => {
              console.log("Complete My Profile clicked"); // Debug log
              navigate("/business-profile", {
                state: { subscriptionSuccess: true },
              });
            }}
            className="bg-[#003087] text-[#FEFEFF] rounded-[12px] px-5 sm:px-6 py-2 sm:py-2.5 font-medium text-[13px] sm:text-[14px] shadow-md hover:bg-[#003087] transition-all duration-300 w-full sm:w-auto cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Complete My Profile
          </motion.button>
          <motion.button
            onClick={() => {
              console.log("Go to Dashboard clicked"); // Debug log
              onCloseAndNavigate();
            }}
            className="bg-transparent border-2 border-[#043D12] text-[#003087] rounded-[12px] px-5 sm:px-6 py-2 sm:py-2.5 font-medium text-[13px] sm:text-[14px] hover:bg-[#003087]/10 transition-all duration-300 w-full sm:w-auto cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go to Dashboard
          </motion.button>
        </div>

        <p className="text-[#003087] text-[10px] sm:text-[12px] mt-4 sm:mt-6 italic text-center">
          Set up your profile in minutes and start growing!
        </p>
      </motion.div>
    </div>
  );
};

const Subscribe = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const fromUserDashboard = params.get("fromUserDashboard") === "true";
  const fromBusinessProfile2 =
    params.get("fromBusinessProfile2") === "true" ||
    location.state?.fromBusinessProfile2 ||
    false;
  const dispatch = useDispatch();
  const [subscriptions, setSubscriptions] = useState([]);
  const [userId, setUserId] = useState(null);
  const [txRefs, setTxRefs] = useState({});
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isPaymentLoading, setIsPaymentLoading] = useState({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const [initializingPayments, setInitializingPayments] = useState(false);
  const [isFirstVisitResolved, setIsFirstVisitResolved] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const subscriptionStatus = user?.subscriptionStatus || "inactive";

  // Log location state and query params for debugging
  console.log("Location state and query params:", {
    state: location.state,
    fromBusinessProfile2,
    fromUserDashboard,
    search: location.search,
  });

  // Initialize user and determine isFirstVisit
  useEffect(() => {
    if (!token) {
      console.log("No token found, redirecting to login");
      toast.error("User not authenticated. Please log in.");
      navigate("/login");
      return;
    }

    const initializeUser = async () => {
      try {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.id);
        console.log("Initializing user with:", {
          token,
          userId: decodedToken.id,
          subscriptionStatus,
          fromUserDashboard,
          fromBusinessProfile2,
        });

        // Fetch user data if not in Redux store
        if (!user) {
          console.log("User data missing, fetching profile...");
          const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/member/my-profile`,
            {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000,
            }
          );

          if (response.data?.success && response.data?.data?.member) {
            const fetchedUser = response.data.data.member;
            dispatch(
              login({
                token,
                user: {
                  firstName: fetchedUser.firstName,
                  lastName: fetchedUser.lastName,
                  email: fetchedUser.email,
                  subscriptionStatus: fetchedUser.subscriptionStatus,
                  role: fetchedUser.role,
                },
              })
            );
          } else {
            throw new Error("Failed to fetch user data");
          }
        }

        // Check localStorage
        const hasCompletedIntro = localStorage.getItem(
          "hasCompletedIntroModal"
        );
        const hasHandledFirstVisit = localStorage.getItem(
          "hasHandledFirstVisit"
        );

        console.log("LocalStorage values before evaluation:", {
          hasCompletedIntro,
          hasHandledFirstVisit,
          fromUserDashboard,
          fromBusinessProfile2,
        });

        let firstVisit = true;
        if (fromBusinessProfile2) {
          console.log(
            "Navigation from BusinessProfile2, forcing isFirstVisit: true and clearing localStorage"
          );
          localStorage.removeItem("hasCompletedIntroModal");
          localStorage.removeItem("hasHandledFirstVisit");
          firstVisit = true;
          localStorage.setItem("hasHandledFirstVisit", "true");
        } else if (fromUserDashboard && !hasHandledFirstVisit) {
          console.log(
            "Initial visit from UserDashboard, setting isFirstVisit: true"
          );
          firstVisit = true;
          localStorage.setItem("hasHandledFirstVisit", "true");
        } else if (!hasCompletedIntro && !hasHandledFirstVisit) {
          console.log("First organic visit, setting isFirstVisit: true");
          firstVisit = true;
          localStorage.setItem("hasHandledFirstVisit", "true");
        } else {
          console.log("Not first visit, setting isFirstVisit: false");
          firstVisit = false;
        }

        // Log localStorage after modifications
        console.log("LocalStorage values after evaluation:", {
          hasCompletedIntroModal: localStorage.getItem(
            "hasCompletedIntroModal"
          ),
          hasHandledFirstVisit: localStorage.getItem("hasHandledFirstVisit"),
        });

        setIsFirstVisit(firstVisit);
        setIsFirstVisitResolved(true);
        setIsLoadingUser(false);

        console.log("isFirstVisit finalized:", {
          isFirstVisit: firstVisit,
          isFirstVisitResolved: true,
        });
      } catch (error) {
        console.error("Error initializing user:", error);
        toast.error("Session expired or invalid token. Please log in again.");
        navigate("/login");
      }
    };

    initializeUser();
  }, [
    token,
    user,
    navigate,
    fromUserDashboard,
    fromBusinessProfile2,
    dispatch,
  ]);

  // Determine if intro modal should be shown
  useEffect(() => {
    if (!isLoadingUser && userId && isFirstVisitResolved) {
      console.log("Evaluating showIntroModal", {
        isFirstVisit,
        subscriptionStatus,
        fromUserDashboard,
        fromBusinessProfile2,
        isFirstVisitResolved,
      });

      const showModal =
        isFirstVisit || (subscriptionStatus !== "active" && !isFirstVisit);

      setShowIntroModal(showModal);
      console.log("showIntroModal set:", showModal, {
        isFirstVisit,
        subscriptionStatus,
      });
    }
  }, [
    isLoadingUser,
    userId,
    isFirstVisit,
    subscriptionStatus,
    isFirstVisitResolved,
    fromBusinessProfile2,
  ]);

  // Fetch subscriptions with retry logic
  useEffect(() => {
    const fetchSubscriptions = async (retries = 3, delay = 1000) => {
      setIsLoadingSubscriptions(true);
      const fallbackSubscriptions = [
        {
          id: "1",
          name: "Business Plan",
          price: 15000,
          duration: "12 months",
        },
      ];

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`Fetching subscriptions, attempt ${attempt}`);
          const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/admin/get-sub`,
            {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000,
            }
          );
          console.log("Subscription fetch response:", response.data);
          if (response.data && Array.isArray(response.data.data)) {
            const fetchedSubscriptions = response.data.data;
            console.log("Fetched subscriptions:", fetchedSubscriptions);
            if (fetchedSubscriptions.length === 0) {
              console.warn("No subscriptions returned, using fallback");
              setSubscriptions(fallbackSubscriptions);
              setIsLoadingSubscriptions(false);
              return;
            } else {
              setSubscriptions(fetchedSubscriptions);
              initializePayments(fetchedSubscriptions);
            }
            setIsLoadingSubscriptions(false);
            return;
          } else {
            console.warn("Invalid subscription data:", response.data);
            toast.warn("Invalid subscription data received, using fallback.");
            setSubscriptions(fallbackSubscriptions);
            setIsLoadingSubscriptions(false);
            return;
          }
        } catch (error) {
          console.error(
            `Error fetching subscriptions (attempt ${attempt}):`,
            error.response?.data || error.message
          );
          if (attempt === retries) {
            toast.error("Failed to load subscriptions. Using default plan.");
            setSubscriptions(fallbackSubscriptions);
            setIsLoadingSubscriptions(false);
            return;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      setIsLoadingSubscriptions(false);
    };

    if (!isLoadingUser && userId) {
      fetchSubscriptions();
    }
  }, [isLoadingUser, userId, token]);

  // Initialize payments
  const initializePayments = async (subs) => {
    if (!user || !userId) {
      console.warn("Cannot initialize payments: missing user or userId");
      return;
    }

    setInitializingPayments(true);
    try {
      const newTxRefs = {};
      for (const subscription of subs) {
        if (!subscription.id) {
          console.warn(`Skipping subscription with missing id:`, subscription);
          continue;
        }
        console.log(`Initializing payment for subscription ${subscription.id}`);
        console.log("Payment initialization payload:", {
          userId,
          planId: subscription.id,
        });
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/admin/initialize-payment`,
            { userId, planId: subscription.id },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              timeout: 10000,
            }
          );
          console.log("Payment initialization response:", response.data);
          if (
            response.data.success &&
            response.data.transaction?.transactionId
          ) {
            newTxRefs[subscription.id] =
              response.data.transaction.transactionId;
          } else {
            console.warn(
              `No transactionId for subscription ${subscription.id}`,
              response.data
            );
          }
        } catch (error) {
          console.error(
            `Failed to initialize payment for subscription ${subscription.id}:`,
            error.response?.data || error.message
          );
        }
      }
      console.log("Setting txRefs:", newTxRefs);
      setTxRefs(newTxRefs);
      if (Object.keys(newTxRefs).length === 0) {
        toast.warn("No valid payment transactions initialized.");
      }
    } catch (error) {
      console.error("Error initializing payments:", error, {
        response: error.response,
        request: error.request,
        message: error.message,
      });
      toast.error(
        error.response?.data?.message ||
          "Payment initialization failed. Please try again."
      );
    } finally {
      setInitializingPayments(false);
    }
  };

  // Payment handlers
  const handlePaymentCallback = async (paymentResponse, subscriptionId) => {
    setIsPaymentLoading((prev) => ({ ...prev, [subscriptionId]: false }));
    setGlobalLoading(false);
    console.log("Payment callback:", paymentResponse);
    if (
      paymentResponse.status === "completed" ||
      paymentResponse.status === "successful"
    ) {
      dispatch(
        login({
          token,
          user: {
            ...user,
            subscriptionStatus: "active",
          },
        })
      );
      setShowSuccessModal(true);
    } else {
      toast.error("Payment failed. Please try again.");
    }
    closePaymentModal();
  };

  const handlePaymentClick = (subscriptionId) => {
    console.log("Payment clicked for subscription:", subscriptionId);
    setIsPaymentLoading((prev) => ({ ...prev, [subscriptionId]: true }));
    setGlobalLoading(true);
  };

  const handlePaymentClose = (subscriptionId) => {
    setIsPaymentLoading((prev) => ({ ...prev, [subscriptionId]: false }));
    setGlobalLoading(false);
    console.log("Payment closed for subscription:", subscriptionId);
  };

  const getFlutterwaveConfig = (subscription, txRef, user) => {
    const config = {
      public_key: PUBLIC_KEY,
      tx_ref: txRef,
      amount: subscription.price || 0,
      currency: "NGN",
      redirect_url: `${MAIN_URL}/user-dashboard/profile`,
      payment_options: "banktransfer, card, ussd",
      customer: {
        email: user.email || "guest@example.com",
        name: `${user.firstName || "Guest"} ${user.lastName || ""}`,
      },
      customizations: {
        title: "MBO Subscription",
        description: `Payment for ${subscription.name || "Subscription"}`,
        logo: "/mbo-logo.png",
      },
      subaccounts: [
        {
          id: SUBACCOUNT_ID,
        },
      ],
    };
    console.log("Flutterwave config:", config);
    return config;
  };

  // Handle IntroModal close and proceed actions
  const handleIntroModalClose = () => {
    console.log("Closing IntroModal, marking as completed", {
      isFirstVisit,
      subscriptionStatus,
    });
    localStorage.setItem("hasCompletedIntroModal", "true");
    setIsFirstVisit(false);
    setShowIntroModal(false);
    navigate("/user-dashboard/profile");
  };

  const handleIntroModalProceed = () => {
    console.log("Proceeding from IntroModal, marking as completed", {
      isFirstVisit,
      subscriptionStatus,
    });
    localStorage.setItem("hasCompletedIntroModal", "true");
    setIsFirstVisit(false);
    setShowIntroModal(false);
  };

  // Handle SuccessModal close and navigate
  const handleSuccessModalCloseAndNavigate = () => {
    console.log("handleSuccessModalCloseAndNavigate called");
    setShowSuccessModal(false);
    navigate("/user-dashboard/profile");
  };

  // Debug render state
  console.log("Subscribe render:", {
    showIntroModal,
    isFirstVisit,
    subscriptionStatus,
    subscriptions,
    isLoadingSubscriptions,
    txRefs,
    fromUserDashboard,
    fromBusinessProfile2,
    user,
    token,
    hasCompletedIntroModal: localStorage.getItem("hasCompletedIntroModal"),
    hasHandledFirstVisit: localStorage.getItem("hasHandledFirstVisit"),
    isFirstVisitResolved,
  });

  if (isLoadingUser || !isFirstVisitResolved) {
    return (
      <div className="text-white text-center py-16">Loading user data...</div>
    );
  }

  if (!user || !userId) {
    console.warn("User or userId missing, redirecting to login");
    toast.error("Authentication required. Redirecting to login...");
    navigate("/login");
    return <div className="text-white text-center py-16">Redirecting...</div>;
  }

  return (
    <div
      className="w-full min-h-screen flex flex-col justify-center items-center py-16 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${bgImage})`,
      }}
    >
      <style>
        {`
          .modern-loader {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            position: relative;
            z-index: 1000;
          }
          .modern-loader::before {
            content: '';
            width: 24px;
            height: 24px;
            border: 3px solid #FFFDF2;
            border-top: 3px solid #043D12;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          .modern-loader::after {
            content: '';
            position: absolute;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(4, 61, 18, 0.2) 0%, transparent 70%);
            animation: pulse 1.5s ease-in-out infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 0.2; }
            100% { transform: scale(1); opacity: 0.5; }
          }
        `}
      </style>

      {globalLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[1000]">
          <div className="modern-loader" />
        </div>
      )}

      {showIntroModal && (
        <IntroModal
          onClose={handleIntroModalClose}
          onProceed={handleIntroModalProceed}
          subscriptions={subscriptions}
          isFirstVisit={isFirstVisit}
          subscriptionStatus={subscriptionStatus}
        />
      )}

      {!showIntroModal && (
        <div className="container mx-auto px-[5vw] flex flex-col items-center gap-8">
          <motion.h1
            className="text-[#FEFEFF] lg:text-[36px] text-[24px] w-[90%] md:w-[60%] mx-auto text-center font-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {subscriptions.length > 1
              ? "Choose Your Subscription Plan"
              : "MindPower Business Online Subscription"}
          </motion.h1>

          <div
            className={`w-full flex ${
              subscriptions.length > 1
                ? "justify-start md:justify-center"
                : "justify-center"
            }`}
          >
            <div
              className={`
                ${
                  subscriptions.length > 1 ? "w-[90%]" : "w-full max-w-[700px]"
                } 
                overflow-x-auto whitespace-nowrap flex gap-6 py-4 items-center
                ${
                  subscriptions.length > 1
                    ? "justify-start md:justify-center"
                    : "justify-center"
                }
              `}
            >
              {isLoadingSubscriptions ? (
                <p className="text-[#FEFEFF] text-center">
                  Loading subscriptions...
                </p>
              ) : subscriptions.length > 0 ? (
                subscriptions.map((subscription) => (
                  <motion.div
                    key={subscription.id}
                    className={`
                      ${
                        subscriptions.length > 1
                          ? "min-w-[280px] md:min-w-[320px]"
                          : "w-full"
                      }
                      px-8 py-8 bg-[#FEFEFF]/90 shadow-lg rounded-[16px] flex relative 
                      ${
                        subscriptions.length > 1
                          ? "flex-col"
                          : "flex-row max-lg:flex-col"
                      } 
                      gap-6 transition-all duration-300 hover:shadow-xl
                    `}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Link
                      to="/user-dashboard"
                      className="lg:text-[50px] text-[32px] font-bold text-[#363636] absolute top-4 left-4"
                    >
                      <IoArrowBackCircle className="text-[#003087] text-[40px]" />
                    </Link>
                    <div
                      className={`amount w-full flex flex-col items-center ${
                        subscriptions.length > 1 ? "" : "lg:pt-8"
                      }`}
                    >
                      <h1 className="lg:text-[48px] text-[40px] text-[#003087] flex items-center gap-0 font-bold">
                        {formatPrice(subscription.price)}
                      </h1>
                      <span className="lg:text-[20px] strict text-[16px] text-[#003087]">
                        YEARLY
                      </span>
                    </div>
                    <div className="w-full flex flex-col gap-4 items-center mt-4">
                      <ul className="w-fit flex flex-col gap-3">
                        <li className="flex items-center gap-3">
                          <Good />
                          <span className="md:text-[18px] text-[14px] text-[#676767]">
                            Active Business Profile
                          </span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Good />
                          <span className="md:text-[18px] text-[14px] text-[#676767]">
                            Boosted Visibility
                          </span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Good />
                          <span className="md:text-[18px] text-[14px] text-[#676767]">
                            Affordable and Flexible
                          </span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Good />
                          <span className="md:text-[18px] text-[14px] text-[#676767]">
                            Networking Opportunities
                          </span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Good />
                          <span className="md:text-[18px] text-[14px] text-[#676767]">
                            Enhanced Credibility
                          </span>
                        </li>
                      </ul>
                      <motion.div
                        className="shadow-lg mt-6 register px-6 md:px-12 md:py-4 py-3 bg-[#003087] rounded-[12px] text-[#FEFEFF] flex flex-col gap-2 w-full max-w-[280px] cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {initializingPayments ? (
                          <p className="text-[#FEFEFF] text-[16px] text-center">
                            Preparing payment...
                          </p>
                        ) : isPaymentLoading[subscription.id] ? (
                          <div className="modern-loader" />
                        ) : txRefs[subscription.id] ? (
                          <>
                            {console.log(
                              `Rendering FlutterWaveButton for subscription ${
                                subscription.id
                              }, txRef: ${txRefs[subscription.id]}`
                            )}
                            <FlutterWaveButton
                              {...getFlutterwaveConfig(
                                subscription,
                                txRefs[subscription.id],
                                user
                              )}
                              callback={(response) =>
                                handlePaymentCallback(response, subscription.id)
                              }
                              onClose={() =>
                                handlePaymentClose(subscription.id)
                              }
                              onClick={() =>
                                handlePaymentClick(subscription.id)
                              }
                              text="Pay Now"
                              className="cursor-pointer text-[16px] font-medium"
                            />
                          </>
                        ) : (
                          <p className="text-[#FEFEFF] text-[16px] text-center">
                            Payment unavailable
                          </p>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-[#FEFEFF] text-center">
                  No subscriptions available. Please try again later.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <SuccessModal
          onCloseAndNavigate={handleSuccessModalCloseAndNavigate}
          userName={`${user.firstName || "User"} ${user.lastName || ""}`}
        />
      )}
    </div>
  );
};

export default Subscribe;
