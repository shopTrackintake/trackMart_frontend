// src/pages/policies/ShippingPolicy.jsx
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

export default function ShippingPolicy() {
  return (
    <PolicyLayout title="Shipping Policy">
      
      <Section title="Delivery Time">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui maiores nam animi. Vero minima quisquam voluptatum reprehenderit nemo? Veniam illo molestias repellendus! Ipsam optio id tenetur dolor, earum expedita ducimus sed corporis sequi ab dignissimos modi unde fugiat, enim magni? delivery takes 3-7 business days.
      </Section>

      <Section title="Shipping Charges">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ducimus dolor neque ratione eos eveniet reiciendis laboriosam, laudantium deserunt dolorum cumque! charges vary by location.
      </Section>

      <Section title="Tracking Orders">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia unde odio quos, dolore consequuntur dolorum suscipit adipisci cumque facere pariatur recusandae alias porro eaque praesentium expedita aliquam, excepturi asperiores error cum. Cum facere, porro molestias rem sint quis quaerat totam. track orders from dashboard.
      </Section>

      <Section title="Delays & Exceptions">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat illum excepturi magnam tempora. A doloremque, consequatur fugiat animi quisquam impedit esse? Ipsam neque iste aspernatur obcaecati magnam. Sapiente, assumenda doloremque?, delays may occur due to conditions.
      </Section>

    </PolicyLayout>
  );
}