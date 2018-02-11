var mic, fft, sound, lastspectrum, M;
var flag = 0,
  recording = false,
  finished = false;
var numframe = 0,
  silencio = 0,
  sflag = 0;
var inputMax = document.getElementById("maxInput");

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

var readyToAnalysis = false;

document.getElementById("showFile").addEventListener("click", handleFileButton);
document.getElementById("showMic").addEventListener("click", handleMicButton);
document
  .getElementById("downloadButton")
  .addEventListener("click", onDownloadButtonClick);
document
  .getElementById("startAnalysis")
  .addEventListener("click", onStartAnalysisClick);
document
  .getElementById("stopAnalysis")
  .addEventListener("click", onStopAnalysisClick);

var timerRef, time;

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

function handleMicButton() {
  if (state === "file") {
    state = "mic";
    mic.start();
    readyToAnalysis = true;
  }
}

function onDownloadButtonClick() {
  save(downloadSound, "mySound.wav");
}

function onLoadSuccess() {
  console.log("success");
  readyToAnalysis = true;
}

function timer() {
  time++;
  timerRef = setTimeout(timer, 1000);
}

function onStartAnalysisClick() {
  numAvaliacoes = 0;
  pontos = 0;
  recording = true;
  finished = false;
  time = 0;
  timerRef = setTimeout(timer, 1000);
  if (state === "mic") {
    micSetUp();
    beginRender(mic);
  } else {
    sound.play();
    sound.onended(naturalEnding);
    beginRender(sound);
  }
}

function naturalEnding() {
  if (!recording) return;
  clearTimeout(timerRef);
  recording = false;
  finished = true;
  mostrarAvaliacao();
}

function onStopAnalysisClick() {
  clearTimeout(timerRef);
  recording = false;
  finished = true;
  if (state === "mic") {
    mic.stop();
    recorder.stop();
  } else {
    sound.stop();
  }
  mostrarAvaliacao();
}

function onLoadFailure() {
  console.error("Failure fetching sound");
}

function whileLoading(percentage) {
  console.log("loading... ", percentage);
}

function micSetUp() {
  mic.start();
  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);
  downloadSound = new p5.SoundFile();
  recorder.record(downloadSound);
}

function beginRender(soundInput) {
  maximaAmplitude = inputMax.value;
  fft = new p5.FFT();
  fft.setInput(soundInput);
  recording = true;
  finished = false;
}

function setup() {
  createCanvas(1000, 400);
  noFill();
  mic = new p5.AudioIn();
  mic.start();
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
  background(247);
  let message;
  const date = new Date().toLocaleString();
  const quantitativeScore = (pontos / numAvaliacoes).toFixed(3);
  if (isNaN(quantitativeScore)) {
    return;
  }
  let qualitativeScore;
  if (quantitativeScore === 1) {
    qualitativeScore = "Perfect!";
  } else if (quantitativeScore > 0.8) {
    qualitativeScore = "Very good!";
  } else if (quantitativeScore > 0.6) {
    qualitativeScore = "Good.";
  } else if (quantitativeScore > 0.4) {
    qualitativeScore = "Nice try.";
  } else if (quantitativeScore > 0.2) {
    qualitativeScore = "Keep practicing.";
  } else {
    qualitativeScore = "At least your mother loves you.";
  }
  if (state === "file") {
    message = `[${date}] Tested File ${
      input.value
    }; Score: ${quantitativeScore}. ${qualitativeScore}`;
  } else {
    message = `[${date}] Mic test, duration ${time} seconds; Score: ${quantitativeScore}. ${qualitativeScore}`;
  }
  //scoreHistory = [message, ...scoreHistory];
  const ul = document.getElementById("scoreList");
  let li = document.createElement("li");
  li.innerHTML = message;
  ul.appendChild(li);
}

function draw() {
  if (readyToAnalysis) {
    if (!recording) {
      document.getElementById("startAnalysis").style.visibility = "visible";
      document.getElementById("stopAnalysis").style.visibility = "hidden";
    } else {
      document.getElementById("startAnalysis").style.visibility = "hidden";
      document.getElementById("stopAnalysis").style.visibility = "visible";
    }
  } else {
    document.getElementById("startAnalysis").style.visibility = "hidden";
    document.getElementById("stopAnalysis").style.visibility = "hidden";
  }

  if (finished && state === "mic") {
    downloadButton.style.visibility = "visible";
  } else if (!finished) {
    downloadButton.style.visibility = "hidden";
  }
  if (recording) {
    document.getElementById("timer").innerHTML = `Time: ${time} seconds`;
    avaliar();
  } else {
    //Nada selecionado
  }
}
