#include "Simulator.h"



Simulator::Simulator(){
	/*/
	groundPos[0] = 0;
	groundPos[1] = -1;
	groundPos[2] = 0;
	*/
	
	
	
}




void Simulator::log(string msg){
	cout << "Simulator:  " << msg << endl;
}

bool Simulator::isInArray(const Json::Value node, string key){
	
	bool found = false;
	if (node.isArray()){
		for (unsigned int index = 0; index < node.size(); ++index){
			const Json::Value e = node[index];

			if (e.asString() == key) found = true;
		}
	}

	return found;
}

string Simulator::createScene(Json::Value root){
	
	/*/
	btScalar d(1.678912345673483737830000001);
	float f = d;
	log("d:" + to_string(d));
	log("f:" + to_string(f));
	*/



	stopBodiesUntilFrame = 0;

	frame = 0;
	terremotoFase = 0.0;
	execTime = 0;

	terremotoDireccion[0] = 1.0f;
	terremotoDireccion[1] = 0.3f;
	terremotoDireccion[2] = 0.0f;
	
	vientoDireccion[0] = 0.0;
	vientoDireccion[1] = 0.0;
	vientoDireccion[2] = 0.0;

	hayViento = false;

	terremotoAmplitudOnda = 0.0f;
	terremotoDeltaFasePorFrame = 0.1f;
	groundY = 0.0;

	linearDamping = 0.01;
	angularDamping = 0.01;
	
	float gravity = -9.8f;
	float groundFriction = 1.0f;
	float groundRestitution = 0.0f;

	simTimeStep=btScalar(1.) / btScalar(60.); // 30 HZ, :0.0333333351
	simMaxSubSteps=1;
	simFixedTimeStep=btScalar(1.) / btScalar(60.); // 60 HZ 0.0166666675

	
	useFixedContrainsts = false;

	const Json::Value global = root["global"];

	if (global.isMember("gravity"))				gravity = global["gravity"].asFloat();

	if (global.isMember("stopBodiesUntilFrame"))				stopBodiesUntilFrame = global["stopBodiesUntilFrame"].asInt();
	if (global.isMember("linearDamping"))				linearDamping = global["linearDamping"].asFloat();
	if (global.isMember("angularDamping"))				angularDamping = global["angularDamping"].asFloat();

	if (global.isMember("groundY"))				groundY = global["groundY"].asFloat();
	if (global.isMember("groundFriction"))		groundFriction = global["groundFriction"].asFloat();
	if (global.isMember("groundRestitution"))	groundRestitution = global["groundRestitution"].asFloat();
	
	if (global.isMember("simTimeStep"))				simTimeStep = btScalar(global["simTimeStep"].asFloat());
	if (global.isMember("simFixedTimeStep"))		simFixedTimeStep = btScalar(global["simFixedTimeStep"].asFloat());
	if (global.isMember("simMaxSubSteps"))			simMaxSubSteps = global["simMaxSubSteps"].asInt();


	this->broadphase = new btDbvtBroadphase();
	
	this->collisionConfiguration = new btDefaultCollisionConfiguration();
	this->dispatcher = new btCollisionDispatcher(collisionConfiguration);
	this->solver = new btSequentialImpulseConstraintSolver;

	this->world = new btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
	this->world->setGravity(btVector3(0.0, btScalar(gravity), 0.0));


	int collisionMask = COL_TOWER_PARTS | COL_CRASHERS;// lo cuerpos de la torre colisionan con todos menos las manos
	int colliderType = COL_TOWER_PARTS;

	// agrego el suelo
	btCollisionShape* groundShape = new btStaticPlaneShape(btVector3(0.0, 1.0, 0.0), 1.0);// parametros: normal {x,y,z} , espesor o altura
	btDefaultMotionState* groundMotionState = new btDefaultMotionState(btTransform(btQuaternion(0.0, 0.0, 0.0, 1.0), btVector3(0.0, groundY-1, 0.0)));
	btRigidBody::btRigidBodyConstructionInfo groundRigidBodyCI(0.0, groundMotionState, groundShape, btVector3(0.0, 0.0, 0.0));

	groundRigidBody = new btRigidBody(groundRigidBodyCI);
	groundRigidBody->setFriction(groundFriction);
	groundRigidBody->setRestitution(groundRestitution);

	// setear como Kinematic object
	groundRigidBody->setCollisionFlags(groundRigidBody->getCollisionFlags() | btCollisionObject::CF_KINEMATIC_OBJECT);
	groundRigidBody->setActivationState(DISABLE_DEACTIVATION);
	world->addRigidBody(groundRigidBody,colliderType,collisionMask);

	Json::Value crashers;

	if (root.isMember("crashers")){
		crashers = root["crashers"];
	}

	Json::Value hands;

	if (root.isMember("hands")){
		hands = root["hands"];
	}

	
	//bool t=this->isInArray(crashers,"auto");
	

	string result = " Creating Scene ...";

	const Json::Value shapes = root["shapes"];
	Json::Value::iterator it = shapes.begin();

	this->log("Lista de shapes:");
	int shapesCount = 0;
	// itero por la lista de shapes
	for (Json::Value::iterator it = shapes.begin(); it != shapes.end(); ++it)
	{
		const Json::Value key = it.key();
		const Json::Value shapeNode = (*it);

		string type = "box";
		if (shapeNode.isMember("type")) type = shapeNode["type"].asString();
		
		float mass = shapeNode["mass"].asFloat();
		float friction = 1.0;
		if (shapeNode.isMember("friction"))   friction = shapeNode["friction"].asFloat();
		float restitution = 0.0;
		if (shapeNode.isMember("restitution"))   restitution = shapeNode["restitution"].asFloat();
		
		btCollisionShape* shape;

		if (type == "sphere"){

			shape = new  btSphereShape(btScalar(shapeNode["radio"].asFloat()));
		
		}
		else { // cylinder o box

			const Json::Value scale = shapeNode["scale"];

			btScalar sX = btScalar(scale[0].asFloat() / 2.0);
			btScalar sY = btScalar(scale[1].asFloat() / 2.0);
			btScalar sZ = btScalar(scale[2].asFloat() / 2.0);

			if (type == "cylinder"){
				shape = new  btCylinderShape(btVector3(sX, sY, sZ));
			}
			else {// box
				shape = new  btBoxShape(btVector3(sX, sY, sZ));
				
			}
		}
		//shape->setMargin(0.5);

		btVector3* inertia=new btVector3(0, 0, 0);

		shape->calculateLocalInertia(btScalar(mass),*inertia);

		
		shapeData sd;
		sd.inertia = inertia;
		sd.shape = shape;
		sd.mass = mass;
		sd.friction = friction;
		sd.restitution = restitution;
			

		listaShapes[key.asString()] = sd;
		
		log(" shape:"+key.asString());
		//cout << "Value: " << value.toStyledString();
		shapesCount++;
	}

	
		
	const Json::Value bodies = root["tower"];
	
	int bodiesCount = 0;
	// Primer pasadas por la lista de cuerpo del nodo Tower
	for (unsigned int index = 0; index<bodies.size(); ++index)
	{

		const Json::Value b = bodies[index];

		string id=b["id"].asString();
		string shapeType=b["shape"].asString();

		const Json::Value pos = b["position"];
		const Json::Value rot = b["rotation"];

		
		if (listaShapes.find(shapeType) != listaShapes.end()){
			btCollisionShape* shape = listaShapes[shapeType].shape;
			


			btTransform initialTransform;
			initialTransform.setIdentity();
			initialTransform.setOrigin(btVector3(btScalar(pos[0].asFloat()), btScalar(pos[1].asFloat()), btScalar(pos[2].asFloat())));
						
			
			//initialTransform.setRotation(btQuaternion(btScalar(rot[0].asFloat()), btScalar(rot[1].asFloat()), btScalar(rot[2].asFloat()), btScalar(rot[3].asFloat())));

			// OJO !!!! la rotacion debe venir en Angulos de Euler en radianes en un ORDEN PARTICULAR:  (angY,angX,angZ)
			//http://bulletphysics.org/Bullet/BulletFull/classbtQuaternion.html#a8bd5d699377ba585749d325076616ffb

			initialTransform.setRotation(btQuaternion(btScalar(rot[1].asFloat()), btScalar(rot[0].asFloat()), btScalar(rot[2].asFloat())));
			//initialTransform.setRotation(btQuaternion(btScalar(0.0), btScalar(0), btScalar(0) ));
			
			/*
			btVector3 localInertia(0, 0, 0);
			shape->calculateLocalInertia(btScalar(listaShapes[shapeType].mass), localInertia);
			*/

			float masa = listaShapes[shapeType].mass;
			float restitution = listaShapes[shapeType].restitution;
			float friction = listaShapes[shapeType].friction;

			if (b.isMember("mass"))   masa = b["mass"].asFloat();

			const btVector3 in = *listaShapes[shapeType].inertia;			

			btDefaultMotionState* initialMotionState = new btDefaultMotionState(initialTransform);
			btRigidBody::btRigidBodyConstructionInfo fallRigidBodyCI(masa, initialMotionState, shape, in);
			

			btRigidBody* rb = new btRigidBody(fallRigidBodyCI);
			rb->setFriction(btScalar(friction));
			rb->setRestitution(btScalar(restitution));
			rb->setDamping(btScalar(linearDamping), btScalar(angularDamping));


			if (b.isMember("trackYValue") && (b["trackYValue"].asInt() == 1)) {
				trackedBodiesVector.push_back(rb);
			}

			string isKinematic = "";

			if (b.isMember("isKinematic") && b["isKinematic"].asBool()) {
				rb->setCollisionFlags(rb->getCollisionFlags() | btCollisionObject::CF_KINEMATIC_OBJECT);
				rb->setActivationState(DISABLE_DEACTIVATION);
				isKinematic = "isKinematic";
			}
			// collision filtering http://www.bulletphysics.org/mediawiki-1.5.8/index.php/Collision_Filtering

			string clase = "body";
			collisionMask = COL_TOWER_PARTS | COL_CRASHERS;// lo cuerpos de la torre colisionan con todos menos las manos
			colliderType = COL_TOWER_PARTS;

			if (this->isInArray(crashers, id)){// es un crasher
				collisionMask = COL_TOWER_PARTS | COL_CRASHERS | COL_HANDS; // colisionan con todos
				colliderType = COL_CRASHERS;
				clase = "crasher";
			}
			else if (this->isInArray(hands, id)){// es una mano
				collisionMask = COL_CRASHERS | COL_HANDS; // colisionan con todos menos los cuerpos de la torre
				colliderType = COL_HANDS;
				clase = "hand";
			}

			this->world->addRigidBody(rb,colliderType,collisionMask);

			listaBodies[id] = rb;
			bodiesVector.push_back(rb);
			bodiesCount++;
			log(" body:" + id + " shapeType: " + shapeType + " masa:" + to_string(masa) + " " + isKinematic+" clase:"+clase);
		}
		else {
			log(" body:" + id + " shapeType: " + shapeType+" NOT FOUND!");
		}			
					
		
	}// for index

	/*
	for (vector<btRigidBody*>::iterator it = bodiesVector.begin(); it != bodiesVector.end(); ++it){
		
	(*it)->getMotionState()->getWorldTransform(xform);
	}*/

	
	// Segunda pasada por la lista de bodies del nodo Tower del JSON
	for (unsigned int index = 0; index < bodies.size(); ++index)
	{

		const Json::Value b = bodies[index];
		btRigidBody* rb = listaBodies.operator[](b["id"].asString());

		if (b.isMember("constraints")){

			const Json::Value constraints = b["constraints"];

			for (unsigned int j = 0; j < constraints.size(); ++j){// recorro la lista de constraints del body b
				const Json::Value con = constraints[j];
				string x =con.toStyledString();
				string attachTo = con["attachTo"].asString();
				

				if (listaBodies.find(attachTo) != listaBodies.end()){

					btRigidBody* rb2 = listaBodies.operator[](attachTo);

					const Json::Value  p = con["pointOnMe"];
					const Json::Value  p2 = con["pointOnAttached"];

					
					/*
					btTransform* t1 = new btTransform();
					btTransform* t2 = new btTransform();
					t1->setIdentity();
					t1->setOrigin(btVector3(btScalar(p[0].asFloat()), btScalar(p[1].asFloat()), btScalar(p[2].asFloat())));
					t2->setIdentity();
					t2->setOrigin(btVector3(btScalar(p2[0].asFloat()), btScalar(p2[1].asFloat()), btScalar(p2[2].asFloat())));
					*/
					// Slider contraint

					//btSliderConstraint* constraint = new btSliderConstraint(*rb, *rb2, *t1, *t2,false);
					//constraint->setUpperLinLimit(10.0);
					//constraint->setLowerLinLimit(-10.0);

					// Fixed Contraint
					//btFixedConstraint* constraint = new btFixedConstraint(*rb, *rb2, *t1, *t2);
					
					// Point2PointConstraint
					
					btPoint2PointConstraint* constraint = new btPoint2PointConstraint(
						*rb, *rb2,
						btVector3(p[0].asFloat(), p[1].asFloat(), p[2].asFloat()), btVector3(p2[0].asFloat(), p2[1].asFloat(), p2[2].asFloat())
						);
						
					
					constraint->setBreakingImpulseThreshold(btScalar(con["breakAt"].asFloat()));
					world->addConstraint(constraint);
				}
				else {
					log(" error en constraint de: " + b["id"].asString() + " no encuentro el attachTo: " + attachTo);
				}

			}// for j

		}

	} // for index




	// sobre referencias en c++ file:///C:/Federico/GameOn/Thinking%20in%20C++/vol1/Chapter11.html

	result = result + " shapes:" + to_string(shapesCount) + " bodies:" + to_string(bodiesCount);
	return result;
}


void Simulator::destroyScene(){
	// TODO

	if (world) {
		int i;

		// delete constraints
		for (i = world->getNumConstraints() - 1; i >= 0; i--) {
		}


		for (i = world->getNumCollisionObjects() - 1; i >= 0; i--) {
			btCollisionObject* obj = world->getCollisionObjectArray()[i];
			btRigidBody* body = btRigidBody::upcast(obj);
			if (body && body->getMotionState()) {
				//btCollisionShape *shape = body->getCollisionShape();
				
				// local inertia?
				// ojo esto no va a andar porque los cuerpos comparten shapes
				//delete body->getCollisionShape();
			}
			if (body && body->getMotionState()) {
				delete body->getMotionState();
			}
			world->removeCollisionObject(obj);
			delete obj;
		}
		//removePickingConstraint();
	}

	/*
	// Delete shapes
	std::map<std::string, btCollisionShape*>::iterator it = shapes.begin();
	while (it != shapes.end()) {
	delete (*it).second;
	it++;
	}*/
	//shapes.clear();
	// Clear name table
	//objectNames.clear();

	world->removeRigidBody(groundRigidBody);

	delete groundRigidBody->getCollisionShape();
	delete groundRigidBody->getMotionState();
	delete groundRigidBody;

	delete this->world;
	delete this->solver;
	delete this->dispatcher;
	delete this->collisionConfiguration;
	delete this->broadphase;
}


void Simulator::setStepParameters(float timeStep, int maxSubSteps, float fixedTimeStep){
	simTimeStep = btScalar(timeStep);
	simMaxSubSteps = maxSubSteps;
	simFixedTimeStep = btScalar(fixedTimeStep);

}

void Simulator::step(){
	clock_t tStart = clock();

	float groundPos[3];

	if (terremotoAmplitudOnda > 0.0) {

		groundPos[0] = terremotoAmplitudOnda*sin(terremotoFase)*terremotoDireccion[0];
		groundPos[1] = groundY+terremotoAmplitudOnda*sin(terremotoFase)*terremotoDireccion[1];
		groundPos[2] = terremotoAmplitudOnda*sin(terremotoFase)*terremotoDireccion[2];
		
		btTransform trans;
		trans.setIdentity();
		trans.setOrigin(btVector3(btScalar(groundPos[0]), btScalar(groundPos[1]), btScalar(groundPos[2])));

		btDefaultMotionState* groundMotionState = new btDefaultMotionState(trans);
		groundRigidBody->setMotionState(groundMotionState);

		terremotoFase+= terremotoDeltaFasePorFrame;
	}


	// viento
	if (hayViento){

		int i;
		for (i=this->world->getNumCollisionObjects() - 1; i >= 0; i--)
		{
			btCollisionObject* obj = world->getCollisionObjectArray()[i];
			btRigidBody* body = btRigidBody::upcast(obj);
			
			if (!body->isStaticObject())
				body->applyCentralForce(btVector3(vientoDireccion[0],vientoDireccion[1], vientoDireccion[2]));
		}
	}
	
	if (frame<stopBodiesUntilFrame){


		int i;
		for (i = this->world->getNumCollisionObjects() - 1; i >= 0; i--)
		{
			btCollisionObject* obj = world->getCollisionObjectArray()[i];
			btRigidBody* body = btRigidBody::upcast(obj);
				
			
			body->setLinearVelocity(btVector3(0, 0, 0));
			body->setAngularVelocity(btVector3(0, 0, 0));
			body->setLinearFactor(btVector3(0, 0, 0));
			body->setAngularFactor(btVector3(0, 0, 0));
			
			//body->setDamping(100, 100);
		}
	}
	else if (frame==stopBodiesUntilFrame) {
		int i;
		for (i = this->world->getNumCollisionObjects() - 1; i >= 0; i--)
		{
			btCollisionObject* obj = world->getCollisionObjectArray()[i];
			btRigidBody* body = btRigidBody::upcast(obj);

			//body->setDamping(0.1, 0.1);
			body->setLinearFactor(btVector3(1, 1, 1));
			body->setAngularFactor(btVector3(1, 1,1));
		}
	}


		


	// leer http://bulletphysics.org/mediawiki-1.5.8/index.php/Stepping_The_World

	world->stepSimulation(simTimeStep,simMaxSubSteps,simFixedTimeStep);	
	clock_t tEnd = clock();

	execTime = (double)(tEnd - tStart)*1000 / CLOCKS_PER_SEC;
		
	//log("step frame=" + to_string(frame));
	frame++;
}

Json::Value Simulator::getState(){
	
	log("");
	log("getState()");
	

	Json::Value root;

	for (map<string, btRigidBody*>::iterator it = listaBodies.begin(); it != listaBodies.end(); ++it){
		
		btRigidBody* rb = it->second;

		btTransform trans;
		rb->getMotionState()->getWorldTransform(trans); 

		btVector3 pos = trans.getOrigin();

		
		
		log("body: "+(it->first)+"  position(x,y,z) = " + to_string(pos.getX())+"," + to_string(pos.getY()) + "," + to_string(pos.getZ()));

		btVector3 axis = trans.getRotation().getAxis(); // aplico orientacion
		float angulo = trans.getRotation().getAngle() * 360 / 6.2832f;

		log("body: " + (it->first) + " rotation(ang,x,y,z) = " + to_string(angulo) + " " + to_string(axis.getX())+", "+to_string(axis.getY())+", "+to_string(axis.getZ()));
		

	}
		

	
	return NULL;
}
/*
void  Simulator::updateTransforms(Escena3D* escena){
	
	map<string, objectData>* lista = &escena->listaObjetos3D;
	
	//map<string, objectData>* listaObjetos3D

	// recorro la lista de cuerpos rigidos simulados en Bullet
	for (map<string, btRigidBody*>::iterator it = listaBodies.begin(); it != listaBodies.end(); ++it){

		string objId=it->first; 
		btRigidBody* rb= it->second;

		// es el id del cuerporigido que es el mismo que el del objetod3d

		
		//map<string, objectData> l=(escena*).listaObjetos3D;

		if (lista->find(objId) != lista->end()){
			objectData* od = &lista->operator[](objId);

			btTransform trans;
			rb->getMotionState()->getWorldTransform(trans);

			btVector3 pos = trans.getOrigin();

			od->position[0] = pos.getX();
			od->position[1] = pos.getY();
			od->position[2] = pos.getZ();

			btVector3 axis = trans.getRotation().getAxis(); // aplico orientacion

			float angulo = float(trans.getRotation().getAngle() * 180.0 /PI);

			od->rotation[0] = angulo;
			od->rotation[1] = axis.getX();
			od->rotation[2] = axis.getY();
			od->rotation[3] = axis.getZ();
		//	if (objId == "cubo0")	log(" sim actualizo transformaciones de objeto3d: " + objId + " pos=" + to_string(axis.getX()));
		}
		else {
			log(" no encuentro el objeto3d: " + objId + " en escena.listaObjetos3D");
		}
	}

	// actualizo transformacion del misil

	btTransform trans;
	misilRB->getMotionState()->getWorldTransform(trans);

	btVector3 pos = trans.getOrigin();
	escena->misilPos[0] = pos.getX();
	escena->misilPos[1] = pos.getY();
	escena->misilPos[2] = pos.getZ();

	btVector3 axis = trans.getRotation().getAxis(); 	

	escena->misilRot[0] = trans.getRotation().getAngle() * 360 / 6.2832f;
	escena->misilRot[1] = axis.getX();
	escena->misilRot[2] = axis.getY();
	escena->misilRot[3] = axis.getZ();

}
*/
void Simulator::dispararCuerpo(string cuerpoId, float posicion[3], float rotacion[3], float velocidad[3], float velocidaAngular[3]){

	if (listaBodies.find(cuerpoId) != listaBodies.end()){

		btRigidBody* crasherRB = listaBodies[cuerpoId];

		btTransform trans;
		trans.setIdentity();
		trans.setOrigin(btVector3(btScalar(posicion[0]), btScalar(posicion[1]), btScalar(posicion[2])));
		trans.setRotation(btQuaternion(btScalar(rotacion[0]), btScalar(rotacion[1]), btScalar(rotacion[2])));

		btDefaultMotionState* misilMotionState = new btDefaultMotionState(trans);
		crasherRB->setMotionState(misilMotionState);
		crasherRB->setLinearVelocity(btVector3(btScalar(velocidad[0]), btScalar(velocidad[1]), btScalar(velocidad[2])));
		crasherRB->setAngularVelocity(btVector3(btScalar(velocidaAngular[0]), btScalar(velocidaAngular[1]), btScalar(velocidaAngular[2])));
		crasherRB->setActivationState(ACTIVE_TAG);

	}
}

void Simulator::setTransformacionCuerpo(string cuerpoId, float posicion[3], float rotacion[3]){

	if (listaBodies.find(cuerpoId) != listaBodies.end()){
		btRigidBody* rb = listaBodies[cuerpoId];

		btTransform trans;
		trans.setIdentity();
		trans.setOrigin(btVector3(btScalar(posicion[0]), btScalar(posicion[1]), btScalar(posicion[2])));
		trans.setRotation(btQuaternion(btScalar(rotacion[1]), btScalar(rotacion[0]), btScalar(rotacion[2])));		

		btDefaultMotionState* misilMotionState = new btDefaultMotionState(trans);
		rb->setMotionState(misilMotionState);
		rb->setActivationState(ACTIVE_TAG);
	}
}


void Simulator::setTerremoto(float amplitud, float deltaFasePorFrame, float dir[3]) {
	terremotoAmplitudOnda = amplitud;
	terremotoDeltaFasePorFrame = deltaFasePorFrame;
	this->terremotoDireccion[0] = dir[0];
	this->terremotoDireccion[1] = dir[1];
	this->terremotoDireccion[2] = dir[2];
	
}

void Simulator::setViento(float fuerza[3]){

	vientoDireccion[0] = fuerza[0];
	vientoDireccion[1] = fuerza[1];
	vientoDireccion[2] = fuerza[2];

	if ((fuerza[0] == 0) && (fuerza[1] == 0) && (fuerza[2] == 0))
		hayViento = false;
	else	
		hayViento = true;

			
}
void Simulator::handleStep(Json::Value root){

	//http://bulletphysics.org/mediawiki-1.5.8/index.php/Stepping_The_World
	if (root != NULL){
		string manos[2];
		manos[0] = "manoIzquierda";
		manos[1] = "manoDerecha";

		for (int i = 0; i < 2; i++){

			if (root.isMember(manos[i]) && (root[manos[i]].isMember("position")) && (root[manos[i]].isMember("rotation"))) {

				Json::Value pos = root[manos[i]]["position"];
				float p[3];
				p[0] = pos[0].asFloat();
				p[1] = pos[1].asFloat();
				p[2] = pos[2].asFloat();

				Json::Value rot = root[manos[i]]["rotation"];
				float r[3];
				r[0] = rot[0].asFloat();
				r[1] = rot[1].asFloat();
				r[2] = rot[2].asFloat();

				this->setTransformacionCuerpo(manos[i], p, r);
			}
		}
	}
	
	this->step();
	
}

float Simulator::getTrackedBodiesMaxYValue(){
	float y = 0;
	for (vector<btRigidBody*>::iterator it = this->trackedBodiesVector.begin(); it != this->trackedBodiesVector.end(); ++it){
		
		if ((*it) && (*it)->getMotionState()) {
			btTransform xform;
			
			(*it)->getMotionState()->getWorldTransform(xform);
						
			btVector3 pos = xform.getOrigin();
			if (pos.getY()>y) y=pos.getY();		

		}		

	}
	return y;

}