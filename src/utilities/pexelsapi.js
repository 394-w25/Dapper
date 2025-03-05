import axios from "axios";
import { ref, get } from "firebase/database";
import { database } from "./firebase";

const fetchApiKey = async () => {
    try {
        // Fetch API Key from Firebase
        // Big ups to @aust1inn
        const apiKeyRef = ref(database, "config/pexels_api_key");
        const snapshot = await get(apiKeyRef);

        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.error("API Key not found in Firebase");
            return null;
        }
    } catch (error) {
        console.error("Error fetching API Key:", error);
        return null;
    }
};

// Fetch Outfit Inspirations from Pexels API
export const fetchOutfitInspirations = async (query = "mens fashion outfits", page = 1) => {
    try {
        const apiKey = await fetchApiKey();
        if (!apiKey) {
            console.error("API key not available.");
            return [];
        }

        const response = await axios.get("https://api.pexels.com/v1/search", {
            headers: { Authorization: apiKey },
            params: { query, per_page: 40, page, orientation: "portrait" },
        });

        return response.data.photos;
    } catch (error) {
        console.error("Error fetching outfit inspirations:", error);
        return [];
    }
};
