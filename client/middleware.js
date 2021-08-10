let url =
  "https://54bg3f6pc9.execute-api.ap-southeast-2.amazonaws.com/prod/board";

function go() {
  var value = document.forms[0].elements["name"].value;
  value = escape(value);

  localStorage.setItem("boardName", value);

  //Post board name to backend.
  postBoardName(value);

  //Load index.html after name entered and go button clicked.
  // window.location.href = "index.html";

  //Append board name to url.sl
  // window.history.replaceState(null, null, value);

  return false;
}

async function postBoardName(boardName) {
  // let board_name = document.forms[0].elements["name"].value;

  // let board = {
  //   BoardName: board_name,
  // };

  //  let _data = {

  //      body:board
  // //     //window.location.pathname
  // }
  //    var header = new Header();
  //    header.append('Content-type','application/json; charset=UTF-8');
  //    header.append('Access-Control-Allow-Origin' , '*');

  //   alert(typeof board);
  //   alert(board.BoardName);

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
    // _parseJSON: function(response) {
    //     return response.text()
    //     .then(function(text)
    //     { return text ? JSON.parse(text) : {} }) }

    .then((response) => {
      response.status;
     // window.location.href = "index.html";

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


