"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Image from "next/image";
import { IMAGES } from "@/lib/constants";
import PasswordInput from "@/components/PasswordInput";


export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        //if (!email || !password) {
        // setError("Nieprawidłowy e-mail lub hasło");
        //   return;
        // }                                                      <--- dodać logikę wyświeltania erroru
    e.preventDefault();
    if (!email || !password) {
      setError("Nieprawidłowy e-mail lub hasło");
      return;
    }
    setError("");                                        
    router.push('/verification');                     //Zmiana logiki pod backend
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full">

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs items-center justify-center">
       <Image src={IMAGES.KEEP_LOGO} alt="Logo" width={280} height={250}/>
        <label className="flex flex-col w-5/6 sm:w-full text-white mb-2">
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            className="inputStyle focus:ring-lilac"
            autoComplete="email"
            required
          />
        </label>

        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          label="Hasło"
        />




        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem style={{ borderColor: '#8D8C8C' }} />}
          spacing={1}
        >
          <button
            type="button"
            style={{ color: "#8D8C8C", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => alert('Funkcja resetowania hasła jeszcze nie jest dostępna. (SignInForm.tsx)')}
          >
            Zapomniałeś hasła?
          </button>

          <Stack
            direction="row"
            spacing={0.5}
          >
            <button
              type="button"
              style={{ color: "#8D8C8C", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => router.push('/signUp')}
            >
              Rejestracja
            </button>
            <span style={{ color: "#8D8C8C", fontSize: "18px" }}>{'\u2B60'}</span>
          </Stack>
        </Stack>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <Button background="#786599" className="mb-20" style={{ marginTop: "10px" }}>Zaloguj się</Button>

      </form>
    </div>
  );
} 