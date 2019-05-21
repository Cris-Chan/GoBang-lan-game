
var canvas = document.getElementById('canvas');
var ctn = canvas.getContext('2d');

var isWhite = true;   // 是否轮到白棋走
var isWell = false;  // 是否赢了

var imgBlack = new Image();
imgBlack.src = 'resources/black.png';
var imgWhite = new Image();
imgWhite.src = 'resources/white.png';

var chessData = []; //var chessData = new Array(15)

init();
//初始化棋盘


//------SOCKETS------
var teamchosen = false;
var team = "NA";
var isMyTurn = false;
var socket = io();

function removeButtons(){
  $("#button1").fadeTo(100,0);
  $("#button2").fadeTo(100,0);
  $("#button1").attr("disabled", true);
  $("#button2").attr("disabled", true);
}

function returnButtons(){
  $("#button1").fadeTo(100,1);
  $("#button2").fadeTo(100,1);
  $("#button1").attr("disabled", false);
  $("#button2").attr("disabled", false);
}

function emitData(x,y){ // sends placed piece
  socket.emit('move made', x+","+y+"-"); // send x and y cord
  $('#m').val('');
  if(isMyTurn) {
    isMyTurn = false;
    updateTurn();
  }else {
    isMyTurn = true;
    updateTurn();
  }
  return false;
}

function emitWin(player){
  socket.emit("win", player);
}

function emitChoice(){
  socket.emit("choice", team);
}

socket.on('disconnect', function(msg){
  if (teamchosen == false) {
    return;
  }
  alert("a player disconnected, Restarting");
  returnButtons();
  clearCanvas();
  $("#teamText").text("Your color is:");
  $("#turnStatus").text("your turn: ?");
});

socket.on('choice', function(msg){
  if (msg == "white") {
    teamchosen = true;
    team = "black";
    console.log("you are black");
    removeButtons();
    $("#teamText").text("Your color is: Black");
    $("#turnStatus").text("your turn: NO");
  }else {
    isMyTurn = true;
    teamchosen = true;
    team = "white";
    console.log("you are white");
    removeButtons();
    $("#teamText").text("Your color is: White");
    $("#turnStatus").text("your turn: yes");
  }

});

socket.on('win', function(msg){
  alert(msg+' Player Win!');
  clearCanvas();
  if(msg == "white"){
    var odiv = document.getElementById("player1win");
    var count = document.getElementById("player1win").innerHTML;
    increase(odiv,count);
  }else {
    var odiv = document.getElementById("player2win");
    var count = document.getElementById("player2win").innerHTML;
    increase(odiv,count);
  }
  returnButtons();
});

socket.on('move made', function(msg){ // listens for player move
  console.log("I hear ya buddy");
  if(isMyTurn) {
    isMyTurn = false;
    updateTurn();
  }else {
    isMyTurn = true;
    updateTurn();
  }

    //------EXTRACTS cords
    var xCord = "";
    var yCord = "";
    var x = 0;
    while(true){ // why didnt i make a for loop?
      if(msg[x] == ","){
        break;
      }
      xCord += msg[x];
      x++;
    }
    x++;
    while(true){ // why didnt i make a for loop?
      if(msg[x] == "-"){
        break;
      }
      yCord += msg[x];
      x++;
    }
    //--------------

   otherPlayerPlay(xCord,yCord);

  });


  function updateTurn(){
    if(isMyTurn){
      $("#turnStatus").text("your turn: YES");
    } else {
      $("#turnStatus").text("your turn: NO");
    }
  }

  function setblack(){
   teamchosen = true;
   team = "black";
   console.log("you are black");
   removeButtons();
   $("#teamText").text("Your color is: Black");
   $("#turnStatus").text("your turn: NO");
   emitChoice();
  }
  function setwhite(){
    teamchosen = true;
    isMyTurn = true;
    team = "white";
    console.log("You are white");
    removeButtons();
    $("#teamText").text("Your color is: white");
    $("#turnStatus").text("your turn: YES");
    emitChoice();
  }


//--------------------------------------





function init() {

    for (var i = 0; i <= 640; i += 40) {
        //绘制横线
        ctn.beginPath();
        ctn.moveTo(0, i);
        ctn.lineTo(640, i);
        ctn.closePath();
        ctn.stroke();
        //绘制竖线
        ctn.beginPath();
        ctn.moveTo(i, 0);
        ctn.lineTo(i, 640);
        ctn.closePath();
        ctn.stroke();
    }
    //初始化棋盘数组
    for (var x = 0; x < 15; x++) {
        chessData[x] = [];
        for (var y = 0; y < 15; y++) {
            chessData[x][y] = 0;
        }
    }
}

function clearCanvas()
{
    var cxt=document.getElementById("canvas").getContext("2d");
    cxt.clearRect(0,0,640,640);
    isWhite = true;   // 是否轮到白棋走
    isWell = false;  // 是否赢了
    init();

}

function increase(odiv,count){
    count = parseInt(count);
    count = count + 1;
    odiv.innerHTML = count;
}
//有些控制

function play(e) {
    if (isMyTurn == false) {
      console.log("not your turn bub");
      alert("Not Your turn! >:(");
      return;
    }
    var x = parseInt((e.clientX - 20) / 40);
    var y = parseInt((e.clientY - 20) / 40);

    if (chessData[x][y] != 0) {
        alert('you cannot put the chess down here!');
        return;
    }

    if (isWell) {
        alert('Game Over, Fresh to play again！');
        return;
    }

    emitData(x,y);

    if (team == "white") {
        console.log("DRAWING IN WHITE");
        drawChess(1, x, y);
        judge(1, x, y);
    } else {
        console.log("DRAWING IN BLACK");
        drawChess(2, x, y);
        judge(2, x, y);
    }

}
//绘制单个棋子


function otherPlayerPlay(x,y){
  if (team == "white") { // I inverted colors here
      console.log("OTHER IN BLACK");
      drawChess(2, x, y);
  } else {
      drawChess(1, x, y);
      console.log("OTHER IN WHITE");
  }
}

function drawChess(chess, x, y) {

    if (x >= 0 && x < 15 && y >= 0 && y < 15) {
        if (chess == 1) {
            ctn.drawImage(imgWhite, x * 40 + 20, y * 40 + 20);
            chessData[x][y] = 1;
        } else {
            ctn.drawImage(imgBlack, x * 40 + 20, y * 40 + 20);
            chessData[x][y] = 2;
        }
    }
}
//输的算法

function judge(chess, x, y) {
    var hz = 0;
    var ve = 0;
    var nw = 0;
    var ne = 0;
    //判断左右
    for (var i = x; i > 0; i--) {
        if (chessData[i][y] != chess) {
            break;
        }
        hz++;
    }
    for (var i = x + 1; i < 15; i++) {
        if (chessData[i][y] != chess) {
            break;
        }
        hz++;
    }
    //判断上下
    for (var i = y; i > 0; i--) {
        if (chessData[x][i] != chess) {
            break;
        }
        ve++;
    }
    for (var i = y + 1; i < 15; i++) {
        if (chessData[x][i] != chess) {
            break;
        }
        ve++
    }
    //判断左上右下
    for (var i = x, j = y; i > 0, j > 0; i--, j--) {
        if (chessData[i][j] != chess) {
            break;
        }
        nw++;
    }
    for (var i = x + 1, j = y + 1; i < 15, j < 15; i++, j++) {
        if (chessData[i][j] != chess) {
            break;
        }
        nw++;
    }
    //判断右上左下
    for (var i = x, j = y; i >= 0, j < 15; i--, j++) {
        if (chessData[i][j] != chess) {
            break;
        }
        ne++;
    }
    for (var i = x + 1, j = y - 1; i < 15, j >= 0; i++, j--) {
        if (chessData[i][j] != chess) {
            break;
        }
        ne++;
    }

    if (hz >= 5 || ve >= 5 || nw >= 5 || ne >= 5) {
        if (chess == 1) {
            isWell = true;
            emitWin("white");
        } else {
            isWell = true;
            emitWin("black");

        }
    }
}
