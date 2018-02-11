var mic, fft, sound, lastspectrum, M;
var flag = 0,
  recording = false,
  finished = false;
var numframe = 0,
  silencio = 0,
  sflag = 0;
var inputMax = document.getElementById("max");

var maximaAmplitude = 17,
  intervaloFrames = 30;
inputMax.value = maximaAmplitude;

var pontos = 0; // 0-100
var numAvaliacoes = 0;

var state = "file";
var inputValue = "";
var input = document.getElementById("fileInput");

var downloadButton = document.getElementById("downloadButton");

var recorder;
var downloadSound;

document.getElementById("showFile").addEventListener("click", handleFileButton);
document.getElementById("showMic").addEventListener("click", handleMicButton);
document
  .getElementById("downloadButton")
  .addEventListener("click", onDownloadButtonClick);

function handleFileButton() {
  if (state === "mic" || input.value !== inputValue) {
    inputValue = input.value;
    //render sound
    state = "file";
    sound = loadSound(
      "assets/" + input.value,
      onLoadSuccess,
      onLoadFailure,
      whileLoading
    );
  }
}

function onDownloadButtonClick() {
  save(downloadSound, "mySound.wav");
}

function onLoadSuccess() {
  console.log("success");
  sound.play();
  sound.onended(onInputStop);
  beginRender(sound);
}

function onInputStop() {
  console.log("ended");
  if (state === "mic") {
    mic.stop();
    recorder.stop();
  } else if (sound.isPlaying()) {
    //sound.stop();
  }

  recording = false;
  finished = true;
  mostrarAvaliacao();
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
    recorder.record(downloadSound);
    beginRender(mic);
  }
}

function beginRender(soundInput) {
  maximaAmplitude = inputMax.value;
  fft = new p5.FFT();
  fft.setInput(soundInput);
  recording = true;
}

function setup() {
  createCanvas(1000, 400);
  noFill();
  mic = new p5.AudioIn();
  mic.start();
  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);
  downloadSound = new p5.SoundFile();
}

function keyPressed() {
  const SPACE = 32;
  if (keyCode === SPACE) {
    if (!recording && mic.enabled) {
      // stop -> recording
      if (state === "mic") {
        mic.start();
      }
      numAvaliacoes = 0;
      pontos = 0;
      recording = true;
      finished = false;
    } else {
      //recording -> stop
      onInputStop();
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
  document.getElementById("score").innerHTML =
    "Score: " + pontos / numAvaliacoes;
  console.log("acabou", pontos / numAvaliacoes);
}

function draw() {
  if (finished) {
    downloadButton.style.visibility = "visible";
  } else {
    downloadButton.style.visibility = "hidden";
  }
  if (recording) {
    avaliar();
  } else {
    //Nada selecionado
  }
}
