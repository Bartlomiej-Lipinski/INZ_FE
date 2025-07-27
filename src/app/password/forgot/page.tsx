"use client";

import { useState } from "react";
import Button from "@/components/Button";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Dodać logikę wysyłki maila resetującego hasło
        setSent(true);
    };


    return (
        <div className="fixed inset-0 flex items-center justify-center w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs items-center justify-center ">

                <h2 className="text-xl font-bold mb-2 text-lilac">Resetowanie hasła</h2>

                {sent ? (

                        <label className="inputStyle flex flex-col w-5/6 sm:w-full text-white text-center" >
                            Jeśli posiadasz konto powiązane z tym adresem e-mail, wysłaliśmy instrukcję resetowania hasła.
                        </label>
   
                ) : (
                    <>
                        <label className="flex flex-col w-5/6 sm:w-full text-white ">
                            E-mail
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="inputStyle focus:ring-lilac mt-1"
                                autoComplete="email"
                                required
                            />
                        </label>

                        <Button background="#786599" style={{ marginTop: "10px" }}>Wyślij link resetujący</Button>

                    </>
                )}
            </form>
        </div>
    );
}
