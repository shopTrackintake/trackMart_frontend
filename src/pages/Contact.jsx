import { motion } from "framer-motion";

export default function Contact() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10">
      
      {/* LEFT INFO */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-4 text-default">
          Contact Us
        </h1>

        <p className="text-muted mb-6 leading-6">
          Have questions or need help? Reach out to us anytime.
        </p>

        <div className="space-y-3 text-muted">
          <p><strong>TrackMart Pvt Ltd</strong></p>
          <p>
            2nd Floor, Tech Park Building,<br />
            Gomti Nagar Extension,<br />
            Lucknow, Uttar Pradesh - 226010
          </p>
          <p>📞 +91 9999999999</p>
          <p>📧 support@trackmart.com</p>
        </div>
      </motion.div>

      {/* RIGHT FORM */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-md border border-default"
      >
        <h2 className="text-xl font-semibold mb-4 text-default">
          Send a Message
        </h2>

        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Your Name"
            className="border border-default rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="email"
            placeholder="Your Email"
            className="border border-default rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <textarea
            placeholder="Your Message"
            className="border border-default rounded-lg px-3 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button className="bg-primary text-white py-2 rounded-lg hover:opacity-90 transition">
            Send Message
          </button>
        </form>
      </motion.div>

    </div>
  );
}