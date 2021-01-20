"use strict";

function TorreTadao(){

    Torre.call(this);

    // modelos DAE que necsito
    this.addGeometry("torreTadao/losa.DAE");
    this.addGeometry("torreTadao/moduloA1.DAE");
    this.addGeometry("torreTadao/moduloA2.DAE");
    this.addGeometry("torreTadao/moduloB1.DAE");
    this.addGeometry("torreTadao/moduloB2.DAE");
    this.addGeometry("torreTadao/moduloB3.DAE");
    this.addGeometry("torreTadao/moduloB4.DAE");
    this.addGeometry("torreTadao/moduloD1.DAE");

    // texturas que necesito
    this.addTexture("cementoGris.jpg");
    this.addTexture("sky1.jpg");


}

inheritPrototype(TorreTadao, Torre);

// Aca se hace  todo lo que requiera usando las texturas y las geometrias cargada


TorreTadao.prototype.init=function(){

    //this.log("inicializar()");

    // Importante para todos los mapas de reflexion hay que setear esto
    this.textures["sky1.jpg"].mapping=THREE.SphericalReflectionMapping;


    this.materiales2={
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
            this.materiales2["vidrio"]
        ])
    }

    // los shapes que quiera incluir en el JSON
    this._jsonShapes2={
       "modulo": {"type": "box", "scale": [3,3,3], "mass":1.0 }
    }

    // aviso que la inicializacion esta terminada
    this.dispatchEvent({ type:this.INIT_COMPLETE });

}


TorreTadao.prototype.agregarPiso=function(anguloY,radio) {


    //this.log("agregarPiso() a:"+anguloY+" "+radio);

    var min=-Math.floor(radio/3)*3;
    var max=-min;
    var count=0;
    for (var x=min;x<=max;x=x+3){
        for (var z=min;z<=max;z=z+3) {

            var mod = new THREE.Mesh(this.getGeometry("torreTadao/moduloA1.DAE"), this.multiMateriales["modulo"]);
            var y=this._alturaAndamio+this.ALTURA_DE_PISO/2;
            mod.position.y = y;
            mod.position.x = x;
            mod.position.z = z;
            mod.updateMatrix();
            mod.matrixAutoUpdate = false;

            //var axisHelper = new THREE.AxisHelper(5);
            //mod.add(axisHelper);
            this._container.add(mod);

            this._objetos3D.push(mod);

            var jsonNode = {};
            jsonNode.id = "modulo_" +x+"_"+y+"_"+z;
            jsonNode.shape = "modulo";
            jsonNode.position = [x, y, z];
            jsonNode.rotation = [0, 0, 0];


            var constraints = [];

            if (x>min) {
                constraints.push({
                    pointOnMe: [-1.5, 0, 0],
                    attachTo: "modulo_" + (x - 3) + "_" + y + "_" + z,
                    pointOnAttached: [1.5, 0, 0],
                    breakAt: 5
                });
            }

            if (z>min) {
                constraints.push({
                    pointOnMe: [0, 0, -1.5],
                    attachTo: "modulo_" + x  + "_" + y + "_" + (z-3),
                    pointOnAttached: [0, 0, 1.5],
                    breakAt: 7
			});
            }

            if ((y>0)  && (x==0) && (z==0)){
                constraints.push({
                    pointOnMe: [0, -1.5,0],
                    attachTo: "modulo_" + x  + "_" + (y-3) + "_" + z,
                    pointOnAttached: [0, 1.5,0],
                    breakAt: 5
                });
                jsonNode.trackYValue=1;
            }


            if (constraints.length > 0) {
               jsonNode.constraints = constraints;
            }


            this._jsonTower2.push(jsonNode);

            count++;
        }
    }


    this._cantPisos++;
    this._alturaAndamio+=this.ALTURA_DE_PISO;

    // esto llama al callback
    this.chequearTorreTerminada();

}


// Armar el JSON para pasarle al simulador
TorreTadao.prototype.getJsonSimulacion=function() {


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

