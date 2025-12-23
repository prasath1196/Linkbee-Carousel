import { db, auth } from '../firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    addDoc,
    query,
    where
} from 'firebase/firestore';

// --- HELPER ---
const getCurrentUid = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be logged in to access cloud data.");
    return user.uid;
};

// --- USER PROFILE (Existing) ---

export const saveUserProfile = async (userProfile) => {
    try {
        await setDoc(doc(db, "users", userProfile.uid), userProfile, { merge: true });
        return userProfile;
    } catch (e) {
        console.error("Error saving profile to Cloud:", e);
        throw e;
    }
};

export const getUserProfile = async (uid) => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (e) {
        console.error("Error fetching profile from Cloud:", e);
        return null;
    }
};

// --- LOG DATA (Moved to Firestore 'logs' collection) ---

export const logTokenUsage = async (actionType, promptTokens, responseTokens) => {
    try {
        const uid = auth.currentUser?.uid || 'anonymous';
        const logEntry = {
            uid,
            action: actionType,
            inputTokens: promptTokens || 0,
            outputTokens: responseTokens || 0,
            totalTokens: (promptTokens || 0) + (responseTokens || 0),
            timestamp: Date.now()
        };

        // Fire-and-forget add to 'logs' collection
        await addDoc(collection(db, 'logs'), logEntry);
        return logEntry;
    } catch (e) {
        console.error("Failed to log usage to Firestore:", e);
        return null;
    }
};

export const getUsageStats = async () => {
    try {
        const uid = getCurrentUid();
        const q = query(collection(db, 'logs'), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);

        const logs = querySnapshot.docs.map(d => d.data());
        const total = logs.reduce((acc, log) => acc + (log.totalTokens || 0), 0);

        return { totalTokens: total, requestCount: logs.length, history: logs };
    } catch (e) {
        console.error("Failed to fetch usage stats:", e);
        return { totalTokens: 0, requestCount: 0, history: [] };
    }
};

// --- PROJECT DATA (Moved to Firestore 'projects' collection) ---

export const saveProject = async (project) => {
    try {
        const uid = getCurrentUid();
        // If it's a new project, create a UUID; otherwise use existing
        const projectId = project.id || crypto.randomUUID();

        const projectData = {
            ...project,
            id: projectId,
            uid: uid, // Securely attach ownership
            updatedAt: Date.now()
        };

        // Use setDoc with merge to update or create
        await setDoc(doc(db, 'projects', projectId), projectData, { merge: true });

        return projectId;
    } catch (e) {
        console.error("Error saving project:", e);
        throw e;
    }
};

export const getAllProjects = async () => {
    try {
        console.log("Fetching projects from Firestore...");
        const uid = getCurrentUid();
        // Only fetch projects belonging to this user
        const q = query(collection(db, 'projects'), where("uid", "==", uid));

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (e) {
        console.error("Error loading projects:", e);
        return [];
    }
};

// Deprecated (Removed IndexedDB init)
export const initDB = async () => {
    console.warn("initDB is deprecated. Using Firestore.");
    return null;
};
