export const API_ROUTES = {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    USER_BY_ID: '/api/user',
    VERIFY_2FA: '/api/auth/2FA',
    USER_GROUPS: '/api/user/groups',
    ADD_GROUP: '/api/group',
} as const; 