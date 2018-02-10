var mic, fft, sound, lastspectrum, med = 0.0, M;
var flag = 0, recState = 1;
var numframe = 0, silencio = 0, sflag = 0;

var maximaAmplitude = 17, intervaloFrames = 30;

var avaliacao = 0.0; // 0-100
var numAvaliacoes = 0;

function setup() {

   createCanvas(1000,400);
   noFill();

   mic = new p5.AudioIn();
   mic.start();
   fft = new p5.FFT();
   fft.setInput(mic);
}

function keyPressed(){
    if(recState === 0 && mic.enabled){ // stop - recording
        mic.start();
        numAvaliacoes = 0;
        avaliacao = 0.0;
        recState = 1;
    }else if(recState === 1){ //recording - stop
        mic.stop();

        recState = 0;
    }
}

function avaliar() {

   var spectrum = fft.analyze();

   if(flag === 0){
       lastspectrum = spectrum;
       flag++;
   }

   M = 0;
   for (i = 0; i<spectrum.length; i++) {
        var diff = abs(spectrum[i]-lastspectrum[i]);
        if(M < diff){
            M = diff;
        }
   }
   if(M<maximaAmplitude){
       silencio++;
   }

   if(numframe==intervaloFrames){
       if(numframe-silencio <= silencio){
            sflag = 1;
       }else{
            sflag = 0;
       }
       numframe = 0;
       silencio = 0;
   }

   if(sflag==0){
       background(0,255,0);
   }else{
       background(255,0,0);
   }

   beginShape();
   for (i = 0; i<spectrum.length; i++) {
    vertex(i, map(abs(spectrum[i]-lastspectrum[i]), 0, 255, 400, 0) );
   }
   endShape();
   lastspectrum = spectrum;
   numframe++;
}

function mostrarAvaliacao(){
    background(200);
    text("acabou",20,20);
}

function draw(){
    if(recState === 1){
        avaliar();
    }else{
        mostrarAvaliacao();
    }
}
