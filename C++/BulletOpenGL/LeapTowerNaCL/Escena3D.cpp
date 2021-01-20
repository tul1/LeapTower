#include "Escena3D.h"
#include "Simulator.h"

class Simulator;

Escena3D::Escena3D(Simulator* simu){
	this->init(simu);
}

void Escena3D::init(Simulator* simu){
	this->sim = simu;
	/*
	at[0] = 0;
	at[1] = 0;
	at[2] = 10;
	*/
	
	eye[0] = 0;
	eye[1] = 0;
	eye[2] = 0;

	this->misilPos[0] = 0;
	this->misilPos[1] = 0;
	this->misilPos[2] = -100;


	this->misilRot[0] = 0;
	this->misilRot[1] = 0;
	this->misilRot[2] = 0;
	this->misilRot[3] = 1;

	direccionTerremoto[0]=1.0;
	direccionTerremoto[1]=0.3;
	direccionTerremoto[2]=0;

	initOpenGL();
}

void Escena3D::initOpenGL(){

	
	
	glEnable(GL_CULL_FACE);
	glCullFace(GL_BACK);
	
	//glEnable(GL_LIGHTING);
	glShadeModel(GL_FLAT);
	glEnable(GL_DEPTH_TEST);
	glLightModeli(GL_LIGHT_MODEL_TWO_SIDE, GL_FALSE);

	glLoadIdentity();
	
	/*
	como posicionar la luz
	http://www.glprogramming.com/red/chapter05.html
	*/

	float light_color[4] = { 1.0f, 1.0f, 1.0f, 1.0f };	
	float light_color2[4] = { 1.0f, 0.5f, 0.0f, 1.0f };
	float light_ambient[4] = { 0.2f, 0.2f, 0.2f, 1.0f };

	glLoadIdentity();
	dl_handle = glGenLists(3);

	

	glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
	
	
	
	
	glLightfv(GL_LIGHT0, GL_DIFFUSE, light_color);
	glLightfv(GL_LIGHT0, GL_AMBIENT, light_ambient);
	glEnable(GL_LIGHT0);
	
	
	
	glLightfv(GL_LIGHT1, GL_DIFFUSE, light_color2);
	glLightfv(GL_LIGHT1, GL_AMBIENT, light_ambient);
	glEnable(GL_LIGHT1);
	
	
	


	// Generación de las Display Lists
	glNewList(DL_AXIS, GL_COMPILE);
	drawAxis();
	glEndList();
	glNewList(DL_GRID, GL_COMPILE);
	drawGrid();
	glEndList();

};


void Escena3D::drawGrid(){
	int i;
	//glDisable(GL_LIGHTING);
	glColor3f(1.0f, 0.0f, 0.0f);
	glBegin(GL_LINES);
	for (i = -20; i<21; i=i+2)
	{
		glVertex3f(float(i), 0.0f, -20.0f);
		glVertex3f(float(i), 0.0f, 20.0f);
		glVertex3f(-20.0f, 0.0f, float(i));
		glVertex3f(20.0f, 0.0f, float(i));
	}
	glEnd();
	//glEnable(GL_LIGHTING);

};

void Escena3D::drawAxis(){


	//glDisable(GL_LIGHTING);
	glBegin(GL_LINES);
	// X
	glColor3f(1.0, 0.0, 0.0);
	glVertex3f(0.0, 0.0, 0.0);
	glColor3f(0.0, 0.0, 0.0);
	glVertex3f(15.0, 0.0, 0.0);
	// Y
	glColor3f(0.0, 1.0, 0.0);
	glVertex3f(0.0, 0.0, 0.0);
	glColor3f(0.0, 0.0, 0.0);
	glVertex3f(0.0, 15.0, 0.0);
	// Z
	glColor3f(0.0, 0.0, 1.0);
	glVertex3f(0.0, 0.0, 0.0);
	glColor3f(0.0, 0.0, 0.0);
	glVertex3f(0.0, 0.0, 15.0);
	glEnd();
	//glEnable(GL_LIGHTING);
}

void Escena3D::drawCube(GLfloat color[3], GLfloat ladoX, GLfloat ladoY, GLfloat ladoZ){
	
	// crea un cubo con base en el plano XY y centrado en 0,0,0 de ladoX * ladoY * lado Z

	setMaterial(color);

	glPushMatrix();
	glTranslatef(0, 0, 0);
	glScalef(ladoX, ladoY, ladoZ);
	glutSolidCube(1);
	//glutWireCube(1);
	glPopMatrix();
};

void Escena3D::drawCylinder(GLfloat color[3], GLfloat ladoX, GLfloat ladoY, GLfloat ladoZ){
	
	

	setMaterial(color);

	glPushMatrix();
	glTranslatef(0, 0, 0);
	glScalef(ladoX, ladoY, ladoZ);
	glutWireCube(1);

		glPushMatrix();
			glTranslatef(0, -0.5, 0);
			glRotatef(-90, 1, 0, 0);
			glutSolidCone(0.5, 0.5, 12, 5);
		glPopMatrix();

	glTranslatef(0, 0.5, 0);
	glRotatef(90, 1, 0, 0);
	glutSolidCone(0.5,0.5,12,5);
	glPopMatrix();
}

void Escena3D::drawSphere(GLfloat color[3], GLfloat radio){
	
	// crea un cubo con base en el plano XY y centrado en 0,0,0 de ladoX * ladoY * lado Z

	setMaterial(color);

	glPushMatrix();
	glTranslatef(0, 0, 0);
	glutSolidSphere(radio,12,12);
	glutWireCube(radio*2);
	glPopMatrix();
};

void Escena3D::setMaterial(GLfloat diffuseColor[3]){

	GLfloat ambientColor[] = { diffuseColor[0] / 3.0, diffuseColor[1] / 3.0, diffuseColor[2] / 3.0, };
	GLfloat whiteSpecularMaterial[] = { 1.0f, 1.0f, 1.0f };
	GLfloat mShininess[] = { 1.0f };

	glMaterialfv(GL_FRONT, GL_AMBIENT, ambientColor);
	//glMaterialfv(GL_FRONT, GL_SPECULAR, whiteSpecularMaterial);
	//glMaterialfv(GL_FRONT, GL_SHININESS, mShininess);
	glMaterialfv(GL_FRONT, GL_DIFFUSE, diffuseColor);
};

void Escena3D::display(double simExecTime){

	
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	glEnable(GL_LIGHTING);

	///////////////////////////////////////////////////
	// Escena 3D
	//glDisable(GL_LIGHTING);
	glColor3f(1.0f, 0.0f, 0.0f);



	string s = "simExecTime:" + to_string(int(simExecTime*1000))+ "us";
	output(10, 870, 255, 255, 255, NULL,s);

	s = "Fuerza Misil:" + to_string(int(fuerzaMisil));
	output(10, 850, 255, 255, 255, NULL, s);

	s = "Amplitud Terremoto:" + to_string(amplitudTerremoto);
	output(10, 830, 255, 255, 255, NULL, s);

	s = "DeltaFase Terremoto:" + to_string(deltaFasePorFrame);
	output(10, 810, 255, 255, 255, NULL, s);

	s = "Angulo Viento:" + to_string(anguloViento);
	output(10, 790, 255, 255, 255, NULL, s);

	s = "Intensidad Viento:" + to_string(intensidadViento);
	output(10, 770, 255, 255, 255, NULL, s);

	s = "Altura Maxima" + to_string(sim->getTrackedBodiesMaxYValue());
	output(10, 750, 255, 255, 255, NULL, s);


	setEnv3D();
	
	
	glMatrixMode(GL_MODELVIEW);
	//output(0, 0, 255, 255, 255, NULL, "hola que tal linea 1 linea 1 linea1");
	glLoadIdentity();



	double x = cos(anguloCam1*PI / 180.0f);
	double z = sin(anguloCam1*PI / 180.0f);

	eye[0] = float(distanciaCam*cos(anguloCam2*PI / 180.0f)*x);	
	eye[1] = float(distanciaCam*sin(anguloCam2*PI / 180.0f));   // eje Y
	eye[2] = float(distanciaCam*cos(anguloCam2*PI / 180.0f)*z);

	float up[3] = { 0.0, 1.0 ,0.0 };


	

	gluLookAt(eye[0], eye[1]+targetCamY, eye[2], 0, targetCamY,0, up[0], up[1], up[2]);


	float pos[4] = {200.0f, 0.0f, 200.0f ,1.0f};
	glLightfv(GL_LIGHT0, GL_POSITION, pos);

	float pos2[4] = { -200.0f, 200.0f, 200.0f, 1.0f };
	glLightfv(GL_LIGHT1, GL_POSITION, pos2);


	//float pos2[3] = { 0.0f, -150.0f, 0.0f };
	//glLightfv(GL_LIGHT1, GL_POSITION, pos2);


	glPushMatrix();

	glCallList(DL_AXIS);// ejes
	glCallList(DL_GRID);// grilla

	glColor3f(0.0f, 1.0f, 1.0f);

	float color[3];
	color[0] = 1.0;
	color[1] = 1.0;
	color[2] = 1.0;
	glPushMatrix();
		glTranslatef(50.0, 0.0, 0.0);
		drawSphere(color, 5.0);
	glPopMatrix();

	for (map<string, objectData>::iterator it = listaObjetos3D.begin(); it != listaObjetos3D.end(); ++it){

		string objId = it->first;
		objectData o = it->second;

	//	if (objId == "cubo0")	log("  objeto3d: " + objId + " pos=" + to_string(o.position[2]));

		glPushMatrix();
		
			glTranslatef(o.position[0], o.position[1], o.position[2]);

			
			//         ( angulo en grados, ejeX, ejeY, ejeZ)
			glRotatef(o.rotation[0], o.rotation[1], o.rotation[2], o.rotation[3]);

			if (o.type==0)
				drawCube(o.color,o.scale[0],o.scale[1],o.scale[2]);
			else if (o.type==1)
				drawCylinder(o.color, o.scale[0], o.scale[1], o.scale[2]);
			else 
				
				drawSphere(o.color, o.radio);

		glPopMatrix();

		
	}
	glPopMatrix();

	glutSwapBuffers();
	frame++;
	
};



void Escena3D::setEnv3D(){

	glViewport(0, 0, (GLsizei)W_WIDTH, (GLsizei)W_HEIGHT);
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	gluPerspective(60.0, (GLfloat)W_WIDTH / (GLfloat)W_HEIGHT, 0.10, 600.0);
}

void Escena3D::keyboard(unsigned char key, int x, int y){

	
	switch (key) {
	case 0x1b:
		exit(0);
		break;


	case '1':  selectCrasher(0);  break;
	case '2':  selectCrasher(1);  break;
	case '3':  selectCrasher(2);  break;
	case '4':  selectCrasher(3);  break;
	case '5':  selectCrasher(4);  break;
	case '6':  selectCrasher(5);  break;
	case '7':  selectCrasher(6);  break;
	case '8':  selectCrasher(7);  break;
		
	case 'a':  anguloCam1 += 3;  break;
	case 'd':  anguloCam1 -= 3;  break;

	case 'w':  anguloCam2 += 3;  break;
	case 's':  anguloCam2 -= 3;  break;

	case 'e':  distanciaCam += 1.0;  break;
	case 'q':  distanciaCam += -1.0;  break;

	case 'u':  targetCamY += 1.0;  break;
	case 'i':  targetCamY += -1.0;  break;

	case 'p':  pauseSimulation=!pauseSimulation;  break;
	case 'z':  pauseTerremoto = !pauseTerremoto; 
		if (!pauseTerremoto) sim->setTerremoto(amplitudTerremoto, deltaFasePorFrame,direccionTerremoto);
		else sim->setTerremoto(0.0, deltaFasePorFrame, direccionTerremoto);
			   break;

	
	case '-':  fuerzaMisil -= 10; break;
	case '+':  fuerzaMisil += 10; break;

	case 'x':  amplitudTerremoto += 0.1;  if (!pauseTerremoto)  sim->setTerremoto(amplitudTerremoto, deltaFasePorFrame, direccionTerremoto);	break;
	case 'c':  amplitudTerremoto -= 0.1;  if (!pauseTerremoto)  sim->setTerremoto(amplitudTerremoto, deltaFasePorFrame, direccionTerremoto);	break;

	case 'b':  deltaFasePorFrame *= 1.5;  if (!pauseTerremoto)  sim->setTerremoto(amplitudTerremoto, deltaFasePorFrame, direccionTerremoto);	break;
	case 'n':  deltaFasePorFrame /= 1.5;  if (!pauseTerremoto)  sim->setTerremoto(amplitudTerremoto, deltaFasePorFrame, direccionTerremoto);	break;


	case 't':  anguloViento +=10; this->actualizarViento();	break;
	case 'y':  anguloViento -= 10; this->actualizarViento();	break;

	case 'g':  intensidadViento += 1.0; this->actualizarViento();	break;
	case 'h':  intensidadViento -= 1.0; this->actualizarViento();	break;


	case 'm': dispararCrasher(currentCrasher);	break;

	default:
		break;
	}

	anguloCam2 = fmin(fmax(-90.0f, anguloCam2), 90.0f);
}

void Escena3D::actualizarViento(){

	float vec[3];

	vec[0] = this->intensidadViento*sin(anguloViento*PI/180.0);
	vec[2] = this->intensidadViento*cos(anguloViento*PI/180.0);
	vec[1] = 0;

	sim->setViento(vec);
}

void Escena3D::reshape(int w, int h){
	
	W_WIDTH = float(w);
	W_HEIGHT = float(h);
};


void Escena3D::selectCrasher(int index){
	if (index < this->totalCrashers){
		currentCrasher = index;
	}
}

void Escena3D::log(string msg){
	cout << "Escena3D:  " << msg << endl;
};



void Escena3D::loadScene(const string& description){

	
	Json::Value root;
	Json::Reader reader;
	bool parsedSuccess = reader.parse(description, root, false);

	if (!parsedSuccess) {// error
		log(reader.getFormattedErrorMessages());
	}
	else {


		map<string, geometryData> listaGeometrias;

		const Json::Value shapes = root["shapes"];
		Json::Value::iterator it = shapes.begin();

		this->log("Lista de geometrias:");

		for (Json::Value::iterator it = shapes.begin(); it != shapes.end(); ++it)	{
			const Json::Value key = it.key();
			const Json::Value shapeNode = (*it);


			string type = "box";
			if (shapeNode.isMember("type")) type = shapeNode["type"].asString();

			const Json::Value scaleNode = shapeNode["scale"];

			geometryData gd;
			
			

			if (type == "sphere") {
				gd.scale[0] = 0;
				gd.scale[1] = 0;
				gd.scale[2] = 0;
				gd.radio = shapeNode["radio"].asFloat();
				gd.type = 2;
			}
			else{
				gd.scale[0] = scaleNode[0].asFloat();
				gd.scale[1] = scaleNode[1].asFloat();
				gd.scale[2] = scaleNode[2].asFloat();
				gd.radio = 0;
				if (type == "box") gd.type = 0;
				else gd.type = 1;
			}
			
			gd.color[0] = 0.5;
			gd.color[1] = 0.5;
			gd.color[2] = 0.5;

			
			
			listaGeometrias[key.asString()] = gd;			
			log("   " + key.asString());
		}

		

		const Json::Value bodies = root["tower"];


		// itero sobre la lista de cuerpos rigidos del nodo Tower
		for (unsigned int index = 0; index < bodies.size(); ++index)
		{

			const Json::Value b = bodies[index];

			string id = b["id"].asString();
			string shapeType = b["shape"].asString();

			const Json::Value pos = b["position"];
			const Json::Value rot = b["rotation"];

			if (listaGeometrias.find(shapeType) != listaGeometrias.end()){
				
				geometryData gd = listaGeometrias[shapeType];

				objectData od;
				od.position[0] = pos[0].asFloat();
				od.position[1] = pos[1].asFloat();
				od.position[2] = pos[2].asFloat();

				od.rotation[0] = rot[0].asFloat();
				od.rotation[1] = rot[1].asFloat();
				od.rotation[2] = rot[2].asFloat();
				od.rotation[3] = rot[3].asFloat();

				od.scale[0] = gd.scale[0];
				od.scale[1] = gd.scale[1];
				od.scale[2] = gd.scale[2];

				od.color[0] = gd.color[0];
				od.color[1] = gd.color[1];
				od.color[2] = gd.color[2];

				od.type = gd.type;
				od.radio = gd.radio;

				
				listaObjetos3D[id] = od;
				log(" object3D:" + id + " shapeType: " + shapeType);
			}
			else {
				log(" object3D:" + id + " shapeType: " + shapeType + " NOT FOUND!");
			}			
		}// for


		if (root.isMember("crashers")){

			
			const Json::Value crashers = root["crashers"];
			totalCrashers = crashers.size();

			crashersIds = new string[totalCrashers];

			for (unsigned int index = 0; index < crashers.size(); ++index){
				const Json::Value crasherId = crashers[index];
				crashersIds[index] = crasherId.asString();
			}

		}

		/*
		const Json::Value crashers = root["crashers"];

		// itero sobre la lista de cuerpos rigidos del nodo Tower
		for (unsigned int index = 0; index < crashers.size(); ++index){

			const Json::Value c = crashers[index];

			string id = c["id"].asString();
			string shapeType = c["shape"].asString();

			const Json::Value pos = c["position"];
			const Json::Value rot = c["rotation"];

			if (listaGeometrias.find(shapeType) != listaGeometrias.end()){

				geometryData gd = listaGeometrias[shapeType];

				objectData od;
				od.position[0] = pos[0].asFloat();
				od.position[1] = pos[1].asFloat();
				od.position[2] = pos[2].asFloat();

				od.rotation[0] = rot[0].asFloat();
				od.rotation[1] = rot[1].asFloat();
				od.rotation[2] = rot[2].asFloat();
				od.rotation[3] = rot[3].asFloat();

				od.scale[0] = gd.scale[0];
				od.scale[1] = gd.scale[1];
				od.scale[2] = gd.scale[2];

				od.color[0] = gd.color[0];
				od.color[1] = gd.color[1];
				od.color[2] = gd.color[2];

				totalCrashers++;
				listaCrashers[id] = od;
				log(" crasher:" + id + " shapeType: " + shapeType);
			}
			else {
				log(" crasher:" + id + " shapeType: " + shapeType + " NOT FOUND!");
			}

		}*/
	}
}


void Escena3D::output(int x, int y, float r, float g, float b, int font, string st)
{


	
	const char *p;
	p = st.c_str();

	//glDisable(GL_LIGHTING);
	glColor3f(1.0, 1.0, 0.1);

	glMatrixMode(GL_PROJECTION);
	double *mat = new double[16];
	glGetDoublev(GL_PROJECTION_MATRIX, mat);
	glLoadIdentity();
	glOrtho(0, 1200, 0, 900, -5, 5);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glPushMatrix();
	glLoadIdentity();

	glColor3f(255,244, 200);
	glRasterPos2f(float(x),float(y));
	int len, i;
	len = (int)strlen(p);
	for (i = 0; i < len; i++) {
		glutBitmapCharacter(GLUT_BITMAP_HELVETICA_12, p[i]);
	}

	glPopMatrix();
	glMatrixMode(GL_PROJECTION);
	glLoadMatrixd(mat);
	glMatrixMode(GL_MODELVIEW);

	//glEnable(GL_LIGHTING);
}

void Escena3D::dispararCrasher(int selectedCrasher){

	
	
	

	if (selectedCrasher< totalCrashers){

		float dir[3];


		double mod = sqrt(pow(eye[0], 2) + pow(eye[1], 2) + pow(eye[2], 2));

		dir[0] = float(-eye[0] * fuerzaMisil / mod);
		dir[1] = float(-eye[1] * fuerzaMisil / mod);
		dir[2] = float(-eye[2] * fuerzaMisil / mod);

		float origen[3];
		origen[0] = eye[0];
		origen[1] = eye[1] + targetCamY;
		origen[2] = eye[2];
		
		float rotacion[3];
		rotacion[0] = 0;
		rotacion[1] = 0;
		rotacion[2] = 0;


		float velocidadAngular[3];
		velocidadAngular[0] = 0;
		velocidadAngular[1] = 0; 
		velocidadAngular[2] = 0;


		sim->dispararCuerpo(crashersIds[selectedCrasher], origen, rotacion,dir,velocidadAngular);
		log("dispararCrasher()  index" + to_string(selectedCrasher) + " selectedCrasher:" + to_string(selectedCrasher));
	}

}

void Escena3D::updateTransforms(Simulator *sim){
	

	
	
	// recorro la lista de cuerpos rigidos simulados en Bullet
	for (map<string, btRigidBody*>::iterator it = sim->listaBodies.begin(); it != sim->listaBodies.end(); ++it){

		string objId = it->first;
		btRigidBody* rb = it->second;

		// es el id del cuerporigido que es el mismo que el del objetod3d

		
		//map<string, objectData> l=(escena*).listaObjetos3D;
		
		if (listaObjetos3D.find(objId) != listaObjetos3D.end()){
			objectData* od =&listaObjetos3D[objId];

			btTransform trans;
			rb->getMotionState()->getWorldTransform(trans);

			btVector3 pos = trans.getOrigin();

			od->position[0] = pos.getX();
			od->position[1] = pos.getY();
			od->position[2] = pos.getZ();

			btVector3 axis = trans.getRotation().getAxis(); // aplico orientacion

			float angulo = float(trans.getRotation().getAngle() * 180.0 / PI);

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


	// recorro la lista de crashers del simulador
	/*
	for (map<string, btRigidBody*>::iterator it = sim->listaCrashers.begin(); it != sim->listaCrashers.end(); ++it){

		string objId = it->first;
		btRigidBody* rb = it->second;

		if (listaCrashers.find(objId) != listaCrashers.end()){
			objectData* od = &listaCrashers[objId];

			btTransform trans;
			rb->getMotionState()->getWorldTransform(trans);

			btVector3 pos = trans.getOrigin();

			od->position[0] = pos.getX();
			od->position[1] = pos.getY();
			od->position[2] = pos.getZ();

			btVector3 axis = trans.getRotation().getAxis(); // aplico orientacion

			float angulo = float(trans.getRotation().getAngle() * 180.0 / PI);

			od->rotation[0] = angulo;
			od->rotation[1] = axis.getX();
			od->rotation[2] = axis.getY();
			od->rotation[3] = axis.getZ();
			
		}
		else {
			log(" no encuentro el crasher: " + objId + " en escena.crasher");
		}
	}*/

}