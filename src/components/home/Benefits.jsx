import React from "react";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/opacity.css";
import VectorIcon1 from "../../assets/vector1.svg";
import VectorIcon2 from "../../assets/vector2.svg";
import VectorIcon3 from "../../assets/vector3.svg";

const fadeInVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const Benefits = () => {
  return (
    <div className="w-full flex justify-center items-center py-18 bg-[#FEFEFF] overflow-hidden">
      <motion.div
        className="container mx-auto px-[5vw] flex flex-col gap-14 text-[#003087]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
      >
        <motion.h1
          className="lg:text-[35px] text-[25px] font-medium text-center"
          variants={fadeInVariants}
        >
          What’s in it for You?
        </motion.h1>

        {[
          {
            id: "showcase",
            title: "Showcase Your Business",
            text: "Create a profile with all your essential details.",
            image:
              "https://res.cloudinary.com/drve24nad/image/upload/v1746539940/benefits/oxpgyvjpqdy2wxycjxyg.gif",
            vector: VectorIcon1,
          },
          {
            id: "expand",
            title: "Expand Your Reach",
            text: "Promote your products and services to a wider audience.",
            image:
              "https://res.cloudinary.com/drve24nad/image/upload/v1746540036/benefits/wrwzs4voq8us3wdrx9zv.gif",
            vector: VectorIcon2,
          },
          {
            id: "engage",
            title: "Engage Customers Easily",
            text: "Communicate seamlessly via WhatsApp and social media links.",
            image:
              "https://res.cloudinary.com/drve24nad/image/upload/v1746540453/benefits/j1bwoky0gmvtn3etcook.gif",
            vector: VectorIcon3,
          },
          {
            id: "track",
            title: "Track Your Progress",
            text: "Access visitor analytics for better business insights.",
            image:
              "https://res.cloudinary.com/drve24nad/image/upload/v1746540552/benefits/i3nqtotfte7yddxrd71u.gif",
          },
        ].map(({ id, title, text, image, vector }, index) => (
          <motion.div
            key={id}
            className="w-full h-fit flex flex-col lg:gap-4 gap-16 overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            variants={{
              hidden: { opacity: 0, x: index % 2 === 0 ? -100 : 100 },
              visible: {
                opacity: 1,
                x: 0,
                transition: {
                  duration: 0.8,
                  delay: index * 0.3,
                  ease: "easeOut",
                },
              },
            }}
          >
            <div className="w-full flex max-lg:flex-col max-lg:justify-center justify-between items-center max-sm:gap-4 text-center lg:text-left">
              <motion.div
                className={`${index % 2 !== 0 ? "lg:order-2" : ""}`}
                variants={fadeInVariants}
              >
                <motion.h1
                  className="lg:text-[35px] text-[25px]"
                  variants={fadeInVariants}
                >
                  {title}
                </motion.h1>
                <motion.p
                  className="md:text-[20px] text-[18px] text-[#003087]"
                  variants={fadeInVariants}
                >
                  {text}
                </motion.p>
              </motion.div>
              <LazyLoadImage
                src={image}
                alt={`${id}_img`}
                effect="opacity"
                className={`max-w-full h-auto object-contain ${
                  index % 2 !== 0 ? "lg:order-1" : ""
                }`}
              />
            </div>
            {vector && (
              <motion.div
                className="vectorImg flex justify-center items-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.4,
                  ease: "easeOut",
                }}
              >
                <img
                  src={vector}
                  alt={`${id}_vector`}
                  className="max-md:w-[80%] max-sm:w-[60%] h-fit mx-auto"
                />
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Benefits;
