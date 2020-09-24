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
    _db.collection("Restaurants").doc(_restaurantId).collection("Menu").orderBy("name", "asc")
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
        $("#modal-Popup").css("display", "block");
        $("#modal-Name").val(data.name);
        // $("#modal-Category").val(data.category);
        $("#modal-Price").val(data.price);
        _menuItemId = docId;

        _db.collection("Restaurants").doc(_restaurantId).get().then(function(doc) {
            if (doc.exists) {
                $("#modal-Category").empty();
                doc.data().menuCategories.forEach(element => {
                    let n = data.category.localeCompare(element);
                    if (n == 0) {
                        $("#modal-Category").append(`<option class="dropdown-Item" value="${element}" selected>${element}</option>`)
                    } else {
                        $("#modal-Category").append(`<option class="dropdown-Item" value="${element}">${element}</option>`)
                    }

                })

            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });


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

let _userUid;
let _db;
let _restaurantId;
let _menuItemId;
let _menuContainer = document.getElementById("menuContainer");

initFirebaseAuth();

$(".close").click(function() {
    $("#modal-Popup").css("display", "none");
});

$("#modal-Save").click(function() {
    _db.collection("Restaurants").doc(_restaurantId).collection("Menu").doc(_menuItemId).set({
            name: $("#modal-Name").val(),
            category: $("#modal-Category").val(),
            price: parseInt($("#modal-Price").val()),
            document_id: _menuItemId,
            available: true
        })
        .then(function() {
            console.log("Document successfully written!");
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
        });
});