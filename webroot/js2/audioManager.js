"use strict";

function AudioManager()
{
	this.pathAudiosMenuInicial = ["audio/musica/menuInicialTema1.mp3",
								"audio/musica/menuInicialTema2.mp3",
								"audio/musica/menuInicialTema3.mp3"];

	this.pathAudiosConstruccion = ["audio/musica/construccionTema1.mp3",
								"audio/musica/construccionTema2.mp3",
								"audio/musica/construccionTema3.mp3"];

	this.pathAudiosDestruccion = ["audio/musica/destruccionTema1.mp3",
								"audio/musica/destruccionTema2.mp3",
								"audio/musica/destruccionTema3.mp3"];

	this.pathAudiosMenuFinal = ["audio/musica/menuFinalTema1.mp3",
								"audio/musica/menuFinalTema2.mp3",
								"audio/musica/menuFinalTema3.mp3"];

	this.pathEfectosTrueno = ["audio/efectos/trueno1.mp3", 
							"audio/efectos/trueno2.mp3", 
							"audio/efectos/trueno3.mp3"];

	this.efectoAudio = new Audio();
	this.currentAudio = new Audio();
	this.currentAudioList = [];  
	this.trackNumber = 0;
	this.mute = false;
	this.muteTrueno = false;
}

AudioManager.prototype.onTrackEnd=function()
{
	this.trackNumber = ++this.trackNumber < this.currentAudioList.length ? this.trackNumber : 0;
	if(!this.currentAudio) this.currentAudio = new Audio();

	console.log(this.currentAudioList[this.trackNumber]);

	this.currentAudio.src = this.currentAudioList[this.trackNumber];
	this.currentAudio.play();
}

AudioManager.prototype.playListLoop=function(filenames)
{
	this.trackNumber = 0;
	this.currentAudioList = filenames;
	this.currentAudio.addEventListener('ended', this.onTrackEnd.bind(this) ,true);

	this.currentAudio.loop = false;
	this.currentAudio.src = filenames[this.trackNumber];

	console.log(filenames[this.trackNumber]);

	if(!this.mute) this.currentAudio.play();
}

AudioManager.prototype.dispararTrueno=function()
{
	this.efectoAudio.loop = false;
	this.efectoAudio.src = this.pathEfectosTrueno[Math.floor(Math.random() * this.pathEfectosTrueno.length)];
	if(!this.mute && !this.muteTrueno)  this.efectoAudio.play();
}

AudioManager.prototype.playMenuInicial=function()
{
	this.playListLoop(this.pathAudiosMenuInicial);
}

AudioManager.prototype.playMenuFinal=function()
{
	this.playListLoop(this.pathAudiosMenuFinal);
}

AudioManager.prototype.playConstruccion=function()
{
	this.playListLoop(this.pathAudiosConstruccion);
}

AudioManager.prototype.playDestruccion=function()
{
	this.playListLoop(this.pathAudiosDestruccion);
}