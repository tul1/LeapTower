"use strict";


function GameManager()
{
}

function onClickPlayPause()
{
	LT.simulador.pausarSimulacion=!LT.simulador.pausarSimulacion;
}


GameManager.prototype.iniciarJuego=function() 
{
	console.log("*** iniciarJuego");

	LT.viewport3D=new Viewport3D();

	var escenario=new Escenario();
	//escenario._obj3D.rotation.y=-Math.PI/2;
	escenario.startLoad();
	escenario._container.scale.set(2,2,2);
	LT.viewport3D.escena.add(escenario._container);
	LT.escenario=escenario;

	// *** Hands Controller
	var handsController=new HandsController({simularSensor:false});
	handsController.startLoad();
	handsController.setMode(handsController.MODE_2D);
	LT.viewport3D.escena.add(handsController._container);
	LT.handsController=handsController;

	// **** Torre
	//var torre=new TorreTadao();
	//var torre=new TorreBasica();
	var torre=new TorreCilindro();

	torre.addEventListener(torre.INIT_COMPLETE,function()
		{
			for (var i=0;i<20;i++)
			{
			this.agregarPiso(0,100);
			}
			this.dispatchEvent({ type:this.INIT_TERMINADA });
		});


	torre.addEventListener(torre.TORRE_TERMINADA,function()
		{
		LT.uiManager.iniciarFase3();
		});
	torre.startLoad();

	LT.viewport3D.escena.add(torre._container);
	LT.torre=torre;


	// handsController ----> (Evento Hands UPDATE) ---->    Torre
	LT.handsController.addEventListener(LT.handsController.HANDS_UPDATED,LT.torre.onHandscontrollerUpdated.bind(LT.torre));
	LT.viewport3D.setModoCamara(LT.viewport3D.MODO_CAMARA_ANIMADA_ROTACION_MANO);

	var uiManager=new UiManager();
	uiManager.actualizarDisplayTorre(20,true);

	uiManager.addEventListener(uiManager.INICIAR_FASE_2, onFase2Iniciada);
	uiManager.addEventListener(uiManager.INICIAR_FASE_3, onFase3Iniciada);
	uiManager.addEventListener(uiManager.INICIAR_FASE_4, onFase4Iniciada);

	LT.uiManager=uiManager;
	common.domContentLoaded("NaClAMBullet", "pnacl", "/simulator", 0, 0);
}


