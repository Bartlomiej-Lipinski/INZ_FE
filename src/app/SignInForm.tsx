"use client";

import { useState } from "react";
import Button from "../components/Button";
import Stack from '@mui/material/Stack';

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Wprowadź e-mail i hasło.");
      return;
    }
    setError("");
    alert(`Zalogowano jako: ${email}`);
  };

  return (
    <Stack className="flex flex-col w-full items-center justify-center min-h-screen">
      
      <img src="/Keep.png" alt="Logo" className="w-40 h-40 mx-auto mb-4 mt-30" />

      <div className="h-9"></div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs mx-auto items-center justify-center">
      <label className="flex flex-col w-5/6 sm:w-full text-white">
        E-mail
        <input
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          className="inputStyle"
          required
        />
      </label>
      <label className="flex flex-col w-5/6 sm:w-full text-white">
        Hasło
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="inputStyle"
          required
        />
      </label>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button background="#786599">Zaloguj się</Button>
    </form>



       <Button background="#786599" style={{ marginTop: "auto" , marginBottom: "40px"}}>Zarejestruj się</Button>
    </Stack>
  );
} 