import './index.css';
import nameGenerator from './name-generator';
import isDef from './is-def';

var canvas = document.getElementById("canvas0");
let mycolor = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
var str = '';

// Store/retrieve the name in/from a cookie.
const cookies = document.cookie.split(';');
let wsname = cookies.find(function(c) {
  if (c.match(/wsname/) !== null) return true;
  return false;
});
if (isDef(wsname)) {
  wsname = wsname.split('=')[1];
} else {
  wsname = nameGenerator();
  document.cookie = "wsname=" + encodeURIComponent(wsname);
}

// Set the name in the header
document.querySelector('header>p').textContent = "Welcome, " + decodeURIComponent(wsname) + " !";


// Create a WebSocket connection to the server
const ws = new WebSocket("ws://" + window.location.host + "/socket");

// We get notified once connected to the server
ws.onopen = (event) => {
  console.log("We are connected.");
};

//Listen to messages coming from the server

ws.onmessage = (event) => {
  const values = event.data.substr(event.data.indexOf("]")).split(' ');

  if(values[1] === 'Draw') {
    draw(parseInt(values[2]), +values[3], values[4], values[5]);
  } else if(values[1] === 'newDessin') {
    ajouteDessin(values[2], values[3]);
  } else if(event.data.split(';')[0] === 'envoyerListe') {
    document.getElementById("listedessins").options.length = 0;
    for (let i = 0; i < event.data.split(';')[1]; i++) {
      ajouteDessin(i, '');
    }
  } else if(!(values[1] === 'ajoutHistorique')) {
    let str = event.data.substring(0,event.data.length-1);
    let tabHistorique = str.split("|");
    if(!(tabHistorique.length === 1)) {
      for (let j = 0; j < tabHistorique.length; j++) {
        draw(parseInt(tabHistorique[j]), +tabHistorique[j + 1], tabHistorique[j + 2], tabHistorique[j + 3]);
        j += 3;
      }
    }
  }
};


//canvas.addEventListener
canvas.addEventListener("mousemove", moveEvent, true);

//moveEvent function
function moveEvent(event) {
  if(event.buttons === 1) {
    let color = mycolor;
    let x = event.offsetX;
    let y = event.offsetY;
    str = 'Draw ' + x + ' ' + y + ' ' + color + ' ' + canvas.id;
    ws.send('ajoutHistorique ' + x + '|' + y + '|' + color + '|' + canvas.id + '|');
    ws.send(str);
  }
}

//Drawing function
function draw(x, y, color, idCanvas) {
  let theCanvas = document.getElementById(idCanvas);
  let ctx = theCanvas.getContext("2d");

  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.lineWidth = 6;
  ctx.moveTo(x, y);
  ctx.lineTo(x+1, y+1);
  ctx.stroke();
  ctx.closePath();
}

//EventListener on clik on  new draw
document.getElementById("newDessin").addEventListener("click", onClickNewDessin, true);

//Function onClickNewDessin
function onClickNewDessin(event) {
  let i = document.getElementById("listedessins").options.length;
  let newId = '' + i;
  str = 'newDessin '  + newId + ' ' + wsname + ' ' + canvas.id;
  ws.send(str);
}

function ajouteDessin(newId, name) {
  let option = new Option('dessin ' + newId, newId);
  document.getElementById("listedessins").options[document.getElementById("listedessins").options.length] = option;
  let newCanvas = document.createElement("canvas");
  newCanvas.id = 'canvas' + newId;
  newCanvas.style.backgroundColor = 'black';
  newCanvas.style.width = '1600px';
  newCanvas.style.height = '700px';
  newCanvas.setAttribute('width', "1600px");
  newCanvas.setAttribute('height', "700px");
  newCanvas.addEventListener("mousemove", moveEvent, true);
  if(name === wsname) {
    canvas.style.display = 'None';
    document.body.insertBefore(newCanvas, document.getElementById("myDiv"));
    canvas = document.getElementById('canvas' + newId);
    canvas.style.display = 'block';
    document.getElementById("listedessins").selectedIndex = document.getElementById("listedessins").options.length -1;
  } else {
    newCanvas.style.display = 'None';
    document.body.insertBefore(newCanvas, document.getElementById("myDiv"));
  }
  if (document.getElementById("message_erreur")) {
    document.getElementById("message_erreur").style.display = 'None';
  }
}


document.getElementById("listedessins").addEventListener("input", onSelectMyOption, true);
function onSelectMyOption(event) {
  canvas.style.display = 'None';
  canvas = document.getElementById('canvas' + document.getElementById("listedessins").selectedOptions[0].value);
  canvas.style.display = 'block';
}


