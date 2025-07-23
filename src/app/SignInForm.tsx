"use client";

import { useState, useEffect } from "react";
import Button from "../components/Button";
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { colors } from "@mui/material";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //if (!email || !password) {
    setError("Nieprawidłowy e-mail lub hasło");
    //   return;
    // }
    // setError("");
    alert(`Zalogowano jako: ${email}`);
  };

  return (
    <div className="flex flex-col w-full items-center justify-center ">

      <img src="/Keep.png" alt="Logo" className="w-40 h-40 mb-10 mt-10 sm:mt-20 2xl:mt-50" />


      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs items-center justify-center">
        <label className="flex flex-col w-5/6 sm:w-full text-white mb-2">
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
              onClick={() => alert('Funkcja resetowania hasła jeszcze nie jest dostępna. (SignInForm.tsx)')}
            >
              Rejestracja
            </button>
            <span style={{ color: "#8D8C8C", fontSize: "18px" }}>{'\u2B60'}</span>
          </Stack>
        </Stack>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <Button background="#786599" style={{ marginTop: "10px" }}>Zaloguj się</Button>
      </form>
    </div>
  );
} 