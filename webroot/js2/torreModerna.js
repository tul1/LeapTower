"use strict";

function TorreModerna(){

    Torre.call(this);


    this.MAXIMO_PISOS=18;
    this.ALTURA_DE_PISO=4;
    // modelos DAE que necsito
	/*
    this.addGeometry("TorreModerna/piso12.DAE");
    this.addGeometry("TorreModerna/piso15.DAE");
    this.addGeometry("TorreModerna/piso18.DAE");
    this.addGeometry("TorreModerna/piso21.DAE");
    this.addGeometry("TorreModerna/piso24.DAE");


    this.addGeometry("andamios/andamio12.DAE");
    this.addGeometry("andamios/andamio15.DAE");
    this.addGeometry("andamios/andamio18.DAE");
    this.addGeometry("andamios/andamio21.DAE");
    this.addGeometry("andamios/andamio24.DAE");
*/

    // texturas que necesito
    this.addTexture("cementoGris.jpg");
    this.addTexture("sky1.jpg");

/*
    var geometry = new THREE.BoxGeometry(6,3,6);
    var unitMesh = new THREE.Mesh(tubeGeometry, shaderMaterial);
    var m=new THREE.Matrix4();

    m.identity();
    //  m.makeTranslation(i*20,j*20,0);

    combinedGeo.merge(unitMesh.geometry,m);
*/

	this._geos={
        "losa":new THREE.BoxGeometry( 12, 1, 12 ),
		"bloque1":new THREE.BoxGeometry( 6, 3, 6 ),
		"bloque2":new THREE.BoxGeometry( 10, 3, 10 ),
		"bloque3":new THREE.BoxGeometry( 16, 3, 16 )
	}
}

inheritPrototype(TorreModerna, Torre);

// Aca se hace  todo lo que requiera usando las texturas y las geometrias cargada


TorreModerna.prototype.init=function(){

    //this.log("inicializar()");

    // Importante para todos los mapas de reflexion hay que setear esto
    this.textures["sky1.jpg"].mapping=THREE.SphericalReflectionMapping;


    this.materiales2={

        "hierroRojo":new THREE.MeshPhongMaterial({
            color: 0xFF4444,
            specular: 0x333333,
            shininess: 1,
            shading: THREE.SmoothShading
        }),
        "cemento":new THREE.MeshPhongMaterial({
            color: 0xCCCCCC,
            specular: 0x333333,
            shininess: 1,
            shading: THREE.SmoothShading,
            map:this.getTexture("cementoGris.jpg")
        }),
        "vidrio":new THREE.MeshPhongMaterial({
            color: 0x6388bb,
            specular: 0xFFFFFF,
            shininess: 16,
            shading: THREE.SmoothShading,
            envMap:this.getTexture("sky1.jpg"),
            reflectivity: 0.9,
            opacity:0.6,
            transparent:true,
            //side:THREE.DoubleSide,
        }),

    };

    // materiales compuestos
    this.multiMateriales= {
        "modulo":new THREE.MeshFaceMaterial([
            this.materiales2["cemento"],
            this.materiales2["vidrio"],

        ])
    }

    // los shapes que quiera incluir en el JSON
    this._jsonShapes2={
       "shape_losa": {"type": "box", "scale": [12,1,12], "mass":20.0},
       "shape_bloque1": {"type": "box", "scale": [6,3,6], "mass":10.0},
       "shape_bloque2": {"type": "box", "scale": [10,3,10], "mass":10.0},
       "shape_bloque3": {"type": "box", "scale": [16,3,12], "mass":10.0},

        "shape_ventanaBloque2": {"type": "box", "scale": [0.2,3,9], "mass":1.0},
        "shape_ventanaBloque3": {"type": "box", "scale": [0.2,3,12], "mass":1.0},
    }

    // aviso que la inicializacion esta terminada
    this.dispatchEvent({ type:this.INIT_COMPLETE });


/*
    for (var i=12;i<=24;i=i+3){
        var andamio = new THREE.Mesh(this.getGeometry("andamios/andamio"+i+".DAE"), this.materiales2["hierroRojo"]);
        andamio.matrixAutoUpdate = false;
        andamio.visible=false;
        this._andamios.push(andamio);
        this._containerAndamios.add(andamio);
    }

*/


}

TorreModerna.prototype.actualizarAndamio=function(posicionY,anguloY,radio,resaltar) {
    var fRadio=Math.max((radio-16)/80,0);

    var idxAndamio=0;
/*
    if (fRadio>0.8){
        idxAndamio=4;
    } else if (fRadio>0.6){
        idxAndamio=3;
    } else  if (fRadio>0.4){
        idxAndamio=2
    } else if (fRadio>0.2){
        idxAndamio=1;
    }
*/
/*
    for (var i=0;i<this._andamios.length;i++) {
        this._andamios[i].visible = false;
    }
    //this.log(" actualizarAndamio idx andamio:"+idxAndamio);
    this._andamios[idxAndamio].visible=true;
    if (resaltar)
        this._andamios[idxAndamio].material.emissive=new THREE.Color(1,0,0);
    else
        this._andamios[idxAndamio].material.emissive=new THREE.Color(0,0,0);

    this._containerAndamios.position.y=posicionY;
	*/
};


TorreModerna.prototype.agregarPiso=function(anguloY,radio,posX,posZ) {



    var fRadio=Math.max((radio-16)/80,0);


   
   /*
    var dae="piso12";

    if (fRadio>0.8){
        dae="piso24";
    } else if (fRadio>0.6){
        dae="piso21";
    } else  if (fRadio>0.4){
        dae="piso18";
    } else if (fRadio>0.2){
        dae="piso15";
    }
*/

    var magnitud=Math.sqrt(posX*posX+posZ*posZ);

    var offsetX=1;
    if (posX<0) offsetX=-1;

    var offsetZ=1;
    if (posZ<0) offsetZ=-1;



    var y=this._alturaAndamio;

    var mod = new THREE.Mesh(this._geos["losa"], this.materiales2["cemento"]);
    mod.position.x = 0;
    mod.position.z = 0;
    mod.position.y = y+0.5;
    mod.updateMatrix();
    mod.matrixAutoUpdate = false;

    this._container.add(mod);
    this._objetos3D.push(mod);

    var jsonNode = {};
    jsonNode.id = "piso_losa_"+this._alturaAndamio;
    jsonNode.shape = "shape_losa";
    jsonNode.position = [0, y+0.5, 0];
    jsonNode.rotation = [0, 0, 0];
    jsonNode.trackYValue=1;
    this._jsonTower2.push(jsonNode);

    this.log("agregarPiso() posX:"+posX+" posZ:"+posZ+" offX:"+offsetX+" offZ:"+offsetZ+" magnitud:"+magnitud);

    for (var i=-1;i<=1;i=i+2){
			for (var j=-1;j<=1;j=j+2){
				

                var shape="";
                var x,z;

				if ((i==offsetX) && (offsetZ==j)){

                    if (magnitud>25){

                        x=i*16/2;
                        z=j*16/2;
                        mod = new THREE.Mesh(this._geos["bloque3"], this.materiales2["cemento"]);
                        shape="shape_bloque3";
                    } else {
                        x=i*10/2;
                        z=j*10/2;
                        mod = new THREE.Mesh(this._geos["bloque2"], this.materiales2["cemento"]);
                        shape="shape_bloque2";
                    }

					mod.position.x = x;
					mod.position.z = z;


				} else {
					mod = new THREE.Mesh(this._geos["bloque1"], this.materiales2["cemento"]);

                    x=i*6/2;
                    z=j*6/2;

                    mod.position.x = x;
					mod.position.z = z;
                    shape="shape_bloque1";
					
				}

				y=this._alturaAndamio+0.5+this.ALTURA_DE_PISO/2;
				mod.position.y = y;
				mod.updateMatrix();
				mod.matrixAutoUpdate = false;

                this._container.add(mod);
                this._objetos3D.push(mod);


                jsonNode = {};
                jsonNode.id = "piso_"+this._alturaAndamio+"_"+i+"_"+j;
                jsonNode.shape = shape;
                jsonNode.position = [x, y, z];
                jsonNode.rotation = [0, 0, 0];

                var breakAt=50-Math.min(40,this._cantPisos*2);
                var constraints = [];

                if (y>this.ALTURA_DE_PISO){
                    constraints.push({
                        pointOnMe: [0, -1.5,0],
                        attachTo: "piso_losa_"+(this._alturaAndamio),
                        pointOnAttached: [x, 0.5,z],
                        breakAt: breakAt
                    });
                    if (this._cantPisos<this.MAXIMO_PISOS) {
                        constraints.push({
                            pointOnMe: [0, 1.5, 0],
                            attachTo: "piso_losa_" + (this._alturaAndamio + this.ALTURA_DE_PISO),
                            pointOnAttached: [x, -0.5, z],
                            breakAt: breakAt
                        });
                    }

                }


                if (constraints.length > 0) {
                    jsonNode.constraints = constraints;
                }


                this._jsonTower2.push(jsonNode);


			}
	}

    //var axisHelper = new THREE.AxisHelper(5);
    //mod.add(axisHelper);


    this._cantPisos++;
    this._alturaAndamio+=this.ALTURA_DE_PISO;

    // esto llama al callback
    this.chequearTorreTerminada();

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

    return json;
}

