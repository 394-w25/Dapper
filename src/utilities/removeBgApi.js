import axios from "axios";
import { ref, get } from "firebase/database";
import { database, storage } from "./firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// Fetch RemoveBG API Key from Firebase
const fetchRemoveBgApiKey = async () => {
    try {
        const apiKeyRef = ref(database, "config/remove_bg_api_key");
        const snapshot = await get(apiKeyRef);
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.error("RemoveBG API Key not found in Firebase");
            return null;
        }
    } catch (error) {
        console.error("Error fetching RemoveBG API Key:", error);
        return null;
    }
};

// Remove Image Background
export const removeBackground = async (file) => {
    const apiKey = await fetchRemoveBgApiKey();
    if (!apiKey) {
        alert("API Key missing. Please check Firebase Database.");
        return null;
    }

    try {
        const formData = new FormData();
        formData.append("image_file", file);
        formData.append("size", "auto");

        const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
            headers: {
                "X-Api-Key": apiKey,
                "Content-Type": "multipart/form-data",
            },
            responseType: "blob",
        });

        // Upload the cleaned image to Firebase Storage
        const uniqueFilename = `removed-bg-${Date.now()}.png`;
        const removedBgFile = new File([response.data], uniqueFilename, { type: "image/png" });

        const imageRef = storageRef(storage, `clothing/${removedBgFile.name}`);
        await uploadBytes(imageRef, removedBgFile);
        const downloadUrl = await getDownloadURL(imageRef);

        return downloadUrl;
    } catch (error) {
        console.error("❌ Error removing background:", error);
        alert("Failed to remove background. Please try again.");
        return null;
    }
};
