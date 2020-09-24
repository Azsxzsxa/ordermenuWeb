var CARD_TEMPLATE =
    '<p class="menuItemName menuItemLine"></p>' +
    '<p class="menuItemValue menuItemLine"></p>';

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

function getMenu() {
    _db.collection("Restaurants").doc(_restaurantId).collection("Menu")
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                addCard(doc.id, doc.data());

            });
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
}

function addCard(docId, data) {
    let infoContainer = document.createElement('a');
    infoContainer.id = docId;
    infoContainer.classList.add("menuItemRow")

    const nameCard = document.createElement('article');
    nameCard.innerHTML = CARD_TEMPLATE;
    nameCard.classList.add("menuItemColumn")
    nameCard.querySelector('.menuItemValue').innerHTML = data.name;
    nameCard.querySelector('.menuItemName').innerHTML = "name";
    infoContainer.appendChild(nameCard);

    const categoryCard = document.createElement('article');
    categoryCard.innerHTML = CARD_TEMPLATE;
    categoryCard.classList.add("menuItemColumn")
    categoryCard.querySelector('.menuItemValue').innerHTML = data.category;
    categoryCard.querySelector('.menuItemName').innerHTML = "category";
    infoContainer.appendChild(categoryCard);

    const priceCard = document.createElement('article');
    priceCard.innerHTML = CARD_TEMPLATE;
    priceCard.classList.add("menuItemColumn")
    priceCard.querySelector('.menuItemValue').innerHTML = data.price;
    priceCard.querySelector('.menuItemName').innerHTML = "price";
    infoContainer.appendChild(priceCard);

    _menuContainer.appendChild(infoContainer);
    infoContainer.onclick = function() {
        $("#modal-text").html(data.name);
        $("#modal-Popup").css("display", "block");
    };


}

function getRestaurant() {
    _db.collection("Restaurants").where("employees", "array-contains", _userUid)
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                console.log("Restaurant: " + doc.id);
                _restaurantId = doc.id;
                getMenu();
            });
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
}

function editTask() {
    $("#modal-Popup").css("display", "block");
}

let _userUid;
let _db;
let _restaurantId;
let _menuContainer = document.getElementById("menuContainer");

initFirebaseAuth();

var span = document.getElementsByClassName("close")[0];
span.onclick = function() {
    $("#modal-Popup").css("display", "none");
}