/***************************************************************

CODE DE BASE POUR MASHUP STUDIO

1) Un seveur express pour heberger les pages.
2) Un serveur OSC pour communiquer avec ReacTIVision ou TUIO SIMULATOR
3) Un serveur websocket pour communiquer avec les pages.
4) Une fonction ("decode") qui est destiné à permettre de convertir les informations OSC en informations WebSocket

***************************************************************/

// 1) LE SERVEUR WEB ///////////////////////////////////////////
////////////////////////////////////////////////////////////////
const express = require('express');
const app = express();

app.use(express.static("public")); // On sert le dossier "public"
app.listen(80); // Sur le port 80
/////////////////////////////////////////////////////////////////









// 2) LE CLIENT OSC////// //////////////////////////////////////
///////////////////////////////////////////////////////////////
const OSC = require('osc-js')
const osc = new OSC({ plugin: new OSC.DatagramPlugin() });

osc.open({ port: 3333 }); // On ecoute en OSC via le port 3333 (port par défaut de ReacTIVision ou TUIO SIMULATOR) 

osc.on('*', message => {
	console.log(message); // On log le message OSC pour comprendre comment ça marche !
	decode(message); // C'est là que ça va se passer....
});
//////////////////////////////////////////////////////////////











// 3) LE SERVEUR WEBSOCKET //////////////////////////////////////
////////////////////////////////////////////////////////////////
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 }); // Websocket sur le port 3000

// Fonction qui traque les evenements de connections.
wss.on('connection', function connection(ws) {
	
	console.log("CONNECTED");

	ws.on('message', function incoming(message) {
		console.log('received: %s', message);
	});
	
	ws.on('close', function close() {
		console.log('DISCONNECTED');
	});

	ws.on('error', function error(e) {
		console.log(e);
	});
});


// Fonction pour envoyer un message à tous les clients en même temps (dans notre cas, un seul de toutes façons). Usage : wss.broadcast("message sous forme de String");
wss.broadcast = function broadcast(data) {
	wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
		client.send(data);
    }
  });
};

// Fonction utilitaire pour envoyer en objet en WS.
function messageWs(action, args = {}) {
	var m  = {}; // On crée un objet vide
	
	m.action = action;
	m.content = args; // On le remplie...
	
    m = JSON.stringify(m); // On le convertie en String
	
    // console.log(m);
	wss.broadcast(m); // Et on envoie
}

////////////////////////////////////////////////////////////////





// LA FONCTION DECODE  /////////////////////////////////////////
////////////////////////////////////////////////////////////////

function decode(msg) {
	if (msg.address == "/tuio/2Dobj") {
	// On utilise que les messages 2DOBJ	
		var args = msg.args;

		messageWs('full', msg); // broadcast toute les infos de la table au navigateur pour la "console"
		
		switch (args[0]) {
			case "fseq" :
				break;
				
			case "alive" :
				messageWs('alive', {aliveIds: msg.args.slice(1, msg.args.length)}); // les ids des cartes de la session en cour ?
				break;
			case "set" :
				messageWs('move', {fixedId: args[2], id: args[1], rot: args[5], pos: {xOffset: args[3], yOffset: args[4]} }); 
				break;

			default :
				break;
		}
 	}
}

console.log("START");




