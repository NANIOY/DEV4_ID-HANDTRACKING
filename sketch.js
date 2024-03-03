let handpose;
let video;
let predictions = [];
let modelLoaded = false;
function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  handpose = ml5.handpose(video, modelReady);

  // This sets up an event that fills the global variable "predictions"
  // with an array every time new hand poses are detected
  handpose.on("predict", results => {
    predictions = results;
    console.log(predictions);
  });

  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  console.log("Model ready!");
  modelLoaded = true;
}

function draw() {
  frameRate(30);
  if (modelLoaded) {
    // mirror video and draw it to canvas
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);

    // We can call both functions to draw all keypoints and the skeletons
    // drawKeypoints();
    drawFingers();

  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  for (let i = 0; i < predictions.length; i += 1) {
    const prediction = predictions[i];
    for (let j = 0; j < prediction.landmarks.length; j += 1) {
      const keypoint = prediction.landmarks[j];
      fill(0, 255, 0);
      noStroke();
      ellipse(keypoint[0], keypoint[1], 10, 10);
    }
  }
}

function drawFingers() {
  console.log(predictions);
  push();
  rectMode(CORNERS);
  noStroke();
  fill(255, 0, 0);
  if (predictions[0] && predictions[0].hasOwnProperty('annotations')) {
    let index1 = predictions[0].annotations.indexFinger[0];
    let index2 = predictions[0].annotations.indexFinger[1];
    let index3 = predictions[0].annotations.indexFinger[2];
    let index4 = predictions[0].annotations.indexFinger[3];
    // circle(index1[0], index1[1], index1[2]);
    // circle(index2[0], index2[1], index2[2]);
    // circle(index3[0], index3[1], index3[2]);
    circle(index4[0], index4[1], 10);// index4[2]);
  }
  pop();
}