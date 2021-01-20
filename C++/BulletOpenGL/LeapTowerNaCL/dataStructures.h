#ifndef DATASTRUCTURES_H
#define DATASTRUCTURES_H

#include <cstring>
#include "btBulletCollisionCommon.h"
#include "btBulletDynamicsCommon.h"

const double PI = 3.141592653589793238463;

//double simExecTime = 0;

struct objectData{
	float position[3];
	float rotation[4];
	float scale[3];
	float color[3];
	float radio;
	int type; // 0 box, 1 cylinder, 2 sphere
};

struct geometryData{
	
	float radio;
	float scale[3];
	float color[3];
	int type; // 0 box, 1 cylinder, 2 sphere
};


struct shapeData{
	btCollisionShape* shape;
	btVector3* inertia;
	float mass;
	float friction;
	float restitution;
	
};

struct xformData{
	float pos[3];
	float rot[4];
};

#endif