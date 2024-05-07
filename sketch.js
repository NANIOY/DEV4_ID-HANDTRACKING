let handpose;
let video;
let predictions = [];
let modelLoaded = false;
let ellipsePositions = [];
let particles = [];
let counter = 0;
let canvas;

function setup() {
  canvas = createCanvas(640, 480);
  canvas.parent('sketch-container');
  video = createCapture(VIDEO);
  video.size(width, height);

  handpose = ml5.handpose(video, modelReady);

  handpose.on("predict", results => {
    predictions = results;
  });

  video.hide();

  const deadZone = 60;
  for (let i = 0; i < 10; i++) {
    let x, y, size, fillColor;
    let overlapping = true;
    while (overlapping) {
      x = random(deadZone, width - deadZone);
      y = random(deadZone, height - deadZone);
      size = random(30, 70);
      fillColor = color(random(255), random(255), random(255));
      overlapping = checkOverlap(x, y, size);
    }
    ellipsePositions.push({ x: x, y: y, size: size, fillColor: fillColor });
  }

  document.getElementById("addCircles").addEventListener("click", addCircles);
}


// function to check if ellipse with other ellipse
function checkOverlap(newX, newY, newSize) {
  for (let i = 0; i < ellipsePositions.length; i++) {
    let position = ellipsePositions[i];
    let distance = dist(newX, newY, position.x, position.y);
    let minDistance = newSize / 2 + position.size / 2;
    if (distance < minDistance) {
      return true;
    }
  }
  return false;
}


function modelReady() {
  console.log("Model ready!");
  modelLoaded = true;
}

function draw() {
  frameRate(24);
  if (modelLoaded) {
    // mirror video and draw it to canvas
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);

    // draw ellipses
    for (let i = 0; i < ellipsePositions.length; i++) {
      let position = ellipsePositions[i];
      fill(position.fillColor);
      noStroke();
      ellipse(position.x, position.y, position.size, position.size);

      if (i < ellipsePositions.length - 1) {
        let nextPosition = ellipsePositions[i + 1];
        stroke(255);
        line(position.x, position.y, nextPosition.x, nextPosition.y);
      }
    }

    drawHand();
  }
}

function drawHand() {
  if (predictions.length > 0 && predictions[0].hasOwnProperty('annotations')) {
    const annotations = predictions[0].annotations;

    fill(255, 0, 0);
    noStroke();
    for (const key in annotations) {
      const points = annotations[key];
      points.forEach(point => {
        circle(point[0], point[1], 10);
      });
    }

    for (const key in annotations) {
      annotations[key].forEach(joint => {
        let jointX = joint[0];
        let jointY = joint[1];
        for (let i = 0; i < ellipsePositions.length; i++) {
          let position = ellipsePositions[i];
          let distance = dist(jointX, jointY, position.x, position.y);
          let minDistance = 10 + position.size / 2;
          if (distance < minDistance) {
            createExplosion(position.x, position.y, position.fillColor);
            ellipsePositions.splice(i, 1);
            counter++;
            break;
          }
        }
      });

      if (isFist(annotations)) {
        addCircles();
      }
    }
  }

  updateExplosion();

  document.getElementById("counter").innerText = "Circles popped: " + counter;
}

function isFist(annotations) {
  const fingerTips = [
    annotations.indexFinger[3],
    annotations.middleFinger[3],
    annotations.ringFinger[3],
    annotations.pinky[3]
  ];
  const palmBase = annotations.palmBase[0];

  return fingerTips.every(tip => {
    const distance = dist(tip[0], tip[1], palmBase[0], palmBase[1]);
    return distance < 60;
  });
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

let lastCircleTime = 0;
const circleCooldown = 2000;

function addCircles() {
  const now = Date.now();
  const deadZone = 40;
  if (now - lastCircleTime > circleCooldown) {
    for (let i = 0; i < 5; i++) {
      let x, y, size, fillColor;
      let overlapping = true;
      while (overlapping) {
        x = random(deadZone, width - deadZone);
        y = random(deadZone, height - deadZone);
        size = random(30, 70);
        fillColor = color(random(255), random(255), random(255));
        overlapping = checkOverlap(x, y, size);
      }
      ellipsePositions.push({ x: x, y: y, size: size, fillColor: fillColor });
    }
    lastCircleTime = now;
  }
}

