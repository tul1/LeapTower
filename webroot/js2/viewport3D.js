"use strict";

function Viewport3D(enableShadows){

    //var cont=$("#contenido");
    this.enableShadows=enableShadows ? enableShadows : false;
/*
    var stats = new Stats();
    stats.setMode(1); // 0: fps, 1: ms
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild(stats.domElement);
*/
    // para camara automatica de fase 3

    var anguloCamaraTargetFase3=0;
    var anguloCamaraFase3=0;

    var alturaCamaraModoInspeccion=0;

    var v3D=$("#viewport3D");

    var camControlDomElement=$("#viewport2D")? $("#viewport2D") : v3D;

    var domContainer =v3D;



    var escena= new THREE.Scene();

    this.MODO_CAMARA_FIJA_POS_1=0;
    this.MODO_CAMARA_ANIMADA_ROTACION_AUTO=1;
    this.MODO_CAMARA_ANIMADA_ROTACION_MANO=2;
    this.MODO_CAMARA_ANIMADA_INSPECCION_TORRE=3;
	this.MODO_CAMARA_ANIMADA_APERTURA=4;

    this.modoCamara=this.MODO_CAMARA_FIJA_POS_1;

    var camaraTime=0;
    var anguloCamaraYEstabilizado=0;
    var anguloCamaraZEstabilizado=0;

    var cam1 = new THREE.PerspectiveCamera( 70, domContainer.width()/ domContainer.height(), 1, 10000);
    cam1.position.x = 100;
    cam1.position.y = 60;
    cam1.position.z = 0;

    cam1.lookAt(new THREE.Vector3(0,30,0));
    cam1.far = 10000;

    escena.add(cam1);

    var cam2 = new THREE.PerspectiveCamera( 70, domContainer.width()/ domContainer.height(), 1, 10000);
    cam2.position.x = 100;
    cam2.position.y = 120;
    cam2.position.z = 0;
    cam2.far = 10000;



    var camControls = new THREE.OrbitControls(cam2, camControlDomElement[0]);
    camControls.target.y = 50;
    camControls.update();

    var renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(domContainer.width(), domContainer.height());
    renderer.setClearColor(0x000000, 1);

    if (this.enableShadows) {
        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;

        renderer.shadowMapBias = 0.1;
        renderer.shadowMapWidth = 2048;
        renderer.shadowMapHeight = 2048;
    }




    // on Resize Callback
    $( window ).resize(function() {

        renderer.setSize(domContainer.width(), domContainer.height());

        for (var i=0;i<LT.viewport3D.camaras.length;i++){
            LT.viewport3D.camaras[i].aspect= domContainer.width() / domContainer.height();
            LT.viewport3D.camaras[i].updateProjectionMatrix();
        }

    });

    domContainer.append(renderer.domElement);

    // *************** Grid Helper **********************
    //var gridHelper = new THREE.GridHelper( 100, 25 );
    //escena.add( gridHelper );



    // ************** Fog *************************************


    this.escena=escena;
    this.renderer=renderer;
    this.camaras=[cam1,cam2];
    this.camaraActual=0;
    this.frame=0;

	this.escena.fog=new THREE.Fog(0x888899, 2000, 6000 ) ;

    var render;

    this.onKeyDown=function(event){
      if (event.keyCode==67){
          this.toggleCamara();
      }
    };

    $("body").on("keydown",this.onKeyDown.bind(this));


    this.setPhotoCam=function(){
        this.camaraActual=1;
        cam2.position.set(60,10,30);
        cam2.lookAt(new THREE.Vector3(0,30,0));
    }

    this.toggleCamara=function(){
        if (this.camaraActual==0) this.camaraActual=1;
        else this.camaraActual=0;
    }


    this.setFog=function(activa){
        if (activa){
            var fog=new THREE.Fog(0x888899, 0, 4000 ) ;
            this.escena.fog=fog;
        }else{
            this.escena.fog=null;
        }
    }

    this.render=function(){


       if ( this.actualizarCamara) this.actualizarCamara();

      //  stats.begin();
        renderer.render(this.escena, this.camaras[this.camaraActual]);
        this.frame++;
        camaraTime++;
      //  stats.end();
    };

    // se llama en cada frame y actualiza en angulo segun el YAW de la mano
    var updateCamaraRotarSegunMano=function(){
        if (LT.handsController){

            anguloCamaraYEstabilizado=anguloCamaraYEstabilizado+(LT.handsController.handYaw-anguloCamaraYEstabilizado)*0.1;
            anguloCamaraZEstabilizado=anguloCamaraZEstabilizado+(LT.handsController.handPitch-anguloCamaraZEstabilizado)*0.1;
            rotarCamara(anguloCamaraYEstabilizado*2,40,90,-anguloCamaraZEstabilizado/2+0.25);
        }
    };

    // se llama en cada cuadro y actualiza segun la direccion del viento
    var updateCamaraRotarSegunViento=function(){
        //var ang=Math.sin(camaraTime/600)*Math.PI/12;

        anguloCamaraFase3=anguloCamaraFase3+ (anguloCamaraTargetFase3-anguloCamaraFase3)*0.01;

        rotarCamara(anguloCamaraFase3,40,80,0.35);
    };

    var updateCamaraModoInspeccion=function(){
        var ang=camaraTime*Math.PI/600;
        var pitch=(Math.sin(camaraTime/300))*0.5;
        alturaCamaraModoInspeccion=(0.6+Math.cos(camaraTime/300)*0.2)*LT.torre.alturaTotal;


        rotarCamara(ang,alturaCamaraModoInspeccion,40,pitch);

    }
	
	 var updateCamaraApertura=function(){

		var u=Math.sin(Math.min(1,camaraTime/300)*Math.PI/2);
		
        var pos1=new THREE.Vector3(200,50,0);
        var pos2=new THREE.Vector3(1300,150,0);
		
		var pos=new THREE.Vector3();
		var target=new THREE.Vector3(0,20,0);				
		pos.lerpVectors(pos1,pos2,1-u);

        cam1.position.copy(pos)
        cam1.lookAt(target);
    }

    // hace el calculo de la rotacion y la aplica
    var rotarCamara=function(ang,altura,distancia,angPitch){


        var pitch=angPitch ?angPitch :0 ;
        var y=altura ?altura :40 ;
        var rad=distancia ? distancia : 90;

        var z=rad*Math.cos(pitch)*Math.sin(ang);
        var x=rad*Math.cos(pitch)*Math.cos(ang);
        var offsetY=rad*Math.sin(pitch);

        var target=new THREE.Vector3(0,y,0);

        cam1.position.x=x;
        cam1.position.y=y+offsetY;
        cam1.position.z=z;
        cam1.lookAt(target);
    };

	this.cambiarCamara=function(nro){
		this.camaraActual=nro;
	}
		

    this.setModoCamara=function(nro){
        this.modoCamara=nro;

        if (nro==this.MODO_CAMARA_FIJA_POS_1) {
            this.actualizarCamara=null;
            cam1.position.x = 100;
            cam1.position.y = 60;
            cam1.position.z = 0;
            cam1.lookAt(new THREE.Vector3(0, 30, 0));

        } else if (nro==this.MODO_CAMARA_ANIMADA_ROTACION_MANO) {

            this.actualizarCamara=updateCamaraRotarSegunMano;

        } else if (nro==this.MODO_CAMARA_ANIMADA_ROTACION_AUTO) {
            camaraTime=0;
            this.actualizarCamara=updateCamaraRotarSegunViento;
        } else if (nro==this.MODO_CAMARA_ANIMADA_INSPECCION_TORRE) {
            camaraTime=0;
            this.actualizarCamara=updateCamaraModoInspeccion;
        } else if (nro==this.MODO_CAMARA_ANIMADA_APERTURA) {
            camaraTime=0;
            this.actualizarCamara=updateCamaraApertura;
        }

    };


    this.actualizarAnguloLluvia=function(evento){
        if (evento.value>0) anguloCamaraTargetFase3=0.5;
        else anguloCamaraTargetFase3=-0.5;
    };

    this.log=function(msg) {
        console.log(this.constructor.name+"."+msg);
    }

    this.setModoCamara(this.MODO_CAMARA_FIJA_POS_1);;


};




addEventsHandlingFunctions(Viewport3D);


/*

LT.render=function() {
    requestAnimationFrame(LT.render);

    LT.renderer.render(LT.escena, LT.camaras[LT.vars.camaraActual]);
    LT.vars.frame++;
}


*/



