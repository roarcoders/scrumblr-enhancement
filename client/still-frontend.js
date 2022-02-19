let sessionBoardId;
// let url = 'http://localhost:3000/board/'
let url = 'https://37run05fad.execute-api.ap-southeast-2.amazonaws.com/prod/board/';
let boardNames;
const webSocketURL = 'wss://n4f51sq0t1.execute-api.ap-southeast-2.amazonaws.com/prod';
/**@type {WebSocket} */
let webSocket;
const PROD_HOST = 'www.scrumblr.roarcoder.dev';
const isProduction = PROD_HOST === window.location.hostname;

onLoad();

async function getBoard() {
  return sessionBoardId;
}

/**
 * checks if board name is unique, sets local storage, navigates to new board
 * @param {string} boardName name of board to create
 */
async function createNewBoard(boardName) {
  /*
   * Checking if the entered BoardName already exists
   **/
  boardNames = await getBoardNames();
  if(boardNames.includes(boardName)) return openAlert() 
  sessionBoardId = await postBoardName(boardName);

  setLocalStorage('boardName',boardName);
  setLocalStorage('boardId', sessionBoardId.BoardId)
  goToBoardURL(boardName)
  //Delaying code run for 500ms so that postBoardName is able to penetrate the request

  //Uncomment or comment when testing
  // console.log(getBoardByName(value));
  console.log(sessionBoardId);
}

async function getBoardName(boardId) {
  let result = await getBoardById(boardId);
  document.getElementById('board-heading').innerHTML = result;
  return result;
}

/**
 * creates a board in dyanamodb from the boardName
 * @async
 * @param {string} boardName 
 * @returns {Promise<string>} the board id for the newly created board
 */
async function postBoardName(boardName) {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      BoardName: boardName,
    }),
  }).catch(err => console.error(err.message));
  if(response.ok) {
    const json = await response.json();
    return json;
  };
  return '';
}

/**
 * Get all the board names from the specific URL.
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
  try {
    const response = await fetch(url);
      if (response.ok) {
        const boardsObject = await response.json();
        return boardsObject;
      }
      const {status, statusText} = response;
      throw Error(`${status}, ${statusText}`);
    } catch (error) {
      console.error(error, 'error fetching boards');
      return [];
    }
}

/**
 *
 * @param {string} boardName
 * @typedef {{ note_id: string, topic: string, colour: Colour, position: NotePosition, dateCreated: number }} Note
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
 * @param {NoteData} data the card's text
 * @returns 
 */
async function postNote(boardId, note_id, data) {
  let status = 400;
  return await fetch(url + boardId + '/note/', {
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
    return status = res.status;
  });
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

/**
 * @description connect to the websocket
 * @returns {Promise<'open' | 'error'>}
 */
 function onConnect() {
  return new Promise((resolve, reject) => {
    webSocket = new WebSocket(webSocketURL);
    webSocket.onopen = (event) => {
      resolve('open');
    }
    webSocket.onerror = (event) => {
      console.error('websocket error', event)
      webSocket.onerror = null;
      reject('error');
    }
  });
}

/**
 * @example ?boardname=testboard -> testboard
 * @returns {string} boardname from the query param
 */
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
 * @description navigates to /home.html for local dev or path "/" on production
 * @param {boolean} redirect if true will use location.replace
 */
function goToHome(redirect = false) {
  const prodpath = isProduction ? '/' : '/home.html'
  const url = `${prodpath}`
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
 * @param {Object} note
 * @param {string} note.id
 * @param {string} note.text
 * @param {number} [note.x]
 * @param {number} [note.y]
 * @param {number} [note.rot]
 * @param {Colour} [note.colour]
 * @param {'card' | null} [note.type]
 * @param {null} [note.sticker] 
 * @param {null} [note.animationspeed] 
 * @returns {NoteToDraw} returns a valid note to draw with script.js
 */
function formAValidNote({id, text, x = 0, y = 0, rot = 0, colour = '' , type = 'card', sticker = null, animationspeed = null}) {
  return {
    id: id,
    text: text,
    x: x,
    y: y,
    rot: rot,
    colour: colour || randomCardColour(),
    type: type,
    sticker: sticker,
    animationspeed: animationspeed,
  };
}

/**
 * @typedef {'default'} Action
 * @typedef {M} MessageType
 * @see {@link getMessage}
 */

/**
 * sends a websocket message to AWS API Gateway
 * @param {{action: Action, message: MessageType }} dispatch
 */
function dispatchWebSocketMessage(dispatch = {action: 'default', message: {}}) {
    webSocket.send(JSON.stringify(dispatch));
}

/**
 *
 * @param {BoardData} boardData
 */
function initCardsInScriptJS(boardData) {
  const { board_notes } = boardData.Items[0];

  populateBoardNotesMap(board_notes);

  const boardNotes = getBoardNotesArray();

  const cardsArray = boardNotes.map((
    { id, data: { colour, position: { left, top }, text }}
    ) => formAValidNote({ id, text, colour, x: left, y: top }));

  getMessage({ action: 'initCards', data: cardsArray });
}
/**
 * @typedef {{top: number, left: number}} NotePosition
 * @typedef {{ text: string, position: NotePosition, colour: Colour }} NoteData
 * @typedef {{data: NoteData, id: string , status: "Not Inserted" | 'Inserted'}} BoardNote
 * @returns {BoardNote[]} an array of the board notes from the boardNotesMap
 */
function getBoardNotesArray () {
  return [...boardNotesMap.values()];
}

/**
 * 
 */
async function postPatchNotesOnSave() {
  const boardId = getLocalStorage('boardId');
  const notes = getBoardNotesArray();

  for await (const {data, id, status} of notes) {
    console.log(JSON.stringify({data, id, status}, null, 2))
    const failureMsg = () => console.error(`fail to insert note ${id}: ${note}`)
    switch(status) {
      case 'Inserted': {
        console.log('patch')
        const res = await patchNote(boardId, id, data).catch(err => console.error(err))
        if(!res === 200) failureMsg()
        break;
      }
      case 'Not Inserted': {
        console.log('POST')
        const res = await postNote(boardId, id, data).catch(err => console.error(err))
        
        if(!res === 200) {
          failureMsg() 
          break
        } 
          
        
        /** @type {BoardNote} */
        const updatedValue = {data, id, status: 'Inserted'}
        boardNotesMap.set(id, updatedValue);
        break;
      }
    }
  }
  /**
   * @zainafzal88
   * @toreylittlefield
   * Writes Data To DynamoDB TOO FAST! Not Strongly Consistent
   * @todo need to discuss options of using only one post request to update the whole note array at once! 
   * */
  // const result = await Promise.allSettled(
  //   notes.map(async ({data, id, status }) => {

  //   console.log(JSON.stringify({data, id, status}, null, 2))
  //   const failureMsg = () => console.error(`fail to insert note ${id}: ${note}`)
  //   switch(status) {
  //     case 'Inserted': {
  //       console.log('patch')
  //       const res = await patchNote(boardId, id, data).catch(err => console.error(err))
  //       if(!res === 200) failureMsg()
  //       return res;
  //     }
  //     case 'Not Inserted': {
  //       console.log('POST')
  //       const res = await postNote(boardId, id, data).catch(err => console.error(err))
        
  //       if(!res === 200) {
  //         failureMsg() 
  //         return res;
  //       } 
          
        
  //       /** @type {BoardNote} */
  //       const updatedValue = {data, id, status: 'Inserted'}
  //       boardNotesMap.set(id, updatedValue);
  //       return res;
  //     }
  //   }
  // })
  // )
  // console.log(result)
  /** Writes Data To DynamoDB TOO FAST! */
}

function openToastMessage() {
  document.getElementById('confirmation-prompt').classList.remove('hide');
}

function closeToastMessage() {
  document.getElementById('confirmation-prompt').classList.add('hide');
}

/**
 * 
 * @param {Note[]} notesFromDB 
 */
 function populateBoardNotesMap(notesFromDB) {
   notesFromDB.forEach(({note_id, topic, colour = '', position = {top: 0, left: 0}, dateCreated}) => { 
     if(topic.text) {
      /** @type {NoteData} */
      const {colour, position, text}  = topic
      const value = { data: { text, colour, position }, id: note_id, status: 'Inserted'}
      boardNotesMap.set(value.id, value);
      return;
     }
    /** @type {BoardNote} */
    const value = { data: { text: topic, colour, position }, id: note_id, status: 'Inserted'}
    boardNotesMap.set(value.id, value);
  })
}

function addEventListenersToBoardPage () {
  const saveNoteBTN = document.getElementById('save-button');
  saveNoteBTN.addEventListener('click', postPatchNotesOnSave);
}

function addEventListenerToHomePage () {
  document.querySelector('form[name=createBoard]').addEventListener('submit', (event) => {
    event.preventDefault();
    /**@type {HTMLFormElement} */
    const form = event.target;
    const boardName = new FormData(form).get('boardname');
    createNewBoard(boardName)
  })
}

/**
* start aws websocket connection and receive messages here
*/
async function initWebSocket() {
  const isOpen = await onConnect();
  console.log({isOpen}, 'websocket is open');
  
  if(isOpen === 'error') return;

  webSocket.onmessage = (event) => {
    /**@type MessageType */
    const data = JSON.parse(event.data);
    console.log({ data }, 'received message');
    getMessage(data);
  };
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

  initWebSocket();
}

function localDevEnv (pathname) {
  const boardname = getBoardFromQueryString();
  switch (pathname) {
    case '/': {
      if(!boardname) {
        // home.html
        goToHome(true)
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
      addEventListenerToHomePage()
      break;
    }
    default: {
      // redirect
      goToHome(true)
    }
  }
}

function productionEnv (pathname) {
  const boardname = getBoardFromQueryString();
  switch (pathname) {
    case '/': {
      // home.html
      if(!boardname) {
        addEventListenerToHomePage();
        break;
      }
      else goToBoardURL(boardname);
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
      addEventListenerToHomePage();
      break;
    }
    default: {
      // redirect
      goToHome(true);
    }
  }
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
}