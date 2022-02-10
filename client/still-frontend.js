let sessionBoardId;
let url = ENV.URL;
let boardNames;
const webSocketURL = 'wss://n4f51sq0t1.execute-api.ap-southeast-2.amazonaws.com/prod';
let webSocket;
const PROD_HOST = 'www.scrumblr.roarcoder.dev';
const isProduction = PROD_HOST === window.location.hostname;

onLoad();

async function getBoard() {
  return sessionBoardId;
}

async function go() {
  var value = document.forms[0].elements['name'].value;
  value = escape(value);
  /*
   * Checking if the entered BoardName already exists
   **/
  boardNames = await getBoardNames();
  boardNames.includes(value) ? openAlert() : await postBoardName(value);
  //patchBoardName("74171dcb-ee89-496a-828a-1b1c7302f628", "I am a small board")
  // deleteBoard("09e49698-05b6-4457-8271-2a288af9f6f5")
  // getBoardById("69761d59-d7a0-4e84-9a5b-c5119b068f9c");
  // getBoardByName(value);
  //getBoards();

  localStorage.setItem('boardName', value);
  localStorage.setItem('boardId', sessionBoardId.BoardId);

  // postNote("I am a note", "6f28a5d4-b14c-455b-9245-60d9e561d84e");
  // getNote("6f28a5d4-b14c-455b-9245-60d9e561d84e","5f216c4d-4aef-42c1-8fc3-0a1c4e076650")
  // patchNote("6f28a5d4-b14c-455b-9245-60d9e561d84e","5f216c4d-4aef-42c1-8fc3-0a1c4e076650","I am a new note now, yayyy!!");
  //deleteNote("6f28a5d4-b14c-455b-9245-60d9e561d84e", "794166f2-bd7f-4001-84e8-4ec2fac0c0ca")

  // console.log("response code :"+JSON.stringify(responseCode));
  //Delaying code run for 500ms so that postBoardName is able to penetrate the request

  //Post board name to backend.
  // if(responseCode === 200)
  //  {
  //       window.location.href = "index.html";
  //       console.log(getBoardById("1adafb42-8879-49c7-868d-a89317bd6cf1"));

  //       //Append board name to url.sl
  //     //  window.history.replaceState(null, null, value);
  // }
  //Uncomment or comment when testing
  // console.log(getBoardByName(value));
  console.log(sessionBoardId);
}

async function getBoardName(boardId) {
  let result = await getBoardById(boardId);
  document.getElementById('board-heading').innerHTML = result;
  return result;
}

async function postBoardName(boardName) {
  sessionBoardId = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      BoardName: boardName,
    }),
  })
    .then((response) => {
      goToBoardURL(boardName)
      // window.location.href = `index.html?boardname=${boardName}`;
      // middlware_boardid=JSON.stringify(response.JSON());
      response_status = response.status;
      return response.text().then(function (text) {
        return text ? JSON.parse(text) : {};
      });
    })

    .catch((err) => console.log(err));
}

/**
 * Get all the board names from the specific URL.
 *
 * @async
 * @function getBoardNames
 * @returns {Promise<string[] | Error>} returns a promise object with an array of the board names from the fetch request or throws an error
 */
async function getBoardNames() {
  try {
    const response = await fetch(url + 'boardnames', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    switch (response.ok) {
      case true:
        const boardsObject = await response.json();
        // map over the Items Array and access the BoardName property in each board object to get the boardname
        const boardNamesArray = boardsObject.Items.map((board) => board.BoardName);
        return boardNamesArray;
      case false:
        throw Error({ message: response.statusText });
    }
  } catch (error) {
    console.error(error.message ? error.message : error);
  }
}

async function getBoards() {
  let boards = await fetch(url).then((response) => response.text());
  // .then((json) => {
  //   console.log(JSON.stringify(json));
  if (response.ok) {
    const boardsObject = await response.json();
    return boardsObject;
  }
}

/**
 * {
    "Items": [
        {
            "BoardId": "f992080c-e2b1-4959-a617-267b3686497f",
            "BoardName": "testboard",
            "board_notes": [
                {
                    "note_id": "card94455729",
                    "topic": "dsadsaa",
                    "dateCreated": 1644231343818
                }
            ]
        }
    ],
    "Count": 1,
    "ScannedCount": 1
}
 */

/**
 *
 * @param {string} boardName
 * @typedef {{note_id: string, topic: string, dateCreated: number}} Note
 * @typedef {{Items: {BoardId: string, BoardName: string, board_notes: Note[]}[], Count: number, ScannedCount: number }} BoardData
 * @returns {Promise<BoardData>}
 */
async function getBoardByName(boardName) {
  // alert("this was called");

  const currentBoard = await fetch(url + boardName, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
    .then((response) => response.json())
    .then((json) => json);
  console.log(currentBoard);
  return currentBoard;
}


/**
 * 
 * @param {string} boardId the boardId
 * @param {string} note_id the card or note_id
 * @param {string} data the card's text
 * @returns 
 */
async function postNote(boardId, note_id, data) {
  let status = 400;
  await fetch(url + boardId + '/note/', {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      noteId: note_id || getUUID(),
      singleNote: data,
    }),
  }).then(res => {
    status = res.status;
  });
  return status;
}

async function getBoardById(boardIdtoGet) {
  let boardNameFromDb;
  return await fetch(url + '/' + boardIdtoGet, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      //See what this is by running git blame. Determine who it was committed by.
      return (boardNameFromDb = data.BoardName);
    });
}

async function getNote(boardId, noteId) {
  let note = await fetch(url + boardId + '/note/' + noteId, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  }).then((response) => {
    //window.location.href = "index.html";
    // middlware_boardid=JSON.stringify(response.JSON());

    return response.text().then(function (text) {
      return text ? JSON.parse(text) : {};
    });
  });
  console.log(note);
}

async function patchNote(boardId, noteId, newNote) {
  await fetch(url + boardId + '/note/' + noteId, {
    method: 'PATCH',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
    },
    body: JSON.stringify({
      singleNote: newNote,
    }),
  }).then((response) => {
    //window.location.href = "index.html";
    // middlware_boardid=JSON.stringify(response.JSON());

    return response.text().then(function (text) {
      return text ? JSON.parse(text) : {};
    });
  });
}

async function deleteBoard(boardId) {
  let message = await fetch(url + boardId, {
    method: 'DELETE',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
    .then((response) => response.text())
    .then((json) => {
      console.log(JSON.stringify(json));
    });
}

async function deleteNote(boardId, noteId) {
  let message = await fetch(url + boardId + '/note/' + noteId, {
    method: 'DELETE',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
    .then((response) => response.text())
    .then((json) => {
      console.log(JSON.stringify(json));
    });
}

async function patchBoardName(boardId, newName) {
  await fetch(url + boardId, {
    method: 'PATCH',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      BoardName: newName,
    }),
  })
    .then((response) => response.text())
    .then((json) => {
      console.log(JSON.stringify(json));
    });
}

function onConnect() {
  return new Promise((resolve, reject) => {
    webSocket = new WebSocket(webSocketURL);
    webSocket.onopen = (event) => {
      console.log({ event }, 'websocket open');
      resolve('open for business');
    };
    try {
    } catch (exception) {
      console.log(exception);
    }
  });
}

function sendMessage() {
  //TODO
  webSocket.send(JSON.stringify({ action: 'default' }));
}

function getBoardFromQueryString() {
  const params = new URLSearchParams(location.search);
  const boardname = params.get('boardname');
  return boardname;
}

/**
 *
 * @param {'boardName' | 'boardId'} key
 * @returns {string | null} returns boardName or boardId or null
 */
function getLocalStorage(key) {
  return localStorage.getItem(key);
}

/**
 *
 * @param {'boardName' | 'boardId'} key
 * @param {string} item
 */
function setLocalStorage(key, item) {
  localStorage.setItem(key, item);
}

/**
 *
 * @param {string} boardName
 */
function setBoardNameOnPage(boardName) {
  document.getElementById('board-title').textContent = boardName;
}

/**
 *
 * @param {string} boardName
 */
function addBoardQueryStringToURL(boardName) {
  window.history.replaceState(null, null, `?boardname=${boardName}`);
}

/**
 * @description redirects to /home.html the create a board page
 */
function redirectToHome() {
  window.location.replace('/home.html');
}


/**
 * @description redirects to index.html for the specific board
 * @param {string} boardname
 * @param {boolean} redirect if true will use location.replace
 */
function goToBoardURL(boardname, redirect = false) {
  const prodpath = isProduction ? '/board' : '/index.html'
  const url = `${prodpath}?boardname=${boardname}`
  if(redirect) location.replace(url);
  else location.href = url;
}

/**
 * @description generates DOMString containing a randomly generated, 36 character long v4 UUID.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
 * @returns {DOMString} returns 36 character long v4 UUID as a string
 */
function getUUID() {
  function create_UUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  }
  return crypto.randomUUID ? crypto.randomUUID() : create_UUID();
}

/**
 * @description forms a valid note to draw on the board based on script.js
 * @typedef {'yellow' | 'green' | 'blue' | 'white'} Colour
 * @typedef {{id: string, text: string, x: number, y: number, rot: number, colour: Colour, type: 'card' | null, sticker: null, animationspeed: null}} NoteToDraw
 * @param {Note} note
 * @param {{colour?: Colour, type?: 'card' | null}} options
 * @returns {NoteToDraw} returns a valid note to draw with script.js
 */
function formAValidNote(note, { colour = 'blue', type = 'card' }) {
  return {
    id: note.note_id,
    text: note.topic,
    x: '',
    y: '',
    rot: '',
    colour: colour,
    type: type,
    sticker: null,
    animationspeed: null,
  };
}

/**
 * @description uses the getMessage function in script to dispatch an action
 * @see {@link getMessage} NOTE: add other actions as needed in the future
 * @typedef {{action: 'initCards', data: NoteToDraw[]}} InitCards
 * @param {InitCards} message
 */
function sendMessageToScriptJS(message) {
  getMessage(message);
}

/**
 *
 * @param {BoardData} boardData
 */
function initCardsInScriptJS(boardData) {
  const {board_notes} = boardData.Items[0];
  populatetextForNotesMap(board_notes);
  const cardsArray = board_notes.map(formAValidNote);
  sendMessageToScriptJS({ action: 'initCards', data: cardsArray });
}
/**
 * @typedef {{data: string, id: string , status: "Not Inserted" | 'Inserted'}} NewNote
 * @returns {NewNote[]}
 */
function getTextForNoteArray () {
  return [...textForNotes.values()];
}

function postPatchNotesOnSave() {
  const boardId = getLocalStorage('boardId')
  const notes = getTextForNoteArray();
  Promise.allSettled(notes.map(async ({data, id, status }) => {
    console.log(JSON.stringify({data, id, status}, null, 2))
    /** @type {NewNote} */
    switch(status) {
      case 'Inserted': {
        console.log('patch')
        await patchNote(boardId, id, data)
        break;
      }
      case 'Not Inserted': {
        console.log('POST')
        const res = await postNote(boardId,id,data);
        if(!res === '200') return console.error(`fail to insert note ${id}: ${note}`); 
        /** @type {NewNote} */
        const updatedValue = {data, id, status: 'Inserted'}
        textForNotes.set(id, updatedValue);
        break;
      }
    }
  }))
}

/**
 * 
 * @param {Note[]} notesFromDB 
 */
 function populatetextForNotesMap (notesFromDB) {
   notesFromDB.forEach(({note_id, topic, dateCreated}) => { 
    /**
     * @type {NewNote}
     */
    const value = {data: topic, id: note_id, status: 'Inserted'}
    textForNotes.set(value.id, value);
  })
}

function addEventListenersToBoardPage () {
  const saveNoteBTN = document.getElementById('save-button');
  saveNoteBTN.addEventListener('click',postPatchNotesOnSave);
  
}

function localDevEnv (pathname) {
  const boardname = getBoardFromQueryString();
  switch (pathname) {
    // home.html
    case '/': {
      if(!boardname) {
        location.replace('/home.html');
        break;
      }
    }
    case '/index.html': {
      addEventListenersToBoardPage();
      loadBoardPage();
      break;
    }
    case '/home.html': {
      // do stuff for home.html
      history.replaceState(null, null, '/');
      break;
    }
    default: {
      // redirect
      location.replace('/');
    }
  }
}

function productionEnv (pathname) {
  const boardname = getBoardFromQueryString();
  switch (pathname) {
    // home.html
    case '/': {
      if(!boardname) {
        location.replace('/home.html');
        break;
      }
      location.replace('/board?' + `boardname=${boardname}`);
      break;
    }
    case '/board': {
      addEventListenersToBoardPage();
      loadBoardPage();
      break;
    }
    case '/home.html': {
      // do stuff for home.html
      history.replaceState(null, null, '/');
      break;
    }
    default: {
      // redirect
      location.replace('/');
    }
  }
}

/**
 * @description loads the board and cards if it exists or redirects to home.html
 *
 */
async function loadBoardPage() {
  const boardName = getBoardFromQueryString();
  if (!boardName) return redirectToHome();
  setLocalStorage('boardName', boardName);
  setBoardNameOnPage(boardName);
  addBoardQueryStringToURL(boardName);
  const boardData = await getBoardByName(boardName);
  if (boardData.Items.length === 0) return redirectToHome();
  const boardId = boardData.Items[0].BoardId;
  setLocalStorage('boardId', boardId);
  initCardsInScriptJS(boardData);
}

async function onLoad() {
  const { pathname, hostname } = window.location;
  switch(hostname) {
    case PROD_HOST: {
      productionEnv(pathname);
      break;
    }
    default: {
      localDevEnv(pathname)
    }
  }
  // TODO
  // document.getElementById('confirmation-prompt').style.display = 'none';
  const isOpen = await onConnect();
  console.log(isOpen);
  sendMessage();
  webSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log({ data }, 'received message');
  };
}
