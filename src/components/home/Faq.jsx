import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import { FaWhatsapp } from "react-icons/fa";
import FaqIcon from "../../assets/faq.png";
import NetworkError from "../NetworkError";
import { Player } from "@lottiefiles/react-lottie-player";

// Default FAQ items (all 10 restored)
const defaultFaqItems = [
  {
    id: "default-1",
    question: "What is MindPower Business Online (MBO)?",
    answer:
      "MBO is a platform designed for businesses to create online profiles, showcase their products and services, and connect with potential customers and other businesses.",
  },
  {
    id: "default-2",
    question: "Who can register on MBO?",
    answer:
      "Anyone who owns a business can register and create a profile on the MindPower Business Platform",
  },
  {
    id: "default-3",
    question: "What are the subscription fees?",
    answer: [
      "Registration Fee: ₦5,000 per year to maintain an active profile.",
      "Promotion Fee: ₦10,000 per year to boost visibility.",
      "Total: ₦15,000 annually.",
    ],
  },
  {
    id: "default-4",
    question: "How can I make payments?",
    answer:
      "Payments can be made via bank transfer or any online payment method specified during registration.",
  },
  {
    id: "default-5",
    question: "Can I cancel my subscription?",
    answer: "Yes, you can cancel at any time, but fees are non-refundable.",
  },
  {
    id: "default-6",
    question: "What features does MBO offer for my business?",
    answer: [
      "Business profile with contact details.",
      "Product/service gallery.",
      "Social media and WhatsApp integration.",
      "Visitor analytics to track profile performance.",
    ],
  },
  {
    id: "default-7",
    question: "Can I upload videos to my profile?",
    answer:
      "Yes, you can embed YouTube videos to showcase your business visually.",
  },
  {
    id: "default-8",
    question: "Can I process payments directly through MBO?",
    answer:
      "No, payment processing is not available. Customers can contact you via WhatsApp to arrange payments.",
  },
  {
    id: "default-9",
    question: "What happens if I forget my password?",
    answer:
      'Use the "Forgot Password" option to reset it via your registered email.',
  },
  {
    id: "default-10",
    question: "Can I update my business information after registration?",
    answer:
      "Yes, you can edit your profile details anytime from your dashboard.",
  },
];

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [faqItems, setFaqItems] = useState(defaultFaqItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const API_URL = `${import.meta.env.VITE_BASE_URL}/admin/get-faqs`;
        const response = await axios.get(API_URL, { timeout: 10000 });
        console.log("FAQ API Response:", response);
        if (response.data && response.data.faqs) {
          setFaqItems([...defaultFaqItems, ...response.data.faqs]);
        }
      } catch (error) {
        console.error("❌ Error Fetching FAQs:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load additional FAQs. Default FAQs are still available."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const filteredFaqs = faqItems.filter((faq) => {
    const questionMatch = faq.question
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const answerMatch = Array.isArray(faq.answer)
      ? faq.answer.some((item) =>
          item.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return questionMatch || answerMatch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FEFEFF]">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce delay-200"></div>
          <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce delay-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FEFEFF] pb-10">
      <div className="container mx-auto px-[5vw] flex flex-col gap-10">
        <div className="w-full flex flex-col lg:gap-4 gap-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-12">
            {/* FAQ Image Column */}
            <div className="order-1 self-start lg:self-center flex flex-col justify-center items-center gap-8">
              <motion.div
                className="intro max-lg:text-center"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="lg:text-[30px] text-[25px] text-[#003087] font-bold">
                  Frequently Asked Questions
                </h1>
                <p className="md:text-[20px] text-[18px] text-[#003087] mt-2">
                  Find answers to common questions
                </p>
              </motion.div>
              <motion.img
                src={FaqIcon}
                alt="FAQ Illustration"
                className="w-full max-w-[400px]"
                loading="lazy"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>

            {/* FAQ Questions Column */}
            <div className="order-2 lg:h-[500px] lg:overflow-y-auto modern-scrollbar lg:pr-4 lg:py-8">
              {/* Search Bar */}
              <div className="mb-6 w-full bg-[#D6E2D98C] text-[16px] px-4 py-3 rounded-[39px] shadow-lg text-[#003087] flex gap-2 items-center">
                <input
                  type="text"
                  className="h-full outline-0 w-full bg-transparent"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <RiArrowDropDownLine className="text-[20px]" />
              </div>

              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((item, index) => (
                  <motion.figure
                    key={item.id}
                    className="rounded-[26px] my-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div
                      className={`${
                        activeIndex === index
                          ? "bg-[#B5BBB4] rounded-t-[26px]"
                          : "bg-transparent"
                      }`}
                    >
                      <button
                        className={`flex justify-between items-center text-start ${
                          activeIndex === index
                            ? "bg-[#003087] text-white"
                            : "bg-[#B5BBB4] text-[#003087] hover:bg-[#003087] hover:text-white"
                        } rounded-[26px] px-6 py-4 gap-4 w-full md:text-[18px] text-[15px] transition-colors`}
                        onClick={() => handleToggle(index)}
                      >
                        {item.question}
                        {activeIndex === index ? (
                          <RiArrowDropUpLine className="text-[20px] min-w-[20px]" />
                        ) : (
                          <RiArrowDropDownLine className="text-[20px] min-w-[20px]" />
                        )}
                      </button>
                    </div>
                    <motion.figcaption
                      className={`p-6 overflow-hidden ${
                        activeIndex === index
                          ? "block bg-[#B5BBB4] rounded-b-[26px]"
                          : "hidden"
                      }`}
                      initial={{ height: 0 }}
                      animate={{ height: activeIndex === index ? "auto" : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {Array.isArray(item.answer) ? (
                        <ul className="md:text-[17px] text-[15px] text-[#003087] list-disc pl-5">
                          {item.answer.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="md:text-[17px] text-[15px] text-[#003087]">
                          {item.answer}
                        </p>
                      )}
                    </motion.figcaption>
                  </motion.figure>
                ))
              ) : (
                <div className="w-full flex flex-col items-center justify-center gap-8 py-16">
                  <Player
                    autoplay
                    loop
                    src="https://lottie.host/7fd33a4f-2e59-4f34-ba0c-4af37814586e/Cq1qkcf16G.lottie"
                    style={{ height: "200px", width: "200px" }}
                  />
                  <h2 className="text-md font-bold text-[#003087]">
                    No FAQs Found
                  </h2>
                  <p className="text-sm text-[#003087] text-center max-w-2xl">
                    We couldn't find any FAQs matching your search. Try
                    different keywords or check back later.
                  </p>
                  <button
                    className="mt-4 bg-[#003087] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#003087] transition-colors"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear Search
                  </button>
                </div>
              )}

              {/* New Section: Did not find what you were looking for? */}
              <div className="mt-8 text-center">
                <h3 className="text-[18px] font-semibold text-[#003087] mb-4">
                  Did not find what you were looking for?
                </h3>
                <a
                  href="https://api.whatsapp.com/send?phone=2349078987890&text=Hello%20MindPower%20Support,%20I%20have%20a%20question:%20[Please%20describe%20your%20question%20or%20issue%20here]%0A%0AName:%20[Your%20Name]%0AProfile/Business:%20[Your%20Business%20Name%20or%20Profile%20ID]%0AThanks!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#003087] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#003087]/90 transition-colors"
                >
                  <FaWhatsapp className="text-[18px]" />
                  Message
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;
