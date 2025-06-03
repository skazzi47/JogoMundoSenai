const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const tartaruga = document.querySelector('.tartaruga');
const menu = document.getElementById('menu');
const startBtn = document.getElementById('start-btn');
const gameBoard = document.querySelector('.game-board');
const jumpSound = document.getElementById('jump-sound');
const gameoverSound = document.getElementById('gameover-sound');
const bgMusic = document.getElementById('bg-music');

let isGameOver = false;
let currentObstacle = 'pipe'; // Alterna entre 'pipe' e 'tartaruga'

const jump = (event) => {
    if (isGameOver) return;
    // Permite pular apenas com espaço, seta para cima ou W
    if (
        event.code === 'Space' ||
        event.code === 'ArrowUp' ||
        event.code === 'KeyW'
    ) {
        if (!mario.classList.contains('jump')) {
            mario.classList.add('jump');
            jumpSound.currentTime = 0;
            jumpSound.play();
            setTimeout(() => {
                // Só remove a animação se o jogo não acabou
                if (!isGameOver) {
                    mario.classList.remove('jump');
                }
            }, 500);
        }
    }
}

function resetObstacle(obstacle) {
    obstacle.style.display = 'none';
    obstacle.style.right = '-90px';
}

function startObstacle(obstacle) {
    obstacle.style.display = 'block';
    obstacle.style.right = '-90px';
}

function animateObstacle(obstacle, speed, onEnd) {
    let pos = -90;
    obstacle.style.display = 'block';
    function frame() {
        if (isGameOver) return;
        pos += speed;
        obstacle.style.right = pos + 'px';
        if (pos < window.innerWidth) {
            requestAnimationFrame(frame);
        } else {
            resetObstacle(obstacle);
            if (onEnd) onEnd();
        }
    }
    frame();
}

function startGameLoop() {
    let speed = 12; // Aumenta a velocidade do obstáculo
    function nextObstacle() {
        if (isGameOver) return;
        let obstacle, other;
        if (currentObstacle === 'pipe') {
            obstacle = pipe;
            other = tartaruga;
        } else {
            obstacle = tartaruga;
            other = pipe;
        }
        resetObstacle(other);
        startObstacle(obstacle);
        animateObstacle(obstacle, speed, () => {
            currentObstacle = currentObstacle === 'pipe' ? 'tartaruga' : 'pipe';
            setTimeout(nextObstacle, 500); // Pequeno delay entre obstáculos
        });
    }
    nextObstacle();
}

function checkCollision() {
    if (isGameOver) return;
    let obstacle = currentObstacle === 'pipe' ? pipe : tartaruga;
    const obstacleRect = obstacle.getBoundingClientRect();
    const marioRect = mario.getBoundingClientRect();
    // Ajuste fino da hitbox: reduzindo levemente a largura do obstáculo e do Mario para evitar colisão precoce
    const marioHitbox = {
        left: marioRect.left + 60, // encolhe só mais um pouco a hitbox na esquerda
        right: marioRect.right - 25, // mantém a direita encolhida
        top: marioRect.top + 10,
        bottom: marioRect.bottom
    };
    const obstacleHitbox = {
        left: obstacleRect.left + 20, // diminui mais a hitbox na esquerda
        right: obstacleRect.right - 20, // diminui mais a hitbox na direita
        top: obstacleRect.top + 10,
        bottom: obstacleRect.bottom
    };
    if (
        obstacle.style.display === 'block' &&
        obstacleHitbox.left < marioHitbox.right &&
        obstacleHitbox.right > marioHitbox.left &&
        obstacleHitbox.bottom > marioHitbox.top &&
        obstacleHitbox.top < marioHitbox.bottom
    ) {
        // Game over
        isGameOver = true;
        jumpSound.pause();
        jumpSound.currentTime = 0;
        bgMusic.pause();
        obstacle.style.display = 'block';
        mario.src = './img/game-over.png';
        mario.style.width = '90px';
        mario.style.height = 'auto';
        // Centraliza o Mario na posição original ao trocar para game-over.png
        const marioCenter = marioRect.left + marioRect.width / 2;
        setTimeout(() => {
            const newMarioRect = mario.getBoundingClientRect();
            const newLeft = marioCenter - newMarioRect.width / 2;
            mario.style.left = `${newLeft}px`;
        }, 10);
        mario.classList.remove('jump');
        void mario.offsetWidth;
        setTimeout(() => {
            mario.classList.add('game-over');
        }, 800);
        setTimeout(() => {
            gameoverSound.currentTime = 0;
            gameoverSound.play();
        }, 50);
    }
}

// Substitui o loop antigo por um novo loop de colisão
setInterval(() => {
    checkCollision();
}, 10);

startBtn.addEventListener('click', () => {
    menu.style.display = 'none';
    gameBoard.style.display = 'block';
    isGameOver = false;
    mario.src = './img/mario.gif';
    mario.classList.remove('game-over');
    currentObstacle = 'pipe';
    resetObstacle(pipe);
    resetObstacle(tartaruga);
    document.addEventListener('keydown', jump);
    bgMusic.currentTime = 0;
    bgMusic.play();
    startGameLoop();
});