  
  
  // Triggers when the auth state change for instance when the user signs-in or signs-out.
  function authStateObserver(user) {
    if (user) {
        window.location.href = "index.html";
    } else {
        console.log("user not logged");
    }
  }
  
  
  
  var emailInput = document.getElementById('input email');
  var passInput = document.getElementById('input pass');
  var login = document.getElementById('login');
  var loginGoogle = document.getElementById('login google');
  var googleLogIn = false;
  
  
  login.onclick = function () {
    googleLogIn = false;
    var emailVal = emailInput.value;
    var passVal = passInput.value;
    console.log(emailVal + passVal);
    firebase.auth().signInWithEmailAndPassword(emailVal, passVal).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      window.alert("error" + emailVal + passVal + errorCode + errorMessage);
    });
  
  }
  
  firebase.auth().onAuthStateChanged(authStateObserver);