import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyANoLl0WWzK7mn_RrSoDYKB3zNPMeQOW1Q",
  authDomain: "reuse-campus-hub.firebaseapp.com",
  databaseURL: "https://reuse-campus-hub-default-rtdb.firebaseio.com",
  projectId: "reuse-campus-hub",
  storageBucket: "reuse-campus-hub.firebasestorage.app",
  messagingSenderId: "388455485216",
  appId: "1:388455485216:web:51a5f9f793ab10ce899145",
  measurementId: "G-MNLL7JGYX7"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default app;