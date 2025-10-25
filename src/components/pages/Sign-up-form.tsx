import { API_ENDPOINTS, IMAGES } from "@/lib/constants";
import { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import Image from "next/image";
import PasswordInput from "@/components/common/Password-input";
import LoadingDots from "@/components/common/Loading-spinner";
import { useRouter } from "next/navigation";
import { 
  Box, 
  TextField, 
  Typography 
} from '@mui/material';


export default function SignUpForm() {
    const router = useRouter();
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
    const [nameError, setNameError] = useState("");
    const [surnameError, setSurnameError] = useState("");
    const [isLoading, setIsLoading] = useState(false);


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
            setError("Popraw błędy!");
            return;
        }
        setError("");
        
        setIsLoading(true);
        
        try {
            const response = await fetch(API_ENDPOINTS.REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Name: name.trim(),
                    UserName: email.trim().toLowerCase(), 
                    Surname: surname.trim(),
                    Email: email.trim().toLowerCase(),
                    BirthDate: birthDate,
                    Password: password
                })
            });


            if (response.ok) {
                router.push('/');
                return; 
                
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
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        if (!passwordError && !birthDateError && !repeatPasswordError && !emailError && !nameError && !surnameError && error) {
            setError("");
        }
    }, [passwordError, birthDateError, repeatPasswordError, emailError, nameError, surnameError, error]);



    //RENDER
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                minHeight: '100vh',
            }}
        >
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    width: '100%',
                    maxWidth: 320,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Image 
                    src={IMAGES.MATES_LOGO} 
                    alt="Logo" 
                    width={150} 
                    height={130} 
                    style={{ marginTop: 15 }} 
                />

                <TextField
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    label="E-mail*"
                    required
                    error={!!emailError}
                    helperText={emailError}
                    fullWidth
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: 'rgba(125, 125, 125, 0.5)',
                            color: 'white',
                            '& fieldset': {
                                borderColor: 'transparent',
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(144, 66, 251, 0.3)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 2,
                            },
                            '&.Mui-error fieldset': {
                                borderColor: 'error.main',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: 'white',
                            '&.Mui-focused': {
                                color: 'primary.main',
                            },
                            '&.Mui-error': {
                                color: 'error.main',
                            },
                        },
                        '& .MuiFormHelperText-root': {
                            color: 'error.main',
                            textAlign: 'center',
                        },
                    }}
                />

                <TextField
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    label="Imię*"
                    required
                    error={!!nameError}
                    helperText={nameError}
                    fullWidth
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: 'rgba(125, 125, 125, 0.5)',
                            color: 'white',
                            '& fieldset': {
                                borderColor: 'transparent',
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(144, 66, 251, 0.3)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 2,
                            },
                            '&.Mui-error fieldset': {
                                borderColor: 'error.main',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: 'white',
                            '&.Mui-focused': {
                                color: 'primary.main',
                            },
                            '&.Mui-error': {
                                color: 'error.main',
                            },
                        },
                        '& .MuiFormHelperText-root': {
                            color: 'error.main',
                            textAlign: 'center',
                        },
                    }}
                />

                <TextField
                    type="text"
                    value={surname}
                    onChange={handleSurnameChange}
                    label="Nazwisko*"
                    required
                    error={!!surnameError}
                    helperText={surnameError}
                    fullWidth
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: 'rgba(125, 125, 125, 0.5)',
                            color: 'white',
                            '& fieldset': {
                                borderColor: 'transparent',
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(144, 66, 251, 0.3)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 2,
                            },
                            '&.Mui-error fieldset': {
                                borderColor: 'error.main',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: 'white',
                            '&.Mui-focused': {
                                color: 'primary.main',
                            },
                            '&.Mui-error': {
                                color: 'error.main',
                            },
                        },
                        '& .MuiFormHelperText-root': {
                            color: 'error.main',
                            textAlign: 'center',
                        },
                    }}
                />

                <TextField
                    type="date"
                    value={birthDate}
                    onChange={handleBirthDateChange}
                    label="Data urodzenia*"
                    required
                    error={!!birthDateError}
                    helperText={birthDateError}
                    fullWidth
                    InputLabelProps={{
                        shrink: true,
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: 'rgba(125, 125, 125, 0.5)',
                            color: 'white',
                            height: 56,
                            '& fieldset': {
                                borderColor: 'transparent',
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(144, 66, 251, 0.3)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 2,
                            },
                            '&.Mui-error fieldset': {
                                borderColor: 'error.main',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: 'white',
                            '&.Mui-focused': {
                                color: 'primary.main',
                            },
                            '&.Mui-error': {
                                color: 'error.main',
                            },
                        },
                        '& .MuiFormHelperText-root': {
                            color: 'error.main',
                            textAlign: 'center',
                        },
                    }}
                />

                <PasswordInput
                    value={password}
                    onChange={e => handlePasswordChange(e.target.value)}
                    error={passwordError}
                    required
                    label="Hasło*"
                    sx={{ width: '100%' }}
                />

                <PasswordInput
                    value={repeatPassword}
                    onChange={e => handleRepeatPasswordChange(e.target.value)}
                    error={repeatPasswordError}
                    required
                    label="Powtórz hasło*"
                    sx={{ width: '100%' }}
                />

                {error && (
                    <Typography
                        sx={{
                            color: 'error.main',
                            fontSize: '14px',
                            textAlign: 'center',
                            mt: 1,
                        }}
                    >
                        {error}
                    </Typography>
                )}

                <Button
                    type="submit"
                    sx={{ mt: 1, mb: 5 }}
                    disabled={isLoading}
                >
                    {isLoading ? <LoadingDots /> : "Potwierdź"}
                </Button>
            </Box>
        </Box>
    );
}