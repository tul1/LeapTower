
#include <gl/glew.h>
#include <gl/freeglut.h>
#include <iostream>

#include "btBulletDynamicsCommon.h"
using namespace std;




// Variables que controlan la ubicación de la cámara en la Escena 3D
float eye[3] = { 0.0, 0.0, 0.0 };
float at[3] = { 0.0, 0.0, 5.0 };
float up[3] = { 0.0, 0.0, 1.0 };

// Variables asociadas a la fuente de luz de la escena
float light_color[4] = { 2.0f, 2.0f, 2.0f, 1.0f };
float light_color2[4] = { 0.3f, 0.3f, 2.0f, 1.0f };
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

float anguloCam = 225 * 6.28 / 360;
float alturaCam = 10;
float distanciaCam = 15;

bool detenerEsfera = false;
// Fisica

// Cajas
#define totalCajas 100
float tamanioCaja = 1;
GLfloat colorCaja[3] = { 1.0, 0.5, 0.0 };
btRigidBody* cajasRB[totalCajas];

// Esfera

float radioEsfera = 2;
float posicionEsferaRB[3] = { 0.0, 50.0, 3.0 }; // Y=2 es el centro de la esfera
float velocidadEsferaRB[3] = { 0.0, -0.05, 0.0 };

GLfloat colorEsfera[3] = { 0.0, 0.5, 1.0 };
btRigidBody* esferaRB;

// Cubo
btRigidBody* cuboRB;
float fuerzaCubo = 0;
float posicionCuboRB[3] = { 5.0, 0.0, 10.0 };
GLfloat colorCubo[3] = { 1.0, 1.0, 1.0 };

btDiscreteDynamicsWorld* dynamicsWorld;











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
	GLfloat whiteSpecularMaterial[] = { 1.0, 1.0, 1.0 };
	GLfloat mShininess[] = { 128 };

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
	dl_handle = glGenLists(3);

	glClearColor(0.02, 0.02, 0.04, 0.0);
	glShadeModel(GL_SMOOTH);
	glEnable(GL_DEPTH_TEST);

	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();

	float pos[4] = { 200.0f, 0.0f, 0.0f ,1.0f};

	glLightfv(GL_LIGHT0, GL_DIFFUSE, light_color);
	glLightfv(GL_LIGHT0, GL_AMBIENT, light_ambient);
	//glLightfv(GL_LIGHT0, GL_POSITION, pos);
	glEnable(GL_LIGHT0);
	
	float pos2[3] = { -150.0f, 150.0f, 50.0f };

	glLightfv(GL_LIGHT1, GL_DIFFUSE, light_color2);
	glLightfv(GL_LIGHT1, GL_AMBIENT, light_ambient);
	//glLightfv(GL_LIGHT1, GL_POSITION, pos2);
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
	cuboRB->applyCentralForce(btVector3(btScalar(fuerzaCubo), btScalar(0), btScalar(0)));
	


}




void OnIdle(void)
{
	// ejecutamos un paso de la simulacion
	actualizarEstadoEscena();

	dynamicsWorld->stepSimulation(1 / 300.f, 10);
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

		drawCube(colorCaja, tamanioCaja, tamanioCaja, tamanioCaja);
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

	drawCube(colorCubo, 2, 2, 2);


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
	float eyeX = distanciaCam*sin(anguloCam);
	float eyeY = distanciaCam*cos(anguloCam);
	gluLookAt(eyeX, eyeY, alturaCam, at[0], at[1], at[2], up[0], up[1], up[2]);


	float pos[4] = { 100.0f, -150.0f, 200.0f, 1.0f };
	glLightfv(GL_LIGHT0, GL_POSITION, pos);

	float pos2[4] = { -100.0f, 150.0f, 200.0f,1.0f };
	glLightfv(GL_LIGHT1, GL_POSITION, pos2);
	



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

void keyboard(unsigned char key, int x, int y)
{
	switch (key) {
	case 0x1b:
		exit(0);
		break;


	case 'a':  anguloCam += 0.2;  break;
	case 'd':  anguloCam += -0.2;  break;
	case 'w':  alturaCam += 1.0;  break;
	case 's':  alturaCam += -1.0;  break;


	case 'e':  detenerEsfera = !detenerEsfera;  break;



	case '-':  fuerzaCubo += 25.0;  printf("fuerza= %f\n", float(fuerzaCubo)); break;
	case '+':  fuerzaCubo -= 25.0;  printf("fuerza= %f\n", float(fuerzaCubo)); break;

	case 'x':
		break;
	default:
		break;
	}
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
	dynamicsWorld->addRigidBody(groundRigidBody);

	// Definicion de las cajas

	btCollisionShape* cajaShape = new  btBoxShape(btVector3(tamanioCaja / 2.0, tamanioCaja / 2.0, tamanioCaja / 2.0));
	// Las dimensiones del BoxShape se definen como la mitad del lado en (X,Y,Z) o distancia del centro al borde en cada coordenada
	btScalar mass = 1;
	btVector3 fallInertia(0, 0, 0);
	cajaShape->calculateLocalInertia(mass, fallInertia);

	btTransform startTransform;
	startTransform.setIdentity();
	
	int cantRows = 4;
	int cantCols = 4;
	float separacion = 0.05f;

	int col = 0;	int row = 0;	int altura = 0;

	for (int k = 0; k<totalCajas; k++){



		// defino la posicion inicial de la caja
		float posX = ((col - cantCols / 2)*(tamanioCaja + separacion));
		float posY = (row - cantRows / 2)*(tamanioCaja + separacion);
		float posZ = altura*(tamanioCaja + separacion);

		// aplico transformacion inicial
		startTransform.setOrigin(btVector3(btScalar(posX), btScalar(posY), btScalar(posZ)));

		btDefaultMotionState* fallMotionState = new btDefaultMotionState(startTransform);
		btRigidBody::btRigidBodyConstructionInfo fallRigidBodyCI(mass, fallMotionState, cajaShape, fallInertia);

		cajasRB[k] = new btRigidBody(fallRigidBodyCI);// creo el cuerpo rigido

		cajasRB[k]->setFriction(btScalar(0.1)); // defino factor de friccion
		dynamicsWorld->addRigidBody(cajasRB[k]); // agrego la caja a la simulacion

		col++;
		if (col>cantCols - 1)	{ col = 0; row++; }
		if (row>cantRows - 1)   { row = 0; col = 0; altura++; }
	}
	// Defino Esfera

	btCollisionShape* esferaShape = new  btSphereShape(radioEsfera);
	mass = 10;
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

	btCollisionShape* cuboShape = new  btBoxShape(btVector3(1.0, 1.0, 1.0));
	mass = 10;
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
	glutInitWindowSize(800, 600);
	glutCreateWindow("Hello OpenGL");
	
	
	init();
	initPhysics();
	glutDisplayFunc(display);
	glutReshapeFunc(reshape);
	glutKeyboardFunc(keyboard);
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