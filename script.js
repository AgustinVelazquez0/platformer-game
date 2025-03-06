const startBtn = document.getElementById("start-btn");
const canvas = document.getElementById("canvas");
const startScreen = document.querySelector(".start-screen");
const checkpointScreen = document.querySelector(".checkpoint-screen");
const checkpointMessage = document.querySelector(".checkpoint-screen > p");
const livesDisplay = document.getElementById("livesDisplay"); // ADDED: div para mostrar vidas
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
const gravity = 0.5;
let isCheckpointCollisionDetectionActive = true;

// Variables para controlar las vidas y para evitar múltiples pérdidas por un mismo toque
let lives = 3;
let floorTouched = false;
let obstacleTouched = false;

// Función para actualizar el div de vidas
function updateLivesDisplay() {
  livesDisplay.innerHTML = "❤️".repeat(lives);
}
updateLivesDisplay();

// Función para ajustar tamaños de objetos en relación al tamaño de la ventana
const proportionalSize = (size) => {
  return innerHeight < 500 ? Math.ceil((size / 500) * innerHeight) : size;
};

// Clase del jugador
class Player {
  constructor() {
    this.position = {
      x: proportionalSize(10),
      y: proportionalSize(400),
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.width = proportionalSize(40);
    this.height = proportionalSize(40);
  }

  draw() {
    ctx.fillStyle = "#99c9ff";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Lógica de gravedad
    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      if (this.position.y < 0) {
        this.position.y = 0;
        this.velocity.y = gravity;
      }
      this.velocity.y += gravity;
    } else {
      this.velocity.y = 0;
      this.position.y = canvas.height - this.height; // Se asegura que no atraviese el suelo
    }

    // Previene que el jugador se mueva fuera del canvas en el eje X
    if (this.position.x < this.width) {
      this.position.x = this.width;
    }

    if (this.position.x >= canvas.width - this.width * 2) {
      this.position.x = canvas.width - this.width * 2;
    }
  }
}

// Clase de los obstáculos
class Obstacle {
  constructor(x, y, width, height, speed) {
    this.position = {
      x: x,
      y: y,
    };
    this.width = width;
    this.height = height;
    this.speed = speed; // Velocidad de movimiento
  }

  draw() {
    ctx.fillStyle = "red"; // Color del obstáculo
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.position.x += this.speed; // Movimiento en el eje X

    // Si el obstáculo sale del canvas, lo reseteamos
    if (this.position.x + this.width < 0) {
      this.position.x = canvas.width;
    }

    this.draw();
  }
}

const obstacles = [
  new Obstacle(
    proportionalSize(300),
    proportionalSize(200 + Math.random() * 200), // Altura aleatoria entre 200 y 400
    proportionalSize(40),
    proportionalSize(40),
    -2 - Math.random() * 2 // Velocidad aleatoria entre -2 y -4
  ),
  new Obstacle(
    proportionalSize(600),
    proportionalSize(200 + Math.random() * 200),
    proportionalSize(40),
    proportionalSize(40),
    -2 - Math.random() * 2
  ),
];

// Detectamos si el jugador toca un obstáculo
function checkCollision(player, obstacle) {
  if (
    player.position.x < obstacle.position.x + obstacle.width &&
    player.position.x + player.width > obstacle.position.x &&
    player.position.y < obstacle.position.y + obstacle.height &&
    player.position.y + player.height > obstacle.position.y
  ) {
    return true; // Hay colisión
  }
  return false;
}

// Si toca obstáculo enviamos al último checkpoint
let checkpoint = { x: proportionalSize(10), y: proportionalSize(400) };

function resetToCheckpoint(player) {
  player.position.x = checkpoint.x;
  player.position.y = checkpoint.y;
}

// Clase de la plataforma
class Platform {
  constructor(x, y) {
    this.position = {
      // Posición de la plataforma
      x,
      y,
    };
    this.width = 200; // Ancho de la plataforma
    this.height = proportionalSize(40); // Alto de la plataforma ajustado proporcionalmente
  }

  draw() {
    ctx.fillStyle = "#acd157"; // Color de la plataforma
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height); // Dibuja la plataforma
  }
}

// Clase del checkpoint
class CheckPoint {
  constructor(x, y, z) {
    this.position = {
      // Posición del checkpoint
      x,
      y,
    };
    this.width = proportionalSize(40); // Ancho del checkpoint
    this.height = proportionalSize(70); // Alto del checkpoint
    this.claimed = false; // Indica si el checkpoint ha sido reclamado
  }

  draw() {
    ctx.fillStyle = "#f1be32"; // Color del checkpoint
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height); // Dibuja el checkpoint
  }

  // Método para reclamar el checkpoint (lo elimina visualmente)
  claim() {
    this.width = 0;
    this.height = 0;
    this.position.y = Infinity;
    this.claimed = true;
  }
}

// Crear el jugador y las plataformas
const player = new Player();

// Posiciones de las plataformas
const platformPositions = [
  { x: 0, y: proportionalSize(600) },
  { x: 500, y: proportionalSize(450) },
  { x: 700, y: proportionalSize(400) },
  { x: 850, y: proportionalSize(350) },
  { x: 900, y: proportionalSize(100) },
  { x: 1050, y: proportionalSize(150) },
  { x: 2500, y: proportionalSize(450) },
  { x: 2900, y: proportionalSize(400) },
  { x: 3150, y: proportionalSize(350) },
  { x: 3900, y: proportionalSize(450) },
  { x: 4200, y: proportionalSize(400) },
  { x: 4400, y: proportionalSize(200) },
  { x: 4700, y: proportionalSize(150) },
  { x: 5000, y: proportionalSize(300) },
  { x: 5300, y: proportionalSize(250) },
  { x: 5600, y: proportionalSize(200) },
  { x: 6000, y: proportionalSize(400) },
  { x: 6300, y: proportionalSize(350) },
  { x: 6500, y: proportionalSize(300) },
  { x: 6700, y: proportionalSize(250) },
  { x: 7000, y: proportionalSize(300) },
  { x: 7300, y: proportionalSize(260) },
  { x: 7600, y: proportionalSize(180) },
  { x: 7900, y: proportionalSize(150) },
  { x: 8200, y: proportionalSize(100) },
  { x: 8500, y: proportionalSize(300) },
  { x: 8800, y: proportionalSize(100) },
  { x: 9100, y: proportionalSize(150) },
  { x: 9400, y: proportionalSize(200) },
  { x: 9700, y: proportionalSize(250) },
  { x: 10000, y: proportionalSize(300) },
  { x: 10300, y: proportionalSize(350) },
  { x: 10600, y: proportionalSize(400) },
  { x: 10900, y: proportionalSize(450) },
  { x: 11200, y: proportionalSize(500) },
  { x: 11500, y: proportionalSize(550) },
  { x: 11800, y: proportionalSize(600) },
  { x: 12100, y: proportionalSize(650) },
  { x: 12400, y: proportionalSize(450) },
  { x: 12700, y: proportionalSize(650) },
  { x: 13000, y: proportionalSize(400) },
  { x: 13300, y: proportionalSize(600) },
  { x: 13600, y: proportionalSize(700) },
  { x: 13900, y: proportionalSize(450) },
  { x: 14200, y: proportionalSize(700) },
  { x: 14500, y: proportionalSize(690) },
  { x: 14800, y: proportionalSize(650) },
  { x: 15100, y: proportionalSize(700) },
];

const platforms = platformPositions.map(
  (platform) => new Platform(platform.x, platform.y)
);

// Crear los checkpoints
const checkpointPositions = [
  { x: 1170, y: proportionalSize(80), z: 1 },
  { x: 2900, y: proportionalSize(330), z: 2 },
  { x: 4800, y: proportionalSize(80), z: 3 },
  { x: 6300, y: proportionalSize(280), z: 4 },
  { x: 9100, y: proportionalSize(80), z: 5 },
  { x: 10900, y: proportionalSize(380), z: 6 },
  { x: 13600, y: proportionalSize(630), z: 7 },
  { x: 15100, y: proportionalSize(630), z: 8 },
];

const checkpoints = checkpointPositions.map(
  (checkpoint) => new CheckPoint(checkpoint.x, checkpoint.y, checkpoint.z)
);

// Función de animación
const animate = () => {
  requestAnimationFrame(animate); // Llama a la función de animación en un bucle
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia el canvas en cada frame

  // Dibuja las plataformas y los checkpoints
  platforms.forEach((platform) => {
    platform.draw();
  });

  checkpoints.forEach((checkpoint) => {
    checkpoint.draw();
  });

  // Agregado: Actualiza y dibuja los obstáculos, y verifica colisión con el jugador
  obstacles.forEach((obstacle) => {
    obstacle.update();
    if (checkCollision(player, obstacle)) {
      if (!obstacleTouched) {
        lives--; // Pierde una vida por colisionar con un obstáculo
        obstacleTouched = true;
        resetToCheckpoint(player);
        if (lives <= 0) {
          alert("Game Over");
          lives = 3; // Reinicia vidas o implementá otra lógica de reinicio
        }
        updateLivesDisplay();
      }
    } else {
      obstacleTouched = false;
    }
  });

  // Actualiza la posición del jugador
  player.update();

  // Si el jugador toca el piso, pierde una vida (máximo 3 vidas)
  if (
    player.position.y === canvas.height - player.height &&
    player.velocity.y === 0 &&
    !floorTouched
  ) {
    lives--;
    floorTouched = true;
    resetToCheckpoint(player);
    if (lives <= 0) {
      alert("Game Over");
      lives = 3; // Reinicia vidas o implementá otra lógica de reinicio
    }
    updateLivesDisplay();
  }
  if (player.velocity.y < 0) {
    floorTouched = false;
  }

  // Lógica de movimiento del jugador con las teclas
  if (keys.rightKey.pressed && player.position.x < proportionalSize(400)) {
    player.velocity.x = 5; // Movimiento hacia la derecha
  } else if (
    keys.leftKey.pressed &&
    player.position.x > proportionalSize(100)
  ) {
    player.velocity.x = -5; // Movimiento hacia la izquierda
  } else {
    player.velocity.x = 0; // Detener el movimiento horizontal si no se presiona ninguna tecla

    // Lógica para mover el escenario cuando el jugador se mueve
    if (keys.rightKey.pressed && isCheckpointCollisionDetectionActive) {
      platforms.forEach((platform) => {
        platform.position.x -= 5;
      });

      checkpoints.forEach((checkpoint) => {
        checkpoint.position.x -= 5;
      });
    } else if (keys.leftKey.pressed && isCheckpointCollisionDetectionActive) {
      platforms.forEach((platform) => {
        platform.position.x += 5;
      });

      checkpoints.forEach((checkpoint) => {
        checkpoint.position.x += 5;
      });
    }
  }

  // Detección de colisiones entre el jugador y las plataformas
  platforms.forEach((platform) => {
    const collisionDetectionRules = [
      player.position.y + player.height <= platform.position.y,
      player.position.y + player.height + player.velocity.y >=
        platform.position.y,
      player.position.x >= platform.position.x - player.width / 2,
      player.position.x <=
        platform.position.x + platform.width - player.width / 3,
    ];

    if (collisionDetectionRules.every((rule) => rule)) {
      player.velocity.y = 0; // Detiene la caída del jugador si está sobre una plataforma
      return;
    }

    // Reglas de detección de colisiones para que el jugador esté sobre la plataforma
    const platformDetectionRules = [
      player.position.x >= platform.position.x - player.width / 2,
      player.position.x <=
        platform.position.x + platform.width - player.width / 3,
      player.position.y + player.height >= platform.position.y,
      player.position.y <= platform.position.y + platform.height,
    ];

    if (platformDetectionRules.every((rule) => rule)) {
      player.position.y = platform.position.y + player.height;
      player.velocity.y = gravity;
    }
  });

  // Detección de colisiones con los checkpoints
  checkpoints.forEach((checkpoint, index, cps) => {
    const checkpointDetectionRules = [
      player.position.x >= checkpoint.position.x,
      player.position.y >= checkpoint.position.y,
      player.position.y + player.height <=
        checkpoint.position.y + checkpoint.height,
      isCheckpointCollisionDetectionActive,
      player.position.x - player.width <=
        checkpoint.position.x - checkpoint.width + player.width * 0.9,
      index === 0 || cps[index - 1].claimed === true,
    ];

    if (checkpointDetectionRules.every((rule) => rule)) {
      checkpoint.claim();

      // Si el jugador ha llegado al último checkpoint
      if (index === cps.length - 1) {
        isCheckpointCollisionDetectionActive = false;
        showCheckpointScreen("You reached the final checkpoint!"); // Muestra mensaje de final
        movePlayer("ArrowRight", 0, false); // Detiene el movimiento del jugador
      } else if (
        player.position.x >= checkpoint.position.x &&
        player.position.x <= checkpoint.position.x + 40
      ) {
        showCheckpointScreen("You reached a checkpoint!"); // Muestra mensaje de checkpoint
      }
    }
  });
};

// Objeto para gestionar las teclas presionadas
const keys = {
  rightKey: {
    pressed: false,
  }, // Tecla derecha
  leftKey: {
    pressed: false,
  }, // Tecla izquierda
};

// Función para mover al jugador según las teclas presionadas
const movePlayer = (key, xVelocity, isPressed) => {
  if (!isCheckpointCollisionDetectionActive) {
    player.velocity.x = 0;
    player.velocity.y = 0;
    return;
  }

  switch (key) {
    case "ArrowLeft":
      keys.leftKey.pressed = isPressed;
      if (xVelocity === 0) {
        player.velocity.x = xVelocity;
      }
      player.velocity.x -= xVelocity;
      break;
    case "ArrowUp":
    case " ":
    case "Spacebar":
      player.velocity.y = -8; // Salto infinito
      break;
    case "ArrowRight":
      keys.rightKey.pressed = isPressed;
      if (xVelocity === 0) {
        player.velocity.x = xVelocity;
      }
      player.velocity.x += xVelocity;
  }
};

// Función para iniciar el juego
const startGame = () => {
  canvas.style.display = "block"; // Muestra el canvas
  startScreen.style.display = "none"; // Oculta la pantalla de inicio
  animate(); // Llama a la función de animación
};

// Función para mostrar la pantalla de checkpoint
const showCheckpointScreen = (msg) => {
  checkpointScreen.style.display = "block"; // Muestra la pantalla de checkpoint
  checkpointMessage.textContent = msg; // Muestra el mensaje
  if (isCheckpointCollisionDetectionActive) {
    setTimeout(() => (checkpointScreen.style.display = "none"), 2000); // Oculta después de 2 segundos
  }
};

// Evento para iniciar el juego cuando se hace click en el botón
startBtn.addEventListener("click", startGame);

// Eventos para detectar teclas presionadas y soltas
window.addEventListener("keydown", ({ key }) => {
  movePlayer(key, 8, true);
});

window.addEventListener("keyup", ({ key }) => {
  movePlayer(key, 0, false);
});
