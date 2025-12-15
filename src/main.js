import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase.js';

function generateRandomName() {
    const adjectives = ['Quick', 'Lazy', 'Happy', 'Sad', 'Brave', 'Clever'];
    const nouns = ['Fox', 'Dog', 'Cat', 'Mouse', 'Lion', 'Tiger'];
    const number = Math.floor(Math.random() * 1000);
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj}${noun}${number}`;  
}

async function queryFirestoreDB(collectionName, key, value) {
    try {
        const q = query(collection(db, collectionName), where(key, '==', value));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        };
    } catch (error) {
        console.error("error querying firestore database:", error);
    }
}

export { generateRandomName, queryFirestoreDB };