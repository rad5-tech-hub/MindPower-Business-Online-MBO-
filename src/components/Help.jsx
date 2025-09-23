import React, { useState } from "react";
import { BiMessage, BiUser } from "react-icons/bi";
import { CgPhotoscan } from "react-icons/cg";
import {
  MdArrowDropDown,
  MdEmail,
  MdOutlineArrowDropDown,
  MdOutlineEmail,
} from "react-icons/md";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Help = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    issueType: "Report a Business",
    issueDescription: "",
    file: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      file.size <= 5 * 1024 * 1024 &&
      ["image/png", "image/jpeg"].includes(file.type)
    ) {
      setFormData((prev) => ({ ...prev, file }));
    } else {
      toast.error("Please upload a PNG or JPG file under 5MB.", {
        position: "top-right",
        autoClose: 3000,
      });
      setFormData((prev) => ({ ...prev, file: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL;
      console.log("BASE_URL:", BASE_URL); // Debug BASE_URL
      let issueImageUrl = null;

      // Step 1: Upload file to /admin/upload if a file is selected
      if (formData.file) {
        const uploadPayload = new FormData();
        uploadPayload.append("image", formData.file); // Adjust field name if backend expects different (e.g., "file")

        // Debug FormData contents
        for (let [key, value] of uploadPayload.entries()) {
          console.log(`${key}:`, value instanceof File ? value.name : value);
        }

        const uploadResponse = await axios.post(
          `${BASE_URL}/admin/upload`,
          uploadPayload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            timeout: 30000, // 30 seconds timeout
          }
        );

        if (uploadResponse.data.imageUrl) {
          issueImageUrl = uploadResponse.data.imageUrl;
          console.log("Image uploaded successfully:", issueImageUrl);
        } else {
          throw new Error("Failed to upload image: No imageUrl in response");
        }
      }

      // Step 2: Submit the issue to /admin/create-issue
      const payload = {
        name: formData.fullName,
        email: formData.email,
        issue: formData.issueDescription,
        issueType: formData.issueType,
        issueImage: issueImageUrl, // Will be null if no file
      };

      console.log("Submitting issue payload:", payload);

      const response = await axios.post(
        `${BASE_URL}/admin/create-issue`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      if (response.data.success) {
        toast.success("Report submitted successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        setFormData({
          fullName: "",
          email: "",
          issueType: "Report a Business",
          issueDescription: "",
          file: null,
        });
      } else {
        throw new Error("Unexpected response format or server error");
      }
    } catch (err) {
      console.error("❌ Error submitting report:", err.response?.data || err);
      let errorMessage = "Failed to submit report. Please try again.";
      if (err.code === "ECONNABORTED") {
        errorMessage =
          "Request timed out. Please check your network or try again later.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#FEFEFF] py-[5vh]">
      <div className="container px-[5vw] mx-auto grid lg:grid-cols-2 grid-cols-1 gap-12">
        <div>
          <h1 className="lg:text-[50px] text-[32px] text-[#003087]">
            We’re Here to Help
          </h1>
          <p className="text-[#003087] lg:text-[32px] text-[20px]">
            Have questions or feedback? Get in <br /> touch with us, and we’ll
            get back to you as soon as possible
          </p>
        </div>
        <div>
          <form
            className="text-[#003087] bg-[#043D120D] rounded-[46px] p-10 flex flex-col gap-6"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2">
              <label>Full Name</label>
              <div className="flex items-center justify-between h-[50px] border-[1px] border-[#6A7368] rounded-[20px] px-8">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full outline-0 border-0 bg-transparent"
                  required
                />
                <BiUser />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label>Email</label>
              <div className="flex items-center justify-between h-[50px] border-[1px] border-[#6A7368] rounded-[20px] px-8">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="deyplay@chibuke.com"
                  className="w-full outline-0 border-0 bg-transparent"
                  required
                />
                <MdOutlineEmail />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label>Issue Type</label>
              <div className="flex items-center justify-between h-[50px] border-[1px] border-[#6A7368] rounded-[20px] px-8">
                <select
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleInputChange}
                  className="w-full outline-0 border-0 bg-transparent appearance-none"
                  required
                >
                  <option value="Report a Business">Report a Business</option>
                  <option value="Feedback">Feedback</option>
                  <option value="System Glitch">System Glitch</option>
                  <option value="Other">Other</option>
                </select>
                <MdOutlineArrowDropDown />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label>Tell us about the issue</label>
              <div className="border-[1px] border-[#6A7368] rounded-[20px] px-8 py-1 h-[78px]">
                <textarea
                  name="issueDescription"
                  value={formData.issueDescription}
                  onChange={handleInputChange}
                  placeholder="Type your issue here..."
                  className="w-full outline-0 border-0 bg-transparent"
                  required
                ></textarea>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label>File Upload (Optional)</label>
              <div className="border-[1px] border-[#6A7368] rounded-[20px] px-8 py-2 h-[100px] flex flex-col items-center justify-center">
                <CgPhotoscan />
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileUpload"
                />
                <label
                  htmlFor="fileUpload"
                  className="cursor-pointer text-[#003087] hover:text-[#003087]"
                >
                  Upload a file
                </label>
                <p>PNG or JPG (Max 5MB)</p>
              </div>
            </div>

            <button
              type="submit"
              className={`text-[16px] text-[#FEFEFF] bg-[#003087] hover:bg-[#003087]/75 rounded-[16px] h-[50px] mt-8 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Help;
