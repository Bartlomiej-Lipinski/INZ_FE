import { IMAGES } from "@/lib/constants";


import { useState } from "react";
import Button from "@/components/Button";
import Image from "next/image";
import PasswordInput from "@/components/PasswordInput";


export default function SignUpForm() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [birthDateError, setBirthDateError] = useState("");


    // PASSWORD VALIDATION
    const validatePassword = (value: string) => {
        if (value.length < 8) {
            return "Hasło musi mieć co najmniej 8 znaków";
        }
        if (!/[A-Z]/.test(value)) {
            return "Hasło musi zawierać wielką literę";
        }
        if (!/[a-z]/.test(value)) {
            return "Hasło musi zawierać małą literę";
        }
        if (!/[^A-Za-z0-9]/.test(value)) {
            return "Hasło musi zawierać znak specjalny";
        }
        return "";
    };

    // BIRTH DATE VALIDATION
    const validateBirthDate = (value: string) => {
        if (!value) return "Podaj datę urodzenia";
        const today = new Date();
        const birth = new Date(value);
        const age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            return age - 1 >= 13 ? "" : "Musisz mieć co najmniej 13 lat";
        }
        return age >= 13 ? "" : "Musisz mieć co najmniej 13 lat";
    };

    

    //HANDLES
    const handlePasswordChange = (value: string) => {
        setPassword(value);
        setPasswordError(validatePassword(value));
    };

    
    const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setBirthDate(value);
        setBirthDateError(validateBirthDate(value));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const pwdErr = validatePassword(password);
        const birthErr = validateBirthDate(birthDate);
        setPasswordError(pwdErr);
        setBirthDateError(birthErr);
        if (pwdErr || birthErr) {
            setError("Popraw błędy w formularzu");
            return;
        }
        setError("");
        alert(`Zalogowano jako: ${email}`);                     //<--- zmiana logiki handleSubmit
    };



    return (
        <div className="flex items-center justify-center w-full min-h-screen">

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

                <label className="flex flex-col w-5/6 sm:w-full text-white">
                    Data urodzenia*
                    <input
                        type="date"
                        value={birthDate}
                        onChange={handleBirthDateChange}
                        className="inputStyle focus:ring-lilac h-10"
                        required
                    />
                    {birthDateError && <span className="text-red-500 text-xs mt-1 text-center block">{birthDateError}</span>}
                </label>


                <PasswordInput
                    value={password}
                    onChange={e => handlePasswordChange(e.target.value)}
                    error={passwordError}
                    required
                    label="Hasło*"
                />
               

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <Button background="#786599" className="mb-20 " style={{ marginTop: "10px" }}>Potwierdź</Button>

            </form>
        </div>
    );
} 
