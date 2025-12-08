  // firebase-init.js (compat initializer)
  // This file initializes Firebase (compat) and exposes `firebase`, `auth`, and `db` globals.
  // Replace config values if you rotate keys, but these are safe for client-side use.
  (function () {
    try {
      const firebaseConfig = {
        apiKey: "AIzaSyDhn4Xgc4L1GLcpcR4ffvxjGIQKNuxrCYc",
        authDomain: "treetails-7af34.firebaseapp.com",
        projectId: "treetails-7af34",
        storageBucket: "treetails-7af34.firebasestorage.app",
        messagingSenderId: "469079945405",
        appId: "1:469079945405:web:263b78fa028da2ebe107d4",
        measurementId: "G-7QLXNT4DNG"
      };

      if (!window.firebase) {
        console.warn('firebase SDK not loaded before firebase-init.js. Make sure you include firebase-app-compat.js before this file.');
        return;
      }

      if (!firebase.apps || firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
        try { firebase.analytics(); } catch (e) { /* ignore analytics failures in local env */ }
        console.info('Firebase initialized (compat)');
      } else {
        console.info('Firebase already initialized');
      }

      // expose helpers
      window.auth = firebase.auth();
      window.db = firebase.firestore();
      window.firebaseApp = firebase.app();
    } catch (err) {
      console.error('Error initializing Firebase in firebase-init.js', err);
    }
  })();
