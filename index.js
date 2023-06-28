// javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  remove,
  set,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// DB code
const appSettings = {
  databaseURL:
    "https://realtime-database-fd2f1-default-rtdb.asia-southeast1.firebasedatabase.app/",
};
const app = initializeApp(appSettings);
const database = getDatabase(app);
const endorsementsInDB = ref(database, "endorsements");

// javascript
const inputEl = document.getElementById("input-el"); // endorsement textarea
const fromEl = document.getElementById("from-el"); // From input
const toEl = document.getElementById("to-el"); // To input

const publishBtn = document.getElementById("publish-btn"); // Publish button
const endorsementsUl = document.getElementById("endorsements-ul"); // ul to hold endorsements in li

publishBtn.addEventListener("click", function (snapshot) {
  // we create the endorsement object
  let newEndorsementObj = {
    endorsement: inputEl.value,
    from: fromEl.value,
    to: toEl.value,
    likes: 0,
  };

  // we push the new object into firebase DB
  push(endorsementsInDB, newEndorsementObj);

  // we clear all the input fields after the push
  clearInputFields();
});

// This is to get the data from firebase DB and invoke appendToEndorsementsUl
// This will run on adding new endorsement, deleting new endorsement, and even when there are changes at the DB end
onValue(endorsementsInDB, function (snapshot) {
  // we check if the snapshot from DB is empty
  if (snapshot.exists()) {
    // we clear the existing items to avoid duplication
    endorsementsUl.innerHTML = "";

    // we get the data from DB as an array and store it
    // the structure would be [[ID, {endorsement:"...", from:"...",to:"...",likes:0}],[...],[...]]
    let endorsementsObjArr = Object.entries(snapshot.val());
    // we reverse the order as requird in the assignment
    endorsementsObjArr.reverse();

    // we call the appendToEndorsementsUl() function on every item in the endorsementsObjArr array
    for (let i = 0; i < endorsementsObjArr.length; i++) {
      appendToEndorsementsUl(endorsementsObjArr[i]);
    }
  } else {
    // if we do not have else, on deletion of last item, onValue will not refresh
    endorsementsUl.innerHTML = `<p class="seperator-el">No endorsements yet...</p>`;
  }
});

/*
The structure of li inside ul is as follows:
<li>
    <p>To AK</p>
    Leanne! Thank you so much for helping me with the March accounting. Saved so much time because of you! 💜 Frode
        <div class="actions-div">
            <p>From MK</p>
            <!-- we placed buttons inside sapn as space-between for div will add space between these 2 buttons also -->
            <span>
                <button> &#10084; 0</button>
                <button class="material-icons">delete</button>
            </span>
        </div>
</li>
*/
function appendToEndorsementsUl(item) {
  // we extract data from the array
  // the object structure will be:
  let currentID = item[0];
  let currentEndorsement = item[1].endorsement;
  let currentFrom = item[1].from;
  let currentTo = item[1].to;
  let currentLikes = item[1].likes;

  // we create new li element
  let newEl = document.createElement("li");

  /*
    If the type="module" for js source, then onclick for button will throw refrence error
    An alternate way to get the like and delete buttons work are using addEventListener
    For that we need to create 2 buttons, append them to span, append span to div and append div to newEl
    */

  // we create like button, set innerHTML and add click event listener
  let likeBtn = document.createElement("button");
  likeBtn.innerHTML = `&#10084; ${currentLikes}`;
  likeBtn.addEventListener("click", () => updateLikes(currentLikes, currentID));

  // we create delete button, set class & innerHTML and add click event listener
  /**
   * we use material-icons service to create delete icon inside the button, and for that to work we need the button in thefollowing format
   * <button class="material-icons">delete</button>
   */
  let deleteBtn = document.createElement("button");
  deleteBtn.setAttribute("class", "material-icons");
  deleteBtn.innerHTML = "delete";
  deleteBtn.addEventListener("click", () =>
    removeItemInEndorsementsDB(currentID)
  );

  // we create span to hold like and delete buttons
  // we placed buttons inside sapn as space-between for actions-div will add space between these 2 buttons also
  let spanEl = document.createElement("span");
  spanEl.appendChild(likeBtn);
  spanEl.appendChild(deleteBtn);

  // we create div to hold fromEl and above span
  let actionsDiv = document.createElement("div");
  actionsDiv.setAttribute("class", "actions-div");
  actionsDiv.innerHTML = `<p>From ${currentFrom}</p>`;
  actionsDiv.appendChild(spanEl);

  // we set the content of li newEl
  newEl.innerHTML = `
    <p>To ${currentTo}</p>
    ${currentEndorsement}
    `;

  // we append actionsDiv with fromEl and like & delete buttons inside span to li
  newEl.appendChild(actionsDiv);

  // we append the li newEl to endorsementsUl
  endorsementsUl.appendChild(newEl);
}

// function to clear all the input fields after click of Publish button
function clearInputFields() {
  inputEl.value = "";
  fromEl.value = "";
  toEl.value = "";
}

// function to update likes on click of like button
function updateLikes(currentLikes, currentID) {
  currentLikes += 1;
  set(ref(database, `endorsements/${currentID}/likes`), currentLikes);
}

// function to remove item in DB on click of delete button
function removeItemInEndorsementsDB(currentID) {
  let exactLocationInDB = ref(database, `endorsements/${currentID}`);
  remove(exactLocationInDB);
}

// we use this code to set the default width and height in PWA
window.addEventListener("resize", function () {
  let fixedWidth = 400;
  let fixedHeight = 600;

  window.resizeTo(fixedWidth, fixedHeight);
});