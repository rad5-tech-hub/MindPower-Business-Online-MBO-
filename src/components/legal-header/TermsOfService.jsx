import React from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "../Header";
import Start from "../home/Start";
import Footer from "../Footer";

const TermsOfService = () => {
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
                Terms of Service
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Effective Date: Thursday, 2 April 2023
              </p>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  1. Acceptance of Terms
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  By accessing or using the platform, you agree to comply with
                  and be bound by these Terms of Service.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  2. Description of Service
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  MBO provides a platform for business to create profiles,
                  showcase products and services, and connect with potential
                  customers.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  3. User Obligations
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed space-y-1">
                  <li>
                    <strong>Registration:</strong> Provide accurate and complete
                    information during registration.
                  </li>
                  <li>
                    <strong>Account Security:</strong> Maintain the security of
                    your account and password.
                  </li>
                  <li>
                    <strong>Compliance:</strong> Use the platform in accordance
                    with applicable laws and these terms.
                  </li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  4. Prohibited Activities
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  You agree not to engage in the following activities:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed space-y-1">
                  <li>Violating Laws: Engaging in illegal activities.</li>
                  <li>
                    Infringing Rights: Violating intellectual property or
                    privacy rights.
                  </li>
                  <li>
                    Interference: Disrupting the platform’s functionality.
                  </li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  5. Content Ownership and Licenses
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed space-y-1">
                  <li>
                    <strong>User Content:</strong> You retain ownership of
                    content you submit but grant MBO a license to use it.
                  </li>
                  <li>
                    <strong>MBO Content:</strong> All platform content is owned
                    by MBO and protected by law.
                  </li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  6. Termination of Service
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  MBO reserves the right to terminate your access to the
                  platform for violating these terms.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  7. Disclaimers and Limitation of Liability
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed space-y-1">
                  <li>
                    <strong>“As Is” Basis:</strong> The platform is provided “as
                    is” without warranties of any kind.
                  </li>
                  <li>
                    <strong>Limitation:</strong> MBO is not liable for indirect,
                    incidental, or consequential damages.
                  </li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  8. Governing Law
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  These terms are governed by the laws of the jurisdiction where
                  MBO operates, without regard to conflict of law principles.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  9. Changes to Terms
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  MBO may update these terms at any time. Continued use of the
                  platform constitutes acceptance of the new terms.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  10. Contact Information
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  For questions about these Terms of Service, please contact us
                  at{" "}
                  <a
                    href="mailto:support@mindpowerbusiness.com"
                    className="text-green-900 hover:underline"
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

export default TermsOfService;
