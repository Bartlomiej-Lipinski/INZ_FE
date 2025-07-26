import { IMAGES } from "@/lib/constants";


import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react"; // opcjonalnie ikony


export default function SignUpForm() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        //if (!email || !password) {
        setError("Nieprawidłowy e-mail lub hasło");
        //   return;
        // }                                                      <--- dodać logikę wyświeltania erroru
        setError("");
        alert(`Zalogowano jako: ${email}`);                     //<--- zmiana logiki handleSubmit
    };

    return (
        <div className=" flex items-center justify-center w-full">

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs items-center justify-center">
                <Image src={IMAGES.KEEP_LOGO} alt="Logo" width={200} height={200}  />

                <label className="flex flex-col w-5/6 sm:w-full text-white mb-2">
                    E-mail*
                    <input
                        type="email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        className="inputStyle focus:ring-lilac"
                        required
                    />
                </label>

                <label className="flex flex-col w-5/6 sm:w-full text-white mb-2">
                    Imię*
                    <input
                        type="text"
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        className="inputStyle focus:ring-lilac"
                        required
                    />
                </label>

                <label className="flex flex-col w-5/6 sm:w-full text-white mb-2">
                    Nazwisko*
                    <input
                        type="text"
                        value={surname}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSurname(e.target.value)}
                        className="inputStyle focus:ring-lilac"
                        required
                    />
                </label>

                <label className="flex flex-col w-5/6 sm:w-full text-white mb-2 ">
                    Data urodzenia*
                    <input
                        type="date"
                        value={birthDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBirthDate(e.target.value)}
                        className="inputStyle focus:ring-lilac h-10"
                        required
                    />
                </label>


                <label className="flex flex-col w-5/6 sm:w-full text-white">
                    Hasło*
                    <div className="relative w-full">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="inputStyle focus:ring-lilac w-full" style={{ paddingRight: "35px" }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="myGray absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                </label>
               

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <Button background="#786599" className="mb-20 " style={{ marginTop: "10px" }}>Potwierdź</Button>

            </form>
        </div>
    );
} 
