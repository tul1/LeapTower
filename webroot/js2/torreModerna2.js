"use strict";

function TorreModerna(){

    Torre.call(this);


    this.MAXIMO_PISOS=19;
    this.ALTURA_DE_PISO=4;
    // modelos DAE que necsito

    this.addGeometry("torreModerna/andamioCentral.DAE");
    this.addGeometry("torreModerna/andamioDeptoA.DAE");
    this.addGeometry("torreModerna/andamioDeptoB.DAE");
    this.addGeometry("torreModerna/bloqueConVentanas.DAE");
    this.addGeometry("torreModerna/losa.DAE");
    this.addGeometry("torreModerna/pared1DeptoA.DAE");
    this.addGeometry("torreModerna/pared2DeptoA.DAE");
    this.addGeometry("torreModerna/pared2DeptoAInvertida.DAE");
    this.addGeometry("torreModerna/pisoDeptoA.DAE");
    this.addGeometry("torreModerna/techoDeptoA.DAE");
    this.addGeometry("torreModerna/ventanal1DeptoA.DAE");
    this.addGeometry("torreModerna/ventanal2DeptoA.DAE");

    this.addGeometry("torreModerna/pared1DeptoB.DAE");
    this.addGeometry("torreModerna/pared2DeptoB.DAE");
    this.addGeometry("torreModerna/pared2DeptoBInvertida.DAE");
    this.addGeometry("torreModerna/pisoDeptoB.DAE");
    this.addGeometry("torreModerna/techoDeptoB.DAE");
    this.addGeometry("torreModerna/ventanal1DeptoB.DAE");
    this.addGeometry("torreModerna/ventanal2DeptoB.DAE");

    // texturas que necesito
    this.addTexture("cementoGris.jpg");
    this.addTexture("parquet1.jpg");
    this.addTexture("sky1.jpg");
    this.addTexture("refmap4a.jpg");


}

inheritPrototype(TorreModerna, Torre);

// Aca se hace  todo lo que requiera usando las texturas y las geometrias cargada


TorreModerna.prototype.init=function(){

    //this.log("inicializar()");

    // Importante para todos los mapas de reflexion hay que setear esto
    this.textures["sky1.jpg"].mapping=THREE.SphericalReflectionMapping;
    this.textures["parquet1.jpg"].repeat.set(2,2);

    this.textures["refmap4a.jpg"].repeat.set(2,1);
    this.textures["refmap4a.jpg"].mapping=THREE.SphericalReflectionMapping;

    this.textures["cementoGris.jpg"].repeat.set(0.5,0.5);

    this.materiales2={

        "hierroRojo":new THREE.MeshPhongMaterial({
            color: 0xCC4444,
            specular: 0x333333,
            shininess: 1,
            shading: THREE.SmoothShading
        }),
        "marcos":new THREE.MeshPhongMaterial({
            color: 0x333333,
            specular: 0xFFFFFF,
            shininess: 16,
            shading: THREE.SmoothShading
        }),
        "pinturaBlanca":new THREE.MeshPhongMaterial({
            color: 0xCCCCCC,
            specular: 0xFFFFFF,
            shininess: 2,
            shading: THREE.SmoothShading
        }),
        "cemento":new THREE.MeshPhongMaterial({
            color: 0xDDDDDD,
            specular: 0x999999,
            shininess: 2,
            shading: THREE.SmoothShading,
            map:this.getTexture("cementoGris.jpg")
        }),
        "parquet":new THREE.MeshPhongMaterial({
            color: 0xCCCCCC,
            specular: 0x333333,
            shininess: 1,
            shading: THREE.SmoothShading,
            map:this.getTexture("parquet1.jpg")
        }),
        "vidrio":new THREE.MeshPhongMaterial({
            color: 0x6388CC,
            specular: 0xFFFFFF,
            shininess: 16,
            shading: THREE.SmoothShading,
            envMap:this.getTexture("sky1.jpg"),
            reflectivity: 0.9,
            opacity:0.75,
            transparent:true,
            side:THREE.DoubleSide,
        }),

    };

    // materiales compuestos
    this.multiMateriales= {
        "ventanal":new THREE.MeshFaceMaterial([
            this.materiales2["marcos"],
        this.materiales2["vidrio"],
    ]),
        "piso":new THREE.MeshFaceMaterial([
            this.materiales2["cemento"],
            this.materiales2["parquet"],
        ]),
        "paredes":new THREE.MeshFaceMaterial([
            this.materiales2["cemento"],
            this.materiales2["pinturaBlanca"],
        ]),
        "bloque":new THREE.MeshFaceMaterial([
            this.materiales2["cemento"],
            this.materiales2["marcos"],
            this.materiales2["vidrio"],
        ]),
    }

    // los shapes que quiera incluir en el JSON
    this._jsonShapes2={
       "shape_losa": {"type": "box", "scale": [12,0.5,12], "mass":20.0},
       "shape_bloque6x6": {"type": "box", "scale": [6,3.5,6], "mass":20.0},

       "shape_pisoDeptoA": {"type": "box", "scale": [9,0.2,9], "mass":10.0},
       "shape_techoDeptoA": {"type": "box", "scale": [9,0.2,9], "mass":10.0},

       "shape_ventanal1DeptoA": {"type": "box", "scale": [0.2,3.1,8], "mass":5.0},
       "shape_ventanal2DeptoA": {"type": "box", "scale": [8,3.1,0.2], "mass":5.0},

       "shape_pared1DeptoA"   : {"type": "box", "scale": [0.8,3.1,9], "mass":10.0},
       "shape_pared2DeptoA"   : {"type": "box", "scale": [8.2,3.1,0.8], "mass":10.0},
	   
	   "shape_pisoDeptoB": {"type": "box", "scale": [12,0.2,12], "mass":10.0},
       "shape_techoDeptoB": {"type": "box", "scale": [12,0.2,12], "mass":10.0},

       "shape_ventanal1DeptoB": {"type": "box", "scale": [0.2,3.1,11], "mass":5.0},
       "shape_ventanal2DeptoB": {"type": "box", "scale": [11 ,3.1,0.2], "mass":5.0},

       "shape_pared1DeptoB"   : {"type": "box", "scale": [0.8,3.1,12], "mass":10.0},
       "shape_pared2DeptoB"   : {"type": "box", "scale": [11.2,3.1,0.8], "mass":10.0},
	   

    }
    this._andamioCentral= new THREE.Mesh(this.getGeometry("torreModerna/andamioCentral.DAE"), this.materiales2["hierroRojo"]);
    this._andamioDeptoA= new THREE.Mesh(this.getGeometry("torreModerna/andamioDeptoA.DAE"), this.materiales2["hierroRojo"]);
    this._andamioDeptoB= new THREE.Mesh(this.getGeometry("torreModerna/andamioDeptoB.DAE"), this.materiales2["hierroRojo"]);



    this._containerAndamios.add(this._andamioCentral);
    this._containerAndamios.add(this._andamioDeptoA);
    this._containerAndamios.add(this._andamioDeptoB);


    this._containerAndamios.visible=false;
    // aviso que la inicializacion esta terminada
    this.dispatchEvent({ type:this.INIT_COMPLETE });







}

TorreModerna.prototype.actualizarAndamio=function(posVec,anguloY,radio,resaltar) {
    //var fRadio=Math.max((radio-16)/80,0);

    var offX=(posVec[0]>0) ? 1:-1;
    var offZ=(posVec[2]>0) ? 1:-1;

    var magnitud=Math.sqrt(posVec[0]*posVec[0]+posVec[2]*posVec[2]);

    this._containerAndamios.position.y=posVec[1];
	this.log(" ** magnitud "+magnitud);
	if (magnitud>15){
	    this._andamioDeptoA.visible=false;
	    this._andamioDeptoB.visible=true;		
		
	    this._andamioDeptoB.position.x=6*offX;
	    this._andamioDeptoB.position.z=6*offZ;
	} else{
	    this._andamioDeptoA.visible=true;
	    this._andamioDeptoB.visible=false;
		
	    this._andamioDeptoA.position.x=4.5*offX;
	    this._andamioDeptoA.position.z=4.5*offZ;
		
	}


    if (resaltar)
        this.materiales2["hierroRojo"].emissive=new THREE.Color(1,0,0);
    else
        this.materiales2["hierroRojo"].emissive=new THREE.Color(0,0,0);

};


TorreModerna.prototype.agregarPiso=function(anguloY,radio,posX,posZ) {




    var fRadio=Math.max((radio-16)/80,0);

    var pisoNro=this._cantPisos;

    var magnitud=Math.sqrt(posX*posX+posZ*posZ);

    var offsetX=1;
    if (posX<0) offsetX=-1;

    var offsetZ=1;
    if (posZ<0) offsetZ=-1;


    var idPrefix= "nivel" + pisoNro;
    var idPrefixPisoSuperior= "nivel" + (pisoNro+1);

    var y=this._alturaAndamio;



    // ****** losa
    var losa = new THREE.Mesh(this.getGeometry("torreModerna/losa.DAE"), this.materiales2["cemento"]);
    losa.position.set(0,y+0.5/2,0);
    losa.castShadow=true;
    losa.receiveShadow=true;
    losa.updateMatrix();losa.matrixAutoUpdate = false;

    var jsonLosa = {
        id:idPrefix+ "_losa",
        shape: "shape_losa",
        position: [0, losa.position.y, 0],
        rotation: [0, 0, 0],
        trackYValue:1,
    };

    this._container.add(losa);
    this._objetos3D.push(losa);
    this._jsonTower2.push(jsonLosa);

    var masa=(this.MAXIMO_PISOS+1-pisoNro)*2;
    var breakAt = (this.MAXIMO_PISOS+1-pisoNro)*20;
   // var breakAt = 100;


    for (var i=-1;i<=1;i=i+2){
			for (var j=-1;j<=1;j=j+2){
				if ((i!=offsetX) || (offsetZ!=j)){


                    var rotYBloque=0; // i=-1 j=1

                    if ((i==-1) && (j==-1)) rotYBloque=-Math.PI/2;
                    else if ((i==1) && (j==-1)) rotYBloque=Math.PI;
                   else if ((i==1) && (j==1)) rotYBloque=Math.PI/2;


                    var bloque = new THREE.Mesh(this.getGeometry("torreModerna/bloqueConVentanas.DAE"), this.multiMateriales["bloque"]);
                    bloque.position.set(i*6/2,y+0.5+3.5/2,j*6/2);
                    bloque.rotation.set(0,rotYBloque,0);
                    bloque.updateMatrix();bloque.matrixAutoUpdate = false;
                    bloque.castShadow=true;
                    bloque.receiveShadow=true;

                    var jsonBloque = {
                        id: idPrefix+"_bloque_"+i+"_"+j,
                        shape: "shape_bloque6x6",
                        position: [bloque.position.x, bloque.position.y, bloque.position.z],
                        rotation: [0, bloque.rotation.y, 0],
                        mass:masa
                    };



                     var constraints = [];

                     if (pisoNro>0) {

                         constraints.push({
                             pointOnMe: [0, -3.5 / 2, 0],
                             attachTo: idPrefix + "_losa",
                             pointOnAttached: [bloque.position.x, 0.5 / 2, bloque.position.z],
                             breakAt: breakAt
                         });

                     }

                     if (pisoNro<this.MAXIMO_PISOS) {

                         constraints.push({
                             pointOnMe: [0, 3.5 / 2, 0],
                             attachTo: idPrefixPisoSuperior + "_losa",
                             pointOnAttached: [bloque.position.x, -0.5 / 2, bloque.position.z],
                             breakAt: breakAt
                         });
                     }

                     if (constraints.length > 0)  jsonBloque.constraints = constraints;

                     this._jsonTower2.push(jsonBloque);
                     this._container.add(bloque);
                     this._objetos3D.push(bloque);


				}// iff
            } // for
	}// for

	var anchoDepto=9;
	var esDeptoB=false;
	if (magnitud>15) {
		anchoDepto=12;
		esDeptoB=true;
	}
		

    this.agregarDepto(new THREE.Vector3(offsetX*anchoDepto/2,y+0.5,offsetZ*anchoDepto/2),pisoNro,idPrefix,offsetX,offsetZ, esDeptoB);
    //var axisHelper = new THREE.AxisHelper(5);
    //mod.add(axisHelper);


    this._cantPisos++;
    this._alturaAndamio+=this.ALTURA_DE_PISO;
    //this.log("agregarPiso() magnitud:"+ magnitud);
    // esto llama al callback
    this.chequearTorreTerminada();

}

TorreModerna.prototype.agregarDepto=function(origen,pisoNro,idPrefix,offsetX,offsetZ,esDeptoB) {

	if (!esDeptoB) esDeptoB=false;
	
	var ancho,letraDepto;
	
	if (esDeptoB){
		 ancho=12;
		 letraDepto="B";
	}
	else{
		ancho=9;
	    letraDepto="A";
	}
	
    var pared2Dae="pared2Depto"+letraDepto;

    var rotPared2Y=(offsetZ>0) ? 0: Math.PI;
    var rotPared1Y=(offsetX<0) ? 0: Math.PI;

    var constraints=[];
    if (offsetX==offsetZ) pared2Dae="pared2Depto"+letraDepto+"Invertida";
    //pared2Dae="pared2DeptoA";

    var pos=origen;
    var breakAt=10;

    var piso = new THREE.Mesh(this.getGeometry("torreModerna/pisoDepto"+letraDepto+".DAE"), this.multiMateriales["piso"]);
    var techo = new THREE.Mesh(this.getGeometry("torreModerna/techoDepto"+letraDepto+".DAE"), this.multiMateriales["paredes"]);
    var ventanal1 = new THREE.Mesh(this.getGeometry("torreModerna/ventanal1Depto"+letraDepto+".DAE"), this.multiMateriales["ventanal"]);
    var ventanal2 = new THREE.Mesh(this.getGeometry("torreModerna/ventanal2Depto"+letraDepto+".DAE"), this.multiMateriales["ventanal"]);

    var pared1 = new THREE.Mesh(this.getGeometry("torreModerna/pared1Depto"+letraDepto+".DAE"), this.multiMateriales["paredes"]);
    var pared2 = new THREE.Mesh(this.getGeometry("torreModerna/"+pared2Dae+".DAE"), this.multiMateriales["paredes"]);

    // piso
    piso.position.set(pos.x,pos.y+0.1,pos.z);
    var jsonPiso = {
        id:idPrefix+"_piso",
        shape: "shape_pisoDepto"+letraDepto,
        position: [piso.position.x, piso.position.y, piso.position.z],
        rotation:[0, 0, 0]
    };
    piso.updateMatrix();piso.matrixAutoUpdate = false;
    piso.castShadow=true;
    piso.receiveShadow=true;
    this._container.add(piso); this._objetos3D.push(piso);
    this._jsonTower2.push(jsonPiso);


    // *************** techo

    techo.position.set(pos.x,pos.y+3.4,pos.z);
    var jsonTecho = {
        id:idPrefix+"_techo",
        shape: "shape_techoDepto"+letraDepto,
        position: [techo.position.x, techo.position.y, techo.position.z],
        rotation:[0, 0, 0]
    };
    techo.castShadow=true;
    techo.receiveShadow=true;
    techo.updateMatrix();techo.matrixAutoUpdate = false;
    this._container.add(techo); this._objetos3D.push(techo);
    this._jsonTower2.push(jsonTecho);


    // **************** ventanal1, ubicada en -x

    ventanal1.position.set(pos.x+offsetX*(ancho/2-0.1) ,pos.y+0.2+3.1/2,pos.z+offsetZ*0.3);
    var jsonVentanal1 = {
        id:idPrefix+"_ventanal1",
        shape: "shape_ventanal1Depto"+letraDepto,
        position: [ventanal1.position.x, ventanal1.position.y, ventanal1.position.z],
        rotation:[0, 0, 0]
    };
    ventanal1.updateMatrix();ventanal1.matrixAutoUpdate = false;

    constraints = [];

    constraints.push({
        pointOnMe: [0, -3.1 / 2, 0],
        attachTo: idPrefix + "_piso",
        pointOnAttached: [offsetX*(ancho/2-0.1), 0.2 / 2,offsetZ*0.3 ],
        breakAt: breakAt
    });
    constraints.push({
        pointOnMe: [0, 3.1 / 2, 0],
        attachTo: idPrefix + "_techo",
        pointOnAttached: [offsetX*(ancho/2-0.1), -0.2 / 2,offsetZ*0.3 ],
        breakAt: breakAt
    });

    jsonVentanal1.constraints = constraints;

    this._container.add(ventanal1); this._objetos3D.push(ventanal1);
    this._jsonTower2.push(jsonVentanal1);

    // ventanal2, ubicada en +z
    ventanal2.position.set(pos.x+offsetX*0.3 ,pos.y+0.2+3.1/2,pos.z+offsetZ*(ancho/2-0.1));

    var jsonVentanal2 = {
        id:idPrefix+"_ventanal2",
        shape: "shape_ventanal2Depto"+letraDepto,
        position: [ventanal2.position.x, ventanal2.position.y, ventanal2.position.z],
        rotation:[0, 0, 0]
    };
    ventanal2.updateMatrix();ventanal2.matrixAutoUpdate = false;

    constraints = [];

    constraints.push({
        pointOnMe: [0, -3.1 / 2, 0],
        attachTo: idPrefix + "_piso",
        pointOnAttached: [offsetX*0.3, 0.2 / 2,offsetZ*(ancho/2-0.1)],
        breakAt: breakAt
    });
    constraints.push({
        pointOnMe: [0, 3.1 / 2, 0],
        attachTo: idPrefix + "_techo",
        pointOnAttached: [offsetX*0.3, -0.2 / 2,offsetZ*(ancho/2-0.1) ],
        breakAt: breakAt
    });

    jsonVentanal2.constraints = constraints;




    this._container.add(ventanal2); this._objetos3D.push(ventanal2);
    this._jsonTower2.push(jsonVentanal2);

    // pared1, ubicada en +x
    pared1.position.set(pos.x-offsetX*(ancho/2-0.8/2) ,pos.y+0.2+3.1/2, pos.z);
    pared1.rotation.set(0,rotPared1Y,0);
    var jsonPared1 = {
        id:idPrefix+"_pared1",
        shape: "shape_pared1Depto"+letraDepto,
        position: [pared1.position.x, pared1.position.y, pared1.position.z],
        rotation:[0, rotPared1Y, 0]
    };
    pared1.castShadow=true;
    pared1.receiveShadow=true;
    pared1.updateMatrix();pared1.matrixAutoUpdate = false;
    this._container.add(pared1); this._objetos3D.push(pared1);
    this._jsonTower2.push(jsonPared1);


    //pared2, la que tiene la escalera, ubicada en -z

    pared2.position.set(pos.x+offsetX*0.3 ,pos.y+0.2+3.1/2, pos.z-offsetZ*(ancho/2-0.8/2));
    pared2.rotation.set(0,rotPared2Y,0);
    var jsonPared2 = {
        id:idPrefix+"_pared2",
        shape: "shape_pared2Depto"+letraDepto,
        position: [pared2.position.x, pared2.position.y, pared2.position.z],
        rotation:[0, rotPared2Y, 0]
    };
    pared2.castShadow=true;
    pared2.receiveShadow=true;
    pared2.updateMatrix();pared2.matrixAutoUpdate = false;
    this._container.add(pared2); this._objetos3D.push(pared2);
    this._jsonTower2.push(jsonPared2);


}


// Armar el JSON para pasarle al simulador
TorreModerna.prototype.getJsonSimulacion=function() {


    // concateno los shapes de esta clase y los comunes que viene de Torre.js en _jsonShapes1
    var _jsonShapes=$.extend(this._jsonShapes1,this._jsonShapes2);

    // concateno lso cuerpos de la torre con el resto que vienen de Torre.js (los crashers y las manos)
    var _jsonTower=this._jsonTower1.concat(this._jsonTower2);


    // armo el JSON final
    var json={
        shapes:_jsonShapes,
        tower:_jsonTower,
        crashers:this._jsonCrashers,
        hands:this._jsonHands
    };
    //JSON.stringify(j,null,"\t");
    json.global={
        gravity:-10,
        groundY:0,
        stopBodiesUntilFrame:30,
        linearDamping:0.05,
        angularDamping:0.05,
        groundFriction:1.0,
        groundRestitution:1.0,
        useFixedConstraints:0,
//      simTimeStep:0.015,
        simTimeStep:0.033,
//      simFixedTimeStep:0.015,
        simFixedTimeStep:0.011,          // 0.035 es el limite de estabilidad
        simMaxSubSteps:3
    };
    return json;
}

TorreModerna.prototype.log=function(msg) {
       console.log(this.constructor.name+"."+msg);
}