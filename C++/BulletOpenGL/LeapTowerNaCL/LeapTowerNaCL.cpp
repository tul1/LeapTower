
#include <gl/glew.h>
#include <gl/freeglut.h>
#include <iostream>
#include <math.h>  
#include "btBulletDynamicsCommon.h"
#include "Simulator.h"
#include "Escena3D.h"
#include "json/json.h"
#include <fstream>
#include <cstdio>
#include <cstring>
#include "dataStructures.h"

using namespace std;

Escena3D* escena;
Simulator*  sim;

long frame = 0;



int pruebaJson1(){
	cout << "pruebaJson1 \r\n";


	// links sobre JSONCPP
	// http://garajeando.blogspot.com.ar/2011/06/we-are-using-json-javascript-object.html
	// https://www.binpress.com/tutorial/working-with-json-and-pnacl-using-jsoncpp/110
	// http://neverfriday.com/2013/07/26/learning-jsoncpp/
	// http://garajeando.blogspot.com.ar/2013/01/traverse-members-of-jsoncpps-jsonvalue_5.html
	// https://www.binpress.com/tutorial/working-with-json-and-pnacl-using-jsoncpp/110
	
	// levanto el File
	std::ifstream ifs("sample3.json");

	// lo convierto a String
	string jsonSample3=string((std::istreambuf_iterator<char>(ifs)),(std::istreambuf_iterator<char>()));

		// Let's parse it  
	Json::Value root;
	Json::Reader reader;
	bool parsedSuccess = reader.parse(jsonSample3,root,	false);

	if (!parsedSuccess)
	{
		// Report failures and their locations in the document.
		cout << "Failed to parse JSON" << endl
			<< reader.getFormattedErrorMessages()
			<< endl;
		return 1;
	}

	// Let's extract the array contained in the root object
	const Json::Value array = root["array"];

	// Iterate over sequence elements and  print its values
	for (unsigned int index = 0; index<array.size();
		++index)
	{
		cout << "Element "
			<< index
			<< " in array: "
			<< array[index].asString()
			<< endl;
	}




	const Json::Value many = root["many"];
	Json::Value::iterator it = many.begin();

	cout << "\r\n List of members:\r\n" << endl;
	for (Json::Value::iterator it = many.begin(); it != many.end(); ++it)
	{
		Json::Value key = it.key();
		Json::Value value = (*it);

		cout << "Key: " << key.toStyledString();
		cout << "Value: " << value.toStyledString();
	}
	

	
	// Lets extract the not array element 
	// contained in the root object and 
	// print its value
	const Json::Value notAnArray =
		root["not an array"];

	if (! notAnArray.isNull())	{
		cout << "Not an array: "
			<< notAnArray.asString()
			<< endl;
	}

	// If we want to print JSON is as easy as doing:
	cout << "\r\n Json Example pretty print: \r\n "
		<< endl << root.toStyledString()
		<< endl;
	
	return 0;


}



void display(void){
	if (!escena->pauseSimulation){


	 
	

		Json::Value root;
		Json::Value mPos;
		mPos.append(-20);
		mPos.append(20.0*sin(frame / 30.0));
		mPos.append(0);
		
		Json::Value mRot;
		mRot.append(0);
		mRot.append(0);
		mRot.append(0);


		root["_manoIzquierda"] = Json::Value("position");
		root["_manoIzquierda"] = Json::Value("rotation");
		

		root["manoIzquierda"]["position"] = mPos;
		root["manoIzquierda"]["rotation"] = mRot;

		sim->handleStep(root);
		
	}

	escena->updateTransforms(sim);
	escena->display(sim->execTime);

	frame++;
}

void onIdle(void){
	glutPostRedisplay();
}

void keyboard(unsigned char key, int x, int y){
	escena->keyboard(key,x,y);
}

void reshape(int w, int h){
	escena->reshape(w, h);
};


int main(int argc, char**argv)
{
	
	


	// https://github.com/open-source-parsers/jsoncpp/wiki
	//	https://github.com/open-source-parsers/jsoncpp
	// http://garajeando.blogspot.com.ar/2013/01/traverse-members-of-jsoncpps-jsonvalue_5.html
	// libreria JSONCPP
	

	std::ifstream ifs;
	if (argc > 1){
		cout << "abriendo: " << argv[1];
		ifs.open(argv[1]);
		//ifs.open("sampleDosPisos.json");
	}
	else{

		ifs.open("sampleUnCubo.json");
		
		//ifs.open("sampleUnCubo.json");

	}

	if (!ifs.is_open()) return 1; // no existe


		
	string sceneJson = string((std::istreambuf_iterator<char>(ifs)), (std::istreambuf_iterator<char>()));


	glutInit(&argc, argv);

	glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGBA | GLUT_DEPTH);
	glutInitWindowSize(1200, 900);
	glutCreateWindow("LeapTowerNaCL");



	Json::Value rootNode;
	Json::Reader reader;
	bool parsedSuccess = reader.parse(sceneJson, rootNode, false);

	if (!parsedSuccess)	{		
		fprintf(stderr, "JSON parsing error");
		system("pause");
	}




	sim = new Simulator();
	sim->createScene(rootNode);

	escena= new Escena3D(sim);	
	escena->loadScene(sceneJson);



	//system("pause");
	glutDisplayFunc(display);
	glutReshapeFunc(reshape);
	glutKeyboardFunc(keyboard);
	glutIdleFunc(onIdle);


	GLenum err = glewInit();
	if (GLEW_OK != err)
	{
		fprintf(stderr, "GLEW Error");
		return 1;
	}

	glutMainLoop();
	//	system("pause");
	return 0;
}