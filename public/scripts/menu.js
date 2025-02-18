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
        .onSnapshot(function(querySnapshot) {
            $("#menuContainer").empty();

            querySnapshot.forEach(function(doc) {
                addCard(doc.id, doc.data());
            });
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

    const availableCard = document.createElement('article');
    availableCard.innerHTML = CARD_TEMPLATE;
    availableCard.classList.add("menuItemColumn")
    availableCard.querySelector('.menuItemValue').innerHTML = data.available;
    availableCard.querySelector('.menuItemName').innerHTML = "available";
    infoContainer.appendChild(availableCard);

    _menuContainer.appendChild(infoContainer);
    infoContainer.onclick = function() {
        $("#modal-Popup").css("display", "block");
        $("#modal-Name").val(data.name);
        // $("#modal-Category").val(data.category);
        $("#modal-Price").val(data.price);
        _menuItemId = docId;


        $("#modal-Available").empty();
        $("#modal-Available").append(`<option class="dropdown-Item" value="${data.available}" selected>${data.available}</option>`)

        if (data.available) {
            $("#modal-Available").append(`<option class="dropdown-Item" value="false">false</option>`)
        } else {
            $("#modal-Available").append(`<option class="dropdown-Item" value="true">true</option>`)
        }
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
    $("#modal-Save-Status").css("display", "none");
});

$("#modal-Save").click(function() {
    let itemId;
    if (_menuItemId) {
        itemId = _menuItemId;
    } else {
        let ref = _db.collection("Restaurants").doc(_restaurantId).collection("Menu").doc()
        itemId = ref.id;
    }
    _db.collection("Restaurants").doc(_restaurantId).collection("Menu").doc(itemId).set({
            name: $("#modal-Name").val(),
            category: $("#modal-Category").val(),
            price: parseInt($("#modal-Price").val()),
            document_id: itemId,
            available: ($("#modal-Available").val() == 'true'),
            status: "Default"
        })
        .then(function() {
            $("#modal-Save-Status").css("display", "block");
            $("#modal-Save-Status").text("Successful");
        })
        .catch(function(error) {
            $("#modal-Save-Status").text(error);
        });

});

$(".buttonAddItem").click(function() {
    _menuItemId = "";
    console.log("hello");
    $("#modal-Popup").css("display", "block");
    $("#modal-Name").val('');
    $("#modal-Price").val('');

    _db.collection("Restaurants").doc(_restaurantId).get().then(function(doc) {
        if (doc.exists) {
            $("#modal-Category").empty();
            doc.data().menuCategories.forEach(element => {
                $("#modal-Category").append(`<option class="dropdown-Item" value="${element}">${element}</option>`)

            })

        } else {
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
});