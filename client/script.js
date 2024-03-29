var cards = {};
var totalcolumns = 0;
var columns = [];
let prevColumns = [];
var currentTheme = "bigcards";
var boardInitialized = false;
var keyTrap = null;
/**@type Map<(id: string), BoardNote> */
const boardNotesMap = new Map();
const noteStatus = {NI:"Not Inserted", I:"Inserted"}
const boardData = sessionStorage.getItem('boardData');
var baseurl = location.pathname.substring(0, location.pathname.lastIndexOf('/'));

//an action has happened, send it to the
//server
async function sendAction(a, d) {

    var message = {
        action: a,
        data: d
    };
}

/**
 * @typedef {{id: string}} CardId
 * @typedef {{value: string}} CardValue
 * @typedef {{colour: Colour}} CardColour
 * @typedef {CardId & CardValue & CardColour} CardData 
 */

/**
 * @typedef {Object} InitCards
 * @property {'createCard'} action
 * @property {NoteToDraw} data
 */

/**
 * @typedef {Object} EditNote
 * @property {'editCard'} action
 * @property {CardData} data
 */

/**
 * @typedef {Object} DeleteNote
 * @property {'deleteCard'} action
 * @property {CardId} data
 */

/**
 * @typedef {Object} InitCards
 * @property {'initCards'} action
 * @property {NoteToDraw[]} data
 */

/**
 * respond to an action event 
 * @description dispatchs various actions like 'createCard', 'editCard' or 'deleteCard' card 
 * @typedef {EditNote | DeleteNote | InitCards} M 
 * @param {M} m
 */
function getMessage(m) {
    var message = m; //JSON.parse(m);
    var action = message.action;
    var data = message.data;

    switch (action) {
        case 'roomAccept':
            //okay we're accepted, then request initialization
            //(this is a bit of unnessary back and forth but that's okay for now)
            sendAction('initializeMe', null);
            break;

        case 'roomDeny':
            //this doesn't happen yet
            break;

        case 'moveCard':
            moveCard($("#" + data.id), data.position);
            break;

        case 'initCards':
            initCards(data);
            break;

        case 'createCard':
            drawNewCard(data.id, data.text, data.x, data.y, data.rot, data.colour, data.type, null,
                null);
            
            break;

        case 'deleteCard':
            $("#" + data.id).fadeOut(500,
                function() {
                    $(this).remove();
                }
            );
            break;

        case 'editCard':
            if (data.value) $("#" + data.id).children('.content:first').text(data.value);
            if (data.colour)
            {
                $('#' + data.id).children('.change-colour').data('colour',data.colour);
                $('#' + data.id).children('.card-image').attr("src", 'images/' + data.colour + '-card.png');
            }

            break;

        case 'initColumns':
            initColumns(data);
            break;

        case 'updateColumns':
            initColumns(data);
            break;

        case 'changeTheme':
            changeThemeTo(data);
            break;

        case 'join-announce':
            displayUserJoined(data.sid, data.user_name);
            break;

        case 'leave-announce':
            displayUserLeft(data.sid);
            break;

        case 'initialUsers':
            displayInitialUsers(data);
            break;

        case 'nameChangeAnnounce':
            updateName(message.data.sid, message.data.user_name);
            break;

        case 'addSticker':
            addSticker(message.data.cardId, message.data.stickerId);
            break;

        case 'setBoardSize':
            resizeBoard(message.data);
            break;

        case 'editText':
            var item = data.item;
            var text = "";
            if (data.text) { text = data.text; }
            updateText(item, text);
            break;

        default:
            //unknown message
            alert('unknown action: ' + JSON.stringify(message));
            break;
    }

    
}

async function requestDeleteNote(cardId) {

    // let sessionBoardId = localStorage.getItem("boardId");

    boardNotesMap.delete(cardId);

    const boardId = getLocalStorage('boardId')
    if(!boardId) return console.error('cannot delete card, no boardId in localstorage')
    await deleteNote(boardId, cardId);
}

function updateText (item, text) {
    if (item == 'board-title' && text != '') {
        $('#board-title').text(text);
    }
}


$(document).bind('keyup', function(event) {
    keyTrap = event.which;
});

function drawNewCard(id, text, x, y, rot, colour, type, sticker, animationspeed) {

    //cards[id] = {id: id, text: text, x: x, y: y, rot: rot, colour: colour};

    var h = '';

    if (type == 'card' || type == null) {
        h = '<div id="' + id + '" class="card ' + colour +
            ' draggable cardstack" style="-webkit-transform:rotate(' + rot +
            'deg);\
        ">\
        <svg class="card-icon delete-card-icon" width="15" height="15"><use xlink:href="teenyicons/teenyicons-outline-sprite.svg#outline--x-circle" /></svg>\
        <svg class="card-icon card-icon2 change-colour" data-colour="' + colour + '" width="15" height="15"><use xlink:href="teenyicons/teenyicons-outline-sprite.svg#outline--paintbrush" /></svg>\
        <img class="card-image" src="images/' + colour + '-card.png">\
        <div id="content:' + id +
            '" class="content stickertarget droppable">' +
            text + '</div><span class="filler"></span>\
        </div>';
    }
    
    var card = $(h);
    card.appendTo('#board');

    //@TODO
    //Draggable has a bug which prevents blur event
    //http://bugs.jqueryui.com/ticket/4261
    //So we have to blur all the cards and editable areas when
    //we click on a card
    //The following doesn't work so we will do the bug
    //fix recommended in the above bug report
    // card.click( function() {
    // 	$(this).focus();
    // } );

    card.draggable({
        snap: false,
        snapTolerance: 5,
        containment: [0, 0, 2000, 2000],
        stack: ".cardstack",
        start: function(event, ui) {
            keyTrap = null;
        },
        drag: function(event, ui) {
            if (keyTrap == 27) {
                ui.helper.css(ui.originalPosition);
                return false;
            }
        },
        handle: "div.content",
        zIndex: 100
    });

    //After a drag:
    card.bind("dragstop", function(event, ui) {
        if (keyTrap == 27) {
            keyTrap = null;
            return;
        }

        if ($(event.target).hasClass("stuck-sticker"))
        {
            //You're dragging a sticker on the card, not the card itself
            //so do not move the card
            if(event.offsetX > 20) console.log('delete!');
            return;
        }

        var data = {
            id: this.id,
            position: ui.position,
            oldposition: ui.originalPosition,
        };

        sendAction('moveCard', data);
        const message = {action: 'moveCard', data: data}
        dispatchWebSocketMessage({action:'default', message})
    });

    card.children(".droppable").droppable({
        accept: '.sticker',
        drop: function(event, ui) {
            var stickerId = ui.draggable.attr("id");
            var cardId = $(this).parent().attr('id');

            addSticker(cardId, stickerId);

            var data = {
                cardId: cardId,
                stickerId: stickerId
            };
            sendAction('addSticker', data);

            //remove hover state to everything on the board to prevent
            //a jquery bug where it gets left around
            $('.card-hover-draggable').removeClass('card-hover-draggable');
        },
        hoverClass: 'card-hover-draggable'
    });

    var speed = Math.floor(Math.random() * 1000);
    if (typeof(animationspeed) != 'undefined') speed = animationspeed;

    var startPosition = $("#create-card").position();

    const top = startPosition.top - card.height() * 0.5;
    const left = startPosition.left - card.width() * 0.5;

    card.css('top', startPosition.top - card.height() * 0.5);
    card.css('left', startPosition.left - card.width() * 0.5);

    card.animate({
        left: x + "px",
        top: y + "px"
    }, speed);

    card.hover(
        function() {
            $(this).addClass('hover');
            $(this).children('.card-icon').fadeIn(10);
        },
        function() {
            $(this).removeClass('hover');
            $(this).children('.card-icon').fadeOut(150);
        }
    );

    card.children('.card-icon').hover(
        function() {
            $(this).addClass('card-icon-hover');
        },
        function() {
            $(this).removeClass('card-icon-hover');
        }
    );

    card.children('.delete-card-icon').click(
        function() {
            requestDeleteNote(id);
            $("#" + id).remove();
            //notify server of delete
            sendAction('deleteCard', {
                'id': id
            });
            /**@type DeleteNote */
            const message = { action: 'deleteCard', data: { id } }
            dispatchWebSocketMessage({action: 'default', message});
        }
    );

    card.children('.change-colour').click(
        function() {
                rotateCardColor(id, $(this).data('colour'));
            });
 
    
    card.children('.content').editable({
        multiline: true,
        saveDelay: 600,
        save: function(content) {
            onCardChange(id, content.target.innerText, null);
        },
        /**@see {@link [end method](https://github.com/agrinko/jquery-contenteditable#end-void)} */
        end: function(event) {
            const text = event.target.textContent
            /**@type EditNote */
            const message = { 
                action: 'editCard', 
                data: { 
                    id, 
                    value: text, 
                    colour: '' 
                } 
            }
            dispatchWebSocketMessage({ action: 'default', message })
            const cardElement = document.getElementById(id);
            
            const top = parseInt(cardElement.style.top, 10);
            const left = parseInt(cardElement.style.left, 10);
            
            /**@type NotePosition */
            const position = { top, left }
            
            /**@type {SVGElement} */
            const svgCard = cardElement.querySelector('[data-colour]');
            const colour = svgCard.getAttribute('data-colour');

            addUpdateBoardNotes({ id, text, position, colour });
        }
    });

    //add applicable sticker
    if (sticker)
        addSticker(id, sticker);

    //update the board notes map
    //addUpdateBoardNotes({id, colour, position: { left, top }, text});
}


async function onCardChange(id, text, c) {
    sendAction('editCard', {
        id: id,
        value: text,
        colour: c
    });
    dispatchWebSocketMessage({action: 'default', 
        message: { action: 'editCard', 
        data: { id, value: text, colour: c }
    }});
}

function moveCard(card, position) {
    card.animate({
        left: position.left + "px",
        top: position.top + "px"
    }, 500);
    const message = {action: 'moveCard', data: position};
    dispatchWebSocketMessage({action:'default', message});
}

function addSticker(cardId, stickerId) {

    stickerContainer = $('#' + cardId + ' .filler');

    if (stickerContainer.length == 0) return;

    if (stickerId === "nosticker") {
        stickerContainer.html("");
        return;
    }


    if (Array.isArray(stickerId)) {
        for (var i in stickerId) {
            stickerContainer.prepend('<img src="images/stickers/' + stickerId[i] +
                '.png" class="stuck-sticker">');
        }
    } else {
        if (stickerContainer.html().indexOf(stickerId) < 0)
            stickerContainer.prepend('<img src="images/stickers/' + stickerId +
                '.png" class="stuck-sticker">');
    }

    $(".stuck-sticker").draggable({
        revert: true,
        zIndex: 1000,
        cursor: "pointer",
    });

}


//----------------------------------
// cards
//----------------------------------
async function createCard(id, text, x, y, rot, colour, type) {
    drawNewCard(id, text, x, y, rot, colour, type, null, null);

    var action = "createCard";

    var data = {
        id: id,
        text: text,
        x: x,
        y: y,
        rot: rot,
        colour: colour,
        type: type
    };

    sendAction(action, data);
    dispatchWebSocketMessage({action: 'default', message: {action, data}})
}

/**
 * 
 * @param {Object} note
 * @param {string} note.id
 * @param {string} note.text
 * @param {NotePosition} note.position
 * @param {Colour} note.colour
 */
function addUpdateBoardNotes({id, text, position, colour}) {
    let note = {};
    if(!boardNotesMap.has(id)) {
        /**@type BoardNote */
        note = {
            id: id,
            data: { text, position, colour },
            status: 'Not Inserted',
        }
    } else {
        note = {
            id:id,
            data: { text, position, colour },
            status: 'Inserted'
        }
    }
    boardNotesMap.set(note.id, note)
    boardNotesMap.forEach(function(value, key) {
        console.log(key+ ":", value.data, value.status);
    });
}

var cardColours = ['yellow', 'green', 'blue', 'white'];
var stickyColours = ['1', '2', '3'];


function randomCardColour() {

    var i = Math.floor(Math.random() * cardColours.length);

    return cardColours[i];
}

function randomStickyColour() {

    var i = Math.floor(Math.random() * stickyColours.length);

    return stickyColours[i];
}


function rotateCardColor(id, currentColour) {
    var index = cardColours.indexOf(currentColour.toString());
    //new position:
    var newIndex = index + 1;
    newIndex = newIndex % (stickyColours.length + 1);
    const newColor = cardColours[newIndex];
    
    $('#'+id).children('.card-image').attr("src", 'images/' + newColor + '-card.png');
    $('#'+id).children('.change-colour').data('colour',newColor);
    
    /** added these lines, looks like there was a bug in updating the colour attribute */
    const card = document.getElementById(id);
    const svg = card.querySelector('[data-colour]')
    svg.setAttribute('data-colour', newColor);

    /** update the board note in the boardNotesMap */
    const {data: { position, text } } = boardNotesMap.get(id);
    addUpdateBoardNotes({ id, colour: newColor, position, text })

    //var trueId = id.substr(4); // remove "card" from start of id // no don't do this, server wants "card" in front
    onCardChange(id, null, newColor);

}


function initCards(cardArray) {
    //first delete any cards that exist
    $('.card').remove();

    cards = cardArray;

    for (var i in cardArray) {
        card = cardArray[i];

        drawNewCard(
            card.id,
            card.text,
            card.x,
            card.y,
            card.rot,
            card.colour,
            card.type,
            card.sticker,
            0,
        );
    }

    boardInitialized = true;
    // unblockUI();
}


//----------------------------------
// cols
//----------------------------------

function drawNewColumn(columnName) {
    var cls = "col";
    if (totalcolumns === 0) {
        cls = "col first";
    }

    $('#icon-col').before('<td class="' + cls +
        '" width="10%" style="display:none"><h2 id="col-' + (totalcolumns + 1) +
        '" class="editable column-editable">' + columnName + '</h2></td>');

    $('.editable').editable({
        multiline: false,
        save: function(content) {
            onColumnChange(this.id, content.target.innerText);
        }
    });    

    $('.col:last').fadeIn(1500);

    totalcolumns++;
}

function onColumnChange(id, text) {
    var names = Array();

    //Get the names of all the columns right from the DOM
    $('.col').each(function() {

        //get ID of current column we are traversing over
        var thisID = $(this).children("h2").attr('id');

        if (id == thisID) {
            names.push(text);
        } else {
            names.push($(this).text());
        }

    });

    updateColumns(names);
}

function displayRemoveColumn() {
    if (totalcolumns <= 0) return false;

    $('.col:last').fadeOut(150,
        function() {
            $(this).remove();
        }
    );

    totalcolumns--;
}

function createColumn(name) {
    if (totalcolumns >= 8) return false;
    drawNewColumn(name);
    columns.push(name);

    var action = "updateColumns";

    var data = columns;

    sendAction(action, data);
    const message = {action: action, data: data};
    dispatchWebSocketMessage({action:'default', message});
}

function deleteColumn() {
    if (totalcolumns <= 0) return false;

    displayRemoveColumn();
    columns.pop();

    var action = "updateColumns";

    var data = columns;

    sendAction(action, data);
    const message = {action: action, data: data};
    dispatchWebSocketMessage({action:'default', message});
}

function updateColumns(c) {
    columns = c;

    var action = "updateColumns";

    var data = columns;

    sendAction(action, data);
    const message = {action: action, data: data};
    dispatchWebSocketMessage({action:'default', message});
}

function deleteColumns(next) {
    //delete all existing columns:
    $('.col').fadeOut('slow', next());
}

function initColumns(columnArray) {
    totalcolumns = 0;
    columns = columnArray;

    $('.col').remove();

    for (var i in columnArray) {
        column = columnArray[i];

        drawNewColumn(
            column
        );
    }
}


function changeThemeTo(theme) {
    currentTheme = theme;
    $("link[title=cardsize]").attr("href", "css/" + theme + ".css");
}


//////////////////////////////////////////////////////////
////////// NAMES STUFF ///////////////////////////////////
//////////////////////////////////////////////////////////



function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays === null) ? "" : "; expires=" +
        exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
}


function setName(name) {
    sendAction('setUserName', name);

    setCookie('scrumscrum-username', name, 365);
}

function displayInitialUsers(users) {
    for (var i in users) {
        displayUserJoined(users[i].sid, users[i].user_name);
    }
}

function displayUserJoined(sid, user_name) {
    name = '';
    if (user_name)
        name = user_name;
    else
        name = sid.substring(0, 5);


    $('#names-ul').append('<li id="user-' + sid + '">' + name + '</li>');
}

function displayUserLeft(sid) {
    name = '';
    if (name)
        name = user_name;
    else
        name = sid;

    var id = '#user-' + sid.toString();

    $('#names-ul').children(id).fadeOut(1000, function() {
        $(this).remove();
    });
}


function updateName(sid, name) {
    var id = '#user-' + sid.toString();

    $('#names-ul').children(id).text(name);
}

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

function boardResizeHappened(event, newSize) {
    sendAction('setBoardSize', newSize);
}

function resizeBoard(size) {
    // $(".board-outline").animate({
    //     height: size.height,
    //     width: size.width
    // });

    $(".board-outline").height(size.height);
    $(".board-outline").width(size.width);

    $('.board-outline').trigger('initboard');


}
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

function calcCardOffset() {
    var offsets = {};
    $(".card,.sticky").each(function() {
        var card = $(this);
        $(".col").each(function(i) {
            var col = $(this);
            if (col.offset().left + col.outerWidth() > card.offset().left +
                card.outerWidth() || i === $(".col").length - 1) {
                offsets[card.attr('id')] = {
                    col: col,
                    x: ((card.offset().left - col.offset().left) / col.outerWidth())
                };
                return false;
            }
        });
    });
    return offsets;
}


//moves cards with a resize of the Board
//doSync is false if you don't want to synchronize
//with all the other users who are in this room
function adjustCard(offsets, doSync) {
    $(".card,.sticky").each(function() {
        var card = $(this);
        var offset = offsets[this.id];
        if (offset) {
            var data = {
                id: this.id,
                position: {
                    left: offset.col.position().left + (offset.x * offset.col
                        .outerWidth()),
                    top: parseInt(card.css('top').slice(0, -2))
                },
                oldposition: {
                    left: parseInt(card.css('left').slice(0, -2)),
                    top: parseInt(card.css('top').slice(0, -2))
                }
            }; //use .css() instead of .position() because css' rotate
            if (!doSync) {
                card.css('left', data.position.left);
                card.css('top', data.position.top);
            } else {
                //note that in this case, data.oldposition isn't accurate since
                //many moves have happened since the last sync
                //but that's okay becuase oldPosition isn't used right now
                moveCard(card, data.position);
                sendAction('moveCard', data);
            }

        }
    });
}

//adjusts the marker and eraser after a board resize
function adjustMarker(originalSize, newSize) {
    //remove any y positioning. Makes a harsh jump but works as a hack
    $("#marker,#eraser").css('top','');
     
    //if either has gone over the edge of the board, just bring it in
    if ( parseFloat($('#marker').css('left')) > newSize.width - 100)
    {
        $('#marker').css('left', newSize.width-100 + 'px' );
    }
    if ( parseFloat($('#eraser').css('left')) > newSize.width - 100)
    {
        $('#eraser').css('left', newSize.width-100 + 'px' );
    }
}

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

$(function() {


	//disable image dragging
	//window.ondragstart = function() { return false; };

/*----------------Removing due to hang on load-------------------(Jason)
    if (boardInitialized === false)
        blockUI('<img src="images/ajax-loader.gif" width=43 height=11/>');

    //setTimeout($.unblockUI, 2000);
/*----------------Removing due to hang on load-------------------(Jason)*/

    $("#create-card")
        .click(function() {
            var rotation = Math.random() * 10 - 5; //add a bit of random rotation (+/- 5deg)
            uniqueID = Math.round(Math.random() * 99999999); //is this big enough to assure uniqueness?
            //alert(uniqueID);
            createCard(
                'card' + uniqueID,
                '',
                58, $('div.board-outline').height(), // hack - not a great way to get the new card coordinates, but most consistant ATM
                rotation,
                randomCardColour(),
                "card");
        });
    
    $("#create-sticky")

        .click(function() {
            var rotation = Math.random() * 4 - 2; //add a bit of random rotation (+/- 2deg)
            uniqueID = Math.round(Math.random() * 99999999); //is this big enough to assure uniqueness?
            createCard(
                'card' + uniqueID,
                '',
                58, $('div.board-outline').height(), // hack - not a great way to get the new card coordinates, but most consistant ATM
                rotation,
                randomStickyColour(),
                "sticky");
        });



    // Style changer
    $("#smallify").click(function() {

        var newBoardSize = {};
        var oldWidth = $(".board-outline").width();
        var oldHeight = $(".board-outline").height();

        var offsets = calcCardOffset();
    
        if (currentTheme == "bigcards") {
            changeThemeTo('smallcards');
            newBoardSize.height = oldHeight / 1.5;
            newBoardSize.width = oldWidth / 1.5;
        } else if (currentTheme == "smallcards") {
            changeThemeTo('bigcards');
            newBoardSize.height = oldHeight * 1.5;
            newBoardSize.width = oldWidth * 1.5;
        }
        /*else if (currentTheme == "nocards")
		{
			currentTheme = "bigcards";
			$("link[title=cardsize]").attr("href", "css/bigcards.css");
        }*/
    
        resizeBoard(newBoardSize);
        boardResizeHappened(null, newBoardSize);
        adjustCard(offsets, true);


        sendAction('changeTheme', currentTheme);




        return false;
    });



    $('#icon-col').hover(
        function() {
            $('.col-icon').fadeIn(10);
        },
        function() {
            $('.col-icon').fadeOut(150);
        }
    );

    $('#add-col').click(
        function() {
            createColumn('New');
            return false;
        }
    );

    $('#delete-col').click(
        function() {
            deleteColumn();
            return false;
        }
    );


    // $('#cog-button').click( function(){
    // 	$('#config-dropdown').fadeToggle();
    // } );

    // $('#config-dropdown').hover(
    // 	function(){ /*$('#config-dropdown').fadeIn()*/ },
    // 	function(){ $('#config-dropdown').fadeOut() }
    // );
    //

    var user_name = getCookie('scrumscrum-username');



    $("#yourname-input").focus(function() {
        if ($(this).val() == 'unknown') {
            $(this).val("");
        }

        $(this).addClass('focused');

    });

    $("#yourname-input").blur(function() {
        if ($(this).val() === "") {
            $(this).val('unknown');
        }
        $(this).removeClass('focused');

        setName($(this).val());
    });

    $("#yourname-input").val(user_name);
    $("#yourname-input").blur();

    $("#yourname-li").hide();

    $("#yourname-input").keypress(function(e) {
        code = (e.keyCode ? e.keyCode : e.which);
        if (code == 10 || code == 13) {
            $(this).blur();
        }
    });



    $(".sticker").draggable({
        revert: true,
        zIndex: 1000
    });


    $(".board-outline").resizable({
        ghost: false,
        minWidth: 700,
        minHeight: 400,
        maxWidth: 3200,
        maxHeight: 1800,
    });

    //A new scope for precalculating
    (function() {
        var offsets;

        $(".board-outline").bind("resizestart", function() {
            offsets = calcCardOffset();
        });
        $(".board-outline").bind("resize", function(event, ui) {
            adjustCard(offsets, false);
        });
        $(".board-outline").bind("resizestop", function(event, ui) {
            boardResizeHappened(event, ui.size);
            adjustCard(offsets, true);
            adjustMarker(ui.originalSize, ui.size);
        });
    })();



    $('#marker').draggable({
        axis: 'x',
        containment: 'parent'
    });

    $('#eraser').draggable({
        axis: 'x',
        containment: 'parent'
    });


    
    $( "#menu" ).menu();
    $('#configmenu').click(function() {
        $('#menu').show();
    });
    $(document.body).click(function() {
        $('#menu').hide();
    });
    $("#menu,#configmenu").click( function(e) {
        e.stopPropagation(); // this stops the event from bubbling up to the body
    });
    
    $(".ceditable").editable({
        multiline: false,
        saveDelay: 600, //wait 600ms before calling "save" callback
        autoselect: false, //select content automatically when editing starts
        save: function(content) {
            //here you can save content to your MVC framework's model or send directly to server...

            var action = "editText";

            var data = {
                item: 'board-title',
                text: content.target.innerText
            };
            
            if (content.target.innerText.length > 0)
                sendAction(action, data);
                

        },
        validate: function(content) {
            //here you can validate content using RegExp or any other JS code to return false for invalid input
            return content !== "";
        }
    });

    
});

function closeAlert() {
    const toastMessage = document.getElementById('confirmation-prompt')
    toastMessage.style.display = 'none';
    toastMessage.classList.remove('toast-animate')
}

function openAlert() {
    const toastMessage = document.getElementById('confirmation-prompt')
    toastMessage.style.display = 'block';
    toastMessage.classList.add('toast-animate')
    const animations = toastMessage.getAnimations();
    const fadeOut = animations.find(ani => ani.animationName === 'fade-out')
    fadeOut.onfinish = () => closeAlert();
}

async function getBoardByName(boardName) {
  
    const currentBoard = await fetch(url + boardName, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
      .then((response) => response.json())
      .then((json) => json);

    return currentBoard;
  }