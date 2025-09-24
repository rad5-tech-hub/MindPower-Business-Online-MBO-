import React, { useState, useEffect } from "react";
import { IoLogoFacebook, IoLogoYoutube } from "react-icons/io5";
import { FiEdit3 } from "react-icons/fi";
import {
  FaInstagram,
  FaTwitter,
  FaTiktok,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditHeader from "./EditHeader";

const ContactAndSocials = () => {
  const [profileData, setProfileData] = useState({
    contactNo: [],
    whatsapp: "",
    email: "",
    socialLinks: {},
  });
  const [formData, setFormData] = useState({
    whatsapp: "",
    alternativeNumber: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState(null);
  const [socialInput, setSocialInput] = useState("");
  const [showSocialModal, setShowSocialModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { token } = useSelector((state) => state.auth);

  // Format phone numbers consistently
  const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.startsWith("234") ? `0${cleaned.slice(3)}` : cleaned;
  };

  // Validate phone number structure
  const validatePhoneNumber = (number) => {
    if (!number) return false;
    const cleaned = number.replace(/\D/g, "");
    return cleaned.length >= 10 && cleaned.length <= 13;
  };

  // Validate social media URLs
  const validateSocialLink = (platform, link) => {
    if (!link) return false;

    const patterns = {
      whatsapp: /^https:\/\/wa\.me\/[0-9]{10,13}$/,
      facebook: /^(https?:\/\/)?(www\.)?(facebook|fb)\.com\/.+/i,
      instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/.+/i,
      twitter:
        /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]{1,15}$/i,
      tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/.+/i,
      linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/.+/i,
      youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i,
    };

    return patterns[platform] ? patterns[platform].test(link) : true;
  };

  useEffect(() => {
    if (!token) {
      toast.error("Authentication required. Please log in.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/member/my-profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data?.success && response.data.data) {
          const profile = response.data.data;
          const whatsappNumber = profile.socialLinks?.whatsapp
            ? formatPhoneNumber(
                profile.socialLinks.whatsapp.replace("https://wa.me/", "")
              )
            : profile.contactNo?.[0]
            ? formatPhoneNumber(profile.contactNo[0])
            : "";

          const alternativeNumber = profile.contactNo?.[1]
            ? formatPhoneNumber(profile.contactNo[1])
            : "";

          setProfileData({
            contactNo: profile.contactNo || [],
            whatsapp: whatsappNumber,
            email: profile.member?.email || "",
            socialLinks: profile.socialLinks || {},
          });

          setFormData({
            whatsapp: whatsappNumber,
            alternativeNumber: alternativeNumber,
            email: profile.member?.email || "",
          });
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast.error(error.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate inputs
    if (!validatePhoneNumber(formData.whatsapp)) {
      toast.error("Please enter a valid WhatsApp number (10-13 digits)");
      setSubmitting(false);
      return;
    }

    if (
      formData.alternativeNumber &&
      !validatePhoneNumber(formData.alternativeNumber)
    ) {
      toast.error("Please enter a valid alternative number (10-13 digits)");
      setSubmitting(false);
      return;
    }

    try {
      const contactNumbers = [
        formData.whatsapp,
        ...(formData.alternativeNumber ? [formData.alternativeNumber] : []),
      ].filter(Boolean);

      const whatsappLink = formData.whatsapp
        ? `https://wa.me/${formData.whatsapp.replace(/^0/, "234")}`
        : "";

      const payload = {
        contactNo: contactNumbers,
        socialLinks: {
          ...profileData.socialLinks,
          whatsapp: whatsappLink,
        },
      };

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/member/edit-profile`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.message === "Profile updated successfully") {
        toast.success("Contact details updated!");
        setProfileData((prev) => ({
          ...prev,
          contactNo: contactNumbers,
          whatsapp: formData.whatsapp,
          socialLinks: {
            ...prev.socialLinks,
            whatsapp: whatsappLink,
          },
        }));
        setEditField(null);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error.response?.data?.message || "Update failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialLinkClick = (platform) => {
    setSocialInput(profileData.socialLinks[platform] || "");
    setShowSocialModal(platform);
  };

  const handleSocialSubmit = async (platform) => {
    if (!socialInput.trim()) {
      toast.error("Please enter a valid link");
      return;
    }

    if (!validateSocialLink(platform, socialInput)) {
      toast.error(`Please enter a valid ${platform} URL`);
      return;
    }

    try {
      const updatedSocialLinks = {
        ...profileData.socialLinks,
        [platform]: socialInput,
      };

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/member/edit-profile`,
        { socialLinks: updatedSocialLinks },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.message === "Profile updated successfully") {
        toast.success(`${platform} link saved!`);
        setProfileData((prev) => ({
          ...prev,
          socialLinks: updatedSocialLinks,
        }));
        setShowSocialModal(null);
        setSocialInput("");
      }
    } catch (error) {
      console.error(`${platform} update error:`, error);
      toast.error(
        error.response?.data?.message || `Failed to save ${platform} link`
      );
    }
  };

  const Loader = () => (
    <div className="flex space-x-2 items-center">
      <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce"></div>
      <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce delay-200"></div>
      <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce delay-400"></div>
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
    <div className="w-full text-[#003087] flex flex-col gap-10">
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
      />

      <div className="container px-[5vw] mx-auto">
        <h2 className="text-[16px] text-[#003087] font-medium border-b-[1px] border-[#6A7368] px-2 py-1 w-fit">
          Contact & Socials
        </h2>

        <div className="socials flex flex-col gap-6">
          <p className="text-[12px] text-[#003087] font-medium border-b-[1px] border-[#6A7368] px-2 py-1 w-fit">
            ON THE WEB
          </p>

          <div className="flex flex-col gap-16">
            {/* Social Media Links Section */}
            <div className="content border-[1px] border-[#6A7368] rounded-[11px]">
              {[
                {
                  icon: <FaWhatsapp className="text-[25px]" />,
                  platform: "whatsapp",
                  label: "WhatsApp",
                },
                {
                  icon: <IoLogoFacebook className="text-[25px]" />,
                  platform: "facebook",
                  label: "Facebook",
                },
                {
                  icon: <FaInstagram className="text-[25px]" />,
                  platform: "instagram",
                  label: "Instagram",
                },
                {
                  icon: <FaTwitter className="text-[25px]" />,
                  platform: "twitter",
                  label: "Twitter",
                },
                {
                  icon: <FaTiktok className="text-[25px]" />,
                  platform: "tiktok",
                  label: "TikTok",
                },
                {
                  icon: <FaLinkedin className="text-[25px]" />,
                  platform: "linkedin",
                  label: "LinkedIn",
                },
                {
                  icon: <IoLogoYoutube className="text-[25px]" />,
                  platform: "youtube",
                  label: "YouTube",
                  last: true,
                },
              ].map(({ icon, platform, label, last }) => (
                <div
                  key={platform}
                  className={`flex justify-between py-6 px-8 ${
                    last ? "" : "border-b-[1px] border-[#6A7368]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {icon}
                    {label}
                  </div>
                  <button
                    onClick={() => handleSocialLinkClick(platform)}
                    className="text-[14px] border-[1px] rounded-[11px] shadow px-4 py-2 flex items-center gap-2 border-[#6A7368] hover:bg-[#003087] hover:text-white cursor-pointer"
                  >
                    {profileData.socialLinks[platform]
                      ? "Edit link"
                      : "Add Profile Url"}
                  </button>
                </div>
              ))}
            </div>

            {/* Contact Form Section */}
            <form onSubmit={handleSubmit}>
              <h2 className="text-[#003087] font-medium text-[12px] border-b-[1px] border-[#6A7368] pb-1 w-fit px-2">
                CONTACT
              </h2>

              <div className="mt-4">
                <div className="flex flex-col gap-8">
                  {[
                    {
                      field: "whatsapp",
                      label: "WhatsApp Number",
                      placeholder: "08032433604",
                      type: "tel",
                    },
                    {
                      field: "alternativeNumber",
                      label: "Alternative Phone Number",
                      placeholder: "08080999467",
                      type: "tel",
                    },
                    {
                      field: "email",
                      label: "Email Address",
                      placeholder: "user@example.com",
                      type: "email",
                    },
                  ].map(({ field, label, placeholder, type }) => (
                    <div
                      key={field}
                      className="text-[#003087] flex flex-col gap-2"
                    >
                      <label>{label}</label>
                      <div className="flex justify-between gap-8 md:gap-16">
                        <input
                          type={type}
                          disabled={editField !== field}
                          value={formData[field] || ""}
                          onChange={(e) =>
                            handleInputChange(field, e.target.value)
                          }
                          placeholder={placeholder}
                          className={`w-full h-[46px] px-4 rounded-[11px] border-[1px] ${
                            editField === field
                              ? "border-[#043D12] bg-green-50 focus:ring-2 focus:ring-[#043D12]"
                              : "border-[#6A7368]"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setEditField(editField === field ? null : field)
                          }
                          className="rounded-[11px] text-[14px] px-4 py-2 shadow-lg flex items-center justify-between gap-2 border-[1px] border-[#6A7368] hover:bg-[#003087] hover:text-white cursor-pointer"
                        >
                          <FiEdit3 className="text-[18px]" />
                          {editField === field ? "Cancel" : "Edit"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="btns flex justify-end pt-20 pb-12">
                <div className="w-fit flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        whatsapp: profileData.whatsapp,
                        alternativeNumber: profileData.contactNo[1] || "",
                        email: profileData.email,
                      });
                      setEditField(null);
                    }}
                    className="border-[1px] border-[#6A7368] text-[#003087] rounded-[11px] text-[15px] hover:text-white px-2 lg:px-8 py-3 shadow-lg hover:bg-[#003087]"
                  >
                    Discard Changes
                  </button>
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
              </div>
            </form>
          </div>
        </div>

        {/* Social Link Modal */}
        {showSocialModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 max-w-[90%]">
              <h2 className="text-lg font-semibold mb-4">
                {profileData.socialLinks[showSocialModal] ? "Edit" : "Add"}{" "}
                {showSocialModal} Link
              </h2>
              <input
                type="text"
                value={socialInput}
                onChange={(e) => setSocialInput(e.target.value)}
                placeholder={
                  showSocialModal === "whatsapp"
                    ? "https://wa.me/234..."
                    : `https://${showSocialModal}.com/username`
                }
                className="w-full p-2 border rounded mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setShowSocialModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-[#003087] text-white rounded hover:bg-[#003087]"
                  onClick={() => handleSocialSubmit(showSocialModal)}
                >
                  {profileData.socialLinks[showSocialModal] ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactAndSocials;
