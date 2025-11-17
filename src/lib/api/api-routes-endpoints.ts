export const API_ROUTES = {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    USER_BY_ID: '/api/user',
    VERIFY_2FA: '/api/auth/2FA',
    USER_GROUPS: '/api/user/groups',
    GROUP_BY_ID: '/api/group',
    ADD_GROUP: '/api/group',
    LOGOUT: '/api/auth/logout',
    JOIN_GROUP: '/api/group/join'
} as const; 