var mic, fft, sound, lastspectrum, M;
var flag = 0, i;
var numframe = 0, silencio = 0, sflag = 0;

function preload() {
    sound = loadSound("assets/Talk_rui.wav");
}

console.log(window);

function setup() {
   createCanvas(1000,400);
   noFill();

   //mic = new p5.AudioIn();
   //mic.start();

    sound.loop();

   fft = new p5.FFT();
   fft.setInput(sound);
}

function draw() {
   
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
   if(M<20){
       silencio++;
   }
   
   if(numframe==10){
       if(numframe-silencio <= silencio){
            sflag = 1;
       }else{
            sflag = 0;
       }
       numframe = 0;
       silencio = 0;
   }
   
   if(sflag==0){
       background(400);
   }else{
       background(200);
   }
    
   beginShape();
   for (i = 0; i<spectrum.length; i++) {
    vertex(i, map(abs(spectrum[i]-lastspectrum[i]), 0, 255, 400, 0) );
   }
   endShape();
   lastspectrum = spectrum;
   numframe++;
}
