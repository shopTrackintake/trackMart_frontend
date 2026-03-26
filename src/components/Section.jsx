import { motion } from "framer-motion";

export default function Section({ title, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="group pb-6 border-b border-gray-200 last:border-none"
    >
      {/* HEADING */}
      <h2
        className="text-lg md:text-xl font-semibold mb-2 
                   text-orange-500 
                   group-hover:text-black dark:group-hover:text-white 
                   transition-colors duration-300"
      >
        {title}
      </h2>

      {/* TEXT */}
      <p className="text-muted leading-7 text-justify">
        {children}
      </p>
    </motion.section>
  );
}