"use client";

import Image from "next/image";
import { IMAGES } from "@/lib/constants";
import VerificationForm from "./VerificationForm";

export default function VerificationPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      
      <Image src={IMAGES.MATES_LOGO} alt="Logo" width={280} height={250} />
      
      <h1 className="text-white text-2xl font-semibold text-center pb-2 pt-2">
        Weryfikacja dwuetapowa
      </h1>

      <p className="text-gray-300 text-center text-sm pb-7 px-10 break-words">  
        Wprowadź kod weryfikacyjny wysłany na Twój adres e-mail 
      </p>

      <VerificationForm />
    </div>
  );
}
