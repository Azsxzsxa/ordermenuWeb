var CARD_TEMPLATE =
    '<div>' +
    '<p class="section"></p>' +
    '<p class="table"></p>' +
    '</div>' +
    '<ol class="list">' +
    '</ol>';


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
    _db.collection(RESTAURANTS).where("employees", "array-contains", _userUid)
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
    _db.collection(RESTAURANTS).doc(_restaurantId).collection(CURRENT).get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                var sectionID = doc.id;
                var sectionName = doc.data().name;
                _db.collection(RESTAURANTS).doc(_restaurantId).collection(CURRENT).doc(sectionID)
                    .get().then(function(doc) {
                        if (doc.exists) {
                            _db.collection(RESTAURANTS).doc(_restaurantId).collection(CURRENT).doc(sectionID).collection(TABLES)
                                .onSnapshot(function(querySnapshot) {
                                    querySnapshot.forEach(function(doc) {
                                        var tableId = doc.id;
                                        var tableNumber = doc.data().number;
                                        var tableOccupied = doc.data().occupied;

                                        switch (tableOccupied) {
                                            case TABLE_STATUS_SERVED:
                                                deleteCard(tableId);
                                                break;
                                            case TABLE_STATUS_FREE:
                                                deleteCard(tableId);
                                                break;
                                            case TABLE_STATUS_BUSY:
                                                addListener(sectionID, tableId, sectionName, tableNumber);
                                                break;
                                        }

                                    });
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
var _orderContainer = document.getElementById("container");

function deleteCard(tableId) {
    var listParent = document.getElementById(tableId);
    if (listParent != null) {
        while (listParent.firstChild) {
            listParent.removeChild(listParent.firstChild);
        }
        _orderContainer.removeChild(document.getElementById("card" + tableId));
    }
}

function addListener(sectionID, tableId, sectionName, tableNumber) {
    _db.collection(RESTAURANTS).doc(_restaurantId).collection(CURRENT).doc(sectionID).collection(TABLES).doc(tableId).collection(IN_PROGRESS).onSnapshot(function(querySnapshot) {

        var listParent = document.getElementById(tableId);
        if (listParent != null) {
            while (listParent.firstChild) {
                listParent.removeChild(listParent.firstChild);
            }
        }
        querySnapshot.forEach(function(doc) {
            // n = doc.data().status.localeCompare('served');
            // if (n != 0) {
            addCard(tableId, sectionName, tableNumber);
            populateCard(tableId, doc.data());
            // }
        });
    })
}


function addCard(tableId, sectionName, tableNumber) {
    var exists = document.getElementById("card" + tableId);
    if (exists == null) {
        const newCard = document.createElement('article');
        newCard.classList.add('card');
        newCard.id = "card" + tableId;
        newCard.innerHTML = CARD_TEMPLATE;
        newCard.querySelector('.list').id = tableId;
        newCard.querySelector('.section').innerHTML = sectionName;
        newCard.querySelector('.table').innerHTML = tableNumber;
        console.log(newCard);
        _orderContainer.appendChild(newCard);
    }

}

function populateCard(tableId, data) {

    var node = document.createElement("LI");
    var textnode = document.createTextNode(data.quantity + " " + data.name);
    let n = data.status.localeCompare('modified');
    if (n == 0) {
        node.classList.add('itemModified');
    }
    n = data.status.localeCompare('canceled');
    if (n == 0) {
        node.classList.add('itemCanceled');
    }


    node.appendChild(textnode);
    document.getElementById(tableId).appendChild(node);


}


initFirebaseAuth();