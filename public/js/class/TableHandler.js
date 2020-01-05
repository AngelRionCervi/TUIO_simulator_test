class TableHandler {
    constructor(consolike, canvas, container) {
        this.consolike = consolike;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.positions = [];
        this.container = container;
        this.cardSize = 30;
        this.defaultCradColor = "grey";
    }

    init(data) {
        this.canvas.width = this.container.offsetHeight/2;
        this.canvas.height = this.container.offsetHeight/2;

        if (data.action === "full") {
            this.feedConsole(data);
        } else if (data.action === "alive") {
            this.declareCards(data.content.aliveIds);
        } else if (data.action === "move" && this.positions.length !== 0) {
            this.setPosition(data.content);
        }
    
        this.render(); // le call pour render le canvas ne se fait que si on bouge une carte 
    }

    feedConsole(data) {
        if (this.consolike.childElementCount > 2) {
            this.consolike.removeChild(this.consolike.firstElementChild);
        }
        let samp = document.createElement('samp');
        samp.innerText = JSON.stringify(data, null, 4) + "\n\n";
        this.consolike.appendChild(samp);
    }

    // Fait en sorte que les cards de positions soit les même que les cards alive de tuio, sans avoir à les remplacer car nous allons devoir sauvegarder leurs positions.
    declareCards(cardsIds) {

        let alreadySetIds = this.positions.map(e => e.id);
    
        let diff = alreadySetIds.filter(e => !cardsIds.includes(e));
    
        diff.forEach((v, i) => {
            this.positions.splice(alreadySetIds.indexOf(diff[i]), 1); // l'entré n'existe pas dans cardsIds, on l'enlève de positions
        })
    
        cardsIds.forEach(v => {
            let obj = { id: v }
    
            if (!alreadySetIds.includes(v)) {
                this.positions.push(obj); // l'entré n'existe pas dans positions, on l'ajoute 
            }
        })
    }

    setPosition(data) {

        let alreadySetIds = this.positions.map(e => e.id);
    
        let currentObj = this.positions[alreadySetIds.indexOf(data.id)];
    
        currentObj.pos = { x: this.canvas.width * data.pos.xOffset, y: this.canvas.height * data.pos.yOffset }; // position absolue -> position en pixel
        currentObj.rot = data.rot;
        currentObj.fixedId = data.fixedId;
    }

    render() {

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        this.positions.forEach(v => {

            switch (v.fixedId) {
                case 0:
                    this.ctx.fillStyle = "blue";
                    break;
                case 1:
                    this.ctx.fillStyle = "red";
                    break;
                case 2:
                    this.ctx.fillStyle = "yellow";
                    break;
                default:
                    this.ctx.fillStyle = this.defaultCradColor;
                    break;
            }
    
            if (v.pos) { 
                this.ctx.save();
                this.ctx.beginPath();
    
                // la rotation
                this.ctx.translate(v.pos.x + this.cardSize/2, v.pos.y + this.cardSize/2)
                this.ctx.rotate(v.rot);
                this.ctx.translate(-(v.pos.x + this.cardSize/2), -(v.pos.y + this.cardSize/2))
    
                this.ctx.rect(v.pos.x, v.pos.y, this.cardSize, this.cardSize);
                this.ctx.fill();
                this.ctx.restore();
            }
        })

    }

    // getter for earth controls
    getPositions() {
        
        let rotSpeed = 0;
        let zoom = 0;
        let cameraPos = {};

        this.positions.forEach(v => {
            switch (v.fixedId) {
                case 0:
                    rotSpeed = v.rot*0.003;
                    break;
                case 1:
                    zoom = v.pos.y/100;
                    break;
                case 2:
                    cameraPos = {x: v.pos.x, y: v.pos.y};
                    break;
            }
        })
 
        return {rotSpeed: rotSpeed, zoom: zoom, cameraPos: cameraPos};
    }
}
