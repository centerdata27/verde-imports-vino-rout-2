import { GoogleGenAI, Type } from "@google/genai";
import { Business } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: "AIzaSyB2HZmk7gmZyPOCr8oKi6P7eIaO99zLHRo" });

const businessSchema = {
    type: Type.OBJECT,
    properties: {
        name: {
            type: Type.STRING,
            description: "The full name of the business.",
        },
        address: {
            type: Type.STRING,
            description: "The complete street address of the business.",
        },
        phone: {
            type: Type.STRING,
            description: "The primary phone number of the business, if available."
        },
        latitude: {
            type: Type.NUMBER,
            description: "The geographical latitude of the business location."
        },
        longitude: {
            type: Type.NUMBER,
            description: "The geographical longitude of the business location."
        },
        prospectReason: {
            type: Type.STRING,
            description: "A short, compelling reason why this business is a good prospect for a new wine supplier. For example, 'Large liquor store with a dedicated fine wine section'."
        },
    },
    required: ["name", "address", "latitude", "longitude", "prospectReason"],
};

export const fetchBusinessesForRoute = async (location: string): Promise<Omit<Business, 'status' | 'previouslyVisited' | 'distance'>[]> => {
    const prompt = `Generate a list of 15-20 potential clients for a wine salesperson targeting liquor stores in or near "${location}". These businesses should be good prospects for purchasing new wine selections. Adhere strictly to the provided JSON schema for the response.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: businessSchema
                },
            },
        });

        const jsonText = response.text.trim();
        const businesses = JSON.parse(jsonText);
        
        if (!Array.isArray(businesses)) {
            throw new Error("API did not return a valid array.");
        }
        
        return businesses;
    } catch (error) {
        console.error("Error fetching data from Gemini API:", error);
        throw new Error("Failed to generate route due to a server error. Please try again in a few moments.");
    }
};