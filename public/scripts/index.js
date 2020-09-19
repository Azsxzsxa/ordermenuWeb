function authStateObserver(user) {
    if (user) {
        console.log("user logged");
        _userUid = user.uid;
        console.log(_userUid);
        _db = firebase.firestore();
        getRestaurant()
    } else {
        console.log("user not logged");
        window.location.href = "login.html";
    }
}



function initFirebaseAuth() {
    // Listen to auth state changes.
    firebase.auth().onAuthStateChanged(authStateObserver);
}

function getRestaurant() {
    _db.collection("Restaurants").where("employees", "array-contains", _userUid)
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                console.log("Restaurant: " + doc.id);
                _restaurantId = doc.id;
                setOrdersListener();
            });
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
}

function setOrdersListener() {
    _db.collection("Restaurants").doc(_restaurantId).collection("Current").get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                console.log("sections ref: " + doc.id);
                var sectionID = doc.id;
                var sectionName = doc.data().name;
                _db.collection("Restaurants").doc(_restaurantId).collection("Current").doc(sectionID)
                    .get().then(function(doc) {
                        if (doc.exists) {
                            _db.collection("Restaurants").doc(_restaurantId).collection("Current").doc(sectionID).collection("Tables")
                                .onSnapshot(function(querySnapshot) {
                                    querySnapshot.forEach(function(doc) {
                                        var tableStatus = doc.data().occupied;
                                        if (tableStatus) {
                                            //ADD 
                                            console.log("table status " + tableStatus);
                                            var tableID = doc.id;
                                            var tableNumber = doc.data().number;
                                            _db.collection("Restaurants").doc(_restaurantId).collection("Current").doc(sectionID).collection("Tables").doc(tableID).collection("Order").onSnapshot(function(querySnapshot) {
                                                querySnapshot.forEach(function(doc) {
                                                    console.log(sectionName + " " + tableNumber + " " + doc.data().name);
                                                });
                                            })

                                        } else {
                                            console.log("table status " + tableStatus);
                                        }
                                    });
                                    // console.log("Current cities in CA: ", cities.join(", "));
                                });
                        } else {
                            // doc.data() will be undefined in this case
                            console.log("No such document!");
                        }
                    }).catch(function(error) {
                        console.log("Error getting document:", error);
                    });

            });
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
}

var _userUid;
var _db;
var _restaurantId;


initFirebaseAuth();