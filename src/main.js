
function generateRandomName() {
    const adjectives = ['Quick', 'Lazy', 'Happy', 'Sad', 'Brave', 'Clever'];
    const nouns = ['Fox', 'Dog', 'Cat', 'Mouse', 'Lion', 'Tiger'];
    const number = Math.floor(Math.random() * 1000);
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj}${noun}${number}`;  
}

export { generateRandomName };