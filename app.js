const canvas = document.querySelector('#canvas1');

const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.querySelector('#collisionCanvas');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

const collisionCtx = collisionCanvas.getContext('2d');

ctx.font = '40px Impact';

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;
let score = 0;
let gameOver = false;

let ravens = [];
class Raven {
  constructor() {
    this.image = new Image();
    this.image.src = './images/raven.png';

    this.spriteWidth = 271;
    this.spriteHeight = 194;
    this.sizeModifier = Math.random() * 0.6 + 0.4;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.frame = 0;
    this.maxFrame = 4;
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 50 + 50;
    this.randomColor = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];
    this.color = `rgb(${this.randomColor[0]}, ${this.randomColor[1]}, ${this.randomColor[2]})`;

    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 1 + 0.8;
    this.directionY = Math.random() * 5 - 2.5;
    this.markedForDeletion = false;
  }

  update(arg) {
    if (this.y < 0 || this.y > canvas.height - this.height) {
      this.directionY *= -1;
    }
    this.x -= this.directionX;
    this.y += this.directionY;
    if (this.x < 0 - this.width) this.markedForDeletion = true;
    this.timeSinceFlap += arg;
    if (this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxFrame) this.frame = 0;
      else this.frame++;
      this.timeSinceFlap = 0;
    }
    if (this.x < 0 - this.width) gameOver = true;
  }
  draw() {
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

let explosions = [];
class Explosion {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = './images/boom.png';
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.size = size;
    this.y = y;
    this.x = x;
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src = `laserfire01.ogg`;
    this.timeSinceLastFrame = 0;
    this.timeSinceLastFrame = 0;
    this.frameInterval = 900;
    this.markedForDeletion = false;
  }
  update(deltaTime) {
    if (this.frame === 0) this.sound.play();
    this.timeSinceLastFrame += deltaTime;
    if (this.timeSinceLastFrame > this.frameInterval) {
      this.frame++;
      this.timeSinceLastFrame = 0;

      if (this.frame > 5) this.markedForDeletion = true;
    }
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.size,
      this.size
    );
  }
}

function drawScore() {
  ctx.fillStyle = 'black';
  ctx.fillText(`Score: ${score}`, 50, 75);
  ctx.fillStyle = 'white';
  ctx.fillText(`Score: ${score}`, 55, 80);
}

function drawGameOver() {
  ctx.textAlign = 'center';
  ctx.fillStyle = 'black';
  ctx.fillText(
    `GAME OVER! Your Score:${score}`,
    canvas.width / 2,
    canvas.height / 2
  );
  ctx.fillStyle = 'white';
  ctx.fillText(
    `GAME OVER! Your Score:${score}`,
    canvas.width / 2 + 5,
    canvas.height / 2 + 5
  );
}

window.addEventListener('click', (e) => {
  //detects color on clicked area
  const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
  const pixelColor = detectPixelColor.data;
  ravens.forEach((raven) => {
    if (
      raven.randomColor[0] === pixelColor[0] &&
      raven.randomColor[1] === pixelColor[1] &&
      raven.randomColor[2] === pixelColor[2]
    ) {
      //detects collision by color
      raven.markedForDeletion = true;
      score++;
      explosions.push(new Explosion(raven.x, raven.y, raven.width));
      console.log(explosions);
    }
  });
});

function animate(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  timeToNextRaven += deltaTime;
  if (timeToNextRaven > ravenInterval) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
    ravens.sort((a, b) => {
      return a.width - b.width;
    });
  }
  drawScore(),
    [...ravens, ...explosions].forEach((object) => object.update(deltaTime));
  [...ravens, ...explosions].forEach((object) => object.draw());
  //gets ravens that have MFD property set to false(they are still on screen)
  ravens = ravens.filter((raven) => !raven.markedForDeletion);
  explosions = ravens.filter((explosion) => !explosion.markedForDeletion);

  if (!gameOver) requestAnimationFrame(animate);
  else drawGameOver();
}
animate(0);
