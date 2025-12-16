import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.js';

function generateRandomName() {
    const adjectives = ['Quick', 'Lazy', 'Happy', 'Sad', 'Brave', 'Clever'];
    const nouns = ['Fox', 'Dog', 'Cat', 'Mouse', 'Lion', 'Tiger'];
    const number = Math.floor(Math.random() * 1000);
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj}${noun}${number}`;  
}

// queryFirestoreDB returns an array of objects with the requested key-value pairs from the firestore db
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

async function findValueInUserDB(uid, key) {
    const users = await queryFirestoreDB('users', 'uid', uid);
    if (users && users.length > 0) {
	    const userData = users[0];
        console.log("the following was found: ", key)
	    return userData[key];
    } else {
	    return false;
    }
}

async function updateDBValue(userUid, key, value) {
    try {
        const users = await queryFirestoreDB('users', 'uid', userUid);
        const userRef = doc(db, 'users', users[0].id);
        await updateDoc(userRef, {
            [key]: value
        })
    } catch (e) {
        console.error("error updating database value:", e);
    }
}

export { generateRandomName, queryFirestoreDB, lookForUser, findValueInUserDB, updateDBValue };