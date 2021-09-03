let url =
  "https://kyp91ncs12.execute-api.ap-southeast-2.amazonaws.com/prod/board";

let middlware_boardid = "";
function go() {
  
  var value = document.forms[0].elements["name"].value;
  value = escape(value);

  localStorage.setItem("boardName", value);

  let responseCode = postBoardName(value);
  console.log("response code :"+JSON.stringify(responseCode));
  // getBoards();
  //Delaying code run for 500ms so that postBoardName is able to penetrate the request
  sleep(500);
  
  // Post board name to backend.
  if(responseCode === 200)
   {
        window.location.href = "index.html";
    
        //Append board name to url.sl
       window.history.replaceState(null, null, value);
  }
  //Uncomment or comment when testing
  // console.log(getBoardByName(value));

  return false;
}

async function postBoardName(boardName) {
  let response_status;

   const response_value =  await fetch(url, {
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
      //window.location.href = "index.html";
      // middlware_boardid=JSON.stringify(response.JSON());
      response_status=response.status;
      return response.text().then(function (text) {
       
        return text ? JSON.parse(text) : {
          
          
        };
      });
    })

    .catch((err) => console.log(err));
    console.log(response_value);
 
    return response_status;
}

function getBoards() {
  fetch(url)
    .then((response) => response.text())
    .then((json) => {
      console.log(JSON.stringify(json));
    });
  }

  // function getBoardByName(value)
  // {
  //   alert("this was called");
    
  //   var currentBoard=fetch(url+"/"+value,{
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Access-Control-Allow-Origin": "*",
  //     },
    
  // })
    
  //   .then((response) => response.text())
  //   .then((json) => {
  //     console.log(JSON.stringify(json));
  //   });
  //   return currentBoard;

  // }
  function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}


