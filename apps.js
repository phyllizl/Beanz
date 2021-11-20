/////////////////////////////////////////////////////////////
/////////////////////////CREATE LANDING PAGE AND DIVS 

//CREATE A GAME LANDING PAGE
const hideGameBoard = () => {
    $(".container").hide();
    $(".containerbeanz").hide();
}

//SHOW INSTRUCTION PAGE
const showInstructions = () => {
    makeInstructions();
    $("#instructions").show();
}

//HIDE GAME LANDING PAGE 
const hideSplashScreen = () => {
    $("#splashScreen").hide();
}

//SHOW GAME BOARD
const showGameBoard = () => {
    $("#instructions").hide();
    $(".container").show();
    $(".containerbeanz").show();
}

//MAKE SPLASH SCREEN
const makeSplashScreen = () => {
    //create the splashScreen div
    const div0 = $("<div>").attr("id", "splashScreen");
    $("body").append(div0);
    $(div0).append("<h1>ARE YOU READY FOR BEANZ</h1>");
    let playNow = $("<button>PLAY NOW</button>");
    $(div0).append(playNow);
    //Playnow function
    playNow.click(() => {
        hideSplashScreen();
        showInstructions();
    })
}

//CREATE INSTRUCTION PAGE
const makeInstructions = () => {
    //CREATE INSTRUCTIONS DIV
    const div3 = $("<div>").attr("id", "instructions");
    const box = $("<div>").attr("id", "box");
    $("body").append(box);
    $(box).append(div3);
    //INSTRUCTIONS
    $(div3).append("<h1>INSTRUCTIONS</h1>").append('<h2>Click on as many Green Beans <img src="assets/greenbean.gif" width="60px" height="60px"/> as possible while avoiding the Red Beans <img src="assets/3dgifmaker89063.gif" width="60px" height="60px"</img>! If you spot the Magic Beans <img src="assets/magicBeans.gif" width="60px" height="60px"/>, act fast and click on them for bonus points!</h2>');
    $(div3).append('<h2>A successfully clicked Green Bean turns into a Sprout  <img src="assets/greenSoil.png" width="50px" height="50px"/> and + 5 points to your score ! A successfully clicked Magic Bean turns into a Star <img src="assets/newstar.png" style="padding-top: 10px;" width="50px" height="50px"/> and + 8 points to your score! Click on a Red Bean and ... a Monster Bean appears <img src="assets/monster.gif" width="60px" height="60px"/> and - 3 points to your score!  Eeps!');
    //APPEND BUTTON TO ENTER GAMEBOARD
    let playNow = $("<button>PLAY NOW</button>");
    $(div3).append(playNow);
    //PLAYNOW ONCLICK
    playNow.click(() => {
        showGameBoard();
    })   
}

//MAKE DIV TO HOLD GRID
const makeDiv1 = () => {
    const $div1 = $("<div1>").attr("id", "grid");
    $(".container").append($div1);
};

//MAKE DIV2 TO HOLD TIMER
const makeDiv2 = () => {
    const $div2 = $("<div2>").addClass("div2");
    $(".container").append($div2);

    //create and append countdown container
    const baseTimer = $("<div>").attr("id", "base-timer");
    $($div2).append(baseTimer);

    //create id of timer
    const timer = $("<div>").attr("id", "timer");
    $("#base-timer").append(timer);

    //create span for time left
    const secs = $("<span>").attr("id", "secs");
    $("#timer").append(secs);

    //create div in #base-time to stor buttons
    const divButtons = $("<div>").attr("id", "divButtons");
    $("#base-timer").append(divButtons);

    //the timer function + button
    const startButton = $("<button>START</button>").attr("id", "startButton");
    $("#divButtons").append(startButton);

};

hideGameBoard();
makeSplashScreen();
makeDiv1();
makeDiv2();

/////////////////////////////////////////////////////////////
/////////////////////////CREATE VAR TO STORE NUMBER VALUES
//CALCULATE % 
const percentage = (num, per) => {
    let percentage = Math.floor((num/100) * per);
    return percentage;
}
//CONSTANTS FOR ALL MY NUMBER VARIABLES
let gridSize = 6; 
let numOfSquares = gridSize * gridSize; 
let numOfGreen = percentage(numOfSquares, 35);
let numOfMagic = percentage(numOfSquares, 6);
let magicIntervals = 5;
let greenPoints = 5;
let redPoints = -3;
let magicPoints = 8;
let timer = 6; 
const magicAppear = 2000;

/////////////////////////////////////////////////////////////
/////////////////////////CREATE GRID AND BEANS 

//START WITH POINTS = 0
let points = 0;
$("#secs").text(points);

//CREATE GRID
const createGrid = (num) => {
    for (row = 0; row < num; row++) {
        for (column = 0; column < num; column++) {
            $("div1").append("<div class=square></div>");
        }
    }
    $(".square").width(($(".square").closest("#grid").width())/num);
    $(".square").height(($(".square").closest("#grid").height())/num);
}


//CREATE GREEN IN RANDOM SQUARES
const placeGreen = () => {
    let squaresArray = $(".square");
    for (i = 0; i < numOfGreen; i++) {
        let randomNumber = Math.floor(Math.random() * numOfSquares);
        let selectedSquare = squaresArray[randomNumber];
         while ($(selectedSquare).attr("class").includes("green")) {
            randomNumber = Math.floor(Math.random() * numOfSquares);
            selectedSquare = squaresArray[randomNumber];
        }
        $(selectedSquare).toggleClass("green");
    }
    for (i = 0; i < numOfSquares; i++) {
        if ($(squaresArray[i]).hasClass("green")) {
        } else {
            $(squaresArray[i]).toggleClass("red");
        }
     }
 };

//CREATE MAGIC SQUARES
const magic = () => {
    let squaresArray = $(".square");
    for (i = 0; i < numOfMagic; i++) {
        let randomNumber = Math.floor(Math.random() * numOfSquares);
        let magicSquare = squaresArray[randomNumber];
        $(magicSquare).toggleClass("magic");

        //store previous class value of bean
        if ($(magicSquare).hasClass("green")) {
            $(magicSquare).addClass("wasgreen");
            $(magicSquare).removeClass("green");
        } else if ($(magicSquare).hasClass("red")) {
            $(magicSquare).addClass("wasred");
            $(magicSquare).removeClass("red");
        }
    }
};

//REMOVE MAGIC BEANS AFTER 2 SECS
const removeMagic = () => {
    let squaresArray = $(".square");
    setTimeout(() => {
        $(".magic").toggleClass("magic");
        for (i = 0; i < numOfSquares; i++) {
            let refsquare = squaresArray[i];
            if ($(refsquare).hasClass("wasgreen")) {
                $(refsquare).addClass("green");
            } else if ($(refsquare).hasClass("wasred")) {
                $(refsquare).addClass("red");
            }
        }
    }, magicAppear);
}

/////////////////////////////////////////////////////////////
/////////////////////////CLICK FUNCTIONS

//GREEN ADDS POINTS AND TURNS INTO SOIL
const greenEffect = () => {
    $click = $("div1").on("click", ".green", (event) => {
        points = points + greenPoints;
        $(event.currentTarget).addClass("greenSoil");
        refreshBoard();
    });
}

//WHEN CLICKED ON GREEN, TURN BEAN INTO SPROUTS
//POINTS + 5
const $clickGreen = () => {
    if (!$(".green").hasClass("greensSoil")) {
        greenEffect();
    }
};

//WHEN CLICKED ON RED, ANGRY BEAN APPEARS FOR 1 SEC
//POINTS - 8
const $clickRed = () => {
    $click = $("div1").on("click", ".red", (event) => {
        points = points + redPoints;
        setTimeout(delayLoad, 500);
        refreshBoard();
        function delayLoad() {
            $(event.currentTarget).css(
                "background-image",
                "url(/assets/3dgifmaker89063.gif)"
            );
        }
        //monster bean appears for 1sec
        $(event.currentTarget).css(
            "background-image",
            "url(/assets/monster.gif)"
        );
    });
};

//WHEN CLICKED ON MAGIC SQUARES +8 POINTS
const $clickMagic = () => {
    $click = $("div1").on("click", ".magic", (event) => {
        points = points + magicPoints;
        $(event.currentTarget).addClass("disappear");
        refreshBoard();
    });
}

//CREATE START BUTTON
const startButton = () => {
    const start = $("#startButton").on("click", () => {
        points = 0;
        //REMOVE START BUTTON ONCE CLICKED
        $("#startButton").remove();
        //TIMER COUNTDOWN
        let counter = timer;
        //CLICK FUNCTIONS ACTIVATED
        createGrid(gridSize);
        $clickGreen();
        $clickRed();
        $clickMagic();
        //COUNTDOWN STARTS
        let start = setInterval(function () {
            //IF 0 --> SHOW SCORE, TURN OFF CLICK FUNCTIONS, TRIGGER TIME RESET
            if (counter === 0) {
                $("#secs").html("DONE" + "<br/>" + "YOUR SCORE: " + points);
                $("div1").off("click");
                clearInterval(start);
                playAgainButton();
                level2Button();
                return;
            }
            if (counter % magicIntervals === 0) {
                magic();
                removeMagic();
            }
            //IF NOT 0 --> SET TEXT TO SHOW TIMER AND POINTS GAINED
            $("#secs").html(counter + "<br/>" + "YOUR SCORE: " + points);
            counter--;
        }, 1000);
    });      
}

//REFRESH BOARD AFTER EVERY CLICK.
const refreshBoard = () => {
    let numArray = [];
    for (i = 0; i < numOfSquares; i++) {
        numArray.push(i);
    }
    let shuffledArray = numArray.sort(() => Math.random() - 0.5);

    //turn class of square into an array
    const squareArray = $(".square");
    //empty Div1
    $("div1").empty();
    //let i be (shuffledArray[i]), append squareArray[shuffledArray[i]] to div1
    for (i = 0; i < numArray.length; i++) {
        let squareArrayElementNumber = shuffledArray[i];
        $("div1").append(squareArray[squareArrayElementNumber]);
    }
}  

//CLEAR GRID, SCORE KEEPER AND TIMER
const refreshContainer = () => {
    $(".container").empty();
    makeDiv1();
    makeDiv2();
    console.log('gridsize', gridSize)
    createGrid(gridSize);
    placeGreen();
    startButton();
}

//CREATE PLAY AGAIN BUTTON
const playAgainButton = () => {
    let playAgainBtn = $("<button>PLAY AGAIN</button>");
    $("#divButtons").append(playAgainBtn);
    $(playAgainBtn).on("click", () => {
        refreshContainer();
    });
}

/////////////////////////////////////////////////////////////
/////////////////////////CALL GAME FUNCTIONS

startButton();
createGrid(gridSize);
placeGreen();

/////////////////////////////////////////////////////////////
/////////////////////////LEVEL 2

//CLEAR GRID BEFORE LEVEL 2
const clearGrid = () => {
    $("div1").empty();
}
const clearScores = () => {
    $("div2").empty();
}

let squaresArray = $(".square");
console.log(squaresArray);

//MAKE LEVEL 2 BOARD
const level2Game = () => {
    gridSize = 9;
    numOfSquares = gridSize * gridSize; 
    numOfGreen = percentage(numOfSquares, 30);
    numOfMagic = 5;
    refreshContainer();
}

//CREATE BUTTON TO ACCESS LEVEL 2
const level2Button = () => {
    let level2Button = $("<button>LEVEL 2</button>");
    $("#divButtons").append(level2Button)
    $(level2Button).on("click", () => {
        level2Game();
    });
}

