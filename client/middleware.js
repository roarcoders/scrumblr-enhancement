let url =
  "https://54bg3f6pc9.execute-api.ap-southeast-2.amazonaws.com/prod/board";

function go() {
  var value = document.forms[0].elements["name"].value;
  value = escape(value);

  localStorage.setItem("boardName", value);

  //Post board name to backend.
  postBoardName(value);

  //Uncomment or comment when testing
  //console.log(getBoardByName(value));

  //Load index.html after name entered and go button clicked.
  //window.location.href = "index.html";

  //Append board name to url.sl
  //window.history.replaceState(null, null, value);

  return false;
}

async function postBoardName(boardName) {
 

  await fetch(url, {
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
      response.status;
      //window.location.href = "index.html";

      return response.text().then(function (text) {
        return text ? JSON.parse(text) : {};
      });
    })
    .catch((err) => console.log(err));
}

function getBoards() {
  fetch(url)
    .then((response) => response.text())
    .then((json) => {
      console.log(JSON.stringify(json));
    });
  }

  function getBoardByName(value)
  {
    alert("this was called");
    
    var currentBoard=fetch(url+"/"+value,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    
  })
    
    .then((response) => response.text())
    .then((json) => {
      console.log(JSON.stringify(json));
    });
    return currentBoard;

  }


