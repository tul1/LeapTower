

function NaClAMBulletInit() {
	// inicializa la simulacion
	  aM.addEventListener('sceneloaded', NaClAMBulletSceneLoadedHandler);
	  aM.addEventListener('noscene', NaClAMBulletStepSceneHandler);
	  aM.addEventListener('sceneupdate', NaClAMBulletStepSceneHandler);
}

function NaClAMBulletLoadScene(sceneDescription) {
	  aM.sendMessage('loadscene', sceneDescription);
}


function NaClAMBulletSceneLoadedHandler(msg) { // callback al mensaje sceneLoaded enviado por NaCL 
	  console.log('Scene loaded.');
	  console.log('Scene object count = ' + msg.header.sceneobjectcount);
}
/*
function NaClAMBulletPickObject(objectTableIndex, cameraPos, hitPos) {
 	 aM.sendMessage('pickobject', {index: objectTableIndex, cpos: [cameraPos.x, cameraPos.y, cameraPos.z], pos: [hitPos.x,hitPos.y,hitPos.z]});
}

function NaClAMBulletDropObject() {
	  aM.sendMessage('dropobject', {});
}
*/
function NaClAMBulletStepSceneHandler(msg) {// callback al mensaje noscene y sceneupdate enviados por NaCL 

	  // Step the scene
	  var i;
	  var j;
	  var numTransforms = 0;
	  
	  if (msg.header.cmd == 'sceneupdate') {
		if (skipSceneUpdates > 0) {
		  skipSceneUpdates--;
		  return;
		}
		var simTime = msg.header.simtime;
		document.getElementById('simulationTime').textContent = simTime;

		console.log("NaClAMBulletStepSceneHandler() simTime:"+simTime);
		str="";
		TransformBuffer = new Float32Array(msg.frames[0]);
		//TransformBuffer = new Float64Array(msg.frames[0]);

		numTransforms = TransformBuffer.length/16; // si es single precision

		for (i = 0; i < numTransforms; i++) {
		  str+="\r\n i:"+i+" values:";
		  for (j = 0; j < 16; j++) {
			//objects[i].matrixWorld.elements[j] = TransformBuffer[i*16+j];
			str+=Number(TransformBuffer[i*16+j]).toFixed(2)+",";
		  }
		}

		document.getElementById("vardumps").value=str;
	  }
}
