"use strict";

function TorreCilindro(){
    Torre.call(this);

    this.addGeometry("torreCilindro/columnaA.DAE");
    this.addGeometry("torreCilindro/columnaB.DAE");
    this.addGeometry("torreCilindro/columnaC.DAE");
    this.addGeometry("torreCilindro/columnaD.DAE");

    this.addGeometry("torreCilindro/losaA.DAE");
    this.addGeometry("torreCilindro/losaB.DAE");
    this.addGeometry("torreCilindro/losaC.DAE");
    this.addGeometry("torreCilindro/losaD.DAE");

    this.addGeometry("torreCilindro/ventanalA.DAE");
    this.addGeometry("torreCilindro/ventanalB.DAE");
    this.addGeometry("torreCilindro/ventanalC.DAE");
    this.addGeometry("torreCilindro/ventanalD.DAE");

	this.addGeometry("torreCilindro/andamioA.DAE");
	this.addGeometry("torreCilindro/andamioB.DAE");
	this.addGeometry("torreCilindro/andamioC.DAE");
	this.addGeometry("torreCilindro/andamioD.DAE");

	// texturas que necesito
	this.addTexture("cementoGris.jpg");
	this.addTexture("sky1.jpg");

	this.losasAnchos=[];

	this.MAXIMO_PISO=25;
	this.breakAtColLosa = 100;
	this.breakAtVetanaLosaAbajo = 40;
	this.breakAtVetanaLosaArriba = 40;

	this.deltaVentana = -0.1;
};

inheritPrototype(TorreCilindro, Torre);


TorreCilindro.prototype.init=function(){
// Importante para todos los mapas de reflexion hay que setear esto
	this.textures["sky1.jpg"].mapping=THREE.SphericalReflectionMapping;
	this.textures["cementoGris.jpg"].repeat.set(1.5,1.5);
	this.materiales2={
		"hierroRojo":new THREE.MeshPhongMaterial({
			color: 0xCC4444,
			specular: 0x333333,
			shininess: 1,
			shading: THREE.SmoothShading
		}),
		"cemento":new THREE.MeshPhongMaterial({
			color: 0xDDDDAA,
			specular: 0x333333,
			shininess: 1,
			shading: THREE.SmoothShading,
			map:this.getTexture("cementoGris.jpg")
		}),
		"vidrio":new THREE.MeshPhongMaterial({
			color: 0x998877,
			specular: 0xFFFFFF,
			shininess: 2,
			shading: THREE.SmoothShading,
			envMap:this.getTexture("sky1.jpg"),
			reflectivity: 0.9,
			opacity:0.85,
			transparent:true,
			side:THREE.DoubleSide,
		}),
		"marcos":new THREE.MeshPhongMaterial({
			color: 0x333333,
			specular: 0xFFFFFF,
			shininess: 16,
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
			this.materiales2["marcos"],
			this.materiales2["vidrio"],
		]),
	};
	
	// los shapes que quiera incluir en el JSON
	this._jsonShapes2={
		"losaA": { "type": "cylinder", "scale": [10.0, 0.3, 10.0], "mass": 10.0 },
 		"losaB": { "type": "cylinder", "scale": [15.0, 0.3, 15.0], "mass": 10.0 },
 		"losaC": { "type": "cylinder", "scale": [20.0, 0.3, 20.0], "mass": 10.0 },
 		"losaD": { "type": "cylinder", "scale": [25.0, 0.3, 25.0], "mass": 10.0 },
		"columnaA": { "type": "cylinder", "scale": [1.0, 2.7, 1.0], "mass": 10},
		"columnaB": { "type": "cylinder", "scale": [1.2, 2.7, 1.2], "mass": 10},
		"columnaC": { "type": "cylinder", "scale": [1.4, 2.7, 1.4], "mass": 10},
		"columnaD": { "type": "cylinder", "scale": [1.6, 2.7, 1.6], "mass": 10},
		"ventanalA": { "type": "box", "scale": [0.1, 2.7, 2.4], "mass": 2 },
 		"ventanalB": { "type": "box", "scale": [0.1, 2.7, 3.7], "mass": 2 },
 		"ventanalC": { "type": "box", "scale": [0.1, 2.7, 5.0], "mass": 2 },
		"ventanalD": { "type": "box", "scale": [0.1, 2.7, 6.3], "mass": 2 }
	};

	var array = ["D","C","B","A"];
	for (var i=0;i<4;i++)
	{
		var andamio = new THREE.Mesh(this.getGeometry("torreCilindro/andamio"+array[i]+".DAE"), this.materiales2["hierroRojo"]);
		andamio.matrixAutoUpdate = false;
		andamio.visible=false;
		this._andamios.push(andamio);
		this._containerAndamios.add(andamio);
	}


	// aviso que la inicializacion esta terminada
	this.dispatchEvent({ type:this.INIT_COMPLETE });
}


// Armar el JSON para pasarle al simulador
TorreCilindro.prototype.getJsonSimulacion=function() 
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
		simTimeStep:0.044,
		simFixedTimeStep:0.011,          // 0.035 es el limite de estabilidad
		simMaxSubSteps:4
    };

    return json;
}

TorreCilindro.prototype.getTamanioPiso=function(radio){
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

TorreCilindro.prototype.actualizarAndamio=function(posVec,anguloY,radio,resaltar) 
{
	var idxAndamio=this.getTamanioPiso(radio);
	for (var i=0;i<this._andamios.length;i++) 
		this._andamios[i].visible = false;
	this._andamios[idxAndamio].visible=true;
	if (resaltar)
		this._andamios[idxAndamio].material.emissive=new THREE.Color(1,0,0);
	else
		this._andamios[idxAndamio].material.emissive=new THREE.Color(0,0,0);
	this._containerAndamios.position.y=posVec[1];
};



TorreCilindro.prototype.agregarPiso=function(anguloY,radio)
{
	var index=this.getTamanioPiso(radio)+1;

	if(!this._alturaAndamio)
	{
		var mod = new THREE.Mesh(this.getGeometry("torreCilindro/losaD.DAE"), this.materiales2["cemento"]);
		var y = 0.15;
		var h = Math.round((y-0.15)*100000)/100000;
		mod.position.y = y;
		mod.updateMatrix();
		mod.matrixAutoUpdate = false;
		this._container.add(mod);
		this._objetos3D.push(mod);
		var body={
			id: "losa" + h,
			shape: "losaD",
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


TorreCilindro.prototype.dibujarPiso=function(index,altura)
{
	this.seleccionarPiso=function(index,altura)
	{
		switch(index)
		{
			case 1:
				this.pisoAnchoA(altura);
				break;
			case 2:
				this.pisoAnchoB(altura);
				break;
			case 3:
				this.pisoAnchoC(altura);
				break;
			case 4:
				this.pisoAnchoD(altura);
				break;
		}
	}

	var y = Math.round((2.85+altura)*1000)/1000;
	var h = Math.round((y-0.15)*1000)/1000;	
	switch(index)
	{
		case 1:
			var mod = new THREE.Mesh(this.getGeometry("torreCilindro/losaA.DAE"), this.materiales2["cemento"]);
			mod.position.y = y;
			mod.updateMatrix();
			mod.matrixAutoUpdate = false;
			this._container.add(mod);
			this._objetos3D.push(mod);
			var body={
				id: "losa" + h,
				shape:"losaA",
				position: [0, y, 0],
				rotation: [0,0,0],
				trackYValue: 1
			};
			this._jsonTower2.push(body);
			this.losasAnchos.push(index);
			if(this.losasAnchos[this.losasAnchos.length-2] > this.losasAnchos[this.losasAnchos.length-1])
				this.pisoAnchoA(altura);
			else
				this.seleccionarPiso(this.losasAnchos[this.losasAnchos.length-2],altura);
			break;
		case 2:
			var mod = new THREE.Mesh(this.getGeometry("torreCilindro/losaB.DAE"), this.materiales2["cemento"]);
			mod.position.y = y;
			mod.updateMatrix();
			mod.matrixAutoUpdate = false;
			this._container.add(mod);
			this._objetos3D.push(mod);
			var body={
				id: "losa" + h,
				shape:"losaB",
				position: [0, y, 0],
				rotation: [0,0,0],				
				trackYValue: 1
			};
			this._jsonTower2.push(body);
			this.losasAnchos.push(index);
			if(this.losasAnchos[this.losasAnchos.length-2] > this.losasAnchos[this.losasAnchos.length-1])
					this.pisoAnchoB(altura);
			else
					this.seleccionarPiso(this.losasAnchos[this.losasAnchos.length-2], altura);
			break;
		case 3:
			var mod = new THREE.Mesh(this.getGeometry("torreCilindro/losaC.DAE"), this.materiales2["cemento"]);
			mod.position.y = y;
			mod.updateMatrix();
			mod.matrixAutoUpdate = false;
			this._container.add(mod);
			this._objetos3D.push(mod);
			var body={
				id: "losa" + h,
				shape:"losaC",
				position: [0, y, 0],
				rotation: [0,0,0],
				trackYValue: 1
			};
			this._jsonTower2.push(body);
			this.losasAnchos.push(index);
			if(this.losasAnchos[this.losasAnchos.length-2] > this.losasAnchos[this.losasAnchos.length-1])
				this.pisoAnchoC(altura);
			else
				this.seleccionarPiso(this.losasAnchos[this.losasAnchos.length-2],altura);
			break;
		case 4:
			var mod = new THREE.Mesh(this.getGeometry("torreCilindro/losaD.DAE"), this.materiales2["cemento"]);
			mod.position.y = y;
			mod.updateMatrix();
			mod.matrixAutoUpdate = false;
			this._container.add(mod);
			this._objetos3D.push(mod);
			var body={
				id: "losa" + h,
				shape:"losaD",
				position: [0, y, 0],
				rotation: [0,0,0],
				trackYValue: 1
			};
			this._jsonTower2.push(body);
			this.losasAnchos.push(index);
			if(this.losasAnchos[this.losasAnchos.length-2] > this.losasAnchos[this.losasAnchos.length-1])
				this.pisoAnchoD(altura);
			else
				this.seleccionarPiso(this.losasAnchos[this.losasAnchos.length-2],altura);
			break;
	}
}

/******************Piso de ancho de ventana 1
************************************************/
TorreCilindro.prototype.pisoAnchoA=function(altura)
{
	var h =Math.round((altura-0.3)*100000)/100000;
	var y = Math.round((1.35+altura)*100000)/100000;
	var losaArriba = "losa"+(h+3);
	var losaAbajo = "losa"+h;
	//AGREGO COLUMNAS
	var COLS_POR_PISO=4;
	var angulo = Math.PI/2;
	var distanciaColumna = 4.0;
	for(var i=0;i<COLS_POR_PISO; i++)
	{		
		var posx = Math.round((distanciaColumna*Math.cos(angulo*i))*100000)/100000;
		var posz = Math.round((distanciaColumna*Math.sin(angulo*i))*100000)/100000;
		var posy = y;

		var mod = new THREE.Mesh(this.getGeometry("torreCilindro/columnaA.DAE"), this.materiales2["cemento"]);
		mod.position.x = posx;
		mod.position.y = posy;
		mod.position.z = posz;
		mod.updateMatrix();
		mod.matrixAutoUpdate = false;
		this._container.add(mod);
		this._objetos3D.push(mod);
		var body={
			id: "columna" + h + '-' + (i+1),
			shape: "columnaA",
			position: [posx, posy, posz],
			rotation: [0,0,0]
			};
		var constraints = [];
		constraints.push({
			pointOnMe: [0, 1.35, 0],
			attachTo: "losa"+(h+3),
			pointOnAttached: [posx, -0.15, posz],
			breakAt: this.breakAtColLosa
		});
		constraints.push({
			pointOnMe: [0, -1.35, 0],
			attachTo: "losa"+h,
			pointOnAttached: [posx, 0.15, posz],
			breakAt: this.breakAtColLosa
		});
		body.constraints = constraints;
		this._jsonTower2.push(body);
	}

	//AGREGO VENTANAS
	var VENTANAS_POR_PISO = 12;
	var angulo = Math.PI/6;
	var distanciaVentana = 4.8+this.deltaVentana;
	for(var i=0; i<VENTANAS_POR_PISO; i++)
	{
		var roty = -angulo*i;
		var posx = Math.round((distanciaVentana*Math.cos(angulo*i))*100000)/100000;
		var posz = Math.round((distanciaVentana*Math.sin(angulo*i))*100000)/100000;
		var posy = y;

		var mod = new THREE.Mesh(this.getGeometry("torreCilindro/ventanalA.DAE"), this.multiMateriales["ventanal"]);
		mod.rotation.y = roty;

		mod.position.x = posx;
		mod.position.y = posy;
		mod.position.z = posz;
		mod.updateMatrix();
		mod.matrixAutoUpdate = false;
		this._container.add(mod);
		this._objetos3D.push(mod);
		var body={
			id: "ventanal" + h + '-' + (i+1),
			shape: "ventanalA",
			position: [posx, posy, posz],
			rotation: [0,roty,0]
			};
		var constraints = [];


		constraints.push({
			pointOnMe: [0, 1.35, 0],
			attachTo: "losa"+(h+3),
			pointOnAttached: [posx, -0.15, posz],
			breakAt: this.breakAtVetanaLosaArriba
		});

		var posx = Math.round((distanciaVentana*Math.cos(i*angulo-15*Math.PI/180))*1000000)/1000000;
		var posz = Math.round((distanciaVentana*Math.sin(i*angulo-15*Math.PI/180))*1000000)/1000000;
		constraints.push({
			pointOnMe: [0, 1.35, 1],
			attachTo: "losa"+(h+3),
			pointOnAttached: [posx, -0.15, posz],
			breakAt: this.breakAtVetanaLosaArriba
		});

		var posx = Math.round((distanciaVentana*Math.cos(i*angulo+15*Math.PI/180))*1000000)/1000000;
		var posz = Math.round((distanciaVentana*Math.sin(i*angulo+15*Math.PI/180))*1000000)/1000000;
		constraints.push({
			pointOnMe: [0, -1.35, -1],
			attachTo: "losa"+h,
			pointOnAttached: [posx, 0.15, posz],
			breakAt: this.breakAtVetanaLosaAbajo
		});


		constraints.push({
			pointOnMe: [0, -1.35, 0],
			attachTo: "losa"+h,
			pointOnAttached: [posx, 0.15, posz],
			breakAt: this.breakAtVetanaLosaAbajo
		});

		constraints.push({
			pointOnMe: [0, 1.35, 0],
			attachTo: "losa"+(h+3),
			pointOnAttached: [posx, -0.15, posz],
			breakAt: this.breakAtVetanaLosaArriba
		});


		body.constraints = constraints;
		this._jsonTower2.push(body);
	}

}

/******************Piso de ancho de ventana 2
************************************************/
TorreCilindro.prototype.pisoAnchoB=function(altura)
{
	var h =Math.round((altura-0.3)*100000)/100000;
	var y = Math.round((1.35+altura)*100000)/100000;
	var losaArriba = "losa"+(h+3);
	var losaAbajo = "losa"+h;

	//AGREGO COLUMNAS
	var COLS_POR_PISO=4;
	var angulo = Math.PI/2;
	var distanciaColumna = 6.0;
	for(var i=0; i<COLS_POR_PISO; i++)
	{		
		var posx = Math.round((distanciaColumna*Math.cos(angulo*i))*100000)/100000;
		var posz = Math.round((distanciaColumna*Math.sin(angulo*i))*100000)/100000;
		var posy = y;

		var mod = new THREE.Mesh(this.getGeometry("torreCilindro/columnaB.DAE"), this.materiales2["cemento"]);
		mod.position.x = posx;
		mod.position.y = posy;
		mod.position.z = posz;
		mod.updateMatrix();
		mod.matrixAutoUpdate = false;
		this._container.add(mod);
		this._objetos3D.push(mod);
		var body={
			id: "columna" + h + '-' + (i+1),
			shape: "columnaB",
			position: [posx, posy, posz],
			rotation: [0,0,0]
			};
		var constraints = [];
		constraints.push({
			pointOnMe: [0, 1.35, 0],
			attachTo: "losa"+(h+3),
			pointOnAttached: [posx, -0.15, posz],
			breakAt: this.breakAtColLosa
		});
		constraints.push({
			pointOnMe: [0, -1.35, 0],
			attachTo: "losa"+h,
			pointOnAttached: [posx, 0.15, posz],
			breakAt: this.breakAtColLosa
		});
		body.constraints = constraints;
		this._jsonTower2.push(body);
	}

	//AGREGO VENTANAS
	var VENTANAS_POR_PISO = 12;
	var angulo = Math.PI/6;
	var distanciaVentana = 7.3+this.deltaVentana;
	for(var i=0; i<VENTANAS_POR_PISO; i++)
	{
		var roty = -angulo*i;
		var posx = Math.round((distanciaVentana*Math.cos(angulo*i))*100000)/100000;
		var posz = Math.round((distanciaVentana*Math.sin(angulo*i))*100000)/100000;
		var posy = y;

		var mod = new THREE.Mesh(this.getGeometry("torreCilindro/ventanalB.DAE"), this.multiMateriales["ventanal"]);
		mod.rotation.y = roty;
		mod.position.x = posx;
		mod.position.y = posy;
		mod.position.z = posz;
		mod.updateMatrix();
		mod.matrixAutoUpdate = false;
		this._container.add(mod);
		this._objetos3D.push(mod);
		var body={
			id: "ventanal" + h + '-' + (i+1),
			shape: "ventanalB",
			position: [posx, posy, posz],
			rotation: [0,roty,0]
			};
		var constraints = [];
		constraints.push({
			pointOnMe: [0, 1.35, 0],
			attachTo: "losa"+(h+3),
			pointOnAttached: [posx, -0.15, posz],
			breakAt: this.breakAtVetanaLosaArriba
		});
		constraints.push({
			pointOnMe: [0, -1.35, 0],
			attachTo: "losa"+h,
			pointOnAttached: [posx, 0.15, posz],
			breakAt: this.breakAtVetanaLosaAbajo
		});
		body.constraints = constraints;

		this._jsonTower2.push(body);
	}

}

/******************Piso de ancho de ventana 3
************************************************/
TorreCilindro.prototype.pisoAnchoC=function(altura)
{
	var h =Math.round((altura-0.3)*100000)/100000;
	var y = Math.round((1.35+altura)*100000)/100000;
	var losaArriba = "losa"+(h+3);
	var losaAbajo = "losa"+h;
	//AGREGO COLUMNAS
	var COLS_POR_PISO=4;
	var angulo = Math.PI/2;
	var distanciaColumna = 7;
	for(var i=0; i<COLS_POR_PISO; i++)
	{		
		var posx = Math.round((distanciaColumna*Math.cos(angulo*i))*100000)/100000;
		var posz = Math.round((distanciaColumna*Math.sin(angulo*i))*100000)/100000;
		var posy = y;

		var mod = new THREE.Mesh(this.getGeometry("torreCilindro/columnaA.DAE"), this.materiales2["cemento"]);
		mod.position.x = posx;
		mod.position.y = posy;
		mod.position.z = posz;
		mod.updateMatrix();
		mod.matrixAutoUpdate = false;
		this._container.add(mod);
		this._objetos3D.push(mod);
		var body={
			id: "columna" + h + '-' + (i+1),
			shape: "columnaC",
			position: [posx, posy, posz],
			rotation: [0,0,0]
			};
		var constraints = [];
		constraints.push({
			pointOnMe: [0, 1.35, 0],
			attachTo: "losa"+(h+3),
			pointOnAttached: [posx, -0.15, posz],
			breakAt: this.breakAtColLosa
		});
		constraints.push({
			pointOnMe: [0, -1.35, 0],
			attachTo: "losa"+h,
			pointOnAttached: [posx, 0.15, posz],
			breakAt: this.breakAtColLosa
		});
		body.constraints = constraints;
		this._jsonTower2.push(body);
	}			

	//AGREGO VENTANAS
	var VENTANAS_POR_PISO = 12;
	var angulo = Math.PI/6;
	var distanciaVentana = 9.8+this.deltaVentana;
	for(var i=0; i<VENTANAS_POR_PISO; i++)
	{
		var roty = -angulo*i;
		var posx = Math.round((distanciaVentana*Math.cos(angulo*i))*100000)/100000;
		var posz = Math.round((distanciaVentana*Math.sin(angulo*i))*100000)/100000;
		var posy = y;

		var mod = new THREE.Mesh(this.getGeometry("torreCilindro/ventanalC.DAE"), this.multiMateriales["ventanal"]);
		mod.rotation.y = roty;
		mod.position.x = posx;
		mod.position.y = posy;
		mod.position.z = posz;
		mod.updateMatrix();
		mod.matrixAutoUpdate = false;
		this._container.add(mod);
		this._objetos3D.push(mod);
		var body={
			id: "ventanal" + h + '-' + (i+1),
			shape: "ventanalC",
			position: [posx, posy, posz],
			rotation: [0,roty,0]
			};
		var constraints = [];
		constraints.push({
			pointOnMe: [0, 1.35, 0],
			attachTo: "losa"+(h+3),
			pointOnAttached: [posx, -0.15, posz],
			breakAt: this.breakAtVetanaLosaArriba
		});
		constraints.push({
			pointOnMe: [0, -1.35, 0],
			attachTo: "losa"+h,
			pointOnAttached: [posx, 0.15, posz],
			breakAt: this.breakAtVetanaLosaAbajo
		});
		body.constraints = constraints;
		this._jsonTower2.push(body);
	}

}


/******************Piso de ancho de ventana 4
************************************************/

TorreCilindro.prototype.pisoAnchoD=function(altura)
{
	var h =Math.round((altura-0.3)*100000)/100000;
	var y = Math.round((1.35+altura)*100000)/100000;
	var losaArriba = "losa"+(h+3);
	var losaAbajo = "losa"+h;
	//AGREGO COLUMNAS
	var COLS_POR_PISO=4;
	var angulo = Math.PI/2;
	var distanciaColumna = 11.0;
	for(var i=0; i<COLS_POR_PISO; i++)
	{		
		var posx = Math.round((distanciaColumna*Math.cos(angulo*i))*100000)/100000;
		var posz = Math.round((distanciaColumna*Math.sin(angulo*i))*100000)/100000;
		var posy = y;

		var mod = new THREE.Mesh(this.getGeometry("torreCilindro/columnaD.DAE"), this.materiales2["cemento"]);
		mod.position.x = posx;
		mod.position.y = posy;
		mod.position.z = posz;
		mod.updateMatrix();
		mod.matrixAutoUpdate = false;
		this._container.add(mod);
		this._objetos3D.push(mod);
		var body={
			id: "columna" + h + '-' + (i+1),
			shape: "columnaD",
			position: [posx, posy, posz],
			rotation: [0,0,0]
			};
		var constraints = [];
		constraints.push({
			pointOnMe: [0, 1.35, 0],
			attachTo: "losa"+(h+3),
			pointOnAttached: [posx, -0.15, posz],
			breakAt: this.breakAtColLosa
		});
		constraints.push({
			pointOnMe: [0, -1.35, 0],
			attachTo: "losa"+h,
			pointOnAttached: [posx, 0.15, posz],
			breakAt: this.breakAtColLosa
		});
		body.constraints = constraints;
		this._jsonTower2.push(body);
	}

	//AGREGO VENTANAS
	var VENTANAS_POR_PISO = 12;
	var angulo = Math.PI/6;
	var distanciaVentana = 12.3+this.deltaVentana;
	for(var i=0; i<VENTANAS_POR_PISO; i++)
	{
		var roty = -angulo*i;
		var posx = Math.round((distanciaVentana*Math.cos(angulo*i))*100000)/100000;
		var posz = Math.round((distanciaVentana*Math.sin(angulo*i))*100000)/100000;
		var posy = y;

		var mod = new THREE.Mesh(this.getGeometry("torreCilindro/ventanalD.DAE"), this.multiMateriales["ventanal"]);
		mod.rotation.y = roty;
		mod.position.x = posx;
		mod.position.y = posy;
		mod.position.z = posz;
		mod.updateMatrix();
		mod.matrixAutoUpdate = false;
		this._container.add(mod);
		this._objetos3D.push(mod);
		var body={
			id: "ventanal" + h + '-' + (i+1),
			shape: "ventanalD",
			position: [posx, posy, posz],
			rotation: [0,roty,0]
			};
		var constraints = [];
		constraints.push({
			pointOnMe: [0, 1.35, 0],
			attachTo: "losa"+(h+3),
			pointOnAttached: [posx, -0.15, posz],
			breakAt: this.breakAtVetanaLosaArriba
		});
		constraints.push({
			pointOnMe: [0, 1.35, 0],
			attachTo: "losa"+(h+3),
			pointOnAttached: [posx, -0.15, posz],
			breakAt: this.breakAtVetanaLosaArriba
		});
		constraints.push({
			pointOnMe: [0, -1.35, 0],
			attachTo: "losa"+h,
			pointOnAttached: [posx, 0.15, posz],
			breakAt: this.breakAtVetanaLosaAbajo
		});
		body.constraints = constraints;
		this._jsonTower2.push(body);
	};

};

