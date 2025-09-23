import React, { useState, useEffect } from "react";
import { ImNotification } from "react-icons/im";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import EditHeader from "./EditHeader";

const Subscription = () => {
  const [subscriptionData, setSubscriptionData] = useState({
    planName: "No Active Plan",
    price: "0.00",
    nextBillingDate: "Not Subscribed",
    subscriptionStatus: "inactive",
  });
  const [loading, setLoading] = useState(true);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error("No authentication token found!");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/member/my-profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );

        if (response.data?.success && response.data?.data?.member) {
          const { member } = response.data.data;
          const subscription = member.subscription || {};

          setSubscriptionData({
            planName: subscription.name || "No Active Plan",
            price: subscription.price
              ? `₦${parseFloat(subscription.price).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "0.00",
            nextBillingDate: member.subscriptionEndDate
              ? new Date(member.subscriptionEndDate).toLocaleDateString(
                  "en-US",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                )
              : "Not Subscribed",
            subscriptionStatus: member.subscriptionStatus || "inactive",
          });

          // Show modal if subscription is inactive
          if (member.subscriptionStatus === "inactive") {
            setShowModal(true);
          }
        }
      } catch (error) {
        console.error(
          "Error fetching profile:",
          error.response?.data || error.message
        );
        toast.error(
          error.response?.data?.message || "Failed to fetch subscription data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleSubscribe = () => {
    if (subscribeLoading) return;
    setSubscribeLoading(true);
    console.log("Navigating to /subscribe from UserDashboard");
    toast.info("Redirecting to subscription plans...");
    setTimeout(() => {
      navigate("/subscribe?fromUserDashboard=true");
      setSubscribeLoading(false);
      setShowModal(false); // Close modal on subscribe
    }, 500);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const Loader = () => (
    <div className="flex space-x-2 items-center">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 bg-[#003087] rounded-full animate-bounce"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full text-[#003087] flex flex-col gap-10 relative">
      <EditHeader />
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="container px-[5vw] mx-auto">
        <h2 className="text-[16px] text-[#003087] font-medium border-b-[1px] border-[#6A7368] px-2 py-1 w-fit">
          Manage Subscription
        </h2>

        <div className="subscription-board mt-6">
          <div className="bg-[#043D121A] flex items-center px-8 h-[30vh]">
            <div>
              <p className="text-[#003087] text-[20px]">Your Current Plan</p>
              <p className="text-[18px] font-semibold text-[#003087] mt-2">
                {subscriptionData.planName} - {subscriptionData.price}
              </p>
              <p className="text-[#003087] text-[16px] mt-2">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    subscriptionData.subscriptionStatus === "active"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {subscriptionData.subscriptionStatus.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          <div className="w-full bg-[#003087] grid md:grid-cols-2 px-8 py-8 text-[#FEFEFF] max-lg:gap-6">
            <ul className="list-disc pl-5">
              <li>Access to all services</li>
              <li>Unlimited usage</li>
              <li>Cancel Anytime</li>
            </ul>

            <div className="w-full flex items-center justify-center">
              <button className="max-lg:w-full flex items-center max-lg:justify-center text-[14px] text-[#FEFEFF] rounded-[11px] shadow px-2 sm:px-4 py-4 gap-2 bg-[#6A736899]">
                <ImNotification className="text-[20px]" />
                Next billing date: {subscriptionData.nextBillingDate}
              </button>
            </div>
          </div>
        </div>

        {subscriptionData.subscriptionStatus === "inactive" && (
          <div className="flex justify-start pt-6 pb-12">
            <motion.button
              onClick={handleSubscribe}
              disabled={subscribeLoading}
              className={`flex items-center justify-center text-[15px] px-8 py-3 rounded-[11px] shadow-lg transition-all duration-300 ${
                subscribeLoading
                  ? "bg-[#003087]/50 text-[#FEFEFF]/50 cursor-not-allowed"
                  : "bg-[#003087] text-[#FEFEFF] hover:bg-[#003087]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {subscribeLoading ? (
                <div className="flex space-x-2 items-center">
                  <div className="w-4 h-4 border-2 border-[#FEFEFF] border-t-transparent rounded-full animate-spin" />
                  <span>Redirecting...</span>
                </div>
              ) : (
                "Subscribe Now"
              )}
            </motion.button>
          </div>
        )}
      </div>

      {/* Subscription Modal for Inactive Users */}
      <AnimatePresence>
        {showModal && subscriptionData.subscriptionStatus === "inactive" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCloseModal}
                className="absolute z-50 top-4 right-4 text-gray-600 hover:text-[#003087] text-xl bg-white/80 rounded-full p-2 shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.button>
              <div className="p-6 md:p-8 bg-gradient-to-b from-[#FEFEFF] to-[#E8EFE5] text-center">
                <Player
                  autoplay
                  loop
                  src="https://lottie.host/7fd33a4f-2e59-4f34-ba0c-4af37814586e/Cq1qkcf16G.lottie"
                  style={{ height: "120px", width: "120px", margin: "0 auto" }}
                />
                <h2 className="text-2xl font-bold text-[#003087] mt-4">
                  Unlock Your Business Potential
                </h2>
                <p className="text-sm text-gray-600 mt-3 max-w-md mx-auto">
                  Without an active subscription, your products and business
                  are:
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1 text-left max-w-xs mx-auto">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span>
                      Not visible or discoverable in the global market
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span>
                      Inaccessible to potential customers outside your dashboard
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span>Unable to share your business profile publicly</span>
                  </li>
                </ul>
                <p className="text-sm text-gray-600 mt-4">
                  Subscribe now to showcase your business to the world and
                  connect with new customers!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <motion.button
                    onClick={handleSubscribe}
                    disabled={subscribeLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-1 bg-[#003087] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#002f87d5] transition-colors shadow-md ${
                      subscribeLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {subscribeLoading ? (
                      <div className="flex space-x-2 items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Redirecting...</span>
                      </div>
                    ) : (
                      "Subscribe Now"
                    )}
                  </motion.button>
                  <motion.button
                    onClick={handleCloseModal}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-white text-[#003087] px-6 py-3 rounded-full text-sm font-semibold border border-[#043D12] hover:bg-gray-100 transition-colors shadow-md"
                  >
                    Maybe Later
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Subscription;
