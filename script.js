const allPlayersTBody = document.querySelector("#allPlayers tbody");
const searchPlayer = document.getElementById("searchPlayer");
const btnAdd = document.getElementById("btnAdd");
const closeDialog = document.getElementById("closeDialog");

function Player(id, name, jersey, team, position) {
  this.id = id;
  this.name = name;
  this.jersey = jersey;
  this.team = team;
  this.position = position;
  this.visible = true;
  this.matches = function (searchFor) {
    return (
      this.name.toLowerCase().includes(searchFor) ||
      this.position.toLowerCase().includes(searchFor) ||
      this.team.toLowerCase().includes(searchFor)
    );
  };
}

async function fetchPlayers() {
  return await (await fetch("http://localhost:3000/players")).json();
}

let players = await fetchPlayers();
console.log(players);

searchPlayer.addEventListener("input", function () {
  const searchFor = searchPlayer.value.toLowerCase();
  for (let i = 0; i < players.length; i++) {
    // TODO add a matches function
    if (players[i].matches(searchFor)) {
      players[i].visible = true;
    } else {
      players[i].visible = false;
    }
  }
  updateTable();
});

const createTableTdOrTh = function (elementType, innerText) {
  let element = document.createElement(elementType);
  element.textContent = innerText;
  return element;
};

const playerName = document.getElementById("playerName");
const playerJersey = document.getElementById("jersey");
const playerPosition = document.getElementById("position");
const playerTeam = document.getElementById("team");
const playerDelete = document.getElementById("delete");

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
  console.log(editingPlayer.id);

  MicroModal.show("modal-1");
};

closeDialog.addEventListener("click", async (ev) => {
  ev.preventDefault();
  let url = "";
  let method = "";
  console.log(url);
  var o = {
    name: playerName.value,
    jersey: playerJersey.value,
    position: playerPosition.value,
    team: playerTeam.value,
  };
  if (editingPlayer != null) {
    o.id = editingPlayer.id;
    console.log(o.id);
    url = "http://localhost:3000/editPlayers/" + o.id;
    method = "PUT";
  } else {
    url = "http://localhost:3000/addPlayers";
    method = "POST";
  }

  console.log(playerDelete.checked);
  if (playerDelete.checked) {
    o.id = editingPlayer.id;
    url = "http://localhost:3000/deletePlayers/" + o.id;
    method = "DELETE";
  } else {
    console.log("not id");
  }
  await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: method,
    body: JSON.stringify(o),
  });

  players = await fetchPlayers();
  updateTable();
  MicroModal.close("modal-1");
});

btnAdd.addEventListener("click", () => {
  playerName.value = "";
  jersey.value = 0;
  position.value = "";
  team.value = "";
  editingPlayer = null;

  MicroModal.show("modal-1");
});

const updateTable = function () {
  allPlayersTBody.innerHTML = "";

  for (let i = 0; i < players.length; i++) {
    if (players[i].visible == false) {
      continue;
    }
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
