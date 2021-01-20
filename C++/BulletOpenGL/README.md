Referencias
-----------

	http://bulletphysics.org/

	Tutorial Hello World	http://bulletphysics.org/mediawiki-1.5.8/index.php/Hello_World


Como crear un Proyecto Visual C++ que incluya Bullet 2.8x
---------------------------------------------------------


	basado en http://bulletphysics.org/mediawiki-1.5.8/index.php/Creating_a_project_from_scratch
	
	Aclaraciones Importantes
	------------------------
	
	1) Paso de "Linkeo de BulletCollision Bullet Dynamics y LinearMath"
	Si se baja bullet 2.8x tener mucho cuidado al linkear los proyectos dependientes segun las instrucciones
	No confundir BulletCollision con Bullet3Collision y lo mismo con los otros 2.

	2) x32 o x64?
 	Compilar todo para win32. Si se compilan los .lib de bullet en x64 y el proyecto es x32 va a fallar.
	Tambien tener cuidado con el parametro que esta en properties, c/C++ , Code Generation / Runtime Library
	debe ser igual tanto en el proyecto como en las dependencias (Bullet Collision, Dynamics y LinearMath)

	
	3) Seguir paso a paso el tutorial, omitiendo el primer paso que habla de Cmake porque ya viene un vs2010.bat 
	en bullet que arma las Solutions (.sln.)

		basicamente lo que explica es que hay que incluir

		en c/c++, additional directories la carpeta  ../bullet3/src
		y linkear nuestro project a los proyectos bulletDynamics bulletCollisions y LinearMath


	4) References: OJO con el ultimo paso que es fundamental:

		Visual Studio 2010: the above does not apply, use referencing instead. Go to your project's property pages.
		In the left panel, select Common Properties->Framework and References. Hit the Add New Reference button a 
		few times and add all the bullet libraries you need (in this case, at least BulletCollision, BulletDynamics 
		and LinearMath). When you get the error The project file has been moved renamed or not on your computer, 
		check the References for the newly added project. Removes references to 'ZERO_CHECK'.


	


	5) Incluir las librerias Freeglut y Glew32
	
	  agregar \packages\nupengl.core.0.0.0.1\build\native\include 			en properties, c\c++ , general, aditional include directories,
	  agregar \packages\nupengl.core.0.0.0.1\build\native\lib\Win32\v120  	en properties, Linker, general,
	  agregar glew32.lib;freeglut.lib; 										en properties, Linker , input
	
	sino ver acá, (usan otra version de freeglut y glew32)
	
	-http://in2gpu.com/2014/10/15/setting-up-opengl-with-visual-studio/	
	
	-http://in2gpu.com/2014/10/17/creating-opengl-window/
	
	-http://aschultz.us/blog/archives/176

	
	-


	6) en el proyecto leaptowernacl, en configuration properties/debugging/command arguments/ se setea el archivo json que se pasa como 	parametro al simulador al iniciar