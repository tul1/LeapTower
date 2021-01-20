"use strict";

function TorreVander()
{
	Torre.call(this);

	this.addGeometry("torreVander2/columna.DAE");
	this.addGeometry("torreVander2/losa4_75.DAE");
	this.addGeometry("torreVander2/losa9_30.DAE");
	this.addGeometry("torreVander2/losa13_80.DAE");
	this.addGeometry("torreVander2/losa18_40.DAE");
	this.addGeometry("torreVander2/ventanalx3.DAE");
	this.addGeometry("torreVander2/ascensores.DAE");


	this.addGeometry("torreVander2/andamio1.DAE");
	this.addGeometry("torreVander2/andamio2.DAE");
	this.addGeometry("torreVander2/andamio3.DAE");
	this.addGeometry("torreVander2/andamio4.DAE");
	this.addGeometry("torreVander2/andamio5.DAE");

	this.losasAnchos = [];

	// texturas que necesito
	this.addTexture("cementoGris.jpg");
	this.addTexture("sky1.jpg");

    this.MAXIMO_PISOS=25;

	this.breakAtColLosa = 20;
	this.breakAtAscLosa = 30;
	this.breakAtVetanaLosaAbajo = 10;
	this.breakAtVetanaLosaArriba = 10;
	this.breakAtVetanaVentana = 10;
	this.deltaLosaVentana = 0;

}

inheritPrototype(TorreVander, Torre);


TorreVander.prototype.init=function()
{
// Importante para todos los mapas de reflexion hay que setear esto
	this.textures["sky1.jpg"].mapping=THREE.SphericalReflectionMapping;
	this.textures["cementoGris.jpg"].repeat.set(0.5,0.5);

	this.materiales2={
		"hierroRojo":new THREE.MeshPhongMaterial({
			color: 0xCC4444,
			specular: 0x333333,
			shininess: 1,
			shading: THREE.SmoothShading
		}),
		"cemento":new THREE.MeshPhongMaterial({
			color: 0x444444,
			specular: 0xFFFFFF,
			shininess: 2,
			shading: THREE.SmoothShading,
			map:this.getTexture("cementoGris.jpg")
		}),
		"vidrio":new THREE.MeshPhongMaterial({
			color: 0xAAFFCC,
			specular: 0xFFFFFF,
			shininess: 32,
			shading: THREE.SmoothShading,
			envMap:this.getTexture("sky1.jpg"),
			reflectivity: 1.0,
			opacity:0.7,
			transparent:true,
			//side:THREE.DoubleSide,
		}),
		"marcos":new THREE.MeshPhongMaterial({
			color: 0x222233,
			specular: 0xFFFFFF,
			shininess: 8,
			shading: THREE.SmoothShading
		}),
	};
	// materiales compuestos
	this.multiMateriales= {
		"modulo":new THREE.MeshFaceMaterial([
			this.materiales2["cemento"],
			this.materiales2["vidrio"]
			]),
		"ventanal":new THREE.MeshFaceMaterial([
			this.materiales2["vidrio"],
			this.materiales2["marcos"]

		])
	};

	// los shapes que quiera incluir en el JSON
	this._jsonShapes2={
		"columna": { "type": "box", "scale": [1.5, 2.7, 1.5], "mass": 5}, 		
		"losaShapeBase": { "type": "box", "scale": [18.40, 0.3, 18.40], "mass": 100 },
 		"losaShape0": { "type": "box", "scale": [4.75, 0.3, 4.75], "mass": 30.0 },
 		"losaShape1": { "type": "box", "scale": [9.30, 0.3, 9.30], "mass": 30.0 },
 		"losaShape2": { "type": "box", "scale": [13.80, 0.3, 13.80], "mass": 30.0 },
 		"losaShape3": { "type": "box", "scale": [18.40, 0.3, 18.40], "mass": 30.0 },
		"ventanalx3": { "type": "box", "scale": [4.55, 2.7, 0.1], "mass": 1 },
		"ascensores": { "type": "box", "scale": [4, 2.7, 4], "mass": 10 }
	};



	for (var i=1;i<=4;i=i+1){
		var andamio = new THREE.Mesh(this.getGeometry("torreVander2/andamio"+i+".DAE"), this.materiales2["hierroRojo"]);
		andamio.matrixAutoUpdate = false;
		andamio.visible=false;
		this._andamios.push(andamio);
		this._containerAndamios.add(andamio);
	}



	this.dispatchEvent({ type:this.INIT_COMPLETE });
}


TorreVander.prototype.getTamanioPiso=function(radio){
	var fRadio=this.normalizarRadio(radio);
	var index=0;

	 if (fRadio>0.9){
		index=3;
	} else  if (fRadio>0.8){
		index=2
	} else if (fRadio>0.7){
		index=1;
	} else{
		 index=0;
	 }
	return index;
}

TorreVander.prototype.actualizarAndamio=function(posVec,anguloY,radio,resaltar) {

	//this.log("actualizarAndamio() rad:"+radio);
	var idxAndamio=this.getTamanioPiso(radio);

	for (var i=0;i<this._andamios.length;i++) {
		this._andamios[i].visible = false;
	}

	this._andamios[idxAndamio].visible=true;

	if (resaltar)
		this._andamios[idxAndamio].material.emissive=new THREE.Color(1,0,0);
	else
		this._andamios[idxAndamio].material.emissive=new THREE.Color(0,0,0);

	this._containerAndamios.position.y=posVec[1];
};


// Armar el JSON para pasarle al simulador
TorreVander.prototype.getJsonSimulacion=function() 
{
    var _jsonShapes=$.extend(this._jsonShapes1,this._jsonShapes2);

    var _jsonTower=this._jsonTower1.concat(this._jsonTower2);

        var json={
        shapes:_jsonShapes,
        tower:_jsonTower,
        crashers:this._jsonCrashers,
        hands:this._jsonHands
    };
    json.global={
		gravity:-10,
		groundY:0,
		stopBodiesUntilFrame:30,
		linearDamping:0.05,
		angularDamping:0.05,
		groundFriction:1.0,
		groundRestitution:1.0,
		useFixedConstraints:0,
//		simTimeStep:0.015,
		simTimeStep:0.033,
//		simFixedTimeStep:0.015,
		simFixedTimeStep:0.011,          // 0.035 es el limite de estabilidad
		simMaxSubSteps:3
    };

    return json;
}


TorreVander.prototype.agregarPiso=function(anguloY,radio,posX,posZ)
{
	var index=this.getTamanioPiso(radio);

	//this.log("agregarPiso() idx:"+index+" rad:"+radio);

	if(!this._alturaAndamio)
	{
		var mod = new THREE.Mesh(this.getGeometry("torreVander2/losa18_40.DAE"), this.materiales2["cemento"]);
		mod.receiveShadow=true;
		mod.castShadow=true;
		var y = 0.15;
		var h = Math.round((y-0.15)*100000)/100000;
		mod.position.y = y;
		mod.updateMatrix();
		mod.matrixAutoUpdate = false;
		this._container.add(mod);
		this._objetos3D.push(mod);

		var body={
			id: "losa" + h,
			shape: "losaShapeBase",
			position: [0, y, 0],
			rotation: [0,0,0],
			trackYValue: 1
			};

		this._jsonTower2.push(body);

		this.losasAnchos.push(index);

		this.dibujarPiso(index,0.3);
	    this._alturaAndamio += this.ALTURA_DE_PISO+0.3;

	}
	else
	{
		this.dibujarPiso(index, this._alturaAndamio);
    	this._alturaAndamio += this.ALTURA_DE_PISO;
	}
    this._cantPisos++;


    this.chequearTorreTerminada();
}


TorreVander.prototype.dibujarPiso=function(index,altura)
{
	this.seleccionarPiso=function(index,altura)
	{
		switch(index)
		{
			case 0:
				this.pisoAncho1(altura);
				break;
			case 1:
				this.pisoAncho2(altura);
				break;
			case 2:
				this.pisoAncho3(altura);
				break;
			case 3:
				this.pisoAncho4(altura);
				break;
		}

	}
	this.log("sibujarPiso idx:"+index);

	var y = Math.round((2.85+altura)*1000)/1000;
	var h = Math.round((y-0.15)*1000)/1000;	
	switch(index)
	{
		case 0:
			var mod = new THREE.Mesh(this.getGeometry("torreVander2/losa4_75.DAE"), this.materiales2["cemento"]);
			mod.position.y = y;
			mod.updateMatrix();
			mod.receiveShadow=true;
			mod.castShadow=true;
			mod.matrixAutoUpdate = false;
			this._container.add(mod);
			this._objetos3D.push(mod);

			var body={
				id: "losa" + h,
				shape:"losaShape0",
				position: [0, y, 0],
				rotation: [0,0,0],
				trackYValue: 1
			};
			this._jsonTower2.push(body);
			this.losasAnchos.push(index);


			if(this.losasAnchos[this.losasAnchos.length-2] > this.losasAnchos[this.losasAnchos.length-1])
				this.pisoAncho1(altura);
			else
				this.seleccionarPiso(this.losasAnchos[this.losasAnchos.length-2],altura);

			break;

		case 1:
			var mod = new THREE.Mesh(this.getGeometry("torreVander2/losa9_30.DAE"), this.materiales2["cemento"]);
			mod.position.y = y;
			mod.updateMatrix();
			mod.receiveShadow=true;
			mod.castShadow=true;
			mod.matrixAutoUpdate = false;
			this._container.add(mod);
			this._objetos3D.push(mod);

			var body={
				id: "losa" + h,
				shape:"losaShape1",
				position: [0, y, 0],
				rotation: [0,0,0],
				trackYValue: 1
			};
			this._jsonTower2.push(body);
			this.losasAnchos.push(index);
			if(this.losasAnchos[this.losasAnchos.length-2] > this.losasAnchos[this.losasAnchos.length-1])
					this.pisoAncho2(altura);
			else
					this.seleccionarPiso(this.losasAnchos[this.losasAnchos.length-2], altura);

		break;

		case 2:
			var mod = new THREE.Mesh(this.getGeometry("torreVander2/losa13_80.DAE"), this.materiales2["cemento"]);
			mod.position.y = y;
			mod.updateMatrix();
			mod.receiveShadow=true;
			mod.castShadow=true;
			mod.matrixAutoUpdate = false;
			this._container.add(mod);
			this._objetos3D.push(mod);

			var body={
				id: "losa" + h,
				shape:"losaShape2",
				position: [0, y, 0],
				rotation: [0,0,0],
				trackYValue: 1
			};
			this._jsonTower2.push(body);
			this.losasAnchos.push(index);
			if(this.losasAnchos[this.losasAnchos.length-2] > this.losasAnchos[this.losasAnchos.length-1])
				this.pisoAncho3(altura);
			else
				this.seleccionarPiso(this.losasAnchos[this.losasAnchos.length-2],altura);
			break;

		case 3:
			var mod = new THREE.Mesh(this.getGeometry("torreVander2/losa18_40.DAE"), this.materiales2["cemento"]);
			mod.position.y = y;
			mod.updateMatrix();
			mod.receiveShadow=true;
			mod.castShadow=true;
			mod.matrixAutoUpdate = false;
			this._container.add(mod);
			this._objetos3D.push(mod);
 
			var body={
				id: "losa" + h,
				shape:"losaShape3",
				position: [0, y, 0],
				rotation: [0,0,0],
				trackYValue: 1
			};
			this._jsonTower2.push(body);
			this.losasAnchos.push(index);
			if(this.losasAnchos[this.losasAnchos.length-2] > this.losasAnchos[this.losasAnchos.length-1])
				this.pisoAncho4(altura);
			else
				this.seleccionarPiso(this.losasAnchos[this.losasAnchos.length-2],altura);
			break;
	}

}


/******************Piso de ancho de ventana 1
************************************************/
TorreVander.prototype.pisoAncho1=function(altura)
{
	var h =Math.round((altura-0.3)*100000)/100000;
	var y = Math.round((1.35+altura)*100000)/100000;

	var colNum=1;
	
	var meshColumna1 = new THREE.Mesh(this.getGeometry("torreVander2/columna.DAE"),this.materiales2["cemento"]);
	var x,z;
	x = -1.3;		
	z = -1.3;
	meshColumna1.position.x = x;
	meshColumna1.position.y = y;
	meshColumna1.position.z = z;
	meshColumna1.updateMatrix();
	meshColumna1.matrixAutoUpdate = false;
	this._container.add(meshColumna1);
	this._objetos3D.push(meshColumna1);
	var body={
		id: "columna" + h + '-' + colNum,
		shape:"columna",
		position: [x, y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15, z],
		breakAt: this.breakAtColLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15, z],
		breakAt: this.breakAtColLosa
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	colNum++;

	var meshColumna2 = new THREE.Mesh(this.getGeometry("torreVander2/columna.DAE"),this.materiales2["cemento"]);
	var x,z;
	x = -1.3;
	z = 1.3;
	meshColumna2.position.x = x;
	meshColumna2.position.y = y;
	meshColumna2.position.z = z;
	meshColumna2.updateMatrix();
	meshColumna2.matrixAutoUpdate = false;
	this._container.add(meshColumna2);
	this._objetos3D.push(meshColumna2);
	var body={
		id: "columna" + h + '-' + colNum,
		shape:"columna",
		position: [x, y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15, z],
		breakAt: this.breakAtColLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15, z],
		breakAt: this.breakAtColLosa
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	colNum++;

	var meshColumna3 = new THREE.Mesh(this.getGeometry("torreVander2/columna.DAE"),this.materiales2["cemento"]);
	var x,z;
	x = 1.3;
	z = -1.3;
	meshColumna3.receiveShadow=true;
	meshColumna3.castShadow=true;
	meshColumna3.position.x = x;
	meshColumna3.position.y = y;
	meshColumna3.position.z = z;
	meshColumna3.updateMatrix();
	meshColumna3.matrixAutoUpdate = false;
	this._container.add(meshColumna3);
	this._objetos3D.push(meshColumna3);
	var body={
		id: "columna" + h + '-' + colNum,
		shape:"columna",
		position: [x, y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15, z],
		breakAt: this.breakAtColLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15, z],
		breakAt: this.breakAtColLosa
	});	
	body.constraints=constraints;
	this._jsonTower2.push(body);
	colNum++;
	
	var meshColumna4 = new THREE.Mesh(this.getGeometry("torreVander2/columna.DAE"),this.materiales2["cemento"]);
	var x,z;
	x = 1.3;
	z = 1.3;
	meshColumna4.receiveShadow=true;
	meshColumna4.castShadow=true;
	meshColumna4.position.x = x;
	meshColumna4.position.y = y;
	meshColumna4.position.z = z;
	meshColumna4.updateMatrix();
	meshColumna4.matrixAutoUpdate = false;
	this._container.add(meshColumna4);
	this._objetos3D.push(meshColumna4);
	var body={
		id: "columna" + h + '-' + colNum,
		shape:"columna",
		position: [x , y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15, z],
		breakAt: this.breakAtColLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15, z],
		breakAt: this.breakAtColLosa
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);

	var ventanaNum=1;

	var meshVentana1 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	ry = 0;
	x = 0;
	z = 2.325;
	meshVentana1.receiveShadow=true;
	meshVentana1.castShadow=true;
	meshVentana1.rotation.y = ry;
	meshVentana1.position.x = x;
	meshVentana1.position.y = y;
	meshVentana1.position.z = z;
	meshVentana1.updateMatrix();
	meshVentana1.matrixAutoUpdate = false;
	this._container.add(meshVentana1);
	this._objetos3D.push(meshVentana1);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana2 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	ry = 0;
	x = 0;
	z = -2.325;
	meshVentana2.receiveShadow=true;
	meshVentana2.castShadow=true;
	meshVentana2.rotation.y = ry;
	meshVentana2.position.x = x;
	meshVentana2.position.y = y;
	meshVentana2.position.z = z;
	meshVentana2.updateMatrix();
	meshVentana2.matrixAutoUpdate = false;
	this._container.add(meshVentana2);
	this._objetos3D.push(meshVentana2);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
			pointOnMe: [0, 1.35, 0],
			attachTo: "losa" + (h + 3),
			pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
			breakAt: this.breakAtVetanaLosaArriba
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana3 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = -2.325;
	z = 0;
	ry = Math.PI/2;
	meshVentana3.receiveShadow=true;
	meshVentana3.castShadow=true;
	meshVentana3.rotation.y = ry;
	meshVentana3.position.x = x;
	meshVentana3.position.y = y;
	meshVentana3.position.z = z;
	meshVentana3.updateMatrix();
	meshVentana3.matrixAutoUpdate = false;
	this._container.add(meshVentana3);
	this._objetos3D.push(meshVentana3);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
			pointOnMe: [0, 1.35, 0],
			attachTo: "losa" + (h + 3),
			pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
			breakAt: this.breakAtVetanaLosaArriba
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana4 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = 2.325;
	z = 0;
	ry = Math.PI/2;
	meshVentana4.rotation.y = ry;
	meshVentana4.position.x = x;
	meshVentana4.position.y = y;
	meshVentana4.position.z = z;
	meshVentana4.updateMatrix();
	meshVentana4.matrixAutoUpdate = false;
	this._container.add(meshVentana4);
	this._objetos3D.push(meshVentana4);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
			pointOnMe: [0, 1.35, 0],
			attachTo: "losa" + (h + 3),
			pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
			breakAt: this.breakAtVetanaLosaArriba
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
}


/******************Piso de ancho de ventana 2
************************************************/
TorreVander.prototype.pisoAncho2=function(altura)
{
	var h =Math.round((altura-0.3)*100000)/100000;
	var y = Math.round((1.35+altura)*100000)/100000;

	var meshAscensor = new THREE.Mesh(this.getGeometry("torreVander2/ascensores.DAE"),this.materiales2["cemento"]);
	meshAscensor.position.y = y;
	meshAscensor.updateMatrix();
	meshAscensor.matrixAutoUpdate = false;
	this._container.add(meshAscensor);
	this._objetos3D.push(meshAscensor);
	var body={
		id: "ascensores" + h,
		shape:"ascensores",
		position: [0, y, 0],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [0, 0.15, 0],
		breakAt: this.breakAtAscLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [0, -0.15, 0],
		breakAt: this.breakAtAscLosa
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	
	var colNum=1;

	var meshColumna1 = new THREE.Mesh(this.getGeometry("torreVander2/columna.DAE"),this.materiales2["cemento"]);
	var x,z;
	x = -3.6;
	z = -3.6;
	meshColumna1.position.x = x;
	meshColumna1.position.y = y;
	meshColumna1.position.z = z;
	meshColumna1.updateMatrix();
	meshColumna1.matrixAutoUpdate = false;
	this._container.add(meshColumna1);
	this._objetos3D.push(meshColumna1);
	var body={
		id: "columna" + h + '-' + colNum,
		shape:"columna",
		position: [x, y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15, z],
		breakAt: this.breakAtColLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15, z],
		breakAt: this.breakAtColLosa
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	colNum++;

	var meshColumna2 = new THREE.Mesh(this.getGeometry("torreVander2/columna.DAE"),this.materiales2["cemento"]);
	var x,z;
	x = -3.6;
	z = 3.6;
	meshColumna2.position.x = x;
	meshColumna2.position.y = y;
	meshColumna2.position.z = z;
	meshColumna2.updateMatrix();
	meshColumna2.matrixAutoUpdate = false;
	this._container.add(meshColumna2);
	this._objetos3D.push(meshColumna2);
	var body={
		id: "columna" + h + '-' + colNum,
		shape:"columna",
		position: [x, y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15, z],
		breakAt: this.breakAtColLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15, z],
		breakAt: this.breakAtColLosa
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	colNum++;

	var meshColumna3 = new THREE.Mesh(this.getGeometry("torreVander2/columna.DAE"),this.materiales2["cemento"]);
	var x,z;
	x = 3.6;
	z = -3.6;
	meshColumna3.position.x = x;
	meshColumna3.position.y = y;
	meshColumna3.position.z = z;
	meshColumna3.updateMatrix();
	meshColumna3.matrixAutoUpdate = false;
	this._container.add(meshColumna3);
	this._objetos3D.push(meshColumna3);
	var body={
		id: "columna" + h + '-' + colNum,
		shape:"columna",
		position: [x, y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15, z],
		breakAt: this.breakAtColLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15, z],
		breakAt: this.breakAtColLosa
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	colNum++;

	var meshColumna4 = new THREE.Mesh(this.getGeometry("torreVander2/columna.DAE"),this.materiales2["cemento"]);
	var x,z;
	x = 3.6;
	z = 3.6;
	meshColumna4.position.x = x;
	meshColumna4.position.y = y;
	meshColumna4.position.z = z;
	meshColumna4.updateMatrix();
	meshColumna4.matrixAutoUpdate = false;
	this._container.add(meshColumna4);	
	this._objetos3D.push(meshColumna4);
	var body={
		id: "columna" + h + '-' + colNum,
		shape:"columna",
		position: [x, y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15, z],
		breakAt: this.breakAtColLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15, z],
		breakAt: this.breakAtColLosa
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);

	var ventanaNum=1;

	var meshVentana1 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	ry=0;
	x = 2.275;
	z = 4.6;
	meshVentana1.rotation.y = ry;
	meshVentana1.position.x = x;
	meshVentana1.position.y = y;
	meshVentana1.position.z = z;
	meshVentana1.updateMatrix();
	meshVentana1.matrixAutoUpdate = false;
	this._container.add(meshVentana1);
	this._objetos3D.push(meshVentana1);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana2 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	ry = 0;
	x = -2.275;
	z = 4.6;
	meshVentana2.rotation.y = ry;
	meshVentana2.position.x = x;
	meshVentana2.position.y = y;
	meshVentana2.position.z = z;
	meshVentana2.updateMatrix();
	meshVentana2.matrixAutoUpdate = false;
	this._container.add(meshVentana2);
	this._objetos3D.push(meshVentana2);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [-2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;


	var meshVentana3 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	ry = 0;
	x = 2.275;
	z = -4.6;
	meshVentana3.rotation.y = ry;
	meshVentana3.position.x = x;
	meshVentana3.position.y = y;
	meshVentana3.position.z = z;
	meshVentana3.updateMatrix();
	meshVentana3.matrixAutoUpdate = false;
	this._container.add(meshVentana3);
	this._objetos3D.push(meshVentana3);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;


	var meshVentana4 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	ry = 0;
	x = -2.275;
	z = -4.6;
	meshVentana4.rotation.y = ry;
	meshVentana4.position.x = x;
	meshVentana4.position.y = y;
	meshVentana4.position.z = z;
	meshVentana4.updateMatrix();
	meshVentana4.matrixAutoUpdate = false;
	this._container.add(meshVentana4);
	this._objetos3D.push(meshVentana4);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [-2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana5 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = -4.6;
	z = 2.275;
	ry = Math.PI/2;
	meshVentana5.rotation.y = ry;
	meshVentana5.position.x = x;
	meshVentana5.position.y = y;
	meshVentana5.position.z = z;
	meshVentana5.updateMatrix();
	meshVentana5.matrixAutoUpdate = false;
	this._container.add(meshVentana5);
	this._objetos3D.push(meshVentana5);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana6 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = -4.6;
	z = -2.275;
	ry = Math.PI/2;
	meshVentana6.rotation.y = ry;
	meshVentana6.position.x = x;
	meshVentana6.position.y = y;
	meshVentana6.position.z = z;
	meshVentana6.updateMatrix();
	meshVentana6.matrixAutoUpdate = false;
	this._container.add(meshVentana6);
	this._objetos3D.push(meshVentana6);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana7 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = 4.6;
	z = 2.275;
	ry = Math.PI/2;
	meshVentana7.rotation.y = ry;
	meshVentana7.position.x = x;
	meshVentana7.position.y = y;
	meshVentana7.position.z = z;
	meshVentana7.updateMatrix();
	meshVentana7.matrixAutoUpdate = false;
	this._container.add(meshVentana7);
	this._objetos3D.push(meshVentana7);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana8 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = 4.6;
	z = -2.275;
	ry = Math.PI/2;
	meshVentana8.rotation.y = ry;
	meshVentana8.position.x = x;
	meshVentana8.position.y = y;
	meshVentana8.position.z = z;
	meshVentana8.updateMatrix();
	meshVentana8.matrixAutoUpdate = false;
	this._container.add(meshVentana8);
	this._objetos3D.push(meshVentana8);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);

}

/******************Piso de ancho de ventana 3
************************************************/
TorreVander.prototype.pisoAncho3=function(altura)
{
	var h =Math.round((altura-0.3)*100000)/100000;
	var y = Math.round((1.35+altura)*100000)/100000;

	var meshAscensor = new THREE.Mesh(this.getGeometry("torreVander2/ascensores.DAE"),this.materiales2["cemento"]);
	meshAscensor.position.y = y;
	meshAscensor.updateMatrix();
	meshAscensor.matrixAutoUpdate = false;
	this._container.add(meshAscensor);
	this._objetos3D.push(meshAscensor);	
	var body={
		id: "ascensores" + h,
		shape:"ascensores",
		position: [0, y, 0],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [0, 0.15, 0],
		breakAt: this.breakAtAscLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [0, -0.15, 0],
		breakAt: this.breakAtAscLosa
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);

	var colNum = 1;

	var meshColumna1 = new THREE.Mesh(this.getGeometry("torreVander2/columna.DAE"),this.materiales2["cemento"]);
	var x,z;
	x = -5.85;
	z = -5.85;		
	meshColumna1.position.x = x;
	meshColumna1.position.y = y;
	meshColumna1.position.z = z;
	meshColumna1.updateMatrix();
	meshColumna1.matrixAutoUpdate = false;
	this._container.add(meshColumna1);
	this._objetos3D.push(meshColumna1);
	var body={
		id: "columna" + h + '-' + colNum,
		shape:"columna",
		position: [x, y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15, z],
		breakAt: this.breakAtColLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15, z],
		breakAt: this.breakAtColLosa
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	colNum++;

	var meshColumna2 = new THREE.Mesh(this.getGeometry("torreVander2/columna.DAE"),this.materiales2["cemento"]);
	var x,z;
	x = -5.85;
	z = 5.85;
	meshColumna2.position.x = x;
	meshColumna2.position.y = y;
	meshColumna2.position.z = z;
	meshColumna2.updateMatrix();
	meshColumna2.matrixAutoUpdate = false;
	this._container.add(meshColumna2);
	this._objetos3D.push(meshColumna2);
	var body={
		id: "columna" + h + '-' + colNum,
		shape:"columna",
		position: [x, y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15, z],
		breakAt: this.breakAtColLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15, z],
		breakAt: this.breakAtColLosa
	});	
	body.constraints=constraints;
	this._jsonTower2.push(body);
	colNum++;

	var meshColumna3 = new THREE.Mesh(this.getGeometry("torreVander2/columna.DAE"),this.materiales2["cemento"]);
	var x,z;
	x = 5.85;
	z = 5.85;
	meshColumna3.position.x = x;
	meshColumna3.position.y = y;
	meshColumna3.position.z = z;
	meshColumna3.updateMatrix();
	meshColumna3.matrixAutoUpdate = false;
	this._container.add(meshColumna3);
	this._objetos3D.push(meshColumna3);
	var body={
		id: "columna" + h + '-' + colNum,
		shape:"columna",
		position: [x, y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15, z],
		breakAt: this.breakAtColLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15, z],
		breakAt: this.breakAtColLosa
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	colNum++;

	var meshColumna4 = new THREE.Mesh(this.getGeometry("torreVander2/columna.DAE"),this.materiales2["cemento"]);
	var x,z;
	x = 5.85;
	z = -5.85;
	meshColumna4.position.x = x;
	meshColumna4.position.y = y;
	meshColumna4.position.z = z;
	meshColumna4.updateMatrix();
	meshColumna4.matrixAutoUpdate = false;
	this._container.add(meshColumna4);
	this._objetos3D.push(meshColumna4);
	var body={
		id: "columna" + h + '-' + colNum,
		shape:"columna",
		position: [x, y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15, z],
		breakAt: this.breakAtColLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15, z],
		breakAt: this.breakAtColLosa
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);

	var ventanaNum=1;

	var meshVentana1 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = -4.55;
	z = 6.875;
	ry = 0;
	meshVentana1.rotation.y = ry;
	meshVentana1.position.x = x;
	meshVentana1.position.y = y;
	meshVentana1.position.z = z;
	meshVentana1.updateMatrix();
	meshVentana1.matrixAutoUpdate = false;
	this._container.add(meshVentana1);
	this._objetos3D.push(meshVentana1);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana2 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = 0;
	z = 6.875;
	ry = 0;
	meshVentana2.rotation.y = ry;
	meshVentana2.position.x = x;
	meshVentana2.position.y = y;
	meshVentana2.position.z = z;
	meshVentana2.updateMatrix();
	meshVentana2.matrixAutoUpdate = false;
	this._container.add(meshVentana2);
	this._objetos3D.push(meshVentana2);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana3 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = 4.55;
	z = 6.875;
	ry = 0;
	meshVentana3.rotation.y = ry;
	meshVentana3.position.x = x;
	meshVentana3.position.y = y;
	meshVentana3.position.z = z;
	meshVentana3.updateMatrix();
	meshVentana3.matrixAutoUpdate = false;
	this._container.add(meshVentana3);
	this._objetos3D.push(meshVentana3);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana4 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = -4.55;
	z = -6.875;
	ry = 0;
	meshVentana4.rotation.y = ry;
	meshVentana4.position.x = x;
	meshVentana4.position.y = y;
	meshVentana4.position.z = z;
	meshVentana4.updateMatrix();
	meshVentana4.matrixAutoUpdate = false;
	this._container.add(meshVentana4);
	this._objetos3D.push(meshVentana4);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana5 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = 0;
	z = -6.875;
	ry = 0;
	meshVentana5.rotation.y = ry;
	meshVentana5.position.x = x;
	meshVentana5.position.y = y;
	meshVentana5.position.z = z;
	meshVentana5.updateMatrix();
	meshVentana5.matrixAutoUpdate = false;
	this._container.add(meshVentana5);
	this._objetos3D.push(meshVentana5);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;


	var meshVentana6 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = 4.55;
	z = -6.875;
	ry = 0;
	meshVentana6.rotation.y = ry;
	meshVentana6.position.x = x;
	meshVentana6.position.y = y;
	meshVentana6.position.z = z;
	meshVentana6.updateMatrix();
	meshVentana6.matrixAutoUpdate = false;
	this._container.add(meshVentana6);
	this._objetos3D.push(meshVentana6);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana7 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = -6.875;
	z = -4.55;
	ry = Math.PI/2;
	meshVentana7.rotation.y = ry;
	meshVentana7.position.x = x;
	meshVentana7.position.y = y;
	meshVentana7.position.z = z;
	meshVentana7.updateMatrix();
	meshVentana7.matrixAutoUpdate = false;
	this._container.add(meshVentana7);
	this._objetos3D.push(meshVentana7);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana8 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = -6.875;
	z = 0;
	ry = Math.PI/2;
	meshVentana8.rotation.y = ry;
	meshVentana8.position.x = x;
	meshVentana8.position.y = y;
	meshVentana8.position.z = z;
	meshVentana8.updateMatrix();
	meshVentana8.matrixAutoUpdate = false;
	this._container.add(meshVentana8);
	this._objetos3D.push(meshVentana8);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana9 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = -6.875;
	z = 4.55;
	ry = Math.PI/2;
	meshVentana9.rotation.y = ry;
	meshVentana9.position.x = x;
	meshVentana9.position.y = y;
	meshVentana9.position.z = z;
	meshVentana9.updateMatrix();
	meshVentana9.matrixAutoUpdate = false;
	this._container.add(meshVentana9);
	this._objetos3D.push(meshVentana9);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana10 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = 6.875;
	z = -4.55;
	ry = Math.PI/2;
	meshVentana10.rotation.y = ry;
	meshVentana10.position.x = x;
	meshVentana10.position.y = y;
	meshVentana10.position.z = z;
	meshVentana10.updateMatrix();
	meshVentana10.matrixAutoUpdate = false;
	this._container.add(meshVentana10);
	this._objetos3D.push(meshVentana10);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana11 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x =  6.875;
	z = 0;
	ry = Math.PI/2;	
	meshVentana11.rotation.y = ry;
	meshVentana11.position.x = x;
	meshVentana11.position.y = y;
	meshVentana11.position.z = z;
	meshVentana11.updateMatrix();
	meshVentana11.matrixAutoUpdate = false;
	this._container.add(meshVentana11);
	this._objetos3D.push(meshVentana11);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});		
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana12 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = 6.875;
	z = 4.55;
	ry = Math.PI/2;
	meshVentana12.rotation.y = ry;
	meshVentana12.position.x = x;
	meshVentana12.position.y = y;
	meshVentana12.position.z = z;
	meshVentana12.updateMatrix();
	meshVentana12.matrixAutoUpdate = false;
	this._container.add(meshVentana12);
	this._objetos3D.push(meshVentana12);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
}



/******************Piso de ancho de ventana 4
************************************************/

TorreVander.prototype.pisoAncho4=function(altura)
{
	var h =Math.round((altura-0.3)*100000)/100000;
	var y = Math.round((1.35+altura)*100000)/100000;

	var meshAscensor = new THREE.Mesh(this.getGeometry("torreVander2/ascensores.DAE"),this.materiales2["cemento"]);
	meshAscensor.position.y = y;
	meshAscensor.updateMatrix();
	meshAscensor.matrixAutoUpdate = false;
	this._container.add(meshAscensor);
	this._objetos3D.push(meshAscensor);
	var body={
		id: "ascensores" + h,
		shape:"ascensores",
		position: [0, y, 0],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [0, 0.15, 0],
		breakAt: this.breakAtAscLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [0, -0.15, 0],
		breakAt: this.breakAtAscLosa
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);

	var colNum=1;		

	var meshColumna1 = new THREE.Mesh(this.getGeometry("torreVander2/columna.DAE"),this.materiales2["cemento"]);
	var x,z;
	x = -8.15;
	z = -8.15; 
	meshColumna1.position.x = x;
	meshColumna1.position.y = y;
	meshColumna1.position.z = z;
	meshColumna1.updateMatrix();
	meshColumna1.matrixAutoUpdate = false;
	this._container.add(meshColumna1);
	this._objetos3D.push(meshColumna1);
	var body={
		id: "columna" + h + '-' + colNum,
		shape:"columna",
		position: [x, y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15, z],
		breakAt: this.breakAtColLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15, z],
		breakAt: this.breakAtColLosa
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	colNum++;

	var meshColumna2 = new THREE.Mesh(this.getGeometry("torreVander2/columna.DAE"),this.materiales2["cemento"]);
	var x,z;
	x = -8.15;
	z = 8.15; 
	meshColumna2.position.x = x;
	meshColumna2.position.y = y;
	meshColumna2.position.z = z;
	meshColumna2.updateMatrix();
	meshColumna2.matrixAutoUpdate = false;
	this._container.add(meshColumna2);
	this._objetos3D.push(meshColumna2);
	var body={
		id: "columna" + h + '-' + colNum,
		shape:"columna",
		position: [x, y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15, z],
		breakAt: this.breakAtColLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15, z],
		breakAt: this.breakAtColLosa
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	colNum++;


	var meshColumna3 = new THREE.Mesh(this.getGeometry("torreVander2/columna.DAE"),this.materiales2["cemento"]);
	var x,z;
	x = 8.15;
	z = 8.15; 
	meshColumna3.position.x = x;
	meshColumna3.position.y = y;
	meshColumna3.position.z = z;
	meshColumna3.updateMatrix();
	meshColumna3.matrixAutoUpdate = false;
	this._container.add(meshColumna3);
	this._objetos3D.push(meshColumna3);
	var body={
		id: "columna" + h + '-' + colNum,
		shape:"columna",
		position: [x, y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15, z],
		breakAt: this.breakAtColLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15, z],
		breakAt: this.breakAtColLosa
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	colNum++;

	var meshColumna4 = new THREE.Mesh(this.getGeometry("torreVander2/columna.DAE"),this.materiales2["cemento"]);
	var x,z;
	x = 8.15;
	z = -8.15; 
	meshColumna4.position.x = x;
	meshColumna4.position.y = y;
	meshColumna4.position.z = z;
	meshColumna4.updateMatrix();
	meshColumna4.matrixAutoUpdate = false;
	this._container.add(meshColumna4);
	this._objetos3D.push(meshColumna4);
	var body={
		id: "columna" + h + '-' + colNum,
		shape:"columna",
		position: [x, y, z],
		rotation: [0,0,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15, z],
		breakAt: this.breakAtColLosa
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15, z],
		breakAt: this.breakAtColLosa
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);


	var ventanaNum = 1;

	var meshVentana1 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = -6.825;
	z = 9.15;
	ry = 0;
	meshVentana1.rotation.y = ry;
	meshVentana1.position.x = x;
	meshVentana1.position.y = y;
	meshVentana1.position.z = z;
	meshVentana1.updateMatrix();
	meshVentana1.matrixAutoUpdate = false;
	this._container.add(meshVentana1);
	this._objetos3D.push(meshVentana1);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana2 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = -2.275;
	z = 9.15;
	ry = 0;
	meshVentana2.rotation.y = ry;
	meshVentana2.position.x = x;
	meshVentana2.position.y = y;
	meshVentana2.position.z = z;
	meshVentana2.updateMatrix();
	meshVentana2.matrixAutoUpdate = false;
	this._container.add(meshVentana2);
	this._objetos3D.push(meshVentana2);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana3 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = 2.275;
	z = 9.15;
	ry = 0;
	meshVentana3.rotation.y = ry;
	meshVentana3.position.x = x;
	meshVentana3.position.y = y;
	meshVentana3.position.z = z;
	meshVentana3.updateMatrix();
	meshVentana3.matrixAutoUpdate = false;
	this._container.add(meshVentana3);
	this._objetos3D.push(meshVentana3);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana4 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = 6.825;
	z = 9.15;
	ry = 0;
	meshVentana4.rotation.y = ry;
	meshVentana4.position.x = x;
	meshVentana4.position.y = y;
	meshVentana4.position.z = z;
	meshVentana4.updateMatrix();
	meshVentana4.matrixAutoUpdate = false;
	this._container.add(meshVentana4);
	this._objetos3D.push(meshVentana4);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana5 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = -6.825;
	z = -9.15;
	ry = 0;
	meshVentana5.rotation.y = ry;
	meshVentana5.position.x = x;
	meshVentana5.position.y = y;
	meshVentana5.position.z = z;
	meshVentana5.updateMatrix();
	meshVentana5.matrixAutoUpdate = false;
	this._container.add(meshVentana5);
	this._objetos3D.push(meshVentana5);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana6 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = -2.275;
	z = -9.15;
	ry = 0;
	meshVentana6.rotation.y = ry;
	meshVentana6.position.x = x;
	meshVentana6.position.y = y;
	meshVentana6.position.z = z;
	meshVentana6.updateMatrix();
	meshVentana6.matrixAutoUpdate = false;
	this._container.add(meshVentana6);
	this._objetos3D.push(meshVentana6);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana7 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = 2.275;
	z = -9.15;
	ry = 0;
	meshVentana7.rotation.y = ry;
	meshVentana7.position.x = x;
	meshVentana7.position.y = y;
	meshVentana7.position.z = z;
	meshVentana7.updateMatrix();
	meshVentana7.matrixAutoUpdate = false;
	this._container.add(meshVentana7);
	this._objetos3D.push(meshVentana7);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana8 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = 6.825;
	z = -9.15;
	ry = 0;
	meshVentana8.rotation.y = ry;
	meshVentana8.position.x = x;
	meshVentana8.position.y = y;
	meshVentana8.position.z = z;
	meshVentana8.updateMatrix();
	meshVentana8.matrixAutoUpdate = false;
	this._container.add(meshVentana8);
	this._objetos3D.push(meshVentana8);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana9 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = -9.15;
	z = -6.825;
	ry = Math.PI/2;
	meshVentana9.rotation.y = ry;
	meshVentana9.position.x = x;
	meshVentana9.position.y = y;
	meshVentana9.position.z = z;
	meshVentana9.updateMatrix();
	meshVentana9.matrixAutoUpdate = false;
	this._container.add(meshVentana9);
	this._objetos3D.push(meshVentana9);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana10 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = -9.15;
	z = -2.275;
	ry = Math.PI/2;
	meshVentana10.rotation.y = ry;
	meshVentana10.position.x = x;
	meshVentana10.position.y = y;
	meshVentana10.position.z = z;
	meshVentana10.updateMatrix();
	meshVentana10.matrixAutoUpdate = false;
	this._container.add(meshVentana10);
	this._objetos3D.push(meshVentana10);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana11 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = -9.15;
	z = 2.275;
	ry = Math.PI/2;
	meshVentana11.rotation.y = ry;
	meshVentana11.position.x = x;
	meshVentana11.position.y = y;
	meshVentana11.position.z = z;
	meshVentana11.updateMatrix();
	meshVentana11.matrixAutoUpdate = false;
	this._container.add(meshVentana11);
	this._objetos3D.push(meshVentana11);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana12 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = -9.15;
	z = 6.825;
	ry = Math.PI/2;
	meshVentana12.rotation.y = ry;
	meshVentana12.position.x = x;
	meshVentana12.position.y = y;
	meshVentana12.position.z = z;
	meshVentana12.updateMatrix();
	meshVentana12.matrixAutoUpdate = false;
	this._container.add(meshVentana12);
	this._objetos3D.push(meshVentana12);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana13 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = 9.15;
	z = -6.825;
	ry = Math.PI/2;
	meshVentana13.rotation.y = ry;
	meshVentana13.position.x = x;
	meshVentana13.position.y = y;
	meshVentana13.position.z = z;
	meshVentana13.updateMatrix();
	meshVentana13.matrixAutoUpdate = false;
	this._container.add(meshVentana13);
	this._objetos3D.push(meshVentana13);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana14 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = 9.15;
	z = -2.275;
	ry = Math.PI/2;
	meshVentana14.rotation.y = ry;
	meshVentana14.position.x = x;
	meshVentana14.position.y = y;
	meshVentana14.position.z = z;
	meshVentana14.updateMatrix();
	meshVentana14.matrixAutoUpdate = false;
	this._container.add(meshVentana14);
	this._objetos3D.push(meshVentana14);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana15 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = 9.15;
	z = 2.275;
	ry = Math.PI/2;
	meshVentana15.rotation.y = ry;
	meshVentana15.position.x = x;
	meshVentana15.position.y = y;
	meshVentana15.position.z = z;
	meshVentana15.updateMatrix();
	meshVentana15.matrixAutoUpdate = false;
	this._container.add(meshVentana15);
	this._objetos3D.push(meshVentana15);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
	ventanaNum++;

	var meshVentana16 = new THREE.Mesh(this.getGeometry("torreVander2/ventanalx3.DAE"),this.multiMateriales["ventanal"]);
	var x,z,ry;
	x = 9.15;
	z = 6.825;
	ry = Math.PI/2;
	meshVentana16.rotation.y = ry;
	meshVentana16.position.x = x;
	meshVentana16.position.y = y;
	meshVentana16.position.z = z;
	meshVentana16.updateMatrix();
	meshVentana16.matrixAutoUpdate = false;
	this._container.add(meshVentana16);
	this._objetos3D.push(meshVentana16);
	var body={
		id: "ventana" + h + '-' + ventanaNum,
		shape:"ventanalx3",
		position: [x, y, z],
		rotation: [0,ry,0]
	};
	var constraints = [];
	constraints.push({
		pointOnMe: [0, -1.35, 0],
		attachTo: "losa" + h,
		pointOnAttached: [x, 0.15+this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaAbajo
	});
	constraints.push({
		pointOnMe: [0, 1.35, 0],
		attachTo: "losa" + (h + 3),
		pointOnAttached: [x, -0.15-this.deltaLosaVentana, z],
		breakAt: this.breakAtVetanaLosaArriba
	});
	constraints.push({
		pointOnMe: [-2.275, 0, 0],
		attachTo: "ventana" + h + '-' + (ventanaNum-1),
		pointOnAttached: [2.275, 0, 0],
		breakAt: this.breakAtVetanaVentana
	});
	body.constraints=constraints;
	this._jsonTower2.push(body);
}

