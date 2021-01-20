#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <map>
#include <vector>
#include <sys/time.h>
#include <cstring>
#include "NaClAMBase/NaClAMBase.h"
#include "btBulletCollisionCommon.h"
#include "btBulletDynamicsCommon.h"
#include "Simulator.h"

static uint64_t microseconds() {
  struct timeval tv;
  gettimeofday(&tv, NULL);
  return tv.tv_sec * 1000000 + tv.tv_usec;

}

Simulator*  sim;

/**
 * This function is called at module initialization time.
 * moduleInterfaces and moduleInstance are already initialized.
 */
void NaClAMModuleInit() {
  
  //scene.Init();
   sim = new Simulator();
	NaClAMPrintf("Bullet AM Running.");

}

/**
 * This function is called at 60hz.
 * @param microseconds A monotonically increasing clock
 */
void NaClAMModuleHeartBeat(uint64_t microseconds) {

}

void handleLoadScene(const NaClAMMessage& message) {
  // Scene created.
  {
	const Json::Value& root = message.headerRoot;
	const Json::Value& sceneDesc = root["args"];


	string result=sim->createScene(sceneDesc);
	
    Json::Value root2 = NaClAMMakeReplyObject("sceneloaded", message.requestId);
    root2["sceneobjectcount"] = Json::Value(result);
    NaClAMSendMessage(root2, NULL, 0);
  }
}

void handleStepScene(const NaClAMMessage& message) {
	  
	  
	const Json::Value& receivedRoot = message.headerRoot;
	const Json::Value& arguments = receivedRoot["args"];
	
	
	
	uint64_t start = microseconds();  
	sim->handleStep(arguments);
	uint64_t end = microseconds();
	uint64_t delta = end-start;

	Json::Value root = NaClAMMakeReplyObject("sceneupdate", message.requestId);
	root["simtime"] = Json::Value(delta);
	root["simulatedFrame"] = arguments["currentFrame"];
	root["maxYValue"]=Json::Value(sim->getTrackedBodiesMaxYValue());

    // construyo el FRAME del mensaje con la info de transformaciones  
	int numObjects = sim->listaBodies.size();

	// IMPORTANTE !!! ALERTA !!!!! OJO !!!!!!!!!
	// sizeof depende de si bullet usa double o simmple precision, para simple va float, para double va double
	//uint32_t TransformSize = (numObjects)*4*4*sizeof(double);
	uint32_t TransformSize = (numObjects)*4*4*sizeof(float);
	
	
	// ****************
	// https://developer.chrome.com/native-client/pepper_dev/c/struct_p_p_b___var_array_buffer__1__0#a4c7c25b939f56de64fa3f6f906a7da8c
	// *****
	PP_Var Transform = moduleInterfaces.varArrayBuffer->Create(TransformSize);
	//double* m = (double*)moduleInterfaces.varArrayBuffer->Map(Transform);
	float* m = (float*)moduleInterfaces.varArrayBuffer->Map(Transform);
	
	string msg="handleStepScene numObjects="+to_string(numObjects)+" transformSize:"+to_string(TransformSize)+" sizeof:"+to_string(sizeof(float));
	/*
	uint32_t byte_length = 0;
	 
	 PP_Bool ok = moduleInterfaces.varArrayBuffer->ByteLength(Transform, &byte_length);
	
	if (ok){
	
		for (uint32_t i = 0; i < 3; ++i){
			m[i] = 1.2345678;
		}
		
	}
	*/
	for (vector<btRigidBody*>::iterator it = sim->bodiesVector.begin(); it != sim->bodiesVector.end(); ++it){
	//for (map<string, btRigidBody*>::iterator it = sim->listaBodies.begin(); it != sim->listaBodies.end(); ++it){
	
		//string objId = it->first;
		//btRigidBody* rb = it->second;
	 
		if ((*it) && (*it)->getMotionState()) {
			btTransform xform;
			btScalar elements[16];
			(*it)->getMotionState()->getWorldTransform(xform);				
			
			//xform.getOpenGLMatrix(&m[0]);
			xform.getOpenGLMatrix(&elements[0]);
			
			// copio los 16 elementos de la matrix que son btScalar a m
			for (int k=0;k<16;k++)	m[k]=elements[k];
			
			
		  }
	  m += 16;
	  
	}
	
	
	
	const char * cMsg = msg.c_str();
	NaClAMPrintf(cMsg);
	moduleInterfaces.varArrayBuffer->Unmap(Transform);
	// Send message
	NaClAMSendMessage(root, &Transform, 1);
	moduleInterfaces.var->Release(Transform);
	
	
}


void handleSetViento(const NaClAMMessage& message){
	const Json::Value& receivedRoot = message.headerRoot;
	const Json::Value& a = receivedRoot["args"];
	
	float fuerza[3];
	
	fuerza[0]=a["fuerza"][0].asFloat();
	fuerza[1]=a["fuerza"][1].asFloat();
	fuerza[2]=a["fuerza"][2].asFloat();
	
	sim->setViento(fuerza);
}

void handleSetTerremoto(const NaClAMMessage& message){
	const Json::Value& receivedRoot = message.headerRoot;
	const Json::Value& a = receivedRoot["args"];
	
	float direccion[3];
	
	direccion[0]=a["direccion"][0].asFloat();
	direccion[1]=a["direccion"][1].asFloat();
	direccion[2]=a["direccion"][2].asFloat();
	
	sim->setTerremoto(a["amplitud"].asFloat(), a["deltaFasePorFrame"].asFloat(), direccion);
	
}

void handleSetStepParameters(const NaClAMMessage& message){
	const Json::Value& receivedRoot = message.headerRoot;
	const Json::Value& a = receivedRoot["args"];
	

	sim->setStepParameters(a["timeStep"].asFloat(), a["maxSubSteps"].asInt(), a["fixedTimeStep"].asFloat());
}

void handleDispararCuerpo(const NaClAMMessage& message){
	const Json::Value& receivedRoot = message.headerRoot;
	const Json::Value& a = receivedRoot["args"];
	

	float posicion[3];	
	posicion[0]=a["posicion"][0].asFloat();
	posicion[1]=a["posicion"][1].asFloat();
	posicion[2]=a["posicion"][2].asFloat();
	
	float rotacion[3];	
	rotacion[0]=a["rotacion"][0].asFloat();
	rotacion[1]=a["rotacion"][1].asFloat();
	rotacion[2]=a["rotacion"][2].asFloat();

	float velocidad[3];	
	velocidad[0]=a["velocidad"][0].asFloat();
	velocidad[1]=a["velocidad"][1].asFloat();
	velocidad[2]=a["velocidad"][2].asFloat();

	float velocidadAngular[3];	
	velocidadAngular[0]=a["velocidadAngular"][0].asFloat();
	velocidadAngular[1]=a["velocidadAngular"][1].asFloat();
	velocidadAngular[2]=a["velocidadAngular"][2].asFloat();
	
		
	sim->dispararCuerpo(a["cuerpoId"].asString(),posicion,rotacion,velocidad,velocidadAngular);
}




/**
 * This function is called for each message received from JS
 * @param message A complete message sent from JS
 */
void NaClAMModuleHandleMessage(const NaClAMMessage& message) {
  if (message.cmdString.compare("loadScene") == 0) {
  
    handleLoadScene(message);
	
  } else if (message.cmdString.compare("stepScene") == 0) {
  
    handleStepScene(message);
	
  } else if (message.cmdString.compare("setViento") == 0) {
	
	handleSetViento(message);
    
  } else if (message.cmdString.compare("setTerremoto") == 0) {
    
	handleSetTerremoto(message);
		
  } else if (message.cmdString.compare("setStepParameters") == 0) {
  
	handleSetStepParameters(message);
  
  } else if (message.cmdString.compare("dispararCuerpo") == 0) {
  
	handleDispararCuerpo(message);
    
  }
  
  
}
