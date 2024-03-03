let handpose;
let video;
let predictions = [];
let modelLoaded = false;
let ellipsePositions = [];

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

  // create random ellipses
  for (let i = 0; i < 10; i++) {
    let x, y, size, fillColor;
    let overlapping = true;
    while (overlapping) {
      x = random(width);
      y = random(height);
      size = random(30, 70);
      fillColor = color(random(255), random(255), random(255));
      overlapping = checkOverlap(x, y, size);
    }
    ellipsePositions.push({ x: x, y: y, size: size, fillColor: fillColor });
  }
}

// function to check if ellipse with other ellipse
function checkOverlap(newX, newY, newSize) {
  for (let i = 0; i < ellipsePositions.length; i++) {
    let position = ellipsePositions[i];
    let distance = dist(newX, newY, position.x, position.y);
    let minDistance = newSize / 2 + position.size / 2;
    if (distance < minDistance) {
      return true; // overlapping with another ellipse
    }
  }
  return false; // not overlapping
}

function modelReady() {
  console.log("Model ready!");
  modelLoaded = true;
}

function draw() {
  frameRate(60);
  if (modelLoaded) {
    // mirror video and draw it to canvas
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);

    // draw ellipses
    for (let i = 0; i < ellipsePositions.length; i++) {
      let position = ellipsePositions[i];
      fill(position.fillColor);
      ellipse(position.x, position.y, position.size, position.size);
    }

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