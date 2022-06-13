import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import firebaseConfig from "auth/firebase.json";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
