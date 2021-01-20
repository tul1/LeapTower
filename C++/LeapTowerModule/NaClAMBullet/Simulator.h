#ifndef SIMULATOR_H
#define SIMULATOR_H

#include <iostream>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <map>
#include <vector>

#include "json/json.h"
#include "btBulletCollisionCommon.h"
#include "btBulletDynamicsCommon.h"

#include "dataStructures.h"


using namespace std;
#define BT_USE_DOUBLE_PRECISION

class Simulator
{
private:
	#define BIT(x) (1<<(x))
	enum collisiontypes {
		COL_NOTHING = 0,				//<Collide with nothing
		COL_HANDS = BIT(0),				//<Collide with ships
		COL_TOWER_PARTS = BIT(1),		//<Collide with walls
		COL_CRASHERS = BIT(2)			//<Collide with powerups
	};
	
	bool useFixedContrainsts;
	long frame;

	
	float terremotoAmplitudOnda;
	float terremotoDeltaFasePorFrame;
	float groundY;
	float terremotoFase;
	
	float linearDamping;
	float angularDamping;

	float terremotoDireccion[3];
	bool hayViento;
	float vientoDireccion[3];
	
	btScalar simTimeStep;
	int		 simMaxSubSteps;
	btScalar simFixedTimeStep;	

	int stopBodiesUntilFrame;


	void log(string msg);
	bool isInArray(const Json::Value node, string key);
	void step();
	

	Json::Value getState();
	
	btRigidBody* groundRigidBody;	
	btDiscreteDynamicsWorld* world;

	btBroadphaseInterface* broadphase;
	btCollisionDispatcher* dispatcher;
	btDefaultCollisionConfiguration* collisionConfiguration;
	btSequentialImpulseConstraintSolver* solver;

	map<string, shapeData> listaShapes;   // Maps   https://www.youtube.com/channel/UCas000yWtwjvFzD2zB9Nzmw
	
	void setTransformacionCuerpo(string cuerpoId, float posicion[3], float rotacion[3]);

public:
	Simulator();

	
	

	string createScene(Json::Value root);
	void destroyScene();

	void handleStep(Json::Value root);
	
	void setStepParameters(float timeStep, int maxSubSteps, float fixedTimeStep);
		
	void dispararCuerpo(string cuerpoId, float posicion[3], float rotacion[3], float velocidad[3], float velocidaAngular[3]);

	float getTrackedBodiesMaxYValue();
	
	void setTerremoto(float amplitud, float deltaFasePorFrame, float direccion[3]);
	void setViento(float fuerza[3]);

	map<string, btRigidBody*> listaBodies;	

	
	vector<btRigidBody*> bodiesVector;
	vector<btRigidBody*> trackedBodiesVector;

	double execTime;
	
	
};

#endif