import {initializeApp, getApps, getApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialise Firebase only once
const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// Initialise Firestore
export const db = getFirestore(app);

// Export Firebase app
export default app;












// import {initializeApp,getApps,getApp} from "firebase/app";
// import {getFirestore} from "firebase/firestore";
// const firebaseConfig={
//     apiKey:process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//     authDomain:process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//     projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//     storageBucket:process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId:process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//     appId:process.env.NEXT_PUBLIC_FIREBASE_APP_ID
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);




// export const firebaseConfigured=Boolean(config.apiKey&&config.authDomain&&config.projectId&&config.appId);
// export const db=firebaseConfigured?getFirestore(getApps().length?getApp():initializeApp(config)):null;




