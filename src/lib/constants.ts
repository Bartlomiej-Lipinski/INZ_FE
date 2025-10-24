
export const IMAGES = {
  MATES_LOGO: "/mates.png",
} as const; 


export const BASE_URL = "https://localhost:7215";

export const API_ENDPOINTS = {
  LOGIN: `${BASE_URL}/api/auth/login`,
  REGISTER: `${BASE_URL}/api/auth/register`,
  USERS: `${BASE_URL}/users`,
} as const; 

