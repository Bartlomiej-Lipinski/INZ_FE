import { IMAGES } from "@/lib/constants";
import { useState, useEffect } from "react";
import { Button as MuiButton } from '@mui/material';
import Image from "next/image";
import PasswordInput from "@/components/common/Password-input";
import LoadingSpinner from "@/components/common/Loading-spinner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { 
  Box, 
  TextField, 
  Typography 
} from '@mui/material';


export default function SignUpForm() {
    const router = useRouter();
    const { register, isLoading: hookIsLoading, setErrorMessage, error } = useAuth();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [birthDateError, setBirthDateError] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [repeatPasswordError, setRepeatPasswordError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [nameError, setNameError] = useState("");
    const [surnameError, setSurnameError] = useState("");


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

    // EMAIL VALIDATION
    const validateEmail = (value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) {
            return "Podaj adres e-mail";
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(trimmedValue)) {
            return "Podaj poprawny adres e-mail";
        }
        return "";
    };

    // NAME VALIDATION
    const validateName = (value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) {
            return "Podaj imię";
        }
        return "";
    };

    // SURNAME VALIDATION
    const validateSurname = (value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) {
            return "Podaj nazwisko";
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

    

    //HANDLERS
    const handlePasswordChange = (value: string) => {
        setPassword(value);
        setPasswordError(validatePassword(value));
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value; 
        setEmail(value);
        setEmailError(validateEmail(value));
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
        setNameError(validateName(value));
    };

    const handleSurnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSurname(value);
        setSurnameError(validateSurname(value));
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
        const emailErr = validateEmail(email);
        const nameErr = validateName(name);
        const surnameErr = validateSurname(surname);
        const pwdErr = validatePassword(password);
        const birthErr = validateBirthDate(birthDate);
        const repeatPwdErr = repeatPassword !== password ? "Hasła muszą być takie same" : "";
        
        setEmailError(emailErr);
        setPasswordError(pwdErr);
        setBirthDateError(birthErr);
        setRepeatPasswordError(repeatPwdErr);
        setNameError(nameErr);
        setSurnameError(surnameErr);

        if (emailErr || nameErr || surnameErr || pwdErr || birthErr || repeatPwdErr) {
            setErrorMessage("Popraw błędy!");
            return;
        }
        setErrorMessage("");
        
        try {
            const response = await register({
                email,
                name,
                surname,
                userName: email.trim().toLowerCase(),
                birthDate,
                password
            });


            if (response && (response.success !== false)) {
                console.log('Register successful, response:', response);
                router.push('/');
            } else {
                if (response?.message === "Email already exists.") {
                    setEmailError("Ten adres e-mail jest już zajęty");
            }
         }
        } catch (error: any) {
            console.log('Register error:', error);
        }
    };


    useEffect(() => {
        if (!passwordError && !birthDateError && !repeatPasswordError && !emailError && !nameError && !surnameError && error) {
                setErrorMessage("");
        }
    }, [passwordError, birthDateError, repeatPasswordError, emailError, nameError, surnameError, error]);



    //RENDER
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                minHeight: '100vh',
            }}
        >
            
            <Image 
                    src={IMAGES.MATES_LOGO} 
                    alt="Logo" 
                    width={150} 
                    height={130} 
                    style={{ marginTop: 30, marginBottom: 40 }} 
                />
                
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    width: '100%',
                    maxWidth: 290,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
               

                <TextField
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    label="E-mail"
                    required
                    error={!!emailError}
                    helperText={emailError}
                    fullWidth
                />

                <TextField
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    label="Imię"
                    required
                    error={!!nameError}
                    helperText={nameError}
                    fullWidth
                />

                <TextField
                    type="text"
                    value={surname}
                    onChange={handleSurnameChange}
                    label="Nazwisko"
                    required
                    error={!!surnameError}
                    helperText={surnameError}
                    fullWidth
                />

                <TextField
                    type="date"
                    value={birthDate}
                    onChange={handleBirthDateChange}
                    label="Data urodzenia"
                    required
                    error={!!birthDateError}
                    helperText={birthDateError}
                    fullWidth
                    sx={{
                        '& input[type="date"]::-webkit-calendar-picker-indicator': {
                            
                            filter: 'invert(1)',
                            opacity: 0.3,
                            marginRight: '-18px',
                            cursor: 'pointer'
                        }
                    }}
                />

                <PasswordInput
                    value={password}
                    onChange={e => handlePasswordChange(e.target.value)}
                    error={passwordError}
                    required
                    label="Hasło"
        
                />

                <PasswordInput
                    value={repeatPassword}
                    onChange={e => handleRepeatPasswordChange(e.target.value)}
                    error={repeatPasswordError}
                    required
                    label="Powtórz hasło"
             
                />

                {error && (
                    <Typography
                        sx={{
                            color: 'error.main',
                            fontSize: '14px',
                            textAlign: 'center',
                            mt: -1,
                            mb: -1
                        }}
                    >
                        {error}
                    </Typography>
                )}

                <MuiButton
                    type="submit"
                    variant="contained"
                    sx={{  mb: 5 }}
                    disabled={hookIsLoading}
                >
                    {hookIsLoading ? <LoadingSpinner /> : "Potwierdź"}
                </MuiButton>
            </Box>
        </Box>
    );
}