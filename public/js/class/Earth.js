class Earth {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();

        this.radius = 2;
        this.segments = 32;
        this.rotation = 6;
        this.speed = 0.001;
        this.cloudSpeedMult = 1.2;
        this.zoom = 0;

        this.sphere;
        this.clouds;
        this.stars;
        this.light;
        this.cameraPos;
    }

    init() {
        this.renderer.setSize(this.container.offsetHeight, this.container.offsetHeight);
        this.camera.position.z = 5;

        let light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 3, 5);
        this.scene.add(light);

        let hlight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
        this.scene.add(hlight);

        this.sphere = this.createSphere(this.radius, this.segments);
        this.sphere.rotation.y = this.rotation;
        this.scene.add(this.sphere )

        this.clouds = this.createClouds(this.radius, this.segments);
        this.clouds.rotation.y = this.rotation;
        this.scene.add(this.clouds)

        this.stars = this.createStars(10, 128);
        this.scene.add(this.stars);

        this.container.appendChild(this.renderer.domElement);

    }

    renderEarth() {

        this.sphere.rotation.y += this.speed;
        this.clouds.rotation.y += this.speed*this.cloudSpeedMult;

        let rotSpeedX = Number((this.cameraPos.x/30)).toFixed(4) - 0.5
        let rotSpeedY = Number((this.cameraPos.y/30)).toFixed(4) - 0.5
        if (isNaN(rotSpeedX)) {
            rotSpeedX = 0;
        }
     
        if (isNaN(rotSpeedY)) {
            rotSpeedY = 0;
        }

        rotSpeedX = rotSpeedX/2

        let x = this.camera.position.x;
        let y = this.camera.position.y;
        let z = this.camera.position.z;

        this.sphere.rotation.x = rotSpeedY;
        this.sphere.rotation.y = rotSpeedX;
        this.clouds.rotation.x = rotSpeedY;
        this.clouds.rotation.y = rotSpeedX;

        this.camera.position.x = x * Math.cos(this.speed) + z * Math.sin(this.speed);
        this.camera.position.z = z * Math.cos(this.speed) - x * Math.sin(this.speed);
        this.camera.position.y = y * Math.cos(this.speed) + z * Math.sin(this.speed);

        this.camera.lookAt(this.scene.position);
        this.camera.zoom = this.zoom;
        this.camera.updateProjectionMatrix();
        
        this.renderer.render(this.scene, this.camera);
    }

    setConf(conf) {
        this.speed = conf.rotSpeed;
        this.cameraPos = conf.cameraPos;
        if (conf.zoom) {
            this.zoom = conf.zoom;
        } else {
            this.zoom = 0.5;
        }
    }

    createSphere(radius, segments) {
        return new THREE.Mesh(
            new THREE.SphereGeometry(radius, segments, segments),
            new THREE.MeshPhongMaterial({
                map: new THREE.TextureLoader().load('images/2_no_clouds_4k.jpg'),
                bumpMap: new THREE.TextureLoader().load('images/elev_bump_4k.jpg'),
                bumpScale: 0.005,
                specularMap: new THREE.TextureLoader().load('images/water_4k.png'),
                specular: new THREE.Color('grey')
            })
        );
    }
    
    createClouds(radius, segments) {
        return new THREE.Mesh(
            new THREE.SphereGeometry(radius + 0.04, segments, segments),
            new THREE.MeshPhongMaterial({
                map: new THREE.TextureLoader().load('images/fair_clouds_4k.png'),
                transparent: true
            })
        );
    }
    
    createStars(radius, segments) {
        return new THREE.Mesh(
            new THREE.SphereGeometry(radius, segments, segments),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load('images/galaxy_starfield.png'),
                side: THREE.BackSide
            })
        );
    }
}


// rotation speed, camera angle, zoom
