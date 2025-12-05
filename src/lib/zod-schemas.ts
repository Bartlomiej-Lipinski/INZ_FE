import { z } from "zod";
import { ALLOWED_PROFILE_PHOTO_TYPES, MAX_PROFILE_PHOTO_SIZE } from "@/lib/constants";

export const passwordSchema = z.string()
    .superRefine((v, ctx) => {
        const errors: string[] = [];
        
        if (v.length < 8) {
            errors.push("co najmniej 8 znaków");
        }
        if (!/[A-Z]/.test(v)) {
            errors.push("wielką literę");
        }
        if (!/[a-z]/.test(v)) {
            errors.push("małą literę");
        }
        if (!/[^A-Za-z0-9]/.test(v)) {
            errors.push("znak specjalny");
        }
        
        if (errors.length > 0) {
            ctx.addIssue({
                code: "custom",
                message: errors.join(", ")
            });
        }
    });

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

export const usernameSchema = z.string()
    .nullable()
    .refine((value) => {
        if (value === "") return true;
        return /^[A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/.test(value ?? "");
    }, {
        message: "Pseudonim może zawierać tylko litery i cyfry"
    });


export const validatePassword = (value: string): string => {
    const result = passwordSchema.safeParse(value);
    return result.success ? "" : "Hasło musi zawierać: " + result.error.issues[0]?.message ;
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

export const validateUsername = (value: string | null): string => {
    const result = usernameSchema.safeParse(value);
    return result.success ? "" : result.error.issues[0]?.message;
};

export const validateAvatarFile = (file: File): string | null => {
    const isAllowedType = ALLOWED_PROFILE_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_PROFILE_PHOTO_TYPES)[number]);
    if (!isAllowedType) {
        return "Obsługiwane formaty zdjęć to JPG, PNG lub WEBP.";
    }

    if (file.size > MAX_PROFILE_PHOTO_SIZE) {
        return "Maksymalny rozmiar zdjęcia to 2 MB.";
    }

    return null;
};

