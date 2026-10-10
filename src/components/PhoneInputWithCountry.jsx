import { useState, useEffect } from "react";
import { Phone, ChevronDown, Globe, ListFilter, X } from "lucide-react";

export const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳", mask: "98765 43210" },
  { code: "+1", country: "US / Canada", flag: "🇺🇸", mask: "(555) 000-0000" },
  { code: "+44", country: "UK", flag: "🇬🇧", mask: "7911 123456" },
  { code: "+971", country: "UAE", flag: "🇦🇪", mask: "50 123 4567" },
  { code: "+65", country: "Singapore", flag: "🇸🇬", mask: "8123 4567" },
  { code: "+61", country: "Australia", flag: "🇦🇺", mask: "412 345 678" },
  { code: "+49", country: "Germany", flag: "🇩🇪", mask: "151 2345678" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦", mask: "50 123 4567" },
  { code: "+33", country: "France", flag: "🇫🇷", mask: "6 12 34 56 78" },
  { code: "+81", country: "Japan", flag: "🇯🇵", mask: "90 1234 5678" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩", mask: "1712 345678" },
  { code: "+977", country: "Nepal", flag: "🇳🇵", mask: "981 2345678" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰", mask: "71 234 5678" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾", mask: "12 345 6789" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩", mask: "812 3456 7890" },
  { code: "+63", country: "Philippines", flag: "🇵🇭", mask: "917 123 4567" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰", mask: "300 1234567" },
  { code: "+20", country: "Egypt", flag: "🇪🇬", mask: "10 1234 5678" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬", mask: "802 123 4567" },
  { code: "+27", country: "South Africa", flag: "🇿🇦", mask: "82 123 4567" },
  { code: "+55", country: "Brazil", flag: "🇧🇷", mask: "11 91234 5678" },
  { code: "+7", country: "Russia / Kazakhstan", flag: "🇷🇺", mask: "912 345 6789" },
  { code: "+39", country: "Italy", flag: "🇮🇹", mask: "312 345 6789" },
  { code: "+34", country: "Spain", flag: "🇪🇸", mask: "612 345 678" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼", mask: "5123 4567" },
  { code: "+974", country: "Qatar", flag: "🇶🇦", mask: "3312 3456" },
  { code: "+968", country: "Oman", flag: "🇴🇲", mask: "9123 4567" },
];

export default function PhoneInputWithCountry({
  countryCode = "+91",
  onCountryCodeChange,
  phoneNumber = "",
  onPhoneNumberChange,
  placeholder = "Mobile number",
  required = false,
  id = "phone-input",
  disabled = false,
  label = "Phone Number",
  error = "",
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isKnownCode = COUNTRY_CODES.some((c) => c.code === countryCode);
  const [isCustomMode, setIsCustomMode] = useState(!isKnownCode && countryCode !== "");
  const [customDigits, setCustomDigits] = useState(
    countryCode.startsWith("+") ? countryCode.substring(1) : countryCode
  );

  useEffect(() => {
    if (!isKnownCode && countryCode) {
      setIsCustomMode(true);
      setCustomDigits(countryCode.replace(/[^0-9]/g, ""));
    }
  }, [countryCode, isKnownCode]);

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  const handlePhoneChange = (e) => {
    const cleaned = e.target.value.replace(/[^0-9]/g, "");
    onPhoneNumberChange?.(cleaned);
  };

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === "CUSTOM") {
      setIsCustomMode(true);
      setCustomDigits("");
      onCountryCodeChange?.("+");
    } else {
      setIsCustomMode(false);
      onCountryCodeChange?.(val);
    }
  };

  const handleCustomDigitsChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
    setCustomDigits(digits);
    onCountryCodeChange?.(`+${digits}`);
  };

  const handleSwitchToList = () => {
    setIsCustomMode(false);
    onCountryCodeChange?.("+91");
  };

  return (
    <div className="space-y-1.5 w-full text-left">
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="block text-xs font-bold text-textStrong uppercase tracking-wider"
          >
            {label} {required && <span className="text-primary">*</span>}
          </label>
          <button
            type="button"
            onClick={() => {
              if (isCustomMode) {
                handleSwitchToList();
              } else {
                setIsCustomMode(true);
                setCustomDigits("");
                onCountryCodeChange?.("+");
              }
            }}
            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            {isCustomMode ? (
              <>
                <ListFilter className="w-3 h-3" />
                <span>Select from country list</span>
              </>
            ) : (
              <>
                <Globe className="w-3 h-3" />
                <span>Custom code</span>
              </>
            )}
          </button>
        </div>
      )}

      <div
        className={`flex items-center rounded-xl bg-white border transition duration-200 shadow-xs overflow-hidden ${
          error
            ? "border-red-400 ring-2 ring-red-100"
            : isFocused
            ? "border-primary ring-2 ring-orange-100"
            : "border-borderDefault hover:border-slate-300"
        } ${disabled ? "opacity-60 bg-slate-50 cursor-not-allowed" : ""}`}
      >
        {/* CUSTOM CODE INPUT MODE */}
        {isCustomMode ? (
          <div className="flex items-center bg-bgApp border-r border-borderDefault shrink-0 px-2.5 py-1.5 sm:py-2 gap-1">
            <span className="text-xs sm:text-sm font-extrabold text-primary flex items-center gap-0.5">
              <Globe className="w-3.5 h-3.5 text-textMuted" />
              <span>+</span>
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={customDigits}
              onChange={handleCustomDigitsChange}
              placeholder="Code"
              maxLength={4}
              disabled={disabled}
              className="w-12 bg-transparent py-1 text-xs sm:text-sm font-bold text-textStrong focus:outline-none placeholder:text-textMuted/50 font-mono"
              autoFocus
              title="Enter custom international calling code"
            />
            <button
              type="button"
              onClick={handleSwitchToList}
              className="text-textMuted hover:text-textStrong p-0.5 rounded transition"
              title="Switch back to country list"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* STANDARD DROPDOWN SELECTOR */
          <div className="relative flex items-center bg-bgApp border-r border-borderDefault shrink-0 max-w-[140px] sm:max-w-[170px]">
            <select
              value={countryCode}
              onChange={handleSelectChange}
              disabled={disabled}
              className="appearance-none bg-transparent pl-3 pr-7 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-textStrong focus:outline-none cursor-pointer truncate"
              aria-label="Country calling code"
            >
              {COUNTRY_CODES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.flag} {item.code} ({item.country})
                </option>
              ))}
              <option value="CUSTOM">
                🌐 Other / Custom Code (+...)
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-textMuted absolute right-2 pointer-events-none" />
          </div>
        )}

        {/* PHONE NUMBER INPUT */}
        <div className="flex-1 flex items-center px-3 gap-2">
          <Phone className="w-4 h-4 text-textMuted shrink-0" />
          <input
            id={id}
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={
              isCustomMode
                ? "Enter phone number"
                : placeholder || selectedCountry.mask
            }
            required={required}
            disabled={disabled}
            maxLength={15}
            className="w-full bg-transparent py-2.5 sm:py-3 text-xs sm:text-sm text-textStrong placeholder:text-textMuted/60 focus:outline-none font-medium"
          />
        </div>
      </div>

      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}
