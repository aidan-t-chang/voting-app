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

async function lookForUser(userId) {
    try {
        const users = await queryFirestoreDB('users', 'uid', userId);
        if (users && users.length > 0) {
            return users[0];
        }
    } catch (e) {
        console.error("error looking for user:", e);
    }
}

async function findSpecificValueInUserDB(uid, key) {
    const users = await queryFirestoreDB('users', 'uid', uid);
    if (users && users.length > 0) {
	    const userData = users[0];
        console.log("", key, " was found.")
	    return userData[key];
    } else {
	    return false;
    }
}

export { generateRandomName, queryFirestoreDB, lookForUser, findSpecificValueInUserDB };