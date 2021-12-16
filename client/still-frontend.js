let sessionBoardId;
let url = ENV.URL;

async function getBoard()
{
  
  console.log(sessionBoardId);
  return sessionBoardId;
}

async function go() {
  var value = document.forms[0].elements["name"].value;
  value = escape(value);

  
  //patchBoardName("74171dcb-ee89-496a-828a-1b1c7302f628", "I am a small board")
  // deleteBoard("09e49698-05b6-4457-8271-2a288af9f6f5")
  // getBoardById("69761d59-d7a0-4e84-9a5b-c5119b068f9c");
  // getBoardByName(value);
  //getBoards();

  localStorage.setItem("boardName", value);
  await postBoardName(value);
  



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


}

async function getBoardName(boardId) {
  let result = await getBoardById(boardId);
  document.getElementById("board-heading").innerHTML = result;
  return result;
}

async function postBoardName(boardName) {

  sessionBoardId = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      BoardName: boardName,
    }),
  })
    .then((response) => {
      window.location.href = "index.html";
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
 * @function getBoards
 * @returns {Promise<object | Error>} returns a promise object as all the board names from the fetch request or throws an error
 */
async function getBoards() {
try {
  const response = await fetch(url, {
    method: 'GET',
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
  if(response.ok) {
    const boardsObject = await response.json();
    return boardsObject;
  }
  throw Error({message: response.statusText})
} catch (error) {
  console.error(error.message ? error.message : error);
}
}

function getBoardByName(value) {
  // alert("this was called");

  var currentBoard = fetch(url + "/" + value, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
    .then((response) => response.json())
    .then((json) => {
      JSON.stringify(json);
    });
  console.log(currentBoard);
  // return currentBoard;
}

async function postNote(value, boardIdtopost) {
  let noteName = value;
  await fetch(url + boardIdtopost + "/note/", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      singleNote: noteName,
    }),
  }).then((response) => {
    return response.text().then(function (text) {
      return text ? JSON.parse(text) : {};
    });
  });
  console.log("note inserted");
}

async function getBoardById(boardIdtoGet) {
  let boardNameFromDb;
  return await fetch(url + "/" + boardIdtoGet, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
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
  let note = await fetch(url + boardId + "/note/" + noteId, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
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
  await fetch(url + boardId + "/note/" + noteId, {
    method: "PATCH",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
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
    method: "DELETE",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
    .then((response) => response.text())
    .then((json) => {
      console.log(JSON.stringify(json));
    });
}

async function deleteNote(boardId, noteId) {
  let message = await fetch(url + boardId + "/note/" + noteId, {
    method: "DELETE",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
    .then((response) => response.text())
    .then((json) => {
      console.log(JSON.stringify(json));
    });
}

async function patchBoardName(boardId, newName) {
  await fetch(url + boardId, {
    method: "PATCH",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
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
