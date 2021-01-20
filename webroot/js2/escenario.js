"use strict";

function Escenario(enableShadows){
    MultiMesh.call(this,"/models/escenario/","/maps/");
    this.enableShadows=enableShadows ? enableShadows : false;
    // Eventos
    this.ESCENARIO_LISTO=0;
	this.ESCENARIO_DISPARO_DE_TRUENO=1;
    this.ESCENARIO_CAMBIO_ANGULO_LLUVIA=2;


	this.MODO_MEDIODIA_SOLEADO=0;	
	this.MODO_TORMENTA=1;

	
	this._modo=0;
	this._assetsLoaded=false;
		
    this._container=new THREE.Object3D();


	this._rayoIntensidad=[10,10,9,8,10,8,6,4,2,9,8,6,5,3,7,6,3,2,1,2,1,0.5,0.0];
	this._rayoFrame=this._rayoIntensidad.length-1;
    this._delayProximoRayo=300;

	this._cielo=null;
	this._lluvia1=null;
	this._lluvia2=null;
	this._rayo1=null;
	this._agua=null;
	
	this._anguloLlluvia=0;
	this._anguloLluviaNeedsUpdate=false;
	
	
    this.addGeometry("peninsula.DAE");
    this.addGeometry("cielo.DAE");
    this.addGeometry("mar.DAE");	
    this.addGeometry("montana.DAE");
    this.addGeometry("edificios.DAE");
    this.addGeometry("arboles.DAE");	
    this.addGeometry("manzanas.DAE");
    this.addGeometry("superficieLluvia.DAE");	


    this.addTexture("aguaDeMar.jpg");
    this.addTexture("aguaDeMar_normal.jpg");
    this.addTexture("aguaDeMar_bump.jpg");
    this.addTexture("cliff2.jpg");
    this.addTexture("sky2.jpg");
    this.addTexture("montana.jpg");
    this.addTexture("pasto.jpg");
    this.addTexture("cieloTormenta.jpg");

    this.addTexture("efectos/lluvia3d-01.png");
    this.addTexture("efectos/rayo.png");



    //  ******************* Luces *******************

    var luzSol = new THREE.DirectionalLight(0xffffff, 0.9);
    luzSol.color.setHSL(0.1, 1, 0.95);
    luzSol.position.set(10,30, 30); // +Z hacia el mar atras de la camara    X+ hacia la izquiera
    luzSol.position.multiplyScalar(1);

    if (this.enableShadows) {
        luzSol.castShadow = true;

        luzSol.shadowMapWidth = 2048;
        luzSol.shadowMapHeight = 2048;

        var d = 300;

        luzSol.shadowCameraLeft = -d;
        luzSol.shadowCameraRight = d;
        luzSol.shadowCameraTop = d;
        luzSol.shadowCameraBottom = -d;

        luzSol.shadowCameraNear = 1;
        luzSol.shadowCameraFar = 500;
        luzSol.shadowBias = 0.002;
        luzSol.shadowDarkness = 0.5;
        luzSol.shadowCameraVisible = true;
    }


    this._container.add(luzSol);


    var luzCielo = new THREE.HemisphereLight(0x666666, 0x666666, 0.3);
    luzCielo.color.setHSL(0.6, 0.3, .5);
    luzCielo.groundColor.setHSL(0.095, 0.2, 0.6);
    luzCielo.position.set(0, 10, 0);
    this._container.add(luzCielo);


    var luzAmbiente = new THREE.AmbientLight( 0x333333 ); // soft white light
    this._container.add( luzAmbiente);

	var luzRayo = new THREE.PointLight( 0xEEEEFF, 0, 1500, 2 );
	luzRayo.position.set( 0, 200, -500 );
    this._container.add(luzRayo);



    this.luces= {
        luzSol: luzSol,
        luzCielo: luzCielo,
        luzAmbiente: luzAmbiente,
		luzRayo:luzRayo
    };
	


/*
    this.onAssetsLoaded=function(){
        this.init();
    }
    */
   // LT.escena.add(this._container);
}

inheritPrototype(Escenario, MultiMesh);


Escenario.prototype.onAssetsLoaded=function(){
    this.log("onAssetsLoaded");


    this.textures["cieloTormenta.jpg"].repeat.set(2,1);
	
//    this.textures["aguaDeMar.jpg"].repeat.set(10,10);
	
    this.textures["aguaDeMar.jpg"].repeat.set(2,2);	
    this.textures["aguaDeMar_bump.jpg"].repeat.set(2,2);		
    this.textures["cliff2.jpg"].repeat.set(1,1);
    this.textures["efectos/lluvia3d-01.png"].repeat.set(6,2);
   //this.textures["sky1.jpg"].repeat.set(1,1.1);
    this.materials={
        "grisOscuro":new THREE.MeshPhongMaterial({
            color: 0x888888,
            specular: 0x333333,
            shininess: 1,
            shading: THREE.SmoothShading,

        }),
        "gris":new THREE.MeshPhongMaterial({
            color: 0x999999,
            specular: 0x333333,
            shininess: 1,
            shading: THREE.SmoothShading,

        }),		
        "verdeHojas":new THREE.MeshPhongMaterial({
            color: 0x4b6045,
            specular: 0x333333,
            shininess: 2,
            shading: THREE.SmoothShading,

        }),			
        "marronArbol":new THREE.MeshPhongMaterial({
            color: 0x5e5b56,
            specular: 0x333333,
            shininess: 2,
            shading: THREE.SmoothShading,

        }),	
        "edificio1":new THREE.MeshPhongMaterial({
            color: 0xa4a195,
            specular: 0x222222,
            shininess: 1,
            shading: THREE.SmoothShading,

        }),	
        "edificio2":new THREE.MeshPhongMaterial({
            color: 0xa49795,
            specular: 0x222222,
            shininess: 1,
            shading: THREE.SmoothShading,

        }),		
        "edificio3":new THREE.MeshPhongMaterial({
            color: 0xa2a495,
            specular: 0x222222,
            shininess: 1,
            shading: THREE.SmoothShading,

        }),							
       "cieloTormenta": new THREE.MeshBasicMaterial({
            map:this.textures["cieloTormenta.jpg"],
           //fog:false
        }),
       "cieloDespejado": new THREE.MeshBasicMaterial({
            map:this.textures["sky2.jpg"],
           fog:false
        }),
		
        "aguaDeMar": new THREE.MeshPhongMaterial({
            color: 0x999999,
            specular: 0x667788,
            shininess:16,
            shading: THREE.SmoothShading,
            map:this.textures["aguaDeMar.jpg"],
            specularMap:this.textures["aguaDeMar_bump.jpg"],
         //   normalMap:this.textures["aguaDeMar_normal.jpg"]	
        }),
        "grava": new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            shininess: 1,
            shading: THREE.SmoothShading,
            map:this.textures["cliff2.jpg"]
        }),
        "pasto": new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            shininess: 1,
            shading: THREE.SmoothShading,
            map:this.textures["pasto.jpg"]
        }),
        "pavimento": new THREE.MeshPhongMaterial({
            color: 0x666666,
            specular: 0x333333,
            shininess: 1,
            shading: THREE.SmoothShading,
        }),
        "montana": new THREE.MeshPhongMaterial({
            color: 0x999999,
            specular: 0x333333,
            shininess: 1,
            shading: THREE.SmoothShading,
            map:this.textures["montana.jpg"]
        }),
        "lluvia":new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent:true,
            opacity:0.8,

            map:this.textures["efectos/lluvia3d-01.png"],
            side:THREE.DoubleSide
        }),
        "rayo":new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent:true,
            shininess:0,
            map:this.textures["efectos/rayo.png"]
           // side:THREE.DoubleSide
        })


    };

    this.multiMateriales= {

        "peninsula": new THREE.MeshFaceMaterial([
            this.materials["pavimento"],
            this.materials["grava"],
        ]),
		
		"arboles": new THREE.MeshFaceMaterial([
            this.materials["marronArbol"],
            this.materials["verdeHojas"],

        ]),
		"edificios": new THREE.MeshFaceMaterial([
            this.materials["edificio1"],
            this.materials["edificio2"],
            this.materials["edificio3"],
            this.materials["pasto"],
            this.materials["pasto"],
            this.materials["pasto"],

        ])
    }



      var planeGeo = new THREE.PlaneGeometry( 5000, 5000, 1 );



	
    var agua = new THREE.Mesh( this.getGeometry("mar.DAE"), this.materials["aguaDeMar"] );
    agua.position.y=-10;
    agua.rotation.x=-Math.PI/2;
    agua.rotation.z=Math.PI/2;	
    this._container.add( agua );

    var cielo = new THREE.Mesh(this.getGeometry("cielo.DAE"), this.materials["cieloDespejado"]);
	cielo.rotation.y=Math.PI/2;
    this._container.add(cielo);

    var montana = new THREE.Mesh(this.getGeometry("montana.DAE"), this.materials["montana"]);
    montana.position.y=-10;
    this._container.add(montana);

    var peninsula = new THREE.Mesh(this.getGeometry("peninsula.DAE"), this.multiMateriales["peninsula"]);
    peninsula.receiveShadow=this.enableShadows;
    this._container.add(peninsula);
	
    var manzanas = new THREE.Mesh(this.getGeometry("manzanas.DAE"), this.materials["grisOscuro"]);
    manzanas.castShadow=this.enableShadows;
    manzanas.receiveShadow=this.enableShadows;
    this._container.add(manzanas);	

    var arboles = new THREE.Mesh(this.getGeometry("arboles.DAE"), this.multiMateriales["arboles"]);
    arboles.castShadow=this.enableShadows;
    arboles.receiveShadow=this.enableShadows;
    this._container.add(arboles);	

    var edificios = new THREE.Mesh(this.getGeometry("edificios.DAE"), this.multiMateriales["edificios"]);
    edificios.castShadow=this.enableShadows;
    edificios.receiveShadow=this.enableShadows;
    this._container.add(edificios);




    // Render Depth
    //http://shi-314.github.io/three/rendering-order.html

   // var cylGeo = new THREE.CylinderGeometry( 500, 500, 5000, 32,1,true );

    var planoLluviaGeo = new THREE.PlaneGeometry( 10, 10, 32 );

    var lluvia1 = new THREE.Mesh( planoLluviaGeo, this.materials["lluvia"] );
    //lluvia1.scale.set(1,1,1);
    //lluvia1.rotation.y=Math.PI/2;
    lluvia1.position.z=-4;




    var lluvia2 = new THREE.Mesh(planoLluviaGeo, this.materials["lluvia"] );
    //lluvia1.scale.set(1,1,1);
    //lluvia2.rotation.y=Math.PI/2;

    lluvia2.position.z=-2.33;






    var planoRayoGeo = new THREE.PlaneGeometry( 300, 300, 32 );

    var rayo1 = new THREE.Mesh( planoRayoGeo, this.materials["rayo"] );
    rayo1.rotation.y=Math.PI/2;
    rayo1.position.x=-500;
    rayo1.renderDepth=0;
    this._container.add(rayo1);
    LT.viewport3D.camaras[0].add( lluvia1 );
    LT.viewport3D.camaras[0].add( lluvia2 );
   //this._container.add( lluvia2 );
   //this._container.add( lluvia1 );


	this._cielo=cielo;
	this._agua=agua;	
	this._lluvia1=lluvia1;
	this._lluvia2=lluvia2;
	this._rayo1=rayo1;
	
	this._assetsLoaded=true;
	this.setModo(this._modo);

    this.dispatchEvent({type:this.ESCENARIO_LISTO});
}


Escenario.prototype.setModo=function(modo){
	this._modo=modo;
	
	if (this._assetsLoaded==true){
		
		if (this._modo==this.MODO_MEDIODIA_SOLEADO){
			this._cielo.material=this.materials["cieloDespejado"];
			this._rayo1.visible=false;
			this._lluvia1.visible=false;
			this._lluvia2.visible=false;
            this.luces.luzSol.hex=0xFFFFDD;
			this.luces.luzSol.intensity=1.1;
			
		} else {// tormenta"];		
			this._cielo.material=this.materials["cieloTormenta"];
			this._lluvia1.visible=true;
			this._lluvia2.visible=true;
			this._rayo1.visible=false;
            this.luces.luzSol.hex=0x8888FF;
			this.luces.luzSol.intensity=0.8;
		}

	}	
}

Escenario.prototype.onEnterFrame=function(){
	if (this._assetsLoaded==true){
	
   		this.textures["aguaDeMar_normal.jpg"].offset.y+=-0.00111;
   		this.textures["aguaDeMar.jpg"].offset.y+=-0.000137;

   		this.textures["aguaDeMar_normal.jpg"].offset.x+=-0.000162;
   		this.textures["aguaDeMar.jpg"].offset.x+=-0.000123;

		
		if (this._modo==this.MODO_TORMENTA){
    		this.textures["efectos/lluvia3d-01.png"].offset.y+=0.03;
		
			if (this._anguloLluviaNeedsUpdate){
			
					var inc=(this._anguloLluvia-this._lluvia1.rotation.z)*0.01;
					if (Math.abs(inc)>0.005){
					    this._lluvia1.rotation.z+=inc;
						this._lluvia2.rotation.z=this._lluvia1.rotation.z;
					} else {
						this._anguloLluviaNeedsUpdate=false;
					}
			}
            /*
            var pCam=LT.viewport3D.camaras[0].position;

            this._lluvia1.position.x=pCam.x-2;
            this._lluvia2.position.x=pCam.x-4;
            this._lluvia1.position.y=pCam.y;
            this._lluvia2.position.y=pCam.y;
            this._lluvia1.position.z=pCam.z;
            this._lluvia2.position.z=pCam.z;
*/
			if (this._rayoFrame<=this._rayoIntensidad.length-1){
				this.luces.luzRayo.intensity=this._rayoIntensidad[this._rayoFrame]*4;
				this._rayo1.material.opacity=Math.floor(this._rayoIntensidad[this._rayoFrame]/2);
				this._rayoFrame++;
			}

            this._delayProximoRayo--;
            if (this._delayProximoRayo==0){
                this.dispararRayo();
                this._delayProximoRayo=Math.floor(150+Math.random()*300);
            }

		}
	
	}
	
	
}

Escenario.prototype.setAnguloLluvia=function(angulo){
	this._anguloLluvia=angulo;
	this._anguloLluviaNeedsUpdate=true;

    this.dispatchEvent({type:this.ESCENARIO_CAMBIO_ANGULO_LLUVIA,value:angulo});
}


Escenario.prototype.dispararRayo=function(){
	var x=-300-Math.random()*300;
	var z=(Math.random()-0.5)*300;	
	
	this.setRayo([x,150,z]);
	
	this.dispatchEvent({type:this.ESCENARIO_DISPARO_DE_TRUENO});
}

Escenario.prototype.setRayo=function(pos){
	this.luces.luzRayo.position.set(pos[0],pos[1],pos[2]);
	
	this._rayo1.position.copy(this.luces.luzRayo.position);
	this._rayoFrame=0;
	this._rayo1.visible=true;
};

addEventsHandlingFunctions(Escenario);