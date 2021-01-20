



function Sismografo() {



    var domNode=$("#sismografo");
    var ctx=domNode[0].getContext("2d");


    this._currentX=0;
    this._last=0;
    this._stepX=2;

    this._lastPerlinY=0;
    this._lastPerlin2Y=0;
    this._lastHandY=0;

    this._currentPerlinY=0;
    this._currentPerlin2Y=0;
    this._currentHandY=150;

    this._perlinPos=0;
    this._perlinSpeed=0.01;
    this._perlinSpeedTarget=0.01;
    this._speedChangeCountDown=0;

    this._seed1=0.8+Math.random()*0.2;
    this._seed2=0.8+Math.random()*0.2;
    this._seed3=0.8+Math.random()*0.2;

    this.amplitud=0;


    this.init=function(){


        var c = document.getElementById("sismografo");
        var ctx = c.getContext("2d");

        ctx.strokeStyle="#FFFF00";
        ctx.beginPath();
        ctx.arc(95,50,40,0,2*Math.PI);
        ctx.stroke();



        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0,0,150,75);

        ctx.clearRect(0,0,2000,500);

    }

    this.update=function(){



            this._currentPerlinY = PerlinNoise.noise( this._perlinPos,this._perlinPos*this._seed1,this._perlinPos*this._seed1)*300;

            var ruidoAdicional=-30+PerlinNoise.noise( this._perlinPos*100,this._seed3,this._seed1)*60;

            this._currentPerlin2Y=this._currentPerlinY+ruidoAdicional;

            var amplitud=Math.floor(Math.abs(this._currentHandY-this._currentPerlinY));

            if (this._currentX>10) {
				ctx.lineWidth=4;
                ctx.beginPath();
                ctx.strokeStyle="#009900";
                ctx.moveTo(this._lastX, this._lastPerlin2Y);
                ctx.lineTo(this._currentX, this._currentPerlin2Y);
                ctx.closePath();
                ctx.stroke();

				/*
                ctx.beginPath();
                ctx.strokeStyle="#FFFF00";
                ctx.moveTo(this._lastX, this._lastPerlinY);
                ctx.lineTo(this._currentX, this._currentPerlinY);
                ctx.closePath();
                ctx.stroke();
				*/

                ctx.strokeStyle="#FF00FF";
                ctx.beginPath();

                ctx.moveTo(this._lastX, this._lastHandY);
                ctx.lineTo(this._currentX, this._currentHandY);
                ctx.closePath();
                ctx.stroke();
            } else {


                ctx.clearRect(0,0,2000,500);
            }


            this.amplitud=Math.abs(this._currentHandY-this._currentPerlinY);

            ctx.fillStyle="#000000";
            ctx.fillRect(1620,200,500,500);
            ctx.font = "20px Arial";
            ctx.fillStyle="#FFFFFF";
            ctx.strokeStyle="#FFFFFF";
            ctx.strokeText(this._perlinSpeed.toFixed(4),1650,220);
			ctx.lineWidth=1;
            ctx.strokeText(this.amplitud.toFixed(0),1650,250);

            this._lastX=this._currentX;
            this._lastHandY=this._currentHandY;
            this._lastPerlinY=this._currentPerlinY;
            this._lastPerlin2Y=this._currentPerlin2Y;


            if (this._speedChangeCountDown==0){

                this._speedChangeCountDown=30+Math.floor(Math.random()*200);
                this._perlinSpeedTarget=0.001+Math.random()*0.001;

            } else {
                this._speedChangeCountDown--;
            }
            this._perlinPos+=this._perlinSpeed;

            this._perlinSpeed+= (this._perlinSpeedTarget-this._perlinSpeed)*0.05;

            if (this._currentX>1800){
                this._currentX=0;
            } else {
                this._currentX += this._stepX;
            }

    }

    this.getAmplitud=function(){

        return 0;
    }

    this.onHandscontrollerUpdated=function(event){
            this._currentHandY=300-event.posicion[1]*2;
    }

}
