function authStateObserver(user) {
    if (user) {
        console.log("user logged");
    } else {
        console.log("user not logged");
    }
  }



  function initFirebaseAuth() {
    // Listen to auth state changes.
    firebase.auth().onAuthStateChanged(authStateObserver);
  }

  initFirebaseAuth();