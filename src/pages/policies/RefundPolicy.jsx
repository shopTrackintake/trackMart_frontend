// src/pages/policies/RefundPolicy.jsx
import PolicyLayout from "../../components/PolicyLayout";
import { motion } from "framer-motion";

const Section = ({ title, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    viewport={{ once: true }}
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

export default function RefundPolicy() {
  return (
    <PolicyLayout title="Refund & Returns">
      
      <Section title="Return Eligibility">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro placeat labore at architecto! Impedit fugit tenetur autem, aut cupiditate dolore!, items can be returned within 7 days.
      </Section>

      <Section title="Return Process">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed aperiam velit mollitia, consectetur pariatur atque, distinctio porro corrupti doloribus perspiciatis modi praesentium quae, dolore omnis, follow steps to initiate return.
      </Section>

      <Section title="Refund Timeline">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit, consectetur. refunds processed within 5-7 days.
      </Section>

      <Section title="Non-returnable Items">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit cupiditate, quos quis natus quisquam similique ut necessitatibus explicabo laboriosam illum, cumque rerum ad dolorem temporibus corrupti doloribus, tempora unde? Neque!, some items are not eligible.
      </Section>

    </PolicyLayout>
  );
}