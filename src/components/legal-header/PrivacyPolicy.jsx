import React from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import Start from "../home/Start";

const PrivacyPolicy = () => {
  const location = useLocation();

  return (
    <>
      <Header />

      <div className=" bg-[#FEFEFF] py-10">
        <div className="container px-[5vw] mx-auto flex max-lg:flex-col justify-center">
          {/* Sidebar */}
          <aside className="lg:w-[20%] h-full px-6 flex flex-col justify-center">
            <h1 className="text-sm font-bold text-gray-800 mb-3">Legal</h1>
            <nav className="space-y-2">
              <Link
                to="/privacy-policy"
                className={`text-sm font-medium block ${
                  location.pathname === "/privacy-policy"
                    ? "text-green-800 font-bold"
                    : "text-gray-600 hover:font-bold"
                }`}
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className={`text-sm font-medium block ${
                  location.pathname === "/terms-of-service"
                    ? "text-green-800 font-bold"
                    : "text-gray-600 hover:font-bold"
                }`}
              >
                Terms of Service
              </Link>
            </nav>
          </aside>

          {/* Content Area */}
          <div className="lg:w-[80%] pb-8 px-6">
            <div className="">
              <h2 className="text-lg font-bold text-gray-800 uppercase my-2">
                Privacy Policy
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Effective Date: Thursday, 2 April 2025
              </p>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  1. Introduction
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Welcome to MindPower Business Online (MBO)! Your privacy is
                  important to us. By accessing or using our platform, you agree
                  to comply with and be bound by this Privacy Policy, which
                  describes how we collect, use, disclose, and safeguard your
                  information when you use our platform.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  2. Information We Collect
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  We may collect the following types of information:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed space-y-1">
                  <li>
                    <strong>Personal Data:</strong> Information that identifies
                    you personally, such as your name, email address, phone
                    number, and business details.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Information on how you access
                    and use the platform, including your IP address, browser
                    type, and usage patterns.
                  </li>
                  <li>
                    <strong>Cookies and Tracking Technologies:</strong> Data
                    collected through cookies and similar technologies to
                    enhance user experience.
                  </li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  3. How We Use Your Information
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed space-y-1">
                  <li>
                    <strong>To Provide and Maintain Our Services:</strong>{" "}
                    Ensuring the platform functions properly and delivering the
                    services you request.
                  </li>
                  <li>
                    <strong>To Improve Our Platform:</strong> Analyzing usage
                    patterns to enhance features and user experience.
                  </li>
                  <li>
                    <strong>To Communicate with You:</strong> Sending updates,
                    newsletters, and responding to inquiries.
                  </li>
                  <li>
                    <strong>For Marketing and Promotional Purposes:</strong>{" "}
                    Offering tailored content and advertisements.
                  </li>
                  <li>
                    <strong>To Enforce Our Terms:</strong> Ensuring compliance
                    with our policies and applicable law.
                  </li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  4. Sharing Your Information
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  We may share your information in the following situations:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed space-y-1">
                  <li>
                    <strong>With Service Providers:</strong> Trusted partners
                    who assist in operating our platform.
                  </li>
                  <li>
                    <strong>For Legal Obligations:</strong> When required by law
                    to protect our rights, comply with legal processes, or
                    respond to government requests.
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with
                    mergers, acquisitions, or asset sales.
                  </li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  5. Security of Your Information
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  We implement industry-standard security measures to protect
                  your data. However, no method of transmission over the
                  internet is 100% secure.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  6. Your Data Protection Rights
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed space-y-1">
                  <li>
                    <strong>Access:</strong> Request a copy of your data.
                  </li>
                  <li>
                    <strong>Rectification:</strong> Correct inaccurate
                    information.
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your data.
                  </li>
                  <li>
                    <strong>Restriction:</strong> Limit the processing of your
                    data.
                  </li>
                  <li>
                    <strong>Objection:</strong> Object to processing for
                    marketing or other purposes.
                  </li>
                  <li>
                    <strong>Data Portability:</strong> Transfer your data to
                    another service.
                  </li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  7. Changes to This Privacy Policy
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  We may update this policy periodically. We will notify you of
                  any significant changes by posting the new policy on our
                  platform.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  8. Contact Us
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  If you have questions or concerns about this Privacy Policy,
                  please contact us at{" "}
                  <a
                    href="mailto:support@mindpowerbusiness.com"
                    className="text-green-800 hover:underline"
                  >
                    support@mindpowerbusiness.com
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Start />
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
