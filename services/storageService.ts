import { VisitedBusiness } from '../types';

const VISITED_BUSINESSES_KEY_PREFIX = 'verdeImportsVinoRoutVisitedBusinesses';

const getKeyForUser = (username: string) => `${VISITED_BUSINESSES_KEY_PREFIX}_${username}`;

/**
 * Retrieves the list of visited businesses for a specific user from localStorage.
 * Handles migration for older data formats.
 * @returns {VisitedBusiness[]} An array of visited business objects.
 */
export const getVisitedBusinesses = (username: string): VisitedBusiness[] => {
    if (!username) return [];
    try {
        const storedData = localStorage.getItem(getKeyForUser(username));
        if (storedData) {
            const businesses = JSON.parse(storedData);
            if (Array.isArray(businesses)) {
                 // Migration for old data that doesn't have a status
                return businesses.map(b => ({
                    ...b,
                    status: b.status || 'successful' // Default old "visited" to 'successful'
                }));
            }
        }
        return [];
    } catch (error) {
        console.error("Failed to parse visited businesses from localStorage", error);
        return [];
    }
};

/**
 * Adds or updates a business in the visited list for a user in localStorage.
 * @param {Omit<VisitedBusiness, 'visitedDate'>} business The business object to add/update.
 * @param {string} username The current user's username.
 */
export const addVisitedBusiness = (business: Omit<VisitedBusiness, 'visitedDate'>, username: string): void => {
    if (!username) return;
    try {
        const currentBusinesses = getVisitedBusinesses(username);
        const newBusinessWithDate: VisitedBusiness = {
            ...business,
            visitedDate: new Date().toISOString(),
        };

        const otherBusinesses = currentBusinesses.filter(b => b.address !== business.address);
        const newBusinesses = [...otherBusinesses, newBusinessWithDate];
        localStorage.setItem(getKeyForUser(username), JSON.stringify(newBusinesses));
    } catch (error) {
        console.error("Failed to save visited business to localStorage", error);
    }
};


/**
 * Removes a business address from the user's visited list in localStorage.
 * @param {string} address The address to remove.
 * @param {string} username The current user's username.
 */
export const removeVisitedBusiness = (address: string, username: string): void => {
    if (!username) return;
    try {
        const currentBusinesses = getVisitedBusinesses(username);
        const newBusinesses = currentBusinesses.filter(b => b.address !== address);
        localStorage.setItem(getKeyForUser(username), JSON.stringify(newBusinesses));
    } catch (error) {
        console.error("Failed to remove visited business from localStorage", error);
    }
};

/**
 * Clears all visited business history for a user from localStorage.
 * @param {string} username The current user's username.
 */
export const clearAllVisitedBusinesses = (username: string): void => {
    if (!username) return;
    try {
        localStorage.removeItem(getKeyForUser(username));
    } catch (error) {
        console.error("Failed to clear visited business history from localStorage", error);
    }
};