import { Phone, Mail, Instagram, Youtube, Linkedin, Send } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-default mt-10">
      
      {/* TOP SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 
                      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
                      gap-10 text-center sm:text-left">
        
        {/* LEFT - LINKS */}
        <div className="flex flex-col items-center sm:items-start">
          <div className="max-w-xs text-center sm:text-left">
            
            <h3 className="text-lg font-semibold mb-4 text-default">
              Quick Links
            </h3>

            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/privacy" className="hover:text-primary transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition">Terms of Service</Link></li>
              <li><Link to="/refund" className="hover:text-primary transition">Refunds & Returns</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition">Shipping Policy</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition">Contact Us</Link></li>
            </ul>

          </div>
        </div>

        {/* CENTER - CONTACT */}
        <div className="flex flex-col items-center sm:items-start">
          <div className="max-w-xs text-center sm:text-left">

            <h3 className="text-lg font-semibold mb-4 text-default">
              Connect With Us
            </h3>

            {/* PHONE */}
            <div className="flex items-center gap-2 text-sm text-muted mb-2 justify-center sm:justify-start">
              <Phone size={16} className="shrink-0" />
              <a href="tel:+919999999999" className="hover:text-primary transition">
                +91 9999999999
              </a>
            </div>

            {/* EMAIL */}
            <div className="flex items-center gap-2 text-sm text-muted mb-4 justify-center sm:justify-start">
              <Mail size={16} className="shrink-0" />
              <a href="mailto:support@trackmart.com" className="hover:text-primary transition">
                support@trackmart.com
              </a>
            </div>


            {/* SOCIAL ICONS */}
            <div className="flex justify-center sm:justify-start gap-5 mt-3">
              
              <a href="#" className="text-muted hover:text-pink-500 hover:scale-110 transition-all duration-300">
                <Instagram size={20} />
              </a>

              <a href="#" className="text-muted hover:text-red-500 hover:scale-110 transition-all duration-300">
                <Youtube size={20} />
              </a>

              <a href="#" className="text-muted hover:text-blue-600 hover:scale-110 transition-all duration-300">
                <Linkedin size={20} />
              </a>

              <a href="#" className="text-muted hover:text-sky-500 hover:scale-110 transition-all duration-300">
                <Send size={20} />
              </a>

            </div>

          </div>
        </div>

        {/* RIGHT - COMPANY INFO */}
        <div className="flex flex-col items-center sm:items-start">
          <div className="max-w-xs text-center sm:text-left">

            <h3 className="text-lg font-semibold mb-4 text-default">
              Our Company
            </h3>

            <p className="text-sm text-muted leading-6">
              TrackMart Pvt Ltd <br />
              2nd Floor, Tech Park Building, <br />
              Gomti Nagar Extension, <br />
              Near Lulu Mall Road, <br />
              Lucknow, Uttar Pradesh <br />
              India - 226010
            </p>

          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-default"></div>

      {/* BOTTOM */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-center text-sm text-muted text-center">
        <p>
          © 2026 TrackMart. All rights reserved.
        </p>
      </div>

    </footer>
  );
}