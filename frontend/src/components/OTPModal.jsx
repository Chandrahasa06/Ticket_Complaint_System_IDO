import React, { useState, useRef } from "react";
import CustomToast from "./CustomToast";

const OTPModal = ({ isOpen, email, username, password,phone, onClose, onSuccess }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const inputsRef = useRef([]);

  if (!isOpen) return null;

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // move to next input
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    if(loading) return;
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      CustomToast("Enter complete OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3000/api/user/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: finalOtp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        CustomToast(data.message || "OTP Verification Failed");
        return;
      }

      const res2 = await fetch("http://localhost:3000/api/user/register", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, email: email, password: password, phone: phone }),
      });
      const data2 = await res2.json();
      if (!res2.ok) { 
        CustomToast(data2.message || "Registration Failed"); 
        return; 
      }

      setOtp(["", "", "", "", "", ""]);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      CustomToast("Server error");
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-md">
    
    <div className="w-[90%] max-w-sm p-8 rounded-3xl bg-white shadow-[0_30px_100px_rgba(0,0,0,0.12)] border border-gray-200 text-center">

      {/* Header */}
      <div className="mb-6">
        <div className="mx-auto mb-3 flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 shadow-md">
          <svg width="30" height="30" fill="none" stroke="white" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 3l7 4v5c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4" />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-gray-800">
          Verify OTP
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Sent to {email}
        </p>
      </div>

      {/* OTP Boxes */}
      <div className="flex justify-between gap-1 sm:gap-2 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            value={digit}
            maxLength={1}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="w-9 h-10 sm:w-10 sm:h-11 text-center text-lg rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        ))}
      </div>

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={loading}
        style={{background:"linear-gradient(135deg,#6366f1,#0ea5e9)"}}
        className="w-full py-3 rounded-2xl text-white font-medium shadow-md"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      {/* Cancel */}
      <button
        onClick={() => {
          setOtp(["", "", "", "", "", ""]);
          onClose();
        }}
        className="mt-3 text-sm text-gray-500 hover:text-gray-700"
      >
        Cancel
      </button>
    </div>
  </div>
);
};

export default OTPModal;