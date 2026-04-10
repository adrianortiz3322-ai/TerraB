// Variables globales
let gameStarted = false;
let player = {
  x: 100,
  y: 100,
  width: 48,
  height: 48,
  velocityX: 0,
  velocityY: 0,
  speed: 3,
  jumpForce: 12,
  gravity: 0.5,
  onGround: false,
  health: 100,
  direction: 'right',
  animationFrame: 0,
  lastDirectionChange: 0
};

// Imágenes del jugador y bloques
let playerImage = new Image();
playerImage.src = 'player.png';

let textures = {
  grass: new Image(),
  dirt: new Image(),
  stone: new Image(),
  sand: new Image(),
  tree: new Image(),
  rock: new Image()
};

// Cargar texturas
textures.grass.src = 'grass.png';
textures.dirt.src = 'dirt.png';
textures.stone.src = 'stone.png';
textures.sand.src = 'sand.png';
textures.tree.src = 'tree.png';
textures.rock.src = 'rock.png';

// Dimensiones del mundo
const worldWidth = 200;
const worldHeight = 200;
const tileSize = 32;

// Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Generar mundo con texturas
function generateWorld() {
  const world = [];
  for (let y = 0; y < worldHeight; y++) {
    world[y] = [];
    for (let x = 0; x < worldWidth; x++) {
      const noise = Math.random();
      if (noise < 0.15) {
        world[y][x] = 'tree';
      } else if (noise < 0.25) {
        world[y][x] = 'rock';
      } else if (noise < 0.4) {
        world[y][x] = 'grass';
      } else if (noise < 0.6) {
        world[y][x] = 'dirt';
      } else if (noise < 0.8) {
        world[y][x] = 'stone';
      } else {
        world[y][x] = 'sand';
      }
    }
  }
  return world;
}

const world = generateWorld();

// Controles táctiles
let touchControls = {
  up: false,
  left: false,
  down: false,
  right: false,
  jump: false
};

// Dibujar controles táctiles
function drawTouchControls() {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(50, canvas.height - 50, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(canvas.width - 50, canvas.height - 50, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText('↑', 40, canvas.height - 40);
  ctx.fillText('↓', 40, canvas.height - 10);
  ctx.fillText('←', 20, canvas.height - 25);
  ctx.fillText('→', 60, canvas.height - 25);
  ctx.fillText('J', canvas.width - 60, canvas.height - 25);
}

// Actualizar controles táctiles
function updateTouchControls() {
  if (touchControls.up) player.velocityY = -player.speed;
  if (touchControls.down) player.velocityY = player.speed;
  if (touchControls.left) {
    player.velocityX = -player.speed;
    player.direction = 'left';
  }
  if (touchControls.right) {
    player.velocityX = player.speed;
    player.direction = 'right';
  }
  if (touchControls.jump && player.onGround) {
    player.velocityY = -player.jumpForce;
    player.onGround = false;
  }
}

// Dibujar barra de vida
function drawHealthBar() {
  ctx.fillStyle = '#000';
  ctx.fillRect(20, 20, 204, 24);
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(22, 22, player.health * 2, 20);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 204, 24);
}

// Dibujar jugador con sprite
function drawPlayer() {
  ctx.save();
  if (player.direction === 'left') {
    ctx.scale(-1, 1);
    ctx.drawImage(playerImage, -(canvas.width / 2), canvas.height / 2 - player.height, player.width, player.height);
  } else {
    ctx.drawImage(playerImage, canvas.width / 2 - player.width, canvas.height / 2 - player.height, player.width, player.height);
  }
  ctx.restore();
}

// Dibujar mundo con texturas
function drawWorld() {
  const offsetX = Math.floor((canvas.width / 2 - player.x) / tileSize) - 5;
  const offsetY = Math.floor((canvas.height / 2 - player.y) / tileSize) - 5;

  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      const worldX = offsetX + x;
      const worldY = offsetY + y;

      if (worldX >= 0 && worldX < worldWidth && worldY >= 0 && worldY < worldHeight) {
        const tileType = world[worldY][worldX];
        const texture = textures[tileType];
        if (texture) {
          ctx.drawImage(texture, x * tileSize, y * tileSize, tileSize, tileSize);
        } else {
          ctx.fillStyle = '#808080';
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
    }
  }
}

// Funciones de lobby
function startGame() {
  document.getElementById('lobbyScreen').style.display = 'none';
  canvas.style.display = 'block';

  audioManager.playSound('select');
  gameStarted = true;
  gameLoop();
}

function showSettings() {
  alert('Configuración temporal');
  audioManager.playSound('click');
}

function gameLoop() {
  if (!gameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWorld();
  drawPlayer();
  drawHealthBar();
  drawTouchControls();

  // Aplicar física
  player.velocityY += player.gravity;
  player.x += player.velocityX;
  player.y += player.velocityY;

  // Verificar si está en el suelo
  const groundTile = world[Math.floor(player.y / tileSize)][Math.floor(player.x / tileSize)];
  if (groundTile && ['grass', 'dirt', 'stone', 'sand'].includes(groundTile)) {
    player.onGround = true;
    player.velocityY = 0;
  } else {
    player.onGround = false;
  }

  // Resetear velocidad horizontal
  player.velocityX = 0;

  updateTouchControls();
  requestAnimationFrame(gameLoop);
}

// Eventos táctiles
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);

let activeTouches = {};

function handleTouchStart(e) {
  e.preventDefault();
  for (let touch of e.changedTouches) {
    activeTouches[touch.identifier] = { x: touch.clientX, y: touch.clientY };
  }
}

function handleTouchMove(e) {
  e.preventDefault();
  for (let touch of e.changedTouches) {
    const startX = activeTouches[touch.identifier]?.x || touch.clientX;
    const startY = activeTouches[touch.identifier]?.y || touch.clientY;
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) touchControls.right = true;
      else touchControls.left = true;
    } else {
      if (deltaY > 0) touchControls.down = true;
      else touchControls.up = true;
    }
  }
}

function handleTouchEnd(e) {
  e.preventDefault();
  for (let touch of e.changedTouches) {
    delete activeTouches[touch.identifier];

    if (touch.clientX > canvas.width - 100 && touch.clientY > canvas.height - 100) {
      touchControls.jump = true;
      setTimeout(() => (touchControls.jump = false), 200);
    }
  }
}
