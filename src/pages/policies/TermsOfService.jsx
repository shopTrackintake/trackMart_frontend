// src/pages/policies/TermsOfService.jsx
import PolicyLayout from "../../components/PolicyLayout";
import { motion } from "framer-motion";

const Section = ({ title, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    viewport={{ once: true }}
    className="group pb-6 border-b border-gray-200 last:border-none hover:bg-gray-50/50 px-2 rounded"
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

export default function TermsOfService() {
  return (
    <PolicyLayout title="Terms of Service">

      <Section title="User Responsibilities">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint eos voluptates quidem! Corrupti animi nemo eos eligendi voluptate! Mollitia nisi sunt totam assumenda nesciunt possimus odio temporibus accusamus enim sapiente. Quas ex itaque quisquam id optio voluptas aperiam expedita eos. users must follow rules.
      </Section>

      <Section title="Account Usage">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique, nulla? accounts must be secure.
      </Section>

      <Section title="Orders & Payments">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate nemo ullam, qui neque soluta odio laboriosam nihil quo ipsam suscipit! all payments must be valid.
      </Section>

      <Section title="Limitation of Liability">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque corporis blanditiis, porro quam esse consequuntur quod placeat voluptate accusamus dolores! platform not liable for misuse.
      </Section>

    </PolicyLayout>
  );
}