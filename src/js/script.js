const allPlayersTBody = document.querySelector("#allPlayers tbody");
const searchPlayer = document.getElementById("searchPlayer");
const btnAdd = document.getElementById("btnAdd");
const closeDialog = document.getElementById("closeDialog");
const getAllSortLinks = document.getElementsByClassName("bi");
const pager = document.getElementById("pager");
const playerName = document.getElementById("playerName");
const playerJersey = document.getElementById("jersey");
const playerPosition = document.getElementById("position");
const playerTeam = document.getElementById("team");
const playerDelete = document.getElementById("delete");
const errorMessage = document.getElementById("errorMessage");

let currentSortCol = "";
let currentSortOrder = "";
let currentPageNumber = 1;
let currentPageSize = 10;
let currentQ = "";

for (let i = 0; i < getAllSortLinks.length; i++) {
  const link = getAllSortLinks[i];
  link.addEventListener("click", () => {
    currentSortCol = link.dataset.sortcol;
    currentSortOrder = link.dataset.sortorder;
    updateTable();
  });
}

const debounce = (cb, delay = 250) => {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
};

const updateQuery = debounce((query) => {
  currentQ = query;
  updateTable();
}, 500);

searchPlayer.addEventListener("input", (e) => {
  updateQuery(e.target.value);
});

async function fetchPlayers() {
  let offset = (currentPageNumber - 1) * currentPageSize;
  let url =
    "http://localhost:3000/players?sortCol=" +
    currentSortCol +
    "&sortOrder=" +
    currentSortOrder +
    "&q=" +
    currentQ +
    "&limit=" +
    currentPageSize +
    "&offset=" +
    offset;
  const response = await fetch(url);
  const players = await response.json();
  return players;
}

let playersObj = await fetchPlayers();
let players = playersObj.result;
const createTableTdOrTh = function (elementType, innerText) {
  let element = document.createElement(elementType);
  element.textContent = innerText;
  return element;
};

let editingPlayer = null;

const onClickPlayer = function (event) {
  const onClick = event.target;
  const playersId = onClick.dataset.playersId;
  const player = players.find((p) => p.id === parseInt(playersId));
  playerName.value = player.name;
  playerJersey.value = player.jersey;
  playerPosition.value = player.position;
  playerTeam.value = player.team;
  editingPlayer = player;

  MicroModal.show("modal-1");
};

closeDialog.addEventListener("click", async (ev) => {
  ev.preventDefault();
  let url = "";
  let method = "";
  var newPlayer = {
    name: playerName.value,
    jersey: playerJersey.value,
    position: playerPosition.value,
    team: playerTeam.value,
  };
  if (editingPlayer != null) {
    if (
      playerName.value === "" ||
      playerName.value.length < 3 ||
      playerJersey.value < 0 ||
      playerJersey.value.length > 3 ||
      playerPosition.value === "" ||
      playerPosition.value.length < 3 ||
      playerTeam.value === "" ||
      playerTeam.value.length < 3
    ) {
      errorMessage.style.display = "block";
      return;
    } else {
      newPlayer.id = editingPlayer.id;
      url = "http://localhost:3000/editPlayers/" + newPlayer.id;
      method = "PUT";
    }
  } else {
    if (
      playerName.value === "" ||
      playerName.value.length < 3 ||
      playerJersey.value < 0 ||
      playerJersey.value.length > 3 ||
      playerPosition.value === "" ||
      playerPosition.value.length < 3 ||
      playerTeam.value === "" ||
      playerTeam.value.length < 3
    ) {
      errorMessage.style.display = "block";
      return;
    } else {
      url = "http://localhost:3000/addPlayers";
      method = "POST";
    }
  }

  if (playerDelete.checked) {
    newPlayer.id = editingPlayer.id;
    url = "http://localhost:3000/deletePlayer/" + newPlayer.id;
    method = "DELETE";
  }
  await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: method,
    body: JSON.stringify(newPlayer),
  });

  let playersObj = await fetchPlayers();
  players = playersObj.result;
  updateTable();
  errorMessage.style.display = "none";
  playerDelete.checked = false;
  MicroModal.close("modal-1");
});

btnAdd.addEventListener("click", () => {
  playerName.value = "";
  jersey.value = 0;
  position.value = "";
  team.value = "";
  editingPlayer = null;

  errorMessage.style.display = "none";
  MicroModal.show("modal-1");
});

const createPager = (count, pageNumber, pageSize) => {
  pager.innerHTML = "";
  let totalPages = Math.ceil(count / pageSize);
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.classList.add("pageItem");
    if (i == pageNumber) {
      li.classList.add("active");
    }
    const a = document.createElement("a");
    a.href = "#";
    a.innerText = i;
    a.classList.add("pageLink");
    li.appendChild(a);
    a.addEventListener("click", () => {
      currentPageNumber = i;
      updateTable();
    });
    pager.appendChild(li);
  }
};

const updateTable = async function () {
  allPlayersTBody.innerHTML = "";
  let playersObj = await fetchPlayers();
  let players = playersObj.result;

  for (let i = 0; i < players.length; i++) {
    let tr = document.createElement("tr");

    tr.appendChild(createTableTdOrTh("th", players[i].name));
    tr.appendChild(createTableTdOrTh("td", players[i].jersey));
    tr.appendChild(createTableTdOrTh("td", players[i].position));
    tr.appendChild(createTableTdOrTh("td", players[i].team));

    let td = document.createElement("td");
    let btn = document.createElement("button");
    btn.textContent = "EDIT";
    btn.dataset.playersId = players[i].id;
    td.appendChild(btn);
    tr.appendChild(td);

    btn.addEventListener("click", onClickPlayer);

    allPlayersTBody.appendChild(tr);
  }
  createPager(playersObj.total, currentPageNumber, currentPageSize);
};

updateTable();

MicroModal.init({
  onShow: (modal) => console.info(`${modal.id} is shown`), // [1]
  onClose: (modal) => console.info(`${modal.id} is hidden`), // [2]

  openTrigger: "data-custom-open", // [3]
  closeTrigger: "data-custom-close", // [4]
  openClass: "is-open", // [5]
  disableScroll: true, // [6]
  disableFocus: false, // [7]
  awaitOpenAnimation: false, // [8]
  awaitCloseAnimation: false, // [9]
  debugMode: true, // [10]
});
