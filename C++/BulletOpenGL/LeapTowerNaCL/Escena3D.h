#ifndef ESCENA3D_H
#define ESCENA3D_H
#include <iostream>
#include <stdio.h>
#include <stdlib.h>
#include <map>
#include "json/json.h"
#include <gl/glew.h>
#include <gl/freeglut.h>
#include "dataStructures.h"

#include <cstring>
#include <cmath> 

using namespace std;

class Simulator;

class Escena3D
{
private:
	
	
	


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
	int frame;
	Simulator* sim;

	float eye[3];
	//float at[3];

	float anguloCam1 = 135;
	float anguloCam2 =20;
	float distanciaCam = 50;
	float targetCamY = 20.0;
	float fuerzaMisil = 50.0;

	float amplitudTerremoto = 0.1;

	float deltaFasePorFrame = 0.03;
	float direccionTerremoto[3];

	float anguloViento = 0;
	float intensidadViento = 0;
	
	int totalCrashers = 0;
	int currentCrasher = 0;

	// metodos privados

	void initOpenGL();
	void log(string msg);
	void drawGrid();
	void drawAxis();
	void drawCube(GLfloat color[3], GLfloat ladoY, GLfloat ladoX, GLfloat ladoZ);
	void drawCylinder(GLfloat color[3], GLfloat ladoY, GLfloat ladoX, GLfloat ladoZ);
	void drawSphere(GLfloat color[3], GLfloat radio);
	void setMaterial(GLfloat diffuseColor[3]);
	
	void dispararCrasher(int selectedCrasher);
	void selectCrasher(int index);
	
	void setEnv3D();
	void actualizarViento();
	
	void output(int x, int y, float r, float g, float b, int font, string st);
	

public:
	bool pauseSimulation = true;
	bool pauseTerremoto = true;
	map<string, objectData> listaObjetos3D;
	//map<string, objectData> listaCrashers;

	string* crashersIds;

	float misilPos[3];
	float misilRot[4];


	Escena3D::Escena3D(Simulator* simu);

	void loadScene(const string& description);
	void keyboard(unsigned char key, int x, int y);
	void updateTransforms(Simulator *sim);
	
	void display(double simExecTime);
	void reshape(int w, int h);
	void init(Simulator* simu);

	
};

#endif