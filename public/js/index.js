const consolike = document.getElementById('console');
const canvas = document.getElementById('canvas');
const leftContainer = document.getElementById('left_container');
const earthCanvas = document.getElementById('earth_container');
const frameRate = 1000 / 30;

const tableHandler = new TableHandler(consolike, canvas, leftContainer);

const earth = new Earth(earthCanvas);
earth.init();

let ws = new WebSocket('ws://localhost:3000');

ws.onmessage = function (event) {
    let m = JSON.parse(event.data);
    tableHandler.init(m);
};

let earthRender = setInterval(() => {

    earth.setConf(tableHandler.getPositions());
    earth.renderEarth();
}, frameRate)