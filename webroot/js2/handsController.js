"use strict";

//var dimPisos=[4.75, 9.30, 13.80, 18.40, 22.95];


function HandsController(params){

	MultiMesh.call(this,"/models/","/maps/");

	var simularSensor=((params) && (params.hasOwnProperty("simularSensor"))) ? params.simularSensor :false;


	// eventos
	this.HANDS_UPDATED=0;
	this.NO_ACTIVITY_TIMEOUT=1;

	// constantes
	this.MODE_2D=0;
	this.MODE_3D=1;
	this.noActivityTimeOut=5*60*1000; // en milisegundos


	this._mode=0; // 2D o 3D
	this.maxHoveringTime=((params) && (params.hasOwnProperty("maxHoveringTime"))) ? params.maxHoveringTime :0.5*60;

	this.padMode=0;

	this.handYaw=0;
	this.handPitch=0;

	this._lastHandActivity=getCurrentTime();
	//this._handVisibleOnScreen=false;

    this._container=new THREE.Object3D();
	this._container.rotation.y=Math.PI/2;
	this._manoMesh=null;



	this._hitAreas=[];
	this._activeHitArea=null;

    this.addGeometry("mano.DAE");

	if (simularSensor) {
		var mouseIsPressed = false;

		$("#leapmotionPad").bind('mousemove', this.onMouseMoveOverPad.bind(this));
		//$("#leapmotionPad").bind('mousedown', this.onMouseDownOverPad.bind(this));
		//$("#leapmotionPad").bind('mouseup', this.onMouseUpOverPad.bind(this));
		$("#leapmotionPad").show();
	} else{
		$("#leapmotionPad").hide();
	}
	$("#handIcon").hide();

	this.startLoad();

	this._timerCheckNoActivity=setInterval(this.checkNoActivityTimeout.bind(this),15*1000);
}

inheritPrototype(HandsController, MultiMesh);


HandsController.prototype.setMode=function(num) {
	//this.log("setMode() "+num);
	this._mode=num;
	if (this._mode==this.MODE_2D) {
		this._container.visible=false;
	}
	else {
		this._container.visible=true;
		$("#handIcon").hide();
	}
};

HandsController.prototype.addHitArea=function(domElement,onHoverStart,onHoverEnd,onClick,margin) {

	if (!margin) margin=0;

	var ha={
		"domElement":domElement,
		"x":(domElement.offset().left-margin),"y":(domElement.offset().top-margin),"w":(domElement.width()+margin*4),"h":(domElement.height()+margin*4),
		"onHoverStart":onHoverStart,
		"onHoverEnd":onHoverEnd,
		"onClick":onClick,
		"hoveringTime":0
	};
	//this.log(ha.w+" "+ha.h+" margin"+margin);
	this._hitAreas.push(ha);
};

HandsController.prototype.removeHitAreas=function() {
	this._hitAreas=[];
}


HandsController.prototype.onAssetsLoaded=function(){


	if (typeof Leap != "undefined"){
		//this.log(" installing leapmotion update binding ...");
		Leap.loop(this.onLeapmotionUpdate.bind(this));
	} else{
		//this.log("no LEAPMOTION library linked ...");
	}

	var material=new THREE.MeshPhongMaterial({
		color: 0x996600,
		specular: 0xFFFFFF,
		shininess: 16,
		shading: THREE.SmoothShading

	});
	
	this._manoMesh= new THREE.Mesh( this.getGeometry("mano.DAE"), material );
	this._manoMesh.scale.set(2,2,2);
	this._manoMesh.rotation.y=Math.PI;
	this._container.add(this._manoMesh);

};



HandsController.prototype.onLeapmotionUpdate=function(frame) {

//	this.log(getCurrentTime());
	var hand2d=$("#handIcon");


	if (frame.hands.length > 0) {
		this._lastHandActivity=getCurrentTime();
		if (this._mode==this.MODE_3D){

			var hand = frame.hands[0];

			var x=hand.palmPosition[0]/3;
			var y=(hand.palmPosition[1]/3)-30;
			var z=hand.palmPosition[2]/3;

			var angX=hand.pitch()+Math.PI*0.9;
			var angY=-hand.roll();
			var angZ=hand.yaw();

			if (hand.type=="right") angY+=Math.PI;

			var r=Math.max(0,hand.sphereRadius);// da entre 15 y 80
			var ev={
				"type":this.HANDS_UPDATED,
				"posicion":[x,y,z],
				"rotacion":[angX,-angZ,angY],
				"radio":r
			};
			this._manoMesh.position.set(x,y,z);
			this._manoMesh.rotation.set(angX,angZ,angY);
			this.dispatchEvent(ev);

			this.handYaw=angZ;
			this.handPitch=hand.pitch();
			//this._handVisibleOnScreen=true;

		} else { // modo 2D

			if (frame.pointables.length > 0) {
				var touchZone = frame.pointables[0].touchZone;
				var pointable = frame.pointables[0];
				var interactionBox = frame.interactionBox;
				var normalizedPosition = interactionBox.normalizePoint(pointable.tipPosition, true);

				var x=normalizedPosition[0]*1880;
				var y=(1-normalizedPosition[1])*1000;

				if (hand2d.is(":hidden")) hand2d.show();

				hand2d.css("top",(y+"px"));
				hand2d.css("left",(x+"px"));

				if (this._hitAreas.length>0){
					var found=false;
					var i=0;
					//this.log("checking  hitareas total" +this._hitAreas.length);
					while((i<this._hitAreas.length) && (!found)){
						var ha=this._hitAreas[i];

						if ((x>ha.x) && (x<(ha.x+ha.w)) && (y>ha.y) &&(y<(ha.y+ha.h))){
							//this.log("check hit area" +i);

							if (this._activeHitArea==i){
								ha.hoveringTime++;
								//this.log(" hitArea "+i+"  Hovering"+ha.hoveringTime);
								if (ha.hoveringTime==this.maxHoveringTime){
									//this.log("click on hitArea:"+i);
									ha.onClick();
									$("#handIcon .progressBar").css("visibility","hidden");
								}
							} else { // no hay areas activas
								this._activeHitArea=i;
								ha.hoveringTime=0;
								if (ha.onHoverStart) ha.onHoverStart();
								//this.log(" hitArea "+i+" started Hovering");
							}
							var width=Math.min(100*ha.hoveringTime/this.maxHoveringTime,100);
							$("#handIcon .bar").css("width",width+"%");
							$("#handIcon .progressBar").css("visibility","visible");
							found=true;
						}
						i++;
					}

					if ((!found) && (this._activeHitArea!=null)){// hover End

						var ha=this._hitAreas[this._activeHitArea];
						if (ha.onHoverEnd) ha.onHoverEnd();
						ha.hoveringTime=0;
						$("#handIcon .progressBar").css("visibility","hidden");
						this._activeHitArea=null;
					}

				}
				//this._handVisibleOnScreen=true;
			}
		}


	} else {// no hay manos frente al sensor

		if (!hand2d.is(":hidden")) {
			hand2d.hide();
			//this._handVisibleOnScreen=false;

			if (this._activeHitArea!=null) {
				var ha = this._hitAreas[this._activeHitArea];
				if (ha.onHoverEnd) ha.onHoverEnd();
				this._activeHitArea=null;
			}
		}
	};



};


HandsController.prototype.checkNoActivityTimeout=function(){


	if (this._lastHandActivity!=null){

		var lapso=(Math.abs(getCurrentTime()-this._lastHandActivity));
		this.log("checkNoActivityTimeout() lapso:" +(lapso/1000));

		if (lapso>this.noActivityTimeOut) {
			this._lastHandActivity = null;
			this.dispatchEvent({"type": this.NO_ACTIVITY_TIMEOUT});
		}

	};
}
HandsController.prototype.onMouseMoveOverPad=function(e){
	
	

	var pos=$("#leapmotionPad").position();
	var h=$("#leapmotionPad").height();
	var w=$("#leapmotionPad").width();
	var yMouse=(h-(e.pageY-pos.top));
	var xMouse=(e.pageX-pos.left);

	
//	var index = (4*xMouse/200)|0;
//	var anchoPiso = dimPisos[index];
	
	var x=0;
	var y=yMouse/2;
	var angulo=0;
	
	var radius=10;
	
	if (this.padMode==0){
		radius=Math.max(10,Math.min(5+xMouse/5,28));		
	} else if (this.padMode==1) {
		x=(xMouse-w/2);
	} else {
		angulo=(xMouse-w/2)/60;

	}
	
	$("#leapmotionPad .info").html("x: " + xMouse + ", y: " + yMouse +" <br> radio:"+radius+" y:"+y+"<br> angulo"+angulo+"<br> padMode:"+this.padMode);
	this._manoMesh.position.set(x,y,0);
//	manoMesh.scale.x = anchoPiso
//	manoMesh.scale.z = anchoPiso;
//	this._manoMesh.visible=true;
	
	//LEAPTOWER.torre.actualizarEstadoMano(new THREE.Vector3(0,y,0), anchoPiso);
	
	var ev={
		"type":this.HANDS_UPDATED,
		"posicion":[x,y,0],
		"rotacion":[0,angulo,0],
		"radio":radius
	}
		
	this.dispatchEvent(ev);


};


HandsController.prototype.log=function(msg){
	console.log(this.constructor.name+"."+msg);
};

addEventsHandlingFunctions(HandsController);




		
	