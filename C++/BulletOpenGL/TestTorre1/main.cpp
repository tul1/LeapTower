
#include <gl/glew.h>
#include <gl/freeglut.h>
#include <iostream>
#include <math.h>  
#include "btBulletDynamicsCommon.h"
using namespace std;




// Variables que controlan la ubicación de la cámara en la Escena 3D
float eye[3] = { 0.0, 0.0, 0.0 };
float at[3] = { 0.0, 0.0, 10.0 };
float up[3] = { 0.0, 0.0, 1.0 };

// Variables asociadas a la fuente de luz de la escena
float light_color[4] = { 0.6f, 0.6f, 0.6f, 1.0f };
float light_color2[4] = { 0.6f, 0.6f, 0.6f, 1.0f };
float light_ambient[4] = { 0.3f, 0.3f, 0.3f, 1.0f };

// Handle para el control de las Display Lists
GLuint dl_handle;
#define DL_AXIS (dl_handle+0)
#define DL_GRID (dl_handle+1)
#define DL_AXIS2D_TOP (dl_handle+2)
#define DL_AXIS2D_HEIGHT (dl_handle+3)

// Tamaño de la ventana
GLfloat window_size[2];
#define W_WIDTH window_size[0]
#define W_HEIGHT window_size[1]

const double PI = 3.141592653589793238463;

float anguloCam1 = 135;
float anguloCam2 = 30;
float distanciaCam = 90;
float targetCamY = 15.0;

float alturaTiro = 10.0;

bool detenerEsfera = true;
bool detenerCubo = true;
bool detenerViento = true;
bool pausarSimulacion = true;
// Fisica

// Cajas
#define maxCajas 3000
int totalCajas = 0;
float tamanioCaja = 1;
GLfloat colorCaja[3] = { 0.5, 0.5, 0.5 };

float escalaCajas[maxCajas][3];
btRigidBody* cajasRB[maxCajas];

// Esfera

float radioEsfera = 2;
float posicionEsferaRB[3] = { 0.0, 50.0, 3.0 }; // Y=2 es el centro de la esfera
float velocidadEsferaRB[3] = { 0.0, -0.05, 0.0 };

GLfloat colorEsfera[3] = { 0.0, 0.5, 1.0 };
btRigidBody* esferaRB;

// Cubo
btRigidBody* cuboRB;
float fuerzaCubo = 1.0;
float posicionCuboRB[3] = { 20.0, 0.5, 35.0 };
GLfloat colorCubo[3] = { 1.0, 1.0, 1.0 };

btDiscreteDynamicsWorld* dynamicsWorld;

int frame = 0;

void DrawAxis()
{
	glDisable(GL_LIGHTING);
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
	glEnable(GL_LIGHTING);

}

void DrawXYGrid()
{
	int i;
	glDisable(GL_LIGHTING);
	glColor3f(0.15, 0.1, 0.1);
	glBegin(GL_LINES);
	for (i = -20; i<21; i++)
	{
		glVertex3f(i, -20.0, 0.0);
		glVertex3f(i, 20.0, 0.0);
		glVertex3f(-20.0, i, 0.0);
		glVertex3f(20.0, i, 0.0);
	}
	glEnd();
	glEnable(GL_LIGHTING);
}

void setMaterial(GLfloat diffuseColor[3]){

	GLfloat ambientColor[] = { 0.1, 0.1, 0.1 };
	GLfloat whiteSpecularMaterial[] = { 0.0, 0.0, 0.0 };
	GLfloat mShininess[] = { 100 };

	glMaterialfv(GL_FRONT_AND_BACK, GL_AMBIENT, ambientColor);
	glMaterialfv(GL_FRONT_AND_BACK, GL_SPECULAR, whiteSpecularMaterial);
	glMaterialfv(GL_FRONT_AND_BACK, GL_SHININESS, mShininess);
	glMaterialfv(GL_FRONT_AND_BACK, GL_DIFFUSE, diffuseColor);

}

void Set3DEnv()
{
	glViewport(0, 0, (GLsizei)W_WIDTH, (GLsizei)W_HEIGHT);
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	gluPerspective(60.0, (GLfloat)W_WIDTH / (GLfloat)W_HEIGHT, 0.10, 600.0);
}

void drawCube(GLfloat color[3], GLfloat ladoY, GLfloat ladoX, GLfloat ladoZ){
	glEnable(GL_LIGHTING);
	// crea un cubo con base en el plano XY y centrado en 0,0,0 de ladoX * ladoY * lado Z

	setMaterial(color);

	glPushMatrix();
	glTranslatef(0, 0, 0);
	glScalef(ladoX, ladoY, ladoZ);
	glutSolidCube(1);
	glPopMatrix();


}

void init(void)
{

	/*
	
	como posicionar la luz
	http://www.glprogramming.com/red/chapter05.html
	
	*/
	glLoadIdentity();
	dl_handle = glGenLists(3);

	glClearColor(0.2, 0.2, 0.3, 0.0);
	glShadeModel(GL_SMOOTH);
	glEnable(GL_DEPTH_TEST);

	float pos[3] = { 250.0f, 250.0f, 250.0f };

	glLightfv(GL_LIGHT0, GL_DIFFUSE, light_color);
	glLightfv(GL_LIGHT0, GL_AMBIENT, light_ambient);
	glLightfv(GL_LIGHT0, GL_POSITION, pos);
	//glEnable(GL_LIGHT0);

	float pos2[3] = { -150.0f, 150.0f, 50.0f };

	glLightfv(GL_LIGHT1, GL_DIFFUSE, light_color2);
	glLightfv(GL_LIGHT1, GL_AMBIENT, light_ambient);
	glLightfv(GL_LIGHT1, GL_POSITION, pos2);
	glEnable(GL_LIGHT1);

	glEnable(GL_LIGHTING);


	// Generación de las Display Lists
	glNewList(DL_AXIS, GL_COMPILE);
	DrawAxis();
	glEndList();
	glNewList(DL_GRID, GL_COMPILE);
	DrawXYGrid();
	glEndList();

}

void actualizarEstadoEscena(void){

	// Actualizo posicion de esferaRB
	
	
	if (!detenerEsfera){
		posicionEsferaRB[0] += velocidadEsferaRB[0];
		posicionEsferaRB[1] += velocidadEsferaRB[1];
		posicionEsferaRB[2] += velocidadEsferaRB[2];
	}
	
	// actualizo la tranformacion de la esfera en la simulacion
	btTransform trans;
	trans.setIdentity();
	trans.setOrigin(btVector3(btScalar(posicionEsferaRB[0]), btScalar(posicionEsferaRB[1]), btScalar(posicionEsferaRB[2])));

	btDefaultMotionState* esferaMotionState = new btDefaultMotionState(trans);
	esferaRB->setMotionState(esferaMotionState);

	if (!detenerCubo){
		detenerCubo = true;

		trans.setIdentity();
		trans.setOrigin(btVector3(btScalar(eye[0]*0.5), btScalar(eye[1]*0.5), btScalar(eye[2]*0.5)));

		btDefaultMotionState* esferaMotionState = new btDefaultMotionState(trans);
		cuboRB->setMotionState(esferaMotionState);

		float dirX = -eye[0]*fmax(0.1,fuerzaCubo);
		float dirY = -eye[1]*fmax(0.1, fuerzaCubo);
		float dirZ = alturaTiro;
		cuboRB->setLinearVelocity(btVector3(btScalar(dirX), btScalar(dirY), btScalar(dirZ)));
		//cuboRB->applyCentralForce(btVector3(btScalar(-10000.0), btScalar(0), btScalar(0)));
		cuboRB->setActivationState(ACTIVE_TAG);
	}
	
	frame++;

	int i;


	// viento
	if (!detenerViento){
		
		float windX = 0.8*sin(frame / 300.0);
		float windY = windX;
		float windZ = 0;
		for (i = dynamicsWorld->getNumCollisionObjects() - 1; i >= 0; i--)
		{
			btCollisionObject* obj = dynamicsWorld->getCollisionObjectArray()[i];
			btRigidBody* body = btRigidBody::upcast(obj);
			if (!body->isStaticObject())
				body->applyCentralForce(btVector3(windX, windY, windZ));
		}
	}

	



}

void OnIdle(void)
{
	// ejecutamos un paso de la simulacion
	actualizarEstadoEscena();

	if (!pausarSimulacion) dynamicsWorld->stepSimulation(1 / 30.f, 10);
	glutPostRedisplay();
}

void displayEscena(void){
	
	// dibujo todas las cajas
	for (int k = 0; k<totalCajas; k++){
		glPushMatrix();
		btTransform trans;
		cajasRB[k]->getMotionState()->getWorldTransform(trans); // obtengo la transformacion de la caja


		btVector3 pos = trans.getOrigin();
		glTranslatef(pos.getX(), pos.getY(), pos.getZ());// unico centro de masa de la casa

		btVector3 axis = trans.getRotation().getAxis(); // aplico orientacion
		glRotatef(trans.getRotation().getAngle() * 360 / 6.2832f, axis.getX(), axis.getY(), axis.getZ());

		drawCube(colorCaja, escalaCajas[k][0], escalaCajas[k][1],escalaCajas[k][2]);
		glPopMatrix();
	}
	
	// Dibujo La esfera
	glPushMatrix();
	setMaterial(colorEsfera);
	glTranslatef(posicionEsferaRB[0], posicionEsferaRB[1], posicionEsferaRB[2]);
	glutSolidSphere(radioEsfera, 16, 16);
	glPopMatrix();

	// Dibujo el Cubo

	glPushMatrix();
	setMaterial(colorCubo);

	btTransform trans;
	cuboRB->getMotionState()->getWorldTransform(trans);

	btVector3 pos = trans.getOrigin();
	glTranslatef(pos.getX(), pos.getY(), pos.getZ());// unico centro de masa de la casa

	btVector3 axis = trans.getRotation().getAxis(); // aplico orientacion
	glRotatef(trans.getRotation().getAngle() * 360 / 6.2832f, axis.getX(), axis.getY(), axis.getZ());

	drawCube(colorCubo, 4, 4, 4);


	glPopMatrix();


}

void display(void)
{
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	///////////////////////////////////////////////////
	// Escena 3D
	Set3DEnv();

	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();

	eye[0] = distanciaCam*cos(anguloCam2*PI/180)*sin(anguloCam1*PI/180);
	eye[1] = distanciaCam*cos(anguloCam2*PI/180)*cos(anguloCam1*PI/180);
	eye[2] = distanciaCam*sin(anguloCam2*PI/180);


	gluLookAt(eye[0] + at[0], eye[1] + at[1], eye[2] + at[2], at[0], at[1],targetCamY, up[0], up[1], up[2]);

	glCallList(DL_AXIS);// ejes
	glCallList(DL_GRID);// grilla

	displayEscena();

	glutSwapBuffers();
}

void reshape(int w, int h)
{
	W_WIDTH = w;
	W_HEIGHT = h;
}



void processSpecialKeys(int key, int x, int y) {
	/*
	switch (key) {
	case GLUT_KEY_F1:
		
		
		break;
	}*/
}
void stopAll(){

	for (int k = 0; k<totalCajas; k++){

		btTransform trans;
		cajasRB[k]->setLinearVelocity(btVector3(0, 0, 0));
		cajasRB[k]->setAngularVelocity(btVector3(0, 0, 0));

	}

}

void keyboard(unsigned char key, int x, int y)
{
	switch (key) {
	case 0x1b:
		exit(0);
		break;


	case 'a':  anguloCam1 += 3;  break;
	case 'd':  anguloCam1 -= 3;  break;

	case 'w':  anguloCam2 += 3;  break;
	case 's':  anguloCam2 -= 3;  break;

	case 'e':  distanciaCam += 1.0;  break;
	case 'q':  distanciaCam += -1.0;  break;
	
	case 'u':  targetCamY += 10.0;  break;
	case 'i':  targetCamY += -10.0;  break;

	case 't':  stopAll();  break;


	case 'j':  alturaTiro += -5.0;  break;
	case 'k':  alturaTiro += 5.0;  break;

	case 'h':  detenerEsfera = !detenerEsfera;  break;
	case 'c':  detenerCubo = !detenerCubo;  break;
	case 'p':  pausarSimulacion = !pausarSimulacion;  break;

	case 'n':  detenerViento = !detenerViento;  break;

	case '-':  fuerzaCubo -= 0.2;  printf("fuerza= %f\n", float(fuerzaCubo)); break;
	case '+':  fuerzaCubo += 0.2;  printf("fuerza= %f\n", float(fuerzaCubo)); break;

	case 'x':
		break;
	default:
		break;
	}
}



void buildTower(){



	btCollisionShape* boxShape1 = new  btBoxShape(btVector3(0.5, 0.5, 0.5));
	btCollisionShape* boxShape2 = new  btBoxShape(btVector3(4.0, 4.0, 0.5));


	btVector3 fallInertia(0, 0, 0);
	boxShape1->calculateLocalInertia(btScalar(1.0), fallInertia);
	boxShape2->calculateLocalInertia(btScalar(25.0), fallInertia);

	btTransform startTransform;
	startTransform.setIdentity();

	float separacion = 1.02f;

	int count = 0;

	for (int i = 0; i < 20; i++){

		if (i % 2 != 0){ // piso par

			for (int j = 0; j < 8; j++){
				for (int k = 0; k < 8; k++){
					float posX = j;
					float posY = k;
					float posZ = i*separacion;

					startTransform.setOrigin(btVector3(btScalar(posX), btScalar(posY), btScalar(posZ)));

					btDefaultMotionState* fallMotionState = new btDefaultMotionState(startTransform);
					btRigidBody::btRigidBodyConstructionInfo fallRigidBodyCI(1.0, fallMotionState, boxShape1, fallInertia);

					escalaCajas[count][0] = 1.0;
					escalaCajas[count][1] = 1.0;
					escalaCajas[count][2] = 1.0;
					cajasRB[count] = new btRigidBody(fallRigidBodyCI);
					cajasRB[count]->setFriction(btScalar(1.0));
					dynamicsWorld->addRigidBody(cajasRB[count]);
					count++;
				}//k
			}//j


		}
		else { // piso impar

			float posZ = i*separacion;
			startTransform.setOrigin(btVector3(btScalar(3.5), btScalar(3.5), btScalar(posZ)));

			btDefaultMotionState* fallMotionState = new btDefaultMotionState(startTransform);
			btRigidBody::btRigidBodyConstructionInfo fallRigidBodyCI(64.0, fallMotionState, boxShape2, fallInertia);

			escalaCajas[count][0] = 8.0;
			escalaCajas[count][1] = 8.0;
			escalaCajas[count][2] = 1.0;

			cajasRB[count] = new btRigidBody(fallRigidBodyCI);
			cajasRB[count]->setFriction(btScalar(1.0));
			cajasRB[count]->setRestitution(btScalar(0.0));
			
			dynamicsWorld->addRigidBody(cajasRB[count]);
			count++;


		}

	}// i

	totalCajas = count;


	//printf("cantidad cajas %i\n", count);

}


void buildTower2(float anchoColumnas=1.0){



	btCollisionShape* boxShape1 = new  btBoxShape(btVector3(anchoColumnas / 2, anchoColumnas / 2, 1.0));// OJO poner la mitad de cada escala  w/2 h/2 l/2
	btCollisionShape* boxShapeLosa = new  btBoxShape(btVector3(5.0, 5.0, 0.25));


	btVector3 fallInertia(0, 0, 0);
	boxShape1->calculateLocalInertia(btScalar(1.0), fallInertia);
	boxShapeLosa->calculateLocalInertia(btScalar(30), fallInertia);

	btTransform startTransform;
	startTransform.setIdentity();

	float separacion = 1.02f;

	int count = 0;
	float posZ = 0.0;
	for (int i = 1; i < 20; i++){

		
		if (i % 2 != 0){ // piso par
			printf("piso par %i , altura Z= %f\n", i,posZ);
			for (int j = 0; j < 3; j++){
				for (int k = 0; k < 3; k++){
					float posX = j*3;
					float posY = k*3;
					

					startTransform.setOrigin(btVector3(btScalar(posX), btScalar(posY), btScalar(posZ+1.0)));

					btDefaultMotionState* fallMotionState = new btDefaultMotionState(startTransform);
					btRigidBody::btRigidBodyConstructionInfo fallRigidBodyCI(1.0, fallMotionState, boxShape1, fallInertia);

					escalaCajas[count][0] = anchoColumnas;
					escalaCajas[count][1] = anchoColumnas;
					escalaCajas[count][2] = 2.0;
					cajasRB[count] = new btRigidBody(fallRigidBodyCI);
					cajasRB[count]->setFriction(btScalar(1.0));
					dynamicsWorld->addRigidBody(cajasRB[count]);
					count++;
				}//k
			}//j

			posZ += 2.0;
		}
		else { // piso impar
			printf("piso impar %i , altura Z= %f\n", i, posZ);
			// cada piso mide 0.5

			startTransform.setOrigin(btVector3(btScalar(3.0), btScalar(3.0), btScalar(posZ+0.5)));

			btDefaultMotionState* fallMotionState = new btDefaultMotionState(startTransform);
			btRigidBody::btRigidBodyConstructionInfo fallRigidBodyCI(64.0, fallMotionState, boxShapeLosa, fallInertia);

			escalaCajas[count][0] = 10.0;
			escalaCajas[count][1] = 10.0;
			escalaCajas[count][2] = .5;

			cajasRB[count] = new btRigidBody(fallRigidBodyCI);
			cajasRB[count]->setFriction(btScalar(1.0));
			cajasRB[count]->setRestitution(btScalar(0.0));

			dynamicsWorld->addRigidBody(cajasRB[count]);
			count++;

			posZ += .5;
		}

	}// i

	totalCajas = count;


	printf("cantidad cajas %i\n", count);

}



void buildTower3(){



	btCollisionShape* boxShape1 = new  btBoxShape(btVector3(1.0,1.0, 1.0));// OJO poner la mitad de cada escala  w/2 h/2 l/2
	


	btVector3 fallInertia(0, 0, 0);
	boxShape1->calculateLocalInertia(btScalar(1.0), fallInertia);
	

	btTransform startTransform;
	startTransform.setIdentity();

	float separacion = 1.1f;

	int count = 0;
	float posZ = 0.0;

	/*
	pickConstraint = new btPoint2PointConstraint(*pickedBody, localPivot);
	pickedBody->setActivationState(DISABLE_DEACTIVATION);
	dynamicsWorld->addConstraint(pickConstraint, true);

	btPoint2PointConstraint(btRigidBody& rbA, btRigidBody& rbB, const btVector3& pivotInA, const btVector3& pivotInB);
	*/

	for (int j = 0; j < 5; j++){
		for (int k = 0; k < 5; k++){
			posZ = 0.0;
			for (int i = 1; i <= 20; i++){
		
			
			
					float posX = (j-3) * 3.0;
					float posY = (k-3) * 3.0;
					
					startTransform.setOrigin(btVector3(btScalar(posX), btScalar(posY), btScalar(posZ + 1.0)));

					btDefaultMotionState* fallMotionState = new btDefaultMotionState(startTransform);
					btRigidBody::btRigidBodyConstructionInfo fallRigidBodyCI(1.0, fallMotionState, boxShape1, fallInertia);

					escalaCajas[count][0] = 2.0;
					escalaCajas[count][1] = 2.0;
					escalaCajas[count][2] = 2.0;
					cajasRB[count] = new btRigidBody(fallRigidBodyCI);
					cajasRB[count]->setFriction(btScalar(10.0));
					dynamicsWorld->addRigidBody(cajasRB[count]);
					
					
					if (i >1){
						btPoint2PointConstraint* constraint = new btPoint2PointConstraint(*cajasRB[count], *cajasRB[count - 1], btVector3(0, 0, -1.0), btVector3(0, 0, 1.0));
						dynamicsWorld->addConstraint(constraint);
						constraint->setBreakingImpulseThreshold(btScalar(10.0));
					}
					
					count++;
					

				posZ += 2.0;
			
			}// i

		}//k
	}//j


	totalCajas = count;


	printf("cantidad cajas %i\n", count);

}


void buildTower4(){

	
	float anchoColumnas = 2.0;
	float altoColumnas = 2.0;

	float anchoVentana = 4.6;
	float altoVentana = 2.0;
	float espesorVentana = 0.3;

	float anchoLosa = 15.0;
	float altoLosa = 0.5;

	float paddingColumnas =1.5;

	int maxLosas = 25;
	int cantColumnaPorLado = 3;


	float separacion = 0.05f;

	int count = 0;
	float posZ = 0.0;
	int indLosaInferior = -1;
	int indLosaSuperior = 0;

	float masaColumna = 1;
	float masaLosa = 10;
	float masaVentana = 0.05;

	btCollisionShape* boxColumna = new  btBoxShape(btVector3(anchoColumnas / 2, anchoColumnas / 2, altoColumnas/2));
	btCollisionShape* boxVentana = new  btBoxShape(btVector3(anchoVentana / 2, espesorVentana / 2, altoVentana/2));
	btCollisionShape* boxLosa = new  btBoxShape(btVector3(anchoLosa/2, anchoLosa/2, altoLosa/2));


	btVector3 columnaInertia(0, 0, 0);
	btVector3 ventanaInertia(0, 0, 0);
	btVector3 losaInertia(0, 0, 0);

	boxColumna->calculateLocalInertia(btScalar(masaColumna), columnaInertia);
	boxVentana->calculateLocalInertia(btScalar(masaVentana), ventanaInertia);
	boxLosa->calculateLocalInertia(btScalar(masaLosa), losaInertia);

	btTransform startTransform;
	startTransform.setIdentity();




	startTransform.setOrigin(btVector3(btScalar(0.0), btScalar(0.0), btScalar(posZ +  altoLosa / 2)));

	btDefaultMotionState* fallMotionState = new btDefaultMotionState(startTransform);
	btRigidBody::btRigidBodyConstructionInfo fallRigidBodyCI(masaLosa, fallMotionState, boxLosa, losaInertia);

	escalaCajas[count][0] = anchoLosa;
	escalaCajas[count][1] = anchoLosa;
	escalaCajas[count][2] = altoLosa;

	cajasRB[count] = new btRigidBody(fallRigidBodyCI);
	cajasRB[count]->setFriction(btScalar(1.0));
	cajasRB[count]->setRestitution(btScalar(0.0));

	dynamicsWorld->addRigidBody(cajasRB[count]);
	indLosaInferior = count;
	
	
	count++;
	posZ += altoLosa;
	float breakVentanas = 0.1;
	float breakingThreshold = 10;
	

	for (int nivel = 1; nivel <=maxLosas; nivel++){
		float f1 = (1 + (maxLosas - nivel) / maxLosas);
		// construyo la losa superior
		
		startTransform.setIdentity();
		startTransform.setOrigin(btVector3(btScalar(0.0), btScalar(0.0), btScalar(posZ + altoColumnas+ altoLosa / 2)));
		

		btDefaultMotionState* fallMotionState = new btDefaultMotionState(startTransform);
		btRigidBody::btRigidBodyConstructionInfo fallRigidBodyCI(masaLosa, fallMotionState, boxLosa, losaInertia);

		escalaCajas[count][0] = anchoLosa;
		escalaCajas[count][1] = anchoLosa;
		escalaCajas[count][2] = altoLosa;

		cajasRB[count] = new btRigidBody(fallRigidBodyCI);
		cajasRB[count]->setFriction(btScalar(1.0));
		cajasRB[count]->setRestitution(btScalar(0.0));
		//cajasRB[count]->setDamping(btScalar(0.1), btScalar(0.1));

		cajasRB[count]->forceActivationState(0);

		dynamicsWorld->addRigidBody(cajasRB[count]);
		indLosaSuperior = count;

		
		printf("contruir losa nivel %i  id: %i  indLosaSuperior %i pozZ %f\n", nivel, count,indLosaSuperior,posZ);
		count++;

		// construyo las columnas
		
		int h=floor(cantColumnaPorLado / 2);
		
		
		for (int j = -h; j <= h; j++){
			for (int k = -h; k <= h; k++){

				float posX = ((anchoLosa / 2) - paddingColumnas - anchoColumnas/2)*j;
				float posY = ((anchoLosa / 2) - paddingColumnas - anchoColumnas / 2)*k;

				printf("   contruir columna j: %i k: %i  en nivel %i  id: %i posZ:%f\n", j, k, nivel ,count,posZ);

				startTransform.setOrigin(btVector3(btScalar(posX), btScalar(posY), btScalar(posZ + altoColumnas/2)));

				btDefaultMotionState* fallMotionState = new btDefaultMotionState(startTransform);
				btRigidBody::btRigidBodyConstructionInfo fallRigidBodyCI(masaColumna, fallMotionState, boxColumna, columnaInertia);

				escalaCajas[count][0] = anchoColumnas;
				escalaCajas[count][1] = anchoColumnas;
				escalaCajas[count][2] = altoColumnas;

				cajasRB[count] = new btRigidBody(fallRigidBodyCI);
				cajasRB[count]->setFriction(btScalar(1.0));
				cajasRB[count]->setRestitution(btScalar(0.0));
				cajasRB[count]->setDamping(btScalar(0.1), btScalar(0.1));
				dynamicsWorld->addRigidBody(cajasRB[count]);
					
				

				btPoint2PointConstraint* constraint = new btPoint2PointConstraint(*cajasRB[count], *cajasRB[indLosaSuperior],
				btVector3(0, 0, altoColumnas / 2.0), btVector3(posX, posY, -altoLosa / 2.0));
				dynamicsWorld->addConstraint(constraint);
				constraint->setBreakingImpulseThreshold(btScalar(breakingThreshold));
				
				
				if (indLosaInferior >-1){
																						// bodyA       bodyB         pointOnA                 pointOnB
					btPoint2PointConstraint* constraint = new btPoint2PointConstraint(*cajasRB[count], *cajasRB[indLosaInferior],
					btVector3(0.0f, 0.0f, -altoColumnas / 2.0f), btVector3(posX, posY, altoLosa / 2.0f));
					dynamicsWorld->addConstraint(constraint);
					constraint->setBreakingImpulseThreshold(btScalar(breakingThreshold));
					printf("unir losa id: %i con columna id:%i \n", indLosaInferior,count);						
					
				}

				count++;

			}//k
		}//j

		if (true){
			
			for (int k = -h; k <= h; k = k + h * 2){
				for (int j = -h; j <= h; j++){

					
					float posX = ((anchoLosa / 2) - espesorVentana / 2)*-k;
					float posY = ((anchoLosa / 2) - anchoVentana / 2 - espesorVentana)*j;// depliego ventanas en Y

					startTransform.setOrigin(btVector3(btScalar(posX), btScalar(posY), btScalar(posZ + altoVentana / 2)));


					btDefaultMotionState* fallMotionState = new btDefaultMotionState(startTransform);
					btRigidBody::btRigidBodyConstructionInfo fallRigidBodyCI(masaVentana, fallMotionState, boxColumna, ventanaInertia);

					escalaCajas[count][0] = anchoVentana;
					escalaCajas[count][1] = espesorVentana;
					escalaCajas[count][2] = altoVentana;

					cajasRB[count] = new btRigidBody(fallRigidBodyCI);
					cajasRB[count]->setFriction(btScalar(1.0));
					cajasRB[count]->setRestitution(btScalar(0.0));
					cajasRB[count]->setDamping(btScalar(0.1), btScalar(0.1));
					
					//cajasRB[count]->setMassProps(1.0, btVector3(0, 0, 0));
					//cajasRB[count]->updateInertiaTensor();

					dynamicsWorld->addRigidBody(cajasRB[count]);


					btPoint2PointConstraint* constraint = new btPoint2PointConstraint(*cajasRB[count], *cajasRB[indLosaSuperior],
																				     	btVector3(0, 0, altoVentana / 2.0), btVector3(posX, posY, -altoLosa / 2.0));
					dynamicsWorld->addConstraint(constraint);
					constraint->setBreakingImpulseThreshold(btScalar(breakVentanas));

					if (indLosaInferior >-1){
					
						btPoint2PointConstraint* constraint = new btPoint2PointConstraint(*cajasRB[count], *cajasRB[indLosaInferior],
							btVector3(0, 0, -altoVentana / 2.0), btVector3(posX, posY, altoLosa / 2.0));
						dynamicsWorld->addConstraint(constraint);
						constraint->setBreakingImpulseThreshold(btScalar(breakVentanas));
						

					}
					
					if (j > -h){ //si no es la primera ventana de la secuencia de 3, pongo un constraint lateral con la ventana vecina
						btPoint2PointConstraint* constraint = new btPoint2PointConstraint(*cajasRB[count], *cajasRB[count-1],
							btVector3(0,-anchoVentana / 2.0,0), btVector3(0,anchoVentana/2,0));
						dynamicsWorld->addConstraint(constraint);
						constraint->setBreakingImpulseThreshold(btScalar(breakVentanas));
					}
					
					count++;
				}
			}

			
			btTransform startTransform2;
			for (int j = -h; j <= h; j = j + 2){
				for (int k = -h; k <= h; k++){


					float posX = ((anchoLosa / 2) - anchoVentana / 2 - espesorVentana)*k;  // despliego las ventanas sobre el eje x
					float posY = ((anchoLosa / 2) - espesorVentana/ 2)*j;
					startTransform2.setIdentity();
					startTransform2.setOrigin(btVector3(btScalar(posX), btScalar(posY), btScalar(posZ + altoVentana / 2)));
					startTransform2.setRotation(btQuaternion(btScalar(0), btScalar(0), btScalar(PI / 2)));

					btDefaultMotionState* fallMotionState = new btDefaultMotionState(startTransform2);
					btRigidBody::btRigidBodyConstructionInfo fallRigidBodyCI(masaVentana, fallMotionState, boxColumna, ventanaInertia);

					escalaCajas[count][0] = anchoVentana;
					escalaCajas[count][1] = espesorVentana;
					escalaCajas[count][2] = altoVentana;

					cajasRB[count] = new btRigidBody(fallRigidBodyCI);
					cajasRB[count]->setFriction(btScalar(1.0));
					cajasRB[count]->setRestitution(btScalar(0.0));
					//cajasRB[count]->setMassProps(1.0, btVector3(0, 0, 0));
					//cajasRB[count]->updateInertiaTensor();
					dynamicsWorld->addRigidBody(cajasRB[count]);

					btPoint2PointConstraint* constraint = new btPoint2PointConstraint(*cajasRB[count], *cajasRB[indLosaSuperior],
						btVector3(0, 0, altoVentana / 2.0), btVector3(posX, posY, -altoLosa / 2.0));
					dynamicsWorld->addConstraint(constraint);
					constraint->setBreakingImpulseThreshold(btScalar(breakVentanas ));

					if (indLosaInferior >-1){

						btPoint2PointConstraint* constraint = new btPoint2PointConstraint(*cajasRB[count], *cajasRB[indLosaInferior],
							btVector3(0, 0, -altoVentana / 2.0), btVector3(posX, posY, altoLosa / 2.0));
						dynamicsWorld->addConstraint(constraint);
						constraint->setBreakingImpulseThreshold(btScalar(breakVentanas ));


					}
					
					if (k > -h){ //si no es la primera ventana de la secuencia de 3, pongo un constraint lateral con la ventana vecina
						btPoint2PointConstraint* constraint = new btPoint2PointConstraint(*cajasRB[count], *cajasRB[count - 1],
							btVector3(0,-anchoVentana / 2.0, 0), btVector3(0,anchoVentana / 2, 0));
						dynamicsWorld->addConstraint(constraint);
						constraint->setBreakingImpulseThreshold(btScalar(breakVentanas));
					}

					count++;
				}
			}


		}
		
		posZ += altoLosa + altoColumnas + separacion;
		indLosaInferior = indLosaSuperior;

	}// nivel
	

	totalCajas = count;


	printf("cantidad cajas %i\n", count);

}


void buildTower5(){


	float anchoColumnas = 2.0;
	float altoColumnas = 2.0;

	float anchoVentana = 4.6;
	float altoVentana = 2.0;
	float espesorVentana = 0.3;

	float anchoLosa = 5.0;
	float altoLosa = 0.5;

	float paddingColumnas = 1.5;

	int maxLosas = 25;
	int cantColumnaPorLado = 5;


	float separacion = 0.0f;

	int count = 0;
	float posZ = 0.0;
	int indLosaInferior = -1;
	int indLosaSuperior = 0;

	float masaColumna = 1;
	float masaLosa = 10;
	float masaVentana = 0.05;

	btCollisionShape* boxColumna = new  btBoxShape(btVector3(anchoColumnas / 2, anchoColumnas / 2, altoColumnas / 2));
	btCollisionShape* boxVentana = new  btBoxShape(btVector3(anchoVentana / 2, espesorVentana / 2, altoVentana / 2));
	btCollisionShape* boxLosa = new  btBoxShape(btVector3(anchoLosa / 2, anchoLosa / 2, altoLosa / 2));


	btVector3 columnaInertia(0, 0, 0);
	btVector3 ventanaInertia(0, 0, 0);
	btVector3 losaInertia(0, 0, 0);

	boxColumna->calculateLocalInertia(btScalar(masaColumna), columnaInertia);
	boxVentana->calculateLocalInertia(btScalar(masaVentana), ventanaInertia);
	boxLosa->calculateLocalInertia(btScalar(masaLosa), losaInertia);

	btTransform startTransform;
	startTransform.setIdentity();




	startTransform.setOrigin(btVector3(btScalar(0.0), btScalar(0.0), btScalar(posZ + altoLosa / 2)));

	btDefaultMotionState* fallMotionState = new btDefaultMotionState(startTransform);
	btRigidBody::btRigidBodyConstructionInfo fallRigidBodyCI(masaLosa, fallMotionState, boxLosa, losaInertia);

	escalaCajas[count][0] = anchoLosa;
	escalaCajas[count][1] = anchoLosa;
	escalaCajas[count][2] = altoLosa;

	cajasRB[count] = new btRigidBody(fallRigidBodyCI);
	cajasRB[count]->setFriction(btScalar(1.0));
	cajasRB[count]->setRestitution(btScalar(0.0));

	dynamicsWorld->addRigidBody(cajasRB[count]);
	indLosaInferior = count;


	count++;
	posZ += altoLosa;
	float breakVentanas = 0.1;
	float breakingThreshold = 100;


	for (int nivel = 1; nivel <= maxLosas; nivel++){

		// construyo las columnas

		int h = floor(cantColumnaPorLado / 2);
		float oldPosX=0;
		float oldPosY=0;
		float oldPosZ=0;

		for (int j = -h; j <= h; j++){
			for (int k = -h; k <= h; k++){

				float posX = anchoColumnas*j;
				float posY = anchoColumnas*k;
				float _posZ = posZ + altoColumnas / 2;

				printf("   contruir columna j: %i k: %i  en nivel %i  id: %i posZ:%f\n", j, k, nivel, count, _posZ);

				startTransform.setOrigin(btVector3(btScalar(posX), btScalar(posY), btScalar(_posZ)));

				btDefaultMotionState* fallMotionState = new btDefaultMotionState(startTransform);
				btRigidBody::btRigidBodyConstructionInfo fallRigidBodyCI(masaColumna, fallMotionState, boxColumna, columnaInertia);

				escalaCajas[count][0] = anchoColumnas;
				escalaCajas[count][1] = anchoColumnas;
				escalaCajas[count][2] = altoColumnas;

				cajasRB[count] = new btRigidBody(fallRigidBodyCI);
				cajasRB[count]->setFriction(btScalar(1.0));
				cajasRB[count]->setRestitution(btScalar(0.0));
				cajasRB[count]->setDamping(btScalar(0.1), btScalar(0.1));
				dynamicsWorld->addRigidBody(cajasRB[count]);



				btPoint2PointConstraint* constraint = new btPoint2PointConstraint(*cajasRB[count], *cajasRB[indLosaSuperior],
					btVector3(0, 0, altoColumnas / 2.0), btVector3(posX, posY, -altoLosa / 2.0));
				dynamicsWorld->addConstraint(constraint);
				constraint->setBreakingImpulseThreshold(btScalar(breakingThreshold));

				
				if (count >1){
					
					btPoint2PointConstraint* constraint = new btPoint2PointConstraint(*cajasRB[count], *cajasRB[count-1],
						btVector3(-(posX - oldPosX) / 2, -(posY - oldPosY) / 2, -(_posZ - oldPosZ) / 2), 
						btVector3((posX - oldPosX) / 2, (posY - oldPosY) / 2, (_posZ - oldPosZ) / 2));
					dynamicsWorld->addConstraint(constraint);
					constraint->setBreakingImpulseThreshold(btScalar(breakingThreshold));
					

				}
				oldPosX = posX;
				oldPosY = posY;
				oldPosZ = _posZ;
				count++;

			}//k
		}//j

		

		posZ +=  altoColumnas + separacion;
		indLosaInferior = indLosaSuperior;

	}// nivel


	totalCajas = count;


	printf("cantidad cajas %i\n", count);

}


void initPhysics()
{
	
	// Inicializacion del motor de fisica


	btBroadphaseInterface* broadphase = new btDbvtBroadphase();


	
	btDefaultCollisionConfiguration* collisionConfiguration = new btDefaultCollisionConfiguration();
	btCollisionDispatcher* dispatcher = new btCollisionDispatcher(collisionConfiguration);
	
	btSequentialImpulseConstraintSolver* solver = new btSequentialImpulseConstraintSolver;

			
	dynamicsWorld = new btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
	dynamicsWorld->setGravity(btVector3(0, 0, -10));
	
	// Definimos plano del suelo - Cuerpo rigido estatico (masa=0)

	btCollisionShape* groundShape = new btStaticPlaneShape(btVector3(0, 0, 1), 1);// parametros: normal {x,y,z} , espesor o altura

	btDefaultMotionState* groundMotionState = new btDefaultMotionState(btTransform(btQuaternion(0, 0, 0, 1), btVector3(0, 0, -1)));
	//los 2 vectores representan la orientacion (x,y,z,w) y traslacion (x,y,z) del objeto suelo,
	// traslacion es (0,-1,0) para compensar el espesor que es 1, asi el lado superior del piso queda en Y=0
	
	btRigidBody::btRigidBodyConstructionInfo groundRigidBodyCI(0, groundMotionState, groundShape, btVector3(0, 0, 0));
	btRigidBody* groundRigidBody = new btRigidBody(groundRigidBodyCI);
	groundRigidBody->setFriction(1.0);
	groundRigidBody->setRestitution(0.3);
	dynamicsWorld->addRigidBody(groundRigidBody);

	// Definicion de las cajas
	
	btCollisionShape* cajaShape = new  btBoxShape(btVector3(tamanioCaja / 2.0, tamanioCaja / 2.0, tamanioCaja / 2.0));
	// Las dimensiones del BoxShape se definen como la mitad del lado en (X,Y,Z) o distancia del centro al borde en cada coordenada
	btScalar mass = 1;
	btVector3 fallInertia(0, 0, 0);
	btTransform startTransform;
	


	//buildTower2(2.0);
	//buildTower3();
	buildTower4();
	//buildTower5();


	// Defino Esfera

	btCollisionShape* esferaShape = new  btSphereShape(radioEsfera);
	mass = 10.0;
	esferaShape->calculateLocalInertia(mass, fallInertia);

	startTransform.setIdentity();
	startTransform.setOrigin(btVector3(btScalar(posicionEsferaRB[0]), btScalar(posicionEsferaRB[1]), btScalar(posicionEsferaRB[2])));
	btDefaultMotionState* esferaMotionState = new btDefaultMotionState(startTransform);

	btRigidBody::btRigidBodyConstructionInfo fallRigidBodyCI2(mass, esferaMotionState, esferaShape, fallInertia);
	esferaRB = new btRigidBody(fallRigidBodyCI2);
	// lo defino  como Kinetic Rigid Body

	esferaRB->setCollisionFlags(esferaRB->getCollisionFlags() | btCollisionObject::CF_KINEMATIC_OBJECT);
	esferaRB->setActivationState(DISABLE_DEACTIVATION);

	dynamicsWorld->addRigidBody(esferaRB);


	// Defino Cubo

	btCollisionShape* cuboShape = new  btBoxShape(btVector3(3.0, 3.0, 3.0));
	mass = 10.0;
	
	cuboShape->calculateLocalInertia(mass, fallInertia);

	startTransform.setIdentity();
	startTransform.setOrigin(btVector3(btScalar(posicionCuboRB[0]), btScalar(posicionCuboRB[1]), btScalar(posicionCuboRB[2])));
	startTransform.setRotation(btQuaternion(btScalar(0), btScalar(0), btScalar(45)));
	btDefaultMotionState* cuboMotionState = new btDefaultMotionState(startTransform);

	btRigidBody::btRigidBodyConstructionInfo fallRigidBodyCI3(mass, cuboMotionState, cuboShape, fallInertia);
	cuboRB = new btRigidBody(fallRigidBodyCI3);
	cuboRB->setFriction(0.00);
	dynamicsWorld->addRigidBody(cuboRB);

	
}


void changeViewport(int w, int h)
{
	glViewport(0, 0, w, h);
}

void render()
{
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glutSwapBuffers();
}

int main(int argc, char**argv)
{
	glutInit(&argc, argv);

	glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGBA | GLUT_DEPTH);
	glutInitWindowSize(1200, 900);
	glutCreateWindow("Hello OpenGL");
	
	
	init();
	initPhysics();
	glutDisplayFunc(display);
	glutReshapeFunc(reshape);
	glutKeyboardFunc(keyboard);
	glutSpecialFunc(processSpecialKeys);
	glutIdleFunc(OnIdle);

	GLenum err = glewInit();
	if (GLEW_OK != err)
	{
		fprintf(stderr, "GLEW Error");
		return 1;
	}

	glutMainLoop();
	return 0;
}