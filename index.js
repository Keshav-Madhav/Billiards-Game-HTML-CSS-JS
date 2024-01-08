const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth*0.85;
let height = canvas.height = window.innerHeight*0.75;

let ballsArray = [];
let colors = ['#DDB700', 'blue', 'red', 'purple', '#F68122', 'green', 'brown'];

window.addEventListener('resize', resize);
function resize() {
  width = canvas.width = window.innerWidth*0.85;
  height = canvas.height = window.innerHeight*0.75;
}

class Ball {
  constructor(type, x, y, dx, dy, color, number) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.dy = dy;
    this.dx = dx;
    this.color = color;
    this.radius = 20;
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

const spawnBalls = () => {
  // Clear existing balls
  ballsArray = [];

  // Spawn cue ball
  ballsArray.push(new Ball('cue', width / 6, height / 2, 80, 10, 'white', 0));

  // Spawn 15 balls
  let ballNumber = 1;
  let rackY = height / 2;
  let rackX = width / 1.5;
  let row = 0;
  let col = 0;
  let radius = 20;
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

  requestAnimationFrame(draw);
}
draw();