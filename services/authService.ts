// This is a simplified, insecure auth service for demonstration purposes using localStorage.
// DO NOT use this in a production environment.

const USERS_KEY = 'verdeImportsVinoRoutUsers';
const CURRENT_USER_SESSION_KEY = 'verdeImportsVinoRoutCurrentUser';

// Helper to get users from localStorage
const getUsers = (): Record<string, string> => {
    try {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : {};
    } catch (e) {
        return {};
    }
};

// Helper to save users to localStorage
const saveUsers = (users: Record<string, string>): void => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const signUp = (username: string, password: string): { success: boolean; message: string } => {
    const users = getUsers();
    if (users[username]) {
        return { success: false, message: 'Username already exists.' };
    }
    users[username] = password; // In a real app, hash the password!
    saveUsers(users);
    return { success: true, message: 'Sign up successful! Please sign in.' };
};

export const signIn = (username: string, password: string): { success: boolean; message: string } => {
    const users = getUsers();
    if (users[username] && users[username] === password) {
        localStorage.setItem(CURRENT_USER_SESSION_KEY, username);
        return { success: true, message: 'Sign in successful.' };
    }
    return { success: false, message: 'Invalid username or password.' };
};

export const signOut = (): void => {
    localStorage.removeItem(CURRENT_USER_SESSION_KEY);
};

export const getCurrentUser = (): string | null => {
    return localStorage.getItem(CURRENT_USER_SESSION_KEY);
};