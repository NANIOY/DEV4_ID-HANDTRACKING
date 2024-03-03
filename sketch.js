let handpose;
let video;
let predictions = [];
let modelLoaded = false;
let ellipsePositions = [];
let particles = [];

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

  // remove ellipse if index finger is touching it
  if (predictions[0] && predictions[0].hasOwnProperty('annotations')) {
    let index4 = predictions[0].annotations.indexFinger[3];
    for (let i = 0; i < ellipsePositions.length; i++) {
      let position = ellipsePositions[i];
      let distance = dist(index4[0], index4[1], position.x, position.y);
      let minDistance = 10 + position.size / 2;
      if (distance < minDistance) {
        // create explosion particles at position of ellipse
        createExplosion(position.x, position.y, position.fillColor);
        // remove the ellipse from positions array
        ellipsePositions.splice(i, 1);
        break;
      }
    }
  }

  // draw circle on index finger
  push();
  rectMode(CORNERS);
  noStroke();
  fill(255, 0, 0);
  if (predictions[0] && predictions[0].hasOwnProperty('annotations')) {
    let index4 = predictions[0].annotations.indexFinger[3];
    circle(index4[0], index4[1], 10);// index4[2]);
  }
  pop();

  // update and draw explosion particles
  updateExplosion();
}

// function to create explosion particles at given position
function createExplosion(x, y, color) {
  for (let j = 0; j < 10; j++) {
    let particle = {
      x: x,
      y: y,
      vx: random(-2, 2),
      vy: random(-2, 2),
      alpha: 255,
      size: random(2, 5),
      color: color
    };
    particles.push(particle);
  }
}

// function to update and draw explosion particles
function updateExplosion() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let particle = particles[i];
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.alpha -= 10; // decrease alpha for fading effect
    fill(particle.color, particle.alpha);
    ellipse(particle.x, particle.y, particle.size);
    noStroke();
    if (particle.alpha <= 0) {
      // remove particle if alpha becomes zero
      particles.splice(i, 1);
    }
  }
}