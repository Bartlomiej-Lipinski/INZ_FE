"use client";
// @ts-ignore
// Jeśli pojawi się błąd z JSX, upewnij się, że tsconfig.json ma "jsx": "preserve" lub "react-jsx"

import { useState } from "react";
import Button from "../components/Button";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs mx-auto items-center justify-center min-h-screen">
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        className="border rounded px-3 py-2"
        required
      />
      <input
        type="password"
        placeholder="Hasło"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        className="border rounded px-3 py-2"
        required
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button background="#786599">Zaloguj się</Button>
    </form>
  );
} 