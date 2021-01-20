/**
 * Created by fede on 15/10/2015.
 */


function UiManager(){

	// eventos

	this.INICIAR_FASE_1=0;

	this.INICIAR_FASE_2=1;

	this.INICIAR_FASE_3=2;

	this.INICIAR_FASE_4=3;

	this._displayStatusTorre=$("#displayStatusTorre");
	this._fondo=$( "#viewport2D .fondo" );

	this._faseActual=1;

	this.topPanel=$("#topPanel");

	this._displayStatusTorre.hide();
	this._velocidadViento=0;
	this._tiempo=0;
	this._tiempoInicio=0;

	this.saltarInstrucciones=false;

	this._actualizarTopPanel=function(){

		var n = getCurrentTime();
		var segundos=Math.floor((n-this._tiempoInicio)/1000);

		this.topPanel.html("Viento: "+this._velocidadViento+" km/h  &nbsp; &nbsp;&nbsp; Tiempo: "+segundos);
	};

	this.actualizarDisplayTorre=function(pisos,mostrarColores){

		var color="";
		if (mostrarColores){			
			if (pisos<9) color="rojo";
			else if (pisos<15) color="amarillo";
			else color="verde";
		}
		
	
		for (var i=1;i<=20;i++){

			
	


			var li=$("#displayStatusTorre li.p"+i);				
			li.attr("class","p"+i+" "+color);
			
			if (i<=pisos)
				li.css("visibility","visible");
			else 
				li.css("visibility","hidden");
		}
		
		$("#displayStatusTorre .pisosCounter").html(pisos);	
	}



	this.setVelocidadViento=function(vel){
		this._velocidadViento=vel;

	};

	this.ocultarModales=function() {
		$("#viewport2D .modal").hide()
	};

	this.mostrarModal=function(modalId){

		//var _delay=delay ? delay : 0;

		$("#viewport2D .modal").hide();

		$("#viewport2D #"+modalId).css("display","inline-block");
		$("#viewport2D #"+modalId).hide();
		$("#viewport2D #"+modalId).fadeIn(1000);


	};

	/*
		Fase 1: Mostrar Instrucciones de construccion
		Fase 2: fase de construccion de la torre
		Fase 3: Mostrar Instrucciones de Juego
		Fase 4: Fase de Juego

	 */

	this.iniciarFase1=function(){
		this._faseActual=1;
		this.log("iniciarFase1");

		if (this.saltarInstrucciones) 	{
			this.iniciarFase2();
		} else {

			this._fondo.css("opacity", 1.0);
			this._fondo.animate({opacity: 0.5}, 2000, this.terminarDeIniciarFase1.bind(this));
			this.dispatchEvent({"type": this.INICIAR_FASE_1});
		}
	}

	this.terminarDeIniciarFase1=function(){
		setTimeout( this._mostrarInstruccionesFase1.bind(this),3500);	
	}
	
	this._mostrarInstruccionesFase1=function(){
		this.mostrarModal("modalInstruccionesFase1");
		if (LT.handsController){
			LT.handsController.setMode(LT.handsController.MODE_2D);
			LT.handsController.removeHitAreas();

			var domNode=$("#modalInstruccionesFase1 button");
			LT.handsController.addHitArea(domNode,
				function(){
					$("#modalInstruccionesFase1 button").addClass("hover");
				},
				function(){
					$("#modalInstruccionesFase1 button").removeClass("hover");
				},
				this.iniciarFase2.bind(this),30
			);

		}
	}

	this.iniciarFase2=function(){
		this._faseActual=2;

		this.ocultarModales();

		this._fondo.css("opacity",0.0);
		this._fondo.hide();

		this.dispatchEvent({"type":this.INICIAR_FASE_2});

		if (LT.handsController) LT.handsController.setMode(LT.handsController.MODE_3D);
	};


	this.terminarFase2=function(){


		this._fondo.show();
		this._fondo.css("opacity",0.0);
		this._fondo.animate({opacity: 1.0}, 500).animate({opacity: 0.0},500,function(){
			this.mostrarModal("modalFinFase2");

			if (LT.handsController){
				LT.handsController.setMode(LT.handsController.MODE_2D);
				LT.handsController.removeHitAreas();

				var domNode=$("#modalFinFase2 button");
				LT.handsController.addHitArea(domNode,
					function(){
						$("#modalFinFase2 button").addClass("hover");
					},
					function(){
						$("#modalFinFase2 button").removeClass("hover");
					},
					this.iniciarFase3.bind(this),30
				);

			}

		}.bind(this));


	};

	this.iniciarFase3=function(){
		this._faseActual=3;
		this.dispatchEvent({"type":this.INICIAR_FASE_3});
		if (this.saltarInstrucciones) 	{
			this.iniciarFase4();
		} else {

			this._fondo.show();
			this._fondo.css("opacity", 0.5);

			this.mostrarModal("modalInstruccionesFase3");

			if (LT.handsController) {
				LT.handsController.setMode(LT.handsController.MODE_2D);
				LT.handsController.removeHitAreas();

				var domNode = $("#modalInstruccionesFase3 button");
				LT.handsController.addHitArea(domNode,
					function () {
						$("#modalInstruccionesFase3 button").addClass("hover");
					},
					function () {
						$("#modalInstruccionesFase3 button").removeClass("hover");
					},
					this.iniciarFase4.bind(this), 30
				);

			}
		}
	};

	this.iniciarFase4=function(){ // fase de juego
		this._faseActual=4;
		//this.log("iniciarFase4");
		this.ocultarModales();


		var d = new Date();
		var n = d.getTime();
		this._tiempoInicio=n;


		this._fondo.css("opacity",0.0);
		this._fondo.hide();
		this._displayStatusTorre.show();

		if (LT.simulador){
			var porcentajeEnPie=Math.floor(LT.simulador.maxYValue/LT.torre.ALTURA_DE_PISO);
		}


		if (LT.handsController) LT.handsController.setMode(LT.handsController.MODE_3D);
		this.dispatchEvent({"type":this.INICIAR_FASE_4});
	};



	this.iniciarFase5=function(){
		this._faseActual=5;
		//this._fondo.show();
		//this._fondo.css("opacity",0.5);
		//LT.simulador.pausarSimulacion=true;
		this.mostrarModal("modalGameOver");
		
		var tiempoFin = getCurrentTime();
		var misSegundos = Math.floor((tiempoFin-this._tiempoInicio)/1000);
		var newRecord = false;
		
		if(!localStorage.recordTiempo){
			localStorage.recordTiempo = misSegundos;
			newRecord = true;
		}
		
		
		if(Number(localStorage.recordTiempo) < misSegundos)
		{
			localStorage.recordTiempo = misSegundos;
			newRecord = true;
		}



		if (LT.handsController){
			LT.handsController.setMode(LT.handsController.MODE_2D);
			LT.handsController.removeHitAreas();

			var domNode=$("#modalGameOver button");
			LT.handsController.addHitArea(domNode,
				function(){
					$("#modalGameOver button").addClass("hover");
				},
				function(){
					$("#modalGameOver button").removeClass("hover");
				},
				function(){
					window.location = "home.html";
				},30
			);

		}
		
		if(newRecord == true)
			$("#mensajeGameOver").html('<h2>Superaste el tiempo record !!!</h2> <h3>Tu tiempo fue de: ' 
			+ misSegundos+" segundos </h3>");
		else
			$("#mensajeGameOver").html("<h3>Tu tiempo fue de: " + misSegundos+" segundos</h3> <h3> El record actual es de: "+localStorage.recordTiempo+" segundos</h3>");
		


	};

	this.hideUi=function(){
		$("#viewport2D").hide();
	}

	this.log=function(msg) {
		console.log(this.constructor.name+"."+msg);
	}

	this.onEnterFrame=function(){
		if (this._faseActual==4){
			this._actualizarTopPanel();
		}
	}
}


addEventsHandlingFunctions(UiManager);