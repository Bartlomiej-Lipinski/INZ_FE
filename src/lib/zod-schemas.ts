import { z } from "zod";

export const passwordSchema = z.string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .refine((v: string) => /[A-Z]/.test(v), "Hasło musi zawierać wielką literę")
    .refine((v: string) => /[a-z]/.test(v), "Hasło musi zawierać małą literę")
    .refine((v: string) => /[^A-Za-z0-9]/.test(v), "Hasło musi zawierać znak specjalny");

export const emailSchema = z.string()
    .trim()
    .min(1, "Podaj adres e-mail")
    .email({ message: "Podaj poprawny adres e-mail" });

    
export const requiredInputSchema = (message: string) => z.string()
    .trim()
    .min(1, message);


export const birthDateSchema = z.string()
    .min(1, "Podaj datę urodzenia")
    .refine((value: string) => {
        const birth = new Date(value);
        if (isNaN(birth.getTime())) return false;
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age -= 1;
        }
        return age >= 13;
    }, {
        message: "Musisz mieć co najmniej 13 lat"
    });


export const validatePassword = (value: string): string => {
    const result = passwordSchema.safeParse(value);
    return result.success ? "" : result.error.issues[0]?.message ;
};

export const validateEmail = (value: string): string => {
    const result = emailSchema.safeParse(value);
    return result.success ? "" : result.error.issues[0]?.message ;
};

export const validateRequiredInput = (value: string, message: string): string => {
    const result = requiredInputSchema(message).safeParse(value);
    return result.success ? "" : result.error.issues[0]?.message;
};

export const validateBirthDate = (value: string): string => {
    const result = birthDateSchema.safeParse(value);
    return result.success ? "" : result.error.issues[0]?.message;
};

