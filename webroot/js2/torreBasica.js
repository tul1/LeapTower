"use strict";

function TorreBasica(){

    Torre.call(this);


    this.MAXIMO_PISOS=25;
    // modelos DAE que necsito
    this.addGeometry("torreBasica/piso12.DAE");
    this.addGeometry("torreBasica/piso15.DAE");
    this.addGeometry("torreBasica/piso18.DAE");
    this.addGeometry("torreBasica/piso21.DAE");
    this.addGeometry("torreBasica/piso24.DAE");


    this.addGeometry("andamios/andamio12.DAE");
    this.addGeometry("andamios/andamio15.DAE");
    this.addGeometry("andamios/andamio18.DAE");
    this.addGeometry("andamios/andamio21.DAE");
    this.addGeometry("andamios/andamio24.DAE");


    // texturas que necesito
    this.addTexture("cementoGris.jpg");
    this.addTexture("sky1.jpg");


}

inheritPrototype(TorreBasica, Torre);

// Aca se hace  todo lo que requiera usando las texturas y las geometrias cargada


TorreBasica.prototype.init=function(){

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
       "shape_piso24": {"type": "box", "scale": [24,3,24], "mass":20.0 },
       "shape_piso21": {"type": "box", "scale": [21,3,21], "mass":17.0 },
       "shape_piso18": {"type": "box", "scale": [18,3,18], "mass":15.0 },
       "shape_piso15": {"type": "box", "scale": [15,3,15], "mass":12.0 },
       "shape_piso12": {"type": "box", "scale": [12,3,12], "mass":10.0 }
    }



    for (var i=12;i<=24;i=i+3){
        var andamio = new THREE.Mesh(this.getGeometry("andamios/andamio"+i+".DAE"), this.materiales2["hierroRojo"]);
        andamio.matrixAutoUpdate = false;
        andamio.visible=false;
        this._andamios.push(andamio);
        this._containerAndamios.add(andamio);
    }

    // aviso que la inicializacion esta terminada
    this.dispatchEvent({ type:this.INIT_COMPLETE });




}

TorreBasica.prototype.actualizarAndamio=function(posicionY,anguloY,radio,resaltar) {
    var fRadio=Math.max((radio-16)/80,0);

    var idxAndamio=0;

    if (fRadio>0.8){
        idxAndamio=4;
    } else if (fRadio>0.6){
        idxAndamio=3;
    } else  if (fRadio>0.4){
        idxAndamio=2
    } else if (fRadio>0.2){
        idxAndamio=1;
    }

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
};


TorreBasica.prototype.agregarPiso=function(anguloY,radio) {



    var fRadio=Math.max((radio-16)/80,0);

   // this.log("agregarPiso() a:"+anguloY+" radio"+radio+" fRadio:"+fRadio);
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

    var mod = new THREE.Mesh(this.getGeometry("torreBasica/"+dae+".DAE"), this.multiMateriales["modulo"]);
    var y=this._alturaAndamio+this.ALTURA_DE_PISO/2;
    mod.position.y = y;
    mod.position.x = 0;
    mod.position.z = 0;
    mod.updateMatrix();
    mod.matrixAutoUpdate = false;

    //var axisHelper = new THREE.AxisHelper(5);
    //mod.add(axisHelper);
    this._container.add(mod);

    this._objetos3D.push(mod);

    var jsonNode = {};
    jsonNode.id = "piso_"+this._alturaAndamio;
    jsonNode.shape = "shape_"+dae;
    jsonNode.position = [0, y, 0];
    jsonNode.rotation = [0, 0, 0];


    var constraints = [];

    if (y>0){
        constraints.push({
            pointOnMe: [-10, -1.5,-10],
            attachTo: "piso_" +y,
            pointOnAttached: [-10, 1.5,-10],
            breakAt: 20
        });
        constraints.push({
            pointOnMe: [10, -1.5,-10],
            attachTo: "piso_" +y,
            pointOnAttached: [10, 1.5,-10],
            breakAt: 20
        });
        constraints.push({
            pointOnMe: [-10, -1.5,10],
            attachTo: "piso_" +y,
            pointOnAttached: [-10, 1.5,10],
            breakAt: 20
        });
        constraints.push({
            pointOnMe: [10, -1.5,10],
            attachTo: "piso_" +y,
            pointOnAttached: [10, 1.5,10],
            breakAt: 20
        });
        jsonNode.trackYValue=1;
    }


    if (constraints.length > 0) {
       jsonNode.constraints = constraints;
    }


    this._jsonTower2.push(jsonNode);




    this._cantPisos++;
    this._alturaAndamio+=this.ALTURA_DE_PISO;

    // esto llama al callback
    this.chequearTorreTerminada();

}


// Armar el JSON para pasarle al simulador
TorreBasica.prototype.getJsonSimulacion=function() {


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

