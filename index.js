const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth*0.85;
let height = canvas.height = window.innerHeight*0.75;

let ballsArray = [];
let colors = ['#DDB700', 'blue', 'red', 'purple', '#F68122', 'green', 'brown'];

let isMovingCue = false;
let dragStartX, dragStartY;

let rectanglesArray = [];

window.addEventListener('resize', resize);
function resize() {
  width = canvas.width = window.innerWidth*0.85;
  height = canvas.height = window.innerHeight*0.75;
}

canvas.addEventListener('contextmenu', function(event) {
  event.preventDefault();
});

canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseup', onMouseUp);


function onMouseDown(event) {
  if(event.button === 2) { // Check if right-click
    event.preventDefault();
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;

    // Check if the mouse is right-clicked on the cue ball
    if (isInsideCueBall(mouseX, mouseY)) {
      isMovingCue = true;
      dragStartX = mouseX;
      dragStartY = mouseY;
      ballsArray[0].radius = ballsArray[0].radius * 1.2;
    }
  }
}

function onMouseMove(event) {
  if (isMovingCue) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;

    const dx = mouseX - dragStartX;
    const dy = mouseY - dragStartY;

    ballsArray[0].x += dx;
    ballsArray[0].y += dy;

    dragStartX = mouseX;
    dragStartY = mouseY;
  }
}

function onMouseUp(event) {
  if (event.button === 2) {
    isMovingCue = false;
    ballsArray[0].radius = ballsArray[0].radius / 1.2;
  }
}

// Function to check if the mouse is inside the cue ball
function isInsideCueBall(mouseX, mouseY) {
  const cueBall = ballsArray[0];
  const distance = Math.sqrt((mouseX - cueBall.x) ** 2 + (mouseY - cueBall.y) ** 2);
  return distance <= cueBall.radius;
}

class Ball {
  constructor(type, x, y, dx, dy, color, number) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.dy = dy;
    this.dx = dx;
    this.color = color;
    this.radius = 16;
    this.number = number;
    this.elasticity = 0.8;
    this.friction = 0.99;
    this.wallElasticity = 0.7;
    this.weight = 1;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  
    // Draw number in the center
    if (this.type !== 'cue') {
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.number, this.x, this.y);
    }
  
    // Draw border for striped balls
    if (this.type === 'stripe') {
      ctx.beginPath();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
  

  update() {
    this.x += this.dx;
    this.y += this.dy;

    this.dx *= this.friction;
    this.dy *= this.friction;

    if (Math.abs(this.dx) < 0.01) {
      this.dx = 0;
    }
    if (Math.abs(this.dy) < 0.01) {
      this.dy = 0;
    }

    this.wallCollision();
  }

  wallCollision() {
    if (this.x + this.radius >= width) {
      this.dx = -Math.abs(this.dx) * this.wallElasticity;
    }
    if (this.x - this.radius <= 0) {
      this.dx = Math.abs(this.dx) * this.wallElasticity;
    }
    if (this.y + this.radius >= height) {
      this.dy = -Math.abs(this.dy) * this.wallElasticity;
    }
    if (this.y - this.radius <= 0) {
      this.dy = Math.abs(this.dy) * this.wallElasticity;
    }
  }
}

class Rectangle {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fill();
  }
}

rectanglesArray.push(new Rectangle(width/17, height/40, width/2.4, height/30 , 'green'));
rectanglesArray.push(new Rectangle(width/17, height-height/17, width/2.4, height/30, 'green'));
rectanglesArray.push(new Rectangle(width/45, height/9, height/30, height-height/4.5, 'green'));
rectanglesArray.push(new Rectangle(width-width/26, height/9, height/30, height-height/4.5, 'green'));
rectanglesArray.push(new Rectangle(width/1.91, height/40, width/2.4, height/30, 'green'));
rectanglesArray.push(new Rectangle(width/1.91, height-height/17, width/2.4, height/30, 'green'));  

const spawnBalls = () => {
  // Clear existing balls
  ballsArray = [];

  // Spawn cue ball
  ballsArray.push(new Ball('cue', width / 6, height / 2, 130, 10, 'white', 0));

  // Spawn 15 balls
  let ballNumber = 1;
  let rackY = height / 2;
  let rackX = width / 1.5;
  let row = 0;
  let col = 0;
  let radius = ballsArray[0].radius;
  let padding = 1;

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j <= i; j++) {
      let x = rackX + row * (radius * 2 + padding - radius / 4);
      let y = rackY + col * (radius * 2 + padding) - (i * radius + i * padding);
      let color, ballType;
      if (ballNumber === 8) {
        ballType = 'black';
        color = 'black';
      } else if (ballNumber <= 7) {
        ballType = 'solid';
        color = colors[ballNumber - 1];
      } else {
        ballType = 'stripe';
        color = colors[ballNumber - 9];
      }
      ballsArray.push(new Ball(ballType, x, y, 0, 0, color, ballNumber));
      ballNumber++;
      col++;
    }
    row++;
    col = 0;
  }
};

spawnBalls();

function draw() {
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < ballsArray.length; i++) {
    ballsArray[i].draw();
    ballsArray[i].update();
  }

  for (let i = 0; i < rectanglesArray.length; i++) {
    rectanglesArray[i].draw();
  }

  // Check for collisions with the walls
  for (let i = 0; i < ballsArray.length; i++) {
    for(let j = 0; j < rectanglesArray.length; j++) {
      ballRectCollision(ballsArray[i], rectanglesArray[j]);
    }
  }

  // Collision detection
  for (let i = 0; i < ballsArray.length; i++) {
    for (let j = i + 1; j < ballsArray.length; j++) {
      if((ballsArray[i].type === 'cue' || ballsArray[j].type === 'cue') && isMovingCue) {
        continue;
      }
      const dx = ballsArray[i].x - ballsArray[j].x;
      const dy = ballsArray[i].y - ballsArray[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < ballsArray[i].radius + ballsArray[j].radius) {
        ballCollide(ballsArray[i], ballsArray[j]);
      }
    }
  }

  requestAnimationFrame(draw);
}
draw();

function ballCollide(ball1, ball2) {
  // Calculate the distance between the balls
  var dx = ball1.x - ball2.x;
  var dy = ball1.y - ball2.y;
  var distance = Math.sqrt(dx * dx + dy * dy);

  // Calculate the angle of the collision
  var angle = Math.atan2(dy, dx);

  // Calculate the components of the velocity of each ball
  var velocity1 = Math.sqrt(ball1.dx * ball1.dx + ball1.dy * ball1.dy);
  var velocity2 = Math.sqrt(ball2.dx * ball2.dx + ball2.dy * ball2.dy);

  // Calculate the direction of each ball
  var direction1 = Math.atan2(ball1.dy, ball1.dx);
  var direction2 = Math.atan2(ball2.dy, ball2.dx);

  // Calculate the new velocity of each ball
  var velocity1x = velocity1 * Math.cos(direction1 - angle);
  var velocity1y = velocity1 * Math.sin(direction1 - angle);
  var velocity2x = velocity2 * Math.cos(direction2 - angle);
  var velocity2y = velocity2 * Math.sin(direction2 - angle);

  // The final velocities after collision are calculated considering the mass and elasticity
  var finalVelocity1x = ((ball1.weight - ball2.weight) * velocity1x + 2 * ball2.weight * velocity2x) / (ball1.weight + ball2.weight) * ball1.elasticity;
  var finalVelocity2x = ((ball2.weight - ball1.weight) * velocity2x + 2 * ball1.weight * velocity1x) / (ball1.weight + ball2.weight) * ball2.elasticity;

  // Convert velocities back to vectors
  ball1.dx = Math.cos(angle) * finalVelocity1x + Math.cos(angle + Math.PI/2) * velocity1y;
  ball1.dy = Math.sin(angle) * finalVelocity1x + Math.sin(angle + Math.PI/2) * velocity1y;
  ball2.dx = Math.cos(angle) * finalVelocity2x + Math.cos(angle + Math.PI/2) * velocity2y;
  ball2.dy = Math.sin(angle) * finalVelocity2x + Math.sin(angle + Math.PI/2) * velocity2y;

  if (distance < ball1.radius + ball2.radius) {
      var overlap = ball1.radius + ball2.radius - distance;
      var angle = Math.atan2(ball2.y - ball1.y, ball2.x - ball1.x);
      ball1.x -= overlap * Math.cos(angle) / 2;
      ball1.y -= overlap * Math.sin(angle) / 2;
      ball2.x += overlap * Math.cos(angle) / 2;
      ball2.y += overlap * Math.sin(angle) / 2;
  } else {
      // If balls are not overlapping, they should not be moving towards each other
      var relativeVelocityX = ball2.dx - ball1.dx;
      var relativeVelocityY = ball2.dy - ball1.dy;
      var relativeVelocityDotProduct = dx * relativeVelocityX + dy * relativeVelocityY;
      if (relativeVelocityDotProduct > 0) {
          return;  // Balls are moving apart, not colliding
      }
  }
}

function ballRectCollision(ball, rectangle) {
  // Subdivide movement into smaller steps
  const numSteps = 10;
  const stepX = ball.dx / numSteps;
  const stepY = ball.dy / numSteps;

  // Perform collision detection at each step
  for (let step = 1; step <= numSteps; step++) {
    const nextX = ball.x + stepX * step;
    const nextY = ball.y + stepY * step;

    // Calculate the distance between the center of the ball and the center of the rectangle
    const distX = Math.abs(nextX - rectangle.x - rectangle.width / 2);
    const distY = Math.abs(nextY - rectangle.y - rectangle.height / 2);

    // If the distance is greater than half rectangle + radius, then they are too far apart to be colliding
    if (distX > (rectangle.width / 2 + ball.radius)) continue;
    if (distY > (rectangle.height / 2 + ball.radius)) continue;

    // If the distance is less than half rectangle, then they are definitely colliding
    if (distX <= (rectangle.width / 2)) {
      // Ball is colliding with the top or bottom of the rectangle, reflect dy
      ball.dy *= -1;
      return;
    }
    if (distY <= (rectangle.height / 2)) {
      // Ball is colliding with the left or right of the rectangle, reflect dx
      ball.dx *= -1;
      return;
    }

    // Check for collision at rectangle corner
    const dx = distX - rectangle.width / 2;
    const dy = distY - rectangle.height / 2;
    if (dx * dx + dy * dy <= (ball.radius * ball.radius)) {
      // Ball is colliding with the corner of the rectangle, reflect both dx and dy
      ball.dx *= -1;
      ball.dy *= -1;
      return;
    }
  }
}
