import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ShippingPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] py-16 px-4 sm:px-6 lg:px-8">
      
      {/* BACK BUTTON */}
      <div className="max-w-4xl mx-auto mb-4">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-[var(--color-text-default)] hover:text-[var(--color-primary)] transition group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
          Back
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-8">
          <Truck className="w-8 h-8 text-[var(--color-primary)]" />
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="text-[var(--color-primary)]">Shipping</span>
            <span className="text-[var(--color-text-strong)]"> Policy</span>
          </h1>
        </div>

        {/* CONTENT */}
        <div className="bg-[var(--color-bg-surface)] p-8 rounded-2xl border-2 border-[var(--color-border-default)] space-y-6">

          <p className="text-[var(--color-text-default)]">
            At TrackMart, we aim to deliver your orders quickly and safely. This shipping policy outlines how orders are processed, shipped, and delivered.
          </p>

          <h2 className="text-xl font-semibold text-[var(--color-text-strong)]">
            Order Processing
          </h2>
          <p className="text-[var(--color-text-default)]">
            Orders are processed within 1–2 business days after confirmation. Orders are not processed on weekends or public holidays.
          </p>

          <h2 className="text-xl font-semibold text-[var(--color-text-strong)]">
            Shipping Time
          </h2>
          <p className="text-[var(--color-text-default)]">
            Delivery usually takes 3–7 business days depending on your location. Remote areas may require additional time.
          </p>

          <h2 className="text-xl font-semibold text-[var(--color-text-strong)]">
            Shipping Charges
          </h2>
          <p className="text-[var(--color-text-default)]">
            Shipping charges are calculated at checkout. Free shipping may be available on selected products or offers.
          </p>

          <h2 className="text-xl font-semibold text-[var(--color-text-strong)]">
            Order Tracking
          </h2>
          <p className="text-[var(--color-text-default)]">
            Once your order is shipped, you will receive tracking details via email or SMS to monitor your delivery status.
          </p>

          <h2 className="text-xl font-semibold text-[var(--color-text-strong)]">
            Delays
          </h2>
          <p className="text-[var(--color-text-default)]">
            Delivery delays may occur due to unforeseen circumstances such as weather conditions, logistics issues, or high demand.
          </p>

          <h2 className="text-xl font-semibold text-[var(--color-text-strong)]">
            Incorrect Address
          </h2>
          <p className="text-[var(--color-text-default)]">
            Please ensure your shipping address is correct. TrackMart is not responsible for delays or losses due to incorrect information.
          </p>

          <h2 className="text-xl font-semibold text-[var(--color-text-strong)]">
            Contact Us
          </h2>
          <p className="text-[var(--color-text-default)]">
            For any shipping-related queries, contact us at support@trackmart.com.
          </p>

          <p className="text-sm text-[var(--color-text-muted)] pt-4 border-t">
            Last Updated: {new Date().toLocaleDateString()}
          </p>

        </div>
      </motion.div>
    </div>
  );
};

export default ShippingPolicy;