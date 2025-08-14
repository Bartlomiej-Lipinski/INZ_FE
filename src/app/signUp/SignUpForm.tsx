import { IMAGES } from "@/lib/constants";


import { useState, useEffect } from "react";
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
    const [repeatPassword, setRepeatPassword] = useState("");
    const [repeatPasswordError, setRepeatPasswordError] = useState("");
    const [emailError, setEmailError] = useState("");


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


    const handleRepeatPasswordChange = (value: string) => {
        setRepeatPassword(value);
        if (value !== password) {
            setRepeatPasswordError("Hasła muszą być takie same");
        } else {
            setRepeatPasswordError("");
        }
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const pwdErr = validatePassword(password);
        const birthErr = validateBirthDate(birthDate);
        const repeatPwdErr = repeatPassword !== password ? "Hasła muszą być takie same" : "";
        setPasswordError(pwdErr);
        setBirthDateError(birthErr);
        setRepeatPasswordError(repeatPwdErr);
        setEmailError(""); 

        if (pwdErr || birthErr || repeatPwdErr) {
            setError("Popraw błędy!");
            return;
        }
        setError("");
        
        try {
            const response = await fetch('https://localhost:7215/api/Auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Name: name,
                    UserName: email, 
                    Surname: surname,
                    Email: email,
                    BirthDate: birthDate,
                    Password: password
                })
            });


            if (response.ok) {
                const userId = await response.text();
                alert(`Rejestracja zakończona pomyślnie! ID użytkownika: ${userId}`);
            } else if (response.status === 500) {
                const errorData = await response.json();
                if (errorData.error?.message === "Email already exists.") {
                    setEmailError("Ten adres e-mail jest już zajęty");
                    setError("Popraw błędy!");
                } else {
                    setError("Wystąpił błąd podczas rejestracji");
                }
            } else {
                setError("Wystąpił błąd podczas rejestracji");
            }
        } catch (error) {
            console.error('Błąd podczas rejestracji:', error);
            setError("Błąd połączenia z serwerem");
        }
    };


    useEffect(() => {
        if (!passwordError && !birthDateError && !repeatPasswordError && !emailError && error) {
            setError("");
        }
    }, [passwordError, birthDateError, repeatPasswordError, emailError, error]);



    //RENDER
    return (
        <div className="flex items-center justify-center w-full min-h-screen">

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs items-center justify-center">
                <Image src={IMAGES.KEEP_LOGO} alt="Logo" width={150} height={150} style={{marginTop: 15}} />

                <label className="flex flex-col w-5/6 sm:w-full text-white mb-2">
                    E-mail*
                    <input
                        type="email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        className="inputStyle focus:ring-lilac"
                        required
                    />
                    {emailError && <span className="text-red-400 text-sm mt-2 text-center block">{emailError}</span>}
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
                    {birthDateError && <span className="text-red-400 text-sm mt-2 text-center block">{birthDateError}</span>}
                </label>


                <PasswordInput
                    value={password}
                    onChange={e => handlePasswordChange(e.target.value)}
                    error={passwordError}
                    required
                    label="Hasło*"
                />

                <PasswordInput
                    value={repeatPassword}
                    onChange={e => handleRepeatPasswordChange(e.target.value)}
                    error={repeatPasswordError}
                    required
                    label="Powtórz hasło*"
                />

                {error && <div className="text-red-400 text-sm mt-2">{error}</div>}

                <Button background="#786599" className="mb-20 " style={{ marginTop: "10px" }}>Potwierdź</Button>

            </form>
        </div>
    );
} 
