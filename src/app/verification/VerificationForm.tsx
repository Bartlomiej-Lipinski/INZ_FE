"use client";

import { useState, useRef } from "react";
import Button from "@/components/Button";

export default function VerificationForm() {
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);


  //HANDLES
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setError("");

    // Przejście do następnego pola
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Przejście do poprzedniego pola 
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = () => {
    const code = verificationCode.join("");
    if (code.length !== 6) {
      setError("Wprowadź pełny kod weryfikacyjny");
      return;
    }
    
                                                                                    // Dodać logikę weryfikacji kodu
    console.log("Kod weryfikacyjny:", code);
    alert(`Kod weryfikacyjny: ${code} - funkcja weryfikacji jeszcze nie jest dostępna`);
  };

  const handleResendCode = () => {
    setIsResending(true);
   
    setTimeout(() => {
      setIsResending(false);
      alert("Kod weryfikacyjny został wysłany ponownie");                           // Dodać logikę wysłania kodu
    }, 2000);
  };

  const isCodeComplete = verificationCode.every(digit => digit !== "");



  //RENDER
  return (
    <div className="flex flex-col gap-3 w-full max-w-xs items-center justify-center mb-20">
 
      <div className="flex gap-2 justify-center ">
        {verificationCode.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-center text-lg font-semibold bg-transparent border border-gray rounded-lg focus:border-lilac focus:ring-2 focus:ring-lilac focus:outline-none text-white"
            maxLength={1}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        ))}
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={isResending}
          style={{ color: "#8D8C8C", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
        >
          {isResending ? "Wysyłanie..." : "Wyślij ponownie kod"}
        </button>

        <Button 
          background="#786599" 
          onClick={handleVerifyCode}
          disabled={!isCodeComplete}
          className={!isCodeComplete ? "opacity-50 cursor-not-allowed focus:outline-none focus:ring-0" : ""}
        >
          Zweryfikuj kod
        </Button>
      </div>
    </div>
  );
} 