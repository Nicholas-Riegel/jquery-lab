// -----------------------------------Constants and Variables-------------------------------------------

// this is used to determin where the cookie is
const gameArray = []

// these are used to determine if the user is in the right row or column (hints are given to the player when this is the case)
const rows = []
const columns = []

// the number in the game array where the cookie is
let cookieNumber = null;

// number of columns chosen by the player (large screens only)
let columnNumber = 5

// image of the cookie
let cookiePic = null;

// game timer
const timer = $('#timer')
let timeLeft = 30
let timerOn = false;
// this will be the setInterval(updateTimer, 1000) function
let timerInterval = null;

let highScore = 0
let playerScore = 0

// displays hints, whether game is over, etc.
const statusDisplay = $('#status-display')
// where cookies are dropped when finished
const dropZone = $('#dropZone')
const startButton = $('#start-btn')
const stopButton = $('#stop-btn')
const columnNumberButton = $('#getColNo')

const playerScoreDisplay = $('#your-score')
const highScoreDisplay = $('#high-score')

// -----------------------------------Start Page Defaults----------------------------------------------------

timer.text(timeLeft)
playerScoreDisplay.text(playerScore)
highScoreDisplay.text(highScore)

// -----------------------------------Event Listeners----------------------------------------------------


// start game
startButton.on('click', e => {
    // chatGPT definitely helped with this code: https://chat.openai.com/c/b5238c30-289f-4511-8ce2-47197b7ed0f8
    // remove cookies from cookie jar drop zone
    const parent = $('#dropZone');
    const childrenToRemove = parent.find('.cookiePic');
    childrenToRemove.each(function() {
        $(this).remove();
    });

    // set player score to 0
    playerScore = 0
    $('#your-score').text(playerScore)
    // set timer to 30s
    timeLeft = 30

    // if timer is off, set to on, set color and start timer
    if (timerOn === false){
        timerOn = true
        timer.css('color', 'rgb(246, 71, 71)');
        timerInterval = setInterval(updateTimer, 1000);
    }
    // start game
    startGame(columnNumber)
})

// column number action button
columnNumberButton.on('click', e => {
    // get number from user input
    const inputValue = parseInt($('#numberColumns').val(), 10); 
    // jquery for the above line?
    

    // if input value is true and a number, then set value
    if(inputValue && typeof inputValue === 'number'){
        if (inputValue > 10){
            columnNumber = 10;
        } else if (inputValue < 5){
            columnNumber = 5
        } else {
            columnNumber = inputValue;
        }
    } else {
        columnNumber = 5
    }
    startGame(columnNumber)
})

// this turns off the timer when stop button is pressed
stopButton.on('click', e => {
    // turn off timer
    clearInterval(timerInterval);
    // set timerOn to false
    timerOn = false
})

// -----------------------------------Functions---------------------------------------------------------

// timer function 
const updateTimer = () => {
    // ChatGPT helped with this code: https://chat.openai.com/c/6a37ffb8-48c9-43fd-9a5a-f738bf2bf722
    // timeLeft is a global variable, initially set to 30
    timer.text(timeLeft)
    // decrement timeLeft by one
    timeLeft--
    // if timeLeft is less than 0 
    if (timeLeft < 0) {
        // stop timer
        clearInterval(timerInterval);
        timerOn = false;
        // if players score is more than high score, set high score to player score
        if (playerScore > highScore){
            highScore = playerScore
            highScoreDisplay.text(highScore)
        }
        // if player score is 0 player loses, otherwise they win
        if (playerScore === 0){
            statusDisplay.text("Game Over! You Lose! You didn't find any cookies!")
        } else {
            statusDisplay.text("Game Over! You Win! You found some cookies!")
        }
    }
}

// create board
const createBoard = (colNo) => {
    // get gameboard container from html
    const gameboardContainer = $('#gameboard-container')
    // create a section to be attached to gameboard container
    const board = $('<section></section>');
    // give board id
    board.attr('id', 'gameboard')
    // set width of gameboard
    board.css('width', `${50 * colNo}px`);

    // set grid template columns
    board.css('gridTemplateColumns', `repeat(${colNo}, 1fr)`)
    // populate board with cells 
    for(let i = 0; i < colNo ** 2; i++){
        const cell = $('<div></div>')
        cell.attr('class', 'cell')
        cell.attr('id', i)
        board.append(cell)
    }
    // append board to container
    gameboardContainer.append(board)
}

// calculate rows
// this is needed to programatically get rows of different sized boards, in order to determine whether user is in the right row, i.e.
// first row    [0, 1, 2, 3]
// second row   [4, 5, 6, 7]
// third row    [8, 9, 10, 11]
// fourth row   [12, 13, 14, 15]
const calculateRows = (colNo) => {
    let k = 0
    for (let i = 0; i < colNo; i++){
        const row = []
        for(let j = 0; j < colNo; j++){
            row.push(k)
            k++
        }
        rows.push(row)
    }
}

// calculate columns
// this is needed to programatically get columns of different sized boards, in order to determine whether user is in the right column, i.e.
// first column     [0, 4, 8, 12]
// second column    [1, 5, 9, 13]
// third column     [2, 6, 10, 14]
// fourth column    [3, 7, 11, 15]
const calculateColumns = (colNo) => {
    let k = 0
    for (let i = 0; i < colNo; i++){
        const column = []
        for(let j = 0; j < colNo; j++){
            column.push(k + i)
            k += colNo
        }
        k = 0
        columns.push(column)
    }
}

// create cookie 
const createCookie = () => {    
    // create image element
    const cookiePic = $('<img>')
    // Image author: Vincent Le Moign: https://commons.wikimedia.org/wiki/File:556-cookie.svg
    // give element the source
    cookiePic.attr('src', './assets/cookie-pic.png');
    // assign dimensions
    cookiePic.css('maxWidth', '47px')
    cookiePic.css('maxHeight', '47px')
    // set class
    cookiePic.attr('class', 'cookiePic')
    return cookiePic[0];
}

// what happens if player finds cookie
const cookieFoundAction = (e) => {
    // create a cookie image
    cookiePic = createCookie()
    // append the image to the cell
    e.target.append(cookiePic)
    // display message 
    statusDisplay.text('YOU GET A COOOKIE!')
    // for windows greater thann 810 allow dragging
    // This is the minimum size that allows 10 columns 
    if (window.innerWidth > 810){
        // enable cookie dragging: this code was adapted from Youtube content creator "Darwin Tech": 
        // https://www.youtube.com/watch?v=_G8G1OrEOrI
        cookiePic.setAttribute('cursor', 'move') // this has to be left in js since it doesn't work in jquery
        cookiePic.setAttribute('draggable', 'true') // this has to be left in js since it doesn't work in jquery
        dropZone.on('dragover', function(e) {
            e.preventDefault();
        });
        
        // allow dropping cookie only if timer is still on
        dropZone.on('drop', e=>{
            if (timerOn === true){
                dropZone.append(cookiePic)
                playerScore = dropZone.find('.cookiePic').length;
                playerScoreDisplay.text(playerScore);
                startGame(columnNumber)
            }
        })
    // for screens smaller than 810, cookie goes to jar automatically, because dragging doesn't really work on mobile screens
    } else if (timerOn === true){
            dropZone.append(cookiePic)
            playerScore = dropZone.find('.cookiePic').length;
            playerScoreDisplay.text(playerScore);
            startGame(columnNumber)
    }
}

// what happens if player clicks a cell where the cookie isn't
const cookieNotFoundAction = (e, id) => {
    // place an x in the cell
    $(e.target).text('x')
    // clear the status display
    statusDisplay.text('');
    // check if the row contains the cookie. If so, give player hint
    rows.forEach(x => {
        if (x.includes(id) && x.includes(cookieNumber)){    
            statusDisplay.text("It's in this row!")
        }
    })
    // check if the column contains the cookie. If so, give player hint
    columns.forEach(x => {
        if (x.includes(id) && x.includes(cookieNumber)){
            statusDisplay.text("It's in this column!")
        }
    })
}


// make cells clickable, game playable
const cellsClickable = () => {    
    // get each cell by class
    $('.cell').each(function() {
        // make each cell clickable
        $(this).on('click', e => {
            // if timer is still on get id of cell
            if (timerOn){

                const id = parseInt($(this).attr('id'), 10)
                
                // if 'o' is at that id number, call cookieFoundAction function
                if (gameArray[id] === 'o'){
                
                    cookieFoundAction(e)

                } else {

                // otherwise call cookieNotFoundAction function
                    cookieNotFoundAction(e, id)
                    
                }
            }
        })
    })
}



const startGame = (colNo) => {
    // clear everything
    gameArray.length = 0;
    rows.length = 0;
    columns.length = 0;
    if ($('#gameboard')){
        $('#gameboard').remove();
    }
    statusDisplay.text('')
    $('#numberColumns').val = ''

    // hardcode column number for screens less than 520;
    // 520 is the smallest width you can have 10 columns
    if (window.innerWidth < 520){
        columnNumber = 5;
    }
    
    // create new board
    createBoard(colNo)
    
    // reset game array
    for(let i = 0; i < colNo ** 2; i++){
        gameArray.push(i)
    }
    // set new place for cookie
    cookieNumber = Math.floor(Math.random() * colNo ** 2)
    gameArray[cookieNumber] = 'o'
    
    // calculate rows and columns
    calculateColumns(colNo)
    calculateRows(colNo)
    
    // make cells clickable etc.
    cellsClickable()
    
}

// -----------------------------------Start Game--------------------------------------------------------

startGame(columnNumber)