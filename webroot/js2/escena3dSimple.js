"use strict";

var escena;

var tiempo=0;
var stats;
var controls;
var camara;
var renderer;


function initThreeJS(noLights) {


    var cont=$("#contenido");

/*

    stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.right = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild(stats.domElement);
*/
    var container = document.getElementById('panel3d');

    escena = new THREE.Scene();



    camara = new THREE.PerspectiveCamera( 80, cont.width()/ cont.height(), 1, 10000);
    camara.position.x = 10;
    camara.position.y = 20;
    camara.position.z = 10;
    camara.far = 10000;


    controls = new THREE.OrbitControls(camara, container);
    controls.target.y = 0;
    controls.update();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(cont.width(), cont.height());
    renderer.setClearColor(0xaaaaaa, 1);
/*
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;

    renderer.shadowMapBias = 0.1;
    renderer.shadowMapWidth = 2048;
    renderer.shadowMapHeight = 2048;
*/
    $( window ).resize(function() {

        renderer.setSize(cont.width(), cont.height());

        camara.aspect = cont.width() / cont.height();
        camara.updateProjectionMatrix();


    });

    container.appendChild(renderer.domElement);

    var gridHelper = new THREE.GridHelper( 100, 25 );
    escena.add( gridHelper );




  //  var fog=new THREE.Fog(0xFFFFFF, 5, 300 ) ;
  //  escena.fog=fog;


	if (noLights==false){
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.color.setHSL(0.1, 1, 0.95);

    dirLight.position.set(40,40, 40);
    dirLight.position.multiplyScalar(1);

    //dirLight.castShadow = true;

    dirLight.shadowMapWidth = 2048;
    dirLight.shadowMapHeight = 2048;

    var d = 60;

    dirLight.shadowCameraLeft = -d;
    dirLight.shadowCameraRight = d;
    dirLight.shadowCameraTop = d;
    dirLight.shadowCameraBottom = -d;

    dirLight.shadowCameraNear = 1;
    dirLight.shadowCameraFar = 120;
   //dirLight.shadowBias = 10;
    dirLight.shadowDarkness = 0.5;
   //dirLight.shadowCameraVisible = true;


    escena.add(dirLight);




    var hemiLight = new THREE.HemisphereLight(0x666666, 0x666666, 0.75);
    hemiLight.color.setHSL(0.6, 0.3, .5);
    hemiLight.groundColor.setHSL(0.095, 0.2, 0.6);
    hemiLight.position.set(0, 10, 0);
    escena.add(hemiLight);


    var light = new THREE.AmbientLight( 0x333333 ); // soft white light
    escena.add( light );

	}
/*
    var pointlight1 = new THREE.PointLight( 0xff0000, 10, 100 );
    pointlight1.position.set( 0, 0, 0 );
    scene.add( pointlight1 );
    */

}



function initGui(){
/*
    var gui = new dat.GUI();


    var f1 = gui.addFolder('Parametros');

    f1.add(Rama.prototype, 'fEscalaX',0.0,2.0).name("fEscalaX").onChange(function(value){
        actualizarArbol();
    });

    f1.add(Rama.prototype, 'fEscalaZ',0.0,2.0).name("fEscalaZ").onChange(function(value){
        actualizarArbol();
    });

    f1.add(Rama.prototype, 'fEscalaY',0.0,2.0).name("fEscalaY").onChange(function(value){
        actualizarArbol();
    });

    f1.open();
*/
};




var frame=0;

function render() {
    requestAnimationFrame(render);

   // stats.begin();


    renderer.render(escena, camara);
   // stats.end();

    frame++;

}






