"use strict";
// Requiere el archivo multiMesh.ja


function Torre(){
    MultiMesh.call(this,"/models/","/maps/");

    // Eventos
    this.INIT_COMPLETE=0;
    this.TORRE_TERMINADA=1;

    // constantes
    this.ALTURA_DE_PISO=3;
    this.MAXIMO_PISOS=25;
    this.DELTA_TIEMPO_ENTRE_AGREGAR_PISOS=250; // 700 milisegundos


    this.alturaTotal=0;
    this.alturaActual=0;


    this._crashersLanzados=0;
    this._container=new THREE.Object3D();
    this._container.rotation.y=Math.PI/2;


    this._containerAndamios=new THREE.Object3D();
	this._container.add(this._containerAndamios);
	
	this._timerLanzamientoCrashers;
	
	this._inicioTimerAgregadoDePisos=0;

	this._disparosConsecutivosDelMismoLado=1; // signo del lado del que viene el crasher
    this._direccionLanzamientoCrasher=1; // vale 1 o -1



    this._frameUltimoPisoAgregado=0;
    this._cantPisos=0;
    this._alturaAndamio=0;           // la coordenada Y desde donde se puede construir (es el limite inferior del piso a agregar)

    this._materiales1={};    // materiales de Torre.js
    this._materiales2={};    // se carga en la subclase

    this._jsonShapes1={};    // shapes de Torre.js
    this._jsonShapes2={};    // se carga en la subclase

    this._jsonTower1=[];     // cuerpos rigidos de Torre.js
    this._jsonTower2=[];     // se carga en la subclase

    this._jsonCrashers=[];
    this._jsonHands=[];

    this._objetos3D=[];                 // todos los objetos de la torre

    this._andamios=[];
	this._manoMesh=null;

    // modelos DAE
    this.addGeometry("crashers/auto.DAE");
    this.addGeometry("crashers/antena.DAE");
    this.addGeometry("crashers/bote.DAE");
    this.addGeometry("crashers/camioneta.DAE");
    this.addGeometry("crashers/cartel.DAE");    
	this.addGeometry("crashers/container.DAE");
    this.addGeometry("crashers/contenedorBasura.DAE");
    this.addGeometry("crashers/lancha.DAE");
    this.addGeometry("crashers/paradaDeBondi.DAE");
	this.addGeometry("crashers/cartelEstacionDeServicio.DAE");	
	this.addGeometry("crashers/tanqueDeAgua.DAE");		
	this.addGeometry("crashers/paredRota1.DAE");	
	this.addGeometry("crashers/chimenea.DAE");


    // texturas
    this.addTexture("crashers/mapaAntena.jpg");
    this.addTexture("crashers/mapaAutoVerde.jpg");
    this.addTexture("crashers/mapaBote.jpg");
    this.addTexture("crashers/mapaCamioneta.jpg");
    this.addTexture("crashers/mapaCartel.jpg");	
    this.addTexture("crashers/mapaCartelVelocidad.jpg");
    this.addTexture("crashers/mapaCartelFlecha.jpg");
    this.addTexture("crashers/mapaContenedorBasura.jpg");
    this.addTexture("crashers/mapaLanchaAmarilla.jpg");
    this.addTexture("crashers/mapaLanchaAzul.jpg");
	this.addTexture("crashers/mapaContainer1.jpg");
	this.addTexture("crashers/mapaContainer2.jpg");
	this.addTexture("crashers/mapaContainer3.jpg");
    this.addTexture("crashers/paradaDeBondi.jpg");
	this.addTexture("crashers/cartelEstacionDeServicio.jpg");
	this.addTexture("crashers/tanqueDeAgua.jpg");	
	this.addTexture("crashers/paredRota1.jpg");	
	this.addTexture("refmap4a.jpg");	

    this.onAssetsLoaded=function(){
        this.init1();
        this.init();
    }
}

inheritPrototype(Torre, MultiMesh);



Torre.prototype.init1=function() {


    var emiFactor=0x222222;

    this._materiales1={
        "neutro":new THREE.MeshPhongMaterial({
            color: 0x666666,
            specular: 0xFFFFFF,
            shininess: 1,
            shading: THREE.SmoothShading,
            side:THREE.DoubleSide
        }),
        "escudos":new THREE.MeshPhongMaterial({
            color: 0xFF0FF,
            specular: 0xFFFFFF,
            shininess: 1,
            opacity:0.5,
            transparent:true,
            shading: THREE.SmoothShading,
        }),		
        "antena":new THREE.MeshPhongMaterial({
            color: 0x888888,
            specular: 0xFFFFFF,
            emissive:emiFactor,
            shininess: 1,
            shading: THREE.SmoothShading,
            map:this.getTexture("crashers/mapaAntena.jpg"),
            side:THREE.DoubleSide,
        }),		
        "autoVerde":new THREE.MeshBasicMaterial({
            color: 0x888888,
            specular: 0xFFFFFF,
          emissive:emiFactor,
            shininess: 1,
            shading: THREE.SmoothShading,
            map:this.getTexture("crashers/mapaAutoVerde.jpg"),
            side:THREE.DoubleSide,
        }),
        "bote":new THREE.MeshBasicMaterial({
            color: 0x888888,
            specular: 0xFFFFFF,
          emissive:emiFactor,
            shininess: 1,
            shading: THREE.SmoothShading,
            map:this.getTexture("crashers/mapaBote.jpg")
        }),

        "camioneta":new THREE.MeshBasicMaterial({
            color: 0x888888,
            specular: 0xFFFFFF,
          emissive:emiFactor,
            shininess: 1,
            shading: THREE.SmoothShading,
            map:this.getTexture("crashers/mapaCamioneta.jpg")
        }),
        "cartel":new THREE.MeshBasicMaterial({
            color: 0x888888,
            specular: 0xFFFFFF,
          emissive:emiFactor,
            shininess: 1,
            shading: THREE.SmoothShading,
            map:this.getTexture("crashers/mapaCartel.jpg")
        }),
        "container1":new THREE.MeshBasicMaterial({
            map:this.getTexture("crashers/mapaContainer1.jpg")
        }),
		"container2":new THREE.MeshBasicMaterial({
            map:this.getTexture("crashers/mapaContainer2.jpg")
        }),
		"container3":new THREE.MeshBasicMaterial({
            map:this.getTexture("crashers/mapaContainer3.jpg")
        }),
        "cartelVelocidad":new THREE.MeshBasicMaterial({
            color: 0x888888,
            specular: 0xFFFFFF,
          emissive:emiFactor,
            shininess: 1,
            shading: THREE.SmoothShading,
            map:this.getTexture("crashers/mapaCartelVelocidad.jpg")
        }),
        "contenedorBasura":new THREE.MeshBasicMaterial({
            color: 0x888888,
            specular: 0xFFFFFF,
            shininess: 1,
          emissive:emiFactor,
            shading: THREE.SmoothShading,
            map:this.getTexture("crashers/mapaContenedorBasura.jpg")
        }),
        "lanchaAmarilla":new THREE.MeshBasicMaterial({
            color: 0x888888,
            specular: 0xFFFFFF,
            shininess: 1,
            shading: THREE.SmoothShading,
            map:this.getTexture("crashers/mapaLanchaAmarilla.jpg")
        }),
        "lanchaAzul":new THREE.MeshBasicMaterial({
            color: 0x888888,
            specular: 0xFFFFFF,
            shininess: 1,
            shading: THREE.SmoothShading,
            map:this.getTexture("crashers/mapaLanchaAzul.jpg")
        }),		
        "paradaDeBondi":new THREE.MeshBasicMaterial({
            color: 0x888888,
            specular: 0xFFFFFF,
          emissive:emiFactor,
            shininess: 1,
            shading: THREE.SmoothShading,
            map:this.getTexture("crashers/paradaDeBondi.jpg")
        }),
        "tanqueDeAgua":new THREE.MeshBasicMaterial({
            color: 0x888888,
            specular: 0xFFFFFF,
            shininess: 1,
            shading: THREE.SmoothShading,
          emissive:emiFactor,
            map:this.getTexture("crashers/tanqueDeAgua.jpg")
        }),
        "cartelEstacionDeServicio":new THREE.MeshBasicMaterial({
            color: 0x888888,
            specular: 0xFFFFFF,
            shininess: 1,
            shading: THREE.SmoothShading,
          emissive:emiFactor,
            map:this.getTexture("crashers/cartelEstacionDeServicio.jpg")
        }),
        "paredRota1":new THREE.MeshBasicMaterial({
            color: 0x888888,
            specular: 0xFFFFFF,
            shininess: 1,
            shading: THREE.SmoothShading,
            emissive:emiFactor,
            map:this.getTexture("crashers/paredRota1.jpg")
        }),
		  "chimenea":new THREE.MeshPhongMaterial({
            color: 0x888888,
            specular: 0xFFFFFF,
            shininess: 8,
            shading: THREE.SmoothShading,
            envMap:this.getTexture("refmap4a.jpg"),
			reflectivity: 0.5,
			side:THREE.DoubleSide,
            emissive:0x444444
        })
    };

    this._jsonShapes1={

        "antenaShape": 							{"scale": [6, 10, 6],			"mass": 10.0 },
        "autoShape": 							{"scale": [3.87, 1.26, 1.68],	"mass": 20.0 },
        "boteShape":							{"scale": [8.52,4.01,3.71], 	"mass": 20.0 },
        "camionetaShape":						{"scale": [5.55,2.8,3.52], 		"mass": 20.0 },
        "cartelShape":							{"scale": [11.03,3.34,4.87], 	"mass": 50.0 },
		"containerMetalicoShape": 						{"scale": [9,2.5,2.5], 			"mass": 40.0 },
        "contenedorBasuraShape": 				{"scale": [2.6,2.2,1.9], 		"mass": 10.0 },
        "lanchaShape": 							{"scale": [8.52,4.01,3.71], 	"mass": 30.0 },        
		"paradaDeBondiShape":					{"scale": [3.9, 3, 2.7], 		"mass": 10.0 },
		"tanqueDeAguaShape": 					{"scale": [2.3, 6.5, 2.3], 		"mass": 25.0 },
		"cartelEstacionDeServicioShape": 		{"scale": [2.5, 8.5, 1.25], 	"mass": 12.0 },
		"paredRota1Shape": 						{"scale": [6.2, 3.2, 0.43], 	"mass": 40.0 },
		"chimeneaShape": 						{"scale": [4.7, 2.3, 1.6], 		"mass": 20.0 },
		
        "manoShape": {"scale": [30,10,30], "mass": 10.0, "restitution":1.0}
    };

	var crashersZ=1500;

    this._jsonTower1=[
        {"id":"antena",                     "shape":"antenaShape",        				  "position": [0 ,20,crashersZ], "rotation":[0,0,0]},
        {"id":"auto",                       "shape":"autoShape",          				  "position": [20,20,crashersZ], "rotation":[0,0,0]},
        {"id":"bote",                       "shape":"boteShape",          				  "position": [40,20,crashersZ], "rotation":[0,0,0]},
        {"id":"camioneta",                  "shape":"camionetaShape",       			  "position": [60,20,crashersZ], "rotation":[0,0,0]},
        {"id":"cartel",                     "shape":"cartelShape",          			  "position": [80,20,crashersZ], "rotation":[0,0,0]},
		{"id":"container1", 			    "shape":"containerMetalicoShape", 			  "position": [100,20,crashersZ], "rotation":[0,0,0]},
		{"id":"container2", 			    "shape":"containerMetalicoShape", 			  "position": [200,20,crashersZ], "rotation":[0,0,0]},
		{"id":"container3", 			    "shape":"containerMetalicoShape", 			  "position": [220,20,crashersZ], "rotation":[0,0,0]},
        {"id":"contenedorBasura",           "shape":"contenedorBasuraShape",    		  "position": [240,20,crashersZ], "rotation":[0,0,0]},
        {"id":"lancha1",                    "shape":"lanchaShape",              		  "position": [260,20,crashersZ], "rotation":[0,0,0]},
		{"id":"lancha2",                    "shape":"lanchaShape",              		  "position": [280,20,crashersZ], "rotation":[0,0,0]},		
		{"id":"paradaDeBondi",              "shape":"paradaDeBondiShape",     			  "position": [400,20,crashersZ], "rotation":[0,0,0]},
		{"id":"tanqueDeAgua",               "shape":"tanqueDeAguaShape",       			  "position": [420,20,crashersZ], "rotation":[0,0,0]},
		{"id":"cartelEstacionDeServicio",   "shape":"cartelEstacionDeServicioShape",      "position": [440,20,crashersZ], "rotation":[0,0,0]},
		{"id":"paredRota1",                 "shape":"paredRota1Shape",        			  "position": [460,20,crashersZ], "rotation":[0,0,0]},
		{"id":"chimenea",                   "shape":"chimeneaShape",        			  "position": [480,20,crashersZ], "rotation":[0,0,0]},
        
		
      //{"id":"manoIzquierda",              "shape":"manoShape",                         "position": [-50,0,0],     "rotation":[0,0,0], "isKinematic":true},
        {"id":"manoDerecha"  ,              "shape":"manoShape",                         "position": [20,0,crashersZ],      "rotation":[0,0,0] , "isKinematic":true}

    ];

    this._jsonHands=[
        //"manoIzquierda",
        "manoDerecha"
    ];

    // esto es parte del json que va al simulador con la lista de los objetos "lanzables"
	this._jsonCrashers=[
		"auto",
		"antena",
		"bote",
		"camioneta",
		"container1",
		"container2",
		"container3",		
		"contendorBasura",
		"cartel",
		"lancha1",
		"lancha2",
		"paredRota1",
		"chimenea",
		"cartelEstacionDeServicio",
		"tanqueDeAgua",
		"paradaDeBondi"
	];

    this._ordenLanzamientoCrashers=shuffle(this._jsonCrashers);

	this._indiceMallasCrashers={};

    var listaGeoMat=[
            ["crashers/antena.DAE","antena"], 
            ["crashers/auto.DAE","autoVerde"],
            ["crashers/bote.DAE","bote"],
            ["crashers/camioneta.DAE","camioneta"],
            ["crashers/cartel.DAE","cartel"],                       
			["crashers/container.DAE","container1"],
			["crashers/container.DAE","container2"],
			["crashers/container.DAE","container3"],			
            ["crashers/contenedorBasura.DAE","contenedorBasura"],
            ["crashers/lancha.DAE","lanchaAmarilla"],
			["crashers/lancha.DAE","lanchaAzul"],
			["crashers/paradaDeBondi.DAE","paradaDeBondi"],
			["crashers/tanqueDeAgua.DAE","tanqueDeAgua"],
			["crashers/cartelEstacionDeServicio.DAE","cartelEstacionDeServicio"],
			["crashers/paredRota1.DAE","paredRota1"],
			["crashers/chimenea.DAE","chimenea"],
           
        ];

    // creo y agrego los objetos a la escena

    for (var i=0;i<listaGeoMat.length;i++) {

        var geo=this.getGeometry(listaGeoMat[i][0]);
        var mat=this._materiales1[listaGeoMat[i][1]];
		
        var c = new THREE.Mesh(geo,mat);
		//this.log(">>>"+keys[i]);
        c.position.x =i*10;
        c.position.z = crashersZ;
        c.position.y = 0;
		//c.visible=false;
        c.updateMatrix();
        c.matrixAutoUpdate = false;
        this._objetos3D.push(c);
        this._container.add(c);
		this._indiceMallasCrashers[this._jsonCrashers[i]]=c;  // esto es medio trucho habria que unificar jsonCrahser y listaGeoMat
    };
	
	var manoGeo=new THREE.BoxGeometry( 30, 1, 30 );

    var c = new THREE.Mesh(manoGeo,this._materiales1["escudos"]);
	c.position.z=200;
	c.updateMatrix();
	c.matrixAutoUpdate = false;
	c.visible=false;
    this._objetos3D.push(c);
    this._container.add(c);
	this._manoMesh=c;
/*
    var c = new THREE.Mesh(manoGeo,this._materiales1["escudos"]);
	c.position.z=200;
	 c.updateMatrix();
	c.matrixAutoUpdate = false;
    this._objetos3D.push(c);
    this._container.add(c);
*/
	//var axisHelper = new THREE.AxisHelper( 50 );
	//this._container.add( axisHelper );

}


/* Este metodo verifica las coordenadas de la mano y decide si hay o no que agregar un Piso */
Torre.prototype.onHandscontrollerUpdated=function(e){

    //this.log("onHandsControllerUpdated "+e.posicion[1]);
    //this.actualizarAndamio(posicion[1],rotacion[2],radio);
	var d = new Date();
	var currentTime=d.getTime();
    var resaltar=false;

    if (    (e.posicion) &&
            (e.posicion[1]<(this._alturaAndamio+this.ALTURA_DE_PISO)) &&
            (e.posicion[1]>(this._alturaAndamio-+this.ALTURA_DE_PISO)) &&
            (this._cantPisos<this.MAXIMO_PISOS)
        ){
         resaltar=true;

         if  (currentTime>this.DELTA_TIEMPO_ENTRE_AGREGAR_PISOS+this._inicioTimerAgregadoDePisos) {
             this.agregarPiso(e.rotacion[1],e.radio, e.posicion[0], e.posicion[2]);
             this.alturaTotal = this._cantPisos * this.ALTURA_DE_PISO;
             d = new Date();
            this._inicioTimerAgregadoDePisos = d.getTime();
         }
    } else {
       this._inicioTimerAgregadoDePisos = d.getTime();
    }

    if (e.posicion) {
        var posVec = [e.posicion[0], this._alturaAndamio + this.ALTURA_DE_PISO / 2, e.posicion[2]];
        this.actualizarAndamio(posVec, 0, e.radio, resaltar);
    }
}

Torre.prototype.chequearTorreTerminada=function(){

    if (this._cantPisos==this.MAXIMO_PISOS) {
        this._containerAndamios.visible=false;
        this.dispatchEvent({ type:this.TORRE_TERMINADA });
    }

}


Torre.prototype.normalizarRadio=function(radio){
	return (Math.max(30,Math.min(130,radio))-15)/40;
}

// Metodos Virtuales o Abstractos

Torre.prototype.agregarPiso=function(anguloY,radio){ // angulo de la Mano respecto de Y, radio de la mano

    this.log("agregarPiso() Este metodo debe ser implementado en la subclase de Torre");
}


Torre.prototype.actualizarAndamio=function(posicion,anguloY,radio,resaltar){

    this.log("actualizarAndamio() Este metodo debe ser implementado en la subclase de Torre");
}

// se llama a esta funcion cuando la torre alcanzo el maximo de pisos

Torre.prototype.onUpdateSimulacion=function(arrayDeFloats) {
    // recibe los floats de las matrices de todos los objetos de la torre

    this.log(" onUpdateSimulacion() este metodo debe ser implementado en la subclase de Torre");
}

Torre.prototype.getJsonSimulacion=function() {

    this.log(" getJsonSimulacion() este metodo debe ser implementado en la subclase de Torre");
}


// recibo las matrices de transformacion del simulador y las actualizo en los objetos de la Torre
Torre.prototype.onUpdateSimulacion=function(arrayDeFloats,maxYValue) {


    this.alturaActual=maxYValue;
    // numTransforms = TransformBuffer.length/16; // si es single precision

    //var indices[0,4,8,12,

    for (var i=0;i<this._objetos3D.length;i++){
        for (var j = 0; j < 16; j++) {
            var o=this._objetos3D[i];
            //var k=Math.floor(j/4);
            //var l=j%4;
            o.matrix.elements[j]=TransformBuffer[i*16+j];

        }
    }

    //   this.log("onUpdateSimulacion "+this._objetos3D.length);


};

Torre.prototype.mostrarAndamios=function(){
    this._containerAndamios.visible=true;
}


Torre.prototype.iniciarLanzamientoCrashers=function(){
	this._manoMesh.visible=true;
    setTimeout(this.onTimerLanzamientoCrasher.bind(this),2500); // le doy un delay inicial
}

Torre.prototype.detenerLanzamientoCrashers=function(){
	clearTimeout(this._timerLanzamientoCrashers);
}

Torre.prototype.onTimerLanzamientoCrasher=function(){

	this.lanzarCrasher(LT.simulador);
    var n=this._crashersLanzados;

    var factor=Math.min(4,Math.max(1,n/20)); // va de 1 a 4 cuando hay 80 lanzamientos
    var tiempoMin=2000/factor;
    var tiempoMax=tiempoMin+Math.random()*4000/factor;

	this._timerLanzamientoCrashers=setTimeout(this.onTimerLanzamientoCrasher.bind(this), 2000+Math.random()*4000);
}

Torre.prototype.lanzarCrasher=function(simulador) {

    this._disparosConsecutivosDelMismoLado--;

    if (this._disparosConsecutivosDelMismoLado<1){
        this._disparosConsecutivosDelMismoLado=Math.floor(3+Math.random()*5);
        this._direccionLanzamientoCrasher=-this._direccionLanzamientoCrasher;
    }

    var n=this._crashersLanzados;

    var indexCrasher= this._crashersLanzados%this._ordenLanzamientoCrashers.length;

	var distanciaAlOrigen=100;
    var angulo=(Math.PI/8)*Math.random(); // 0 a 22,5 grados

    //***** el eje X corre de lado a lado de la peninsula

    var x=this._direccionLanzamientoCrasher*distanciaAlOrigen*Math.cos(angulo);
    var z=distanciaAlOrigen*Math.sin(angulo);
    var y=Math.max(20,this.alturaActual*(0.7+0.4*Math.random()));

    var origen=[x,y,z];// punto desde donde lanzo

    var moduloOrigenXZ=Math.sqrt(x*x+z*z);

    var direccionLanzamiento=[-x/moduloOrigenXZ,0,-z/moduloOrigenXZ]; // vector direccion normalizado


    var velocidadMediaLanzamiento=30*(6+n)/6;
    var moduloVelocidad=velocidadMediaLanzamiento*(0.8+Math.random()*0.4); // media +- 20%


	var velocidadLineal=[
        moduloVelocidad*direccionLanzamiento[0],
        direccionLanzamiento[1]
        ,moduloVelocidad*direccionLanzamiento[2]
    ];

    var velocidadAngular=[
        (Math.random()-0.5)*15,
        (Math.random()-0.5)*15,
        (Math.random()-0.5)*15
    ];

    var anguloLluvia=this._direccionLanzamientoCrasher*Math.min(1.9,Math.log(1+velocidadMediaLanzamiento)/3);


    LT.escenario.setAnguloLluvia(-anguloLluvia);
    LT.uiManager.setVelocidadViento(Math.floor(moduloVelocidad));

	//this._indiceMallasCrashers[this._listaCrashers[idx]].visible=true;

    var fnDisparar=function() {
        simulador.dispararCrasher(this._ordenLanzamientoCrashers[indexCrasher], origen, velocidadLineal, velocidadAngular);
      //  simulador.setViento([ this._direccionLanzamientoCrasher*1,0,0]);
    };

    setTimeout(fnDisparar.bind(this),1500);

    this._crashersLanzados++;

	this.log("lanzarCrasher() crasher:"+this._ordenLanzamientoCrashers[indexCrasher]+" angLluvia:"+anguloLluvia+" lanzados:"+n+" velMed:"+velocidadMediaLanzamiento);
}

// agrego manejo de eventos sobre la clase Torre

addEventsHandlingFunctions(Torre);

