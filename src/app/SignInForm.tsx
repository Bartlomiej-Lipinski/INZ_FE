"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Image from "next/image";
import { IMAGES, API_ENDPOINTS } from "@/lib/constants";
import PasswordInput from "@/components/PasswordInput";


export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError("");


    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Email: email.trim(),
          Password: password
        }),
      });


      if (response.ok) {
        router.push('/verification');
        return;
      } else if (response.status === 401 || response.status === 403) {
        setError("Nieprawidłowy e-mail lub hasło");
      } else {
        setError("Wystąpił błąd podczas logowania. Spróbuj ponownie.");
      }
    } catch (error) {
      console.error('Błąd logowania:', error);
      setError("Wystąpił błąd połączenia");
    } finally {
      setIsLoading(false);
    }
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
            onChange={handleEmailChange}
            className="inputStyle focus:ring-lilac"
            autoComplete="email"
            required
            disabled={isLoading}
          />
        </label>

        <PasswordInput
          value={password}
          onChange={handlePasswordChange}
          required
          label="Hasło"
          disabled={isLoading}
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
            disabled={isLoading}
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
              disabled={isLoading}
            >
              Rejestracja
            </button>
            <span style={{ color: "#8D8C8C", fontSize: "18px" }}>{'\u2B60'}</span>
          </Stack>
        </Stack>

        {error && (
          <div className="text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <Button 
          background="#786599" 
          className="mb-20" 
          style={{ marginTop: "10px" }}
          disabled={isLoading}
        >
          {isLoading ? "Logowanie..." : "Zaloguj się"}
        </Button>

      </form>
    </div>
  );
} 