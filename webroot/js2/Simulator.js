
function Simulator()
{
	this.SIMULATION_UPDATED=0;  // cuando se actualizar el array de transformaciones

	var aM = new NaClAM('nacl_module');

	var sceneAlreadyLoaded=false;
	var torre=null;

	var lastStepExecTime=0;
	var lastSimulatedFrame=0;

	var frameCount=0;



	this._handPosition=null;
	this._handRotation=null;


	var simulationInfoPanel=$("#debugPanel .simulatorInfo");

	var transformBuffer=[];

	this.pausarSimulacion=true;
	this.maxYValue=0;

	var stepEveryNFrames=2 // hace un step cada X frames, 3 son 20 fps, 2 son 30fps, 1 son 60ps

    this._jsonGlobal={
		gravity:-10,
		groundY:0,
		stopBodiesUntilFrame:60,
		linearDamping:0.1,
		angularDamping:0.1,
		groundFriction:1.0,
		groundRestitution:1.0,
		useFixedConstraints:0,
//		simTimeStep:0.015,
		simTimeStep:0.01, // es el tiempo que se quiere simular por cada request o llamado a step()
//		simFixedTimeStep:0.015,
		simFixedTimeStep:0.02, // es el paso maximo que se pude calcular por ves, 0.035 es el limite de estabilidad
		
		// si TimeStep es 0,03 y FixedTimeStep es 0.01 se van a ejecutar 3 pasos de 0.01 para completar el tiempo pedido
		simMaxSubSteps:1
    };



	this.setTorre=function(_torre){
		torre=_torre;
	}

	var me=this;

	this.loadScene=function() {

		if (!sceneAlreadyLoaded)	{
			if (torre){
				var json=torre.getJsonSimulacion();

				if (!json.hasOwnProperty("global")) json.global=this._jsonGlobal;

				aM.sendMessage('loadScene', json );
			}
			else
				this.log(" no esta seteada la Torre");
				
			sceneAlreadyLoaded=true;
		} else {
			this.log("error: la escena ya se habia cargado ...")
		}

	};

	this.step=function(){
		if (sceneAlreadyLoaded){
			var frame= LT.viewport3D.frame ? LT.viewport3D.frame :0;
			
			var args={currentFrame:frame};
						
			if (this._handPosition!=null && this._handRotation!=null){

				args.manoDerecha={
						"position":this._handPosition,
						"rotation":this._handRotation
				};
		
			}
				
			aM.sendMessage('stepScene',args);
		} else {
			this.log("aun no se cargo ninguna escena ...");
		}
	};


	this.onHandscontrollerUpdated=function(ev){
//		this.log("onHandscontrollerUpdated"+ev.posicion[1]);
		this._handPosition=ev.posicion;
		this._handRotation=ev.rotacion;	
		
	}
	
	this.onEnterFrame=function(){
		frameCount++;

		if ((!this.pausarSimulacion) &&  (frameCount%stepEveryNFrames==0) && (sceneAlreadyLoaded)) this.step();
	}

	this.dispararCrasher=function(cuerpoId,posicion,velocidad,velocidadAngular){

		var json={
			cuerpoId:cuerpoId,
			posicion:posicion,
			rotacion:[0,0,0],
			velocidad:velocidad,
			velocidadAngular:velocidadAngular
		}

		aM.sendMessage('dispararCuerpo', json);
	};

	this.setViento=function(fuerza){

		var json={
			fuerza:fuerza
		}

		aM.sendMessage('setViento', json);
	};

	this.setTerremoto=function(amplitud,deltaFasePorFrame,direccion){
		var json={
			amplitud:amplitud,
			deltaFasePorFrame:deltaFasePorFrame,
			direccion:direccion
		}

		aM.sendMessage('setTerremoto', json);
	};

	this.log=function(msg){
		console.log("Simulador() "+msg);
	};

	this.sceneLoadedHandler=function(msg) {
		// callback al mensaje sceneLoaded enviado por NaCL
		console.log('Scene loaded.');
		console.log('Scene object count = ' + msg.header.sceneobjectcount);
	};

	this.getSimulationTime=function(){
		return lastStepExecTime;
	};

	this.getLastSimulatedFrame=function(){
		return lastSimulatedFrame;
	};


 	this.stepSceneHandler=function(msg) {// callback al mensaje noscene y sceneupdate enviados por NaCL

		// Step the scene
		var i;
		var j;
		var numTransforms = 0;

		if (msg.header.cmd == 'sceneupdate') {

			var lastStepExecTime = msg.header.simtime;
			var lastSimulatedFrame = msg.header.simulatedFrame;
			this.maxYValue = msg.header.maxYValue;
			TransformBuffer = new Float32Array(msg.frames[0]);

/*
			if (simulationInfoPanel){
				var html="Last Step Exec Tim:"+lastStepExecTime+" usec<br>";
				html+="Last Simulated Frame:"+lastSimulatedFrame+"<br>";
				//html+="Altura maxima:"+maxYValue+"<br>";

				simulationInfoPanel.html(html);

			}
			*/
			//console.log("NaClAMBulletStepSceneHandler() lastStepExecTime:"+lastStepExecTime);
			//str="";
			//TransformBuffer = new Float64Array(msg.frames[0]);
			/*
			 numTransforms = TransformBuffer.length/16; // si es single precision

			 for (i = 0; i < numTransforms; i++) {
			 str+="\r\n i:"+i+" values:";
			 for (j = 0; j < 16; j++) {
			 //objects[i].matrixWorld.elements[j] = TransformBuffer[i*16+j];
			 str+=Number(TransformBuffer[i*16+j]).toFixed(2)+",";
			 }
			 }
			 */
			//
			var e= {
				type:this.SIMULATION_UPDATED,
				values:TransformBuffer,
				maxYValue:this.maxYValue
			};
			this.dispatchEvent(e);

			//		torre.onUpdateSimulacion(TransformBuffer);
			//}
			//else this.log(" no esta seteada la Torre");

		}
	};


	/*
	 function NaClAMBulletPickObject(objectTableIndex, cameraPos, hitPos) {
	 aM.sendMessage('pickobject', {index: objectTableIndex, cpos: [cameraPos.x, cameraPos.y, cameraPos.z], pos: [hitPos.x,hitPos.y,hitPos.z]});
	 }

	 function NaClAMBulletDropObject() {
	 aM.sendMessage('dropobject', {});
	 }
	 */



	// sobre la funcion BIND
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind

	aM.enable();

	aM.addEventListener('sceneloaded', this.sceneLoadedHandler.bind(this));
	aM.addEventListener('sceneupdate',this.stepSceneHandler.bind(this));


};

addEventsHandlingFunctions(Simulator);

