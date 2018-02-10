var mic, fft, sound, lastspectrum, M;
var flag = 0,
  recState = -1;
var numframe = 0,
  silencio = 0,
  sflag = 0;

var maximaAmplitude = 17,
  intervaloFrames = 30;

var pontos = 0; // 0-100
var numAvaliacoes = 0;

var state = "file";
var inputValue = "";
var input = document.getElementById("fileInput");

document.getElementById("showFile").addEventListener("click", handleFileButton);
document.getElementById("showMic").addEventListener("click", handleMicButton);

function handleFileButton() {
  if (state === "mic" || input.value !== inputValue) {
    inputValue = input.value;
    //render sound
    state = "file";
    sound = loadSound(input.value, onLoadSuccess, onLoadFailure, whileLoading);
  }
}

function onLoadSuccess() {
  console.log("success");
  sound.loop();
  beginRender(sound);
}

function onLoadFailure() {
  console.error("Failure fetching sound");
}

function whileLoading(percentage) {
  console.log("loading... ", percentage);
}

function handleMicButton() {
  if (state === "file") {
    state = "mic";
    mic = new p5.AudioIn();
    mic.start();
    beginRender(mic);
  }
}

function beginRender(soundInput) {
  fft = new p5.FFT();
  fft.setInput(soundInput);
  recState = 1;
}

function setup() {
  createCanvas(1000, 400);
  noFill();
}

function keyPressed() {
  if (keyCode === 32) {
    if ((recState === 0 || recState === 2) && mic.enabled) {
      // stop - recording
        mic.start();
        numAvaliacoes = 0;
        pontos = 0;
        recState = 1;
    } else {
      //recording - stop
      if (state === "mic") {
        mic.stop();
      } else {
        sound.stop();
      }
        
      recState = 0;
    }
  }
}

function avaliar() {
  var spectrum = fft.analyze();

  if (flag === 0) {
    lastspectrum = spectrum;
    flag++;
  }

  M = 0;
  for (i = 0; i < spectrum.length; i++) {
    var diff = abs(spectrum[i] - lastspectrum[i]);
    if (M < diff) {
      M = diff;
    }
  }
  if (M < maximaAmplitude) {
    silencio++;
  }

  if (numframe == intervaloFrames) {
    if (numframe - silencio <= silencio) {
      sflag = 1;
    } else {
      sflag = 0;
      pontos++;
    }
    numframe = 0;
    silencio = 0;
    numAvaliacoes++;
  }

  if (sflag == 0) {
    background(0, 255, 0);
  } else {
    background(255, 0, 0);
  }

  beginShape();
  for (i = 0; i < spectrum.length; i++) {
    vertex(i, map(abs(spectrum[i] - lastspectrum[i]), 0, 255, 400, 0));
  }
  endShape();
  lastspectrum = spectrum;
  numframe++;
}

function mostrarAvaliacao() {
  background(200);
  //document.write(pontos/numAvaliacoes);
  console.log("acabou", pontos/numAvaliacoes);

  recState = 2;
}

function draw() {
  if (recState === 1) {
    avaliar();
  } else if (recState === 0) {
    mostrarAvaliacao();
  } else {
    //Nada selecionado
  }
}
