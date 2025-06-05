const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const tartaruga = document.querySelector('.tartaruga');
const moeda = document.querySelector('.moeda');
const menu = document.getElementById('menu');
const startBtn = document.getElementById('start-btn');
const gameBoard = document.querySelector('.game-board');
const jumpSound = document.getElementById('jump-sound');
const gameoverSound = document.getElementById('gameover-sound');
const bgMusic = document.getElementById('bg-music');
const coinSound = new Audio('./audio/mario-coin-sound-effect.mp3');

let isGameOver = false;
let currentObstacle = 'pipe'; // Alterna entre 'pipe' e 'tartaruga'
let moedaActive = false;
let contadorMoedas = 0;
const contadorMoedasSpan = document.querySelector('.contador-moedas');
let tempo = 0;
let tempoInterval = null;
const contadorTempoSpan = document.querySelector('.contador-tempo');
let vidas = 3;
const contadorVidasSpan = document.querySelector('.contador-vidas');

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

function animateMoeda(speed) {
    let pos = -90;
    moeda.style.display = 'block';
    moedaActive = true;
    function frame() {
        if (isGameOver || !moedaActive) return;
        pos += speed;
        moeda.style.right = pos + 'px';
        if (pos < window.innerWidth) {
            requestAnimationFrame(frame);
        } else {
            moeda.style.display = 'none';
            moedaActive = false;
        }
    }
    frame();
}

function startGameLoop() {
    let speed = 12;
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
            setTimeout(nextObstacle, 500);
        });
        // Spawn múltiplas moedas em posições variadas
        if (!isGameOver) {
            // Sempre pode spawnar uma moeda sobre o obstáculo
            if (Math.random() < 0.9) {
                spawnMoeda('obstacle', obstacle, speed);
            }
            // Pode spawnar moedas extras dos lados (esquerda/direita/centro)
            const maxMoedasExtras = 2 + Math.floor(Math.random() * 2); // 2 ou 3 moedas extras
            for (let i = 0; i < maxMoedasExtras; i++) {
                if (Math.random() < 0.7) {
                    spawnMoeda('random', null, speed);
                }
            }
        }
    }
    nextObstacle();
}

// Função para spawnar moedas em diferentes posições
function spawnMoeda(tipo, obstacle, speed) {
    // Cria um novo elemento moeda
    const novaMoeda = document.createElement('img');
    novaMoeda.src = './img/gifmoeda.gif';
    novaMoeda.className = 'moeda';
    novaMoeda.style.position = 'absolute';
    novaMoeda.style.display = 'block';
    novaMoeda.style.zIndex = 3;
    // Define posição vertical aleatória
    const minBottom = 80;
    const maxBottom = 350;
    let bottom = Math.floor(Math.random() * (maxBottom - minBottom + 1)) + minBottom;
    // Define posição horizontal inicial
    let right = -90;
    if (tipo === 'obstacle' && obstacle) {
        // Sobre o obstáculo: mesma altura do obstáculo + 80px
        bottom = (parseInt(obstacle.style.bottom || 0) + 80);
    } else if (tipo === 'random') {
        // Lados: pode variar a altura e pode variar o right inicial
        if (Math.random() < 0.5) {
            right = -90; // Lado direito (padrão)
        } else {
            right = Math.floor(Math.random() * (window.innerWidth * 0.5)); // Spawn mais à esquerda
        }
    }
    novaMoeda.style.bottom = bottom + 'px';
    novaMoeda.style.right = right + 'px';
    // Adiciona ao game-board
    gameBoard.appendChild(novaMoeda);
    // Animação da moeda
    let pos = right;
    let ativa = true;
    function frame() {
        if (isGameOver || !ativa) {
            novaMoeda.style.display = 'none';
            gameBoard.removeChild(novaMoeda);
            return;
        }
        pos += speed;
        novaMoeda.style.right = pos + 'px';
        if (pos < window.innerWidth) {
            requestAnimationFrame(frame);
        } else {
            novaMoeda.style.display = 'none';
            ativa = false;
            if (gameBoard.contains(novaMoeda)) gameBoard.removeChild(novaMoeda);
        }
    }
    frame();
    // Colisão da moeda (adiciona ao loop de colisão)
    novaMoeda._ativa = true;
    moedasAtivas.push(novaMoeda);
}

// Lista para moedas ativas
let moedasAtivas = [];

// Função para pausar animações de fundo
function pauseBackgroundAnimations() {
    document.querySelector('.chao-box').style.animationPlayState = 'paused';
    document.querySelector('.clouds').style.animationPlayState = 'paused';
}

// Função para retomar animações de fundo
function resumeBackgroundAnimations() {
    document.querySelector('.chao-box').style.animationPlayState = 'running';
    document.querySelector('.clouds').style.animationPlayState = 'running';
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
        // Controle de vidas: permite jogar uma última vez com 0
        if (vidas > 0) {
            vidas--;
            contadorVidasSpan.textContent = vidas;
        }
        if (vidas >= 0) {
            isGameOver = true;
            if (tempoInterval) clearInterval(tempoInterval);
            pauseBackgroundAnimations();
            jumpSound.pause();
            jumpSound.currentTime = 0;
            bgMusic.pause();
            obstacle.style.display = 'block';
            mario.src = './img/game-over.png';
            mario.style.width = '90px';
            mario.style.height = 'auto';
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
            // Se ainda tem a última chance (vidas > 0 ou vidas == 0), reinicia normalmente
            if (vidas > 0) {
                setTimeout(() => {
                    // Reset para próxima vida
                    mario.src = './img/mario.gif';
                    mario.style.width = '150px';
                    mario.style.height = '';
                    mario.classList.remove('game-over');
                    mario.style.left = '';
                    isGameOver = false;
                    contadorTempoSpan.style.display = 'block';
                    contadorVidasSpan.style.display = 'block';
                    tempoInterval = setInterval(() => {
                        if (!isGameOver) {
                            tempo++;
                            contadorTempoSpan.textContent = tempo;
                        }
                    }, 1000);
                    currentObstacle = 'pipe';
                    resetObstacle(pipe);
                    resetObstacle(tartaruga);
                    document.addEventListener('keydown', jump);
                    bgMusic.currentTime = 0;
                    bgMusic.play();
                    resumeBackgroundAnimations();
                    startGameLoop();
                }, 2000);
            }
        }
        // Se já está em 0 e morrer de novo, reinicia o jogo
        if (vidas === 0) {
            // Permite jogar normalmente, mas não renasce mais depois
            // O próximo hit (vidas < 0) reinicia o jogo
        }
        if (vidas < 0) {
            isGameOver = true;
            if (tempoInterval) clearInterval(tempoInterval);
            contadorVidasSpan.style.display = 'none';
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }
    // Colisão com moedas múltiplas
    moedasAtivas = moedasAtivas.filter(moedaEl => {
        if (!moedaEl._ativa || moedaEl.style.display === 'none') return false;
        const moedaRect = moedaEl.getBoundingClientRect();
        const moedaHitbox = {
            left: moedaRect.left + 10,
            right: moedaRect.right - 10,
            top: moedaRect.top + 10,
            bottom: moedaRect.bottom - 10
        };
        if (
            moedaHitbox.left < marioHitbox.right &&
            moedaHitbox.right > marioHitbox.left &&
            moedaHitbox.bottom > marioHitbox.top &&
            moedaHitbox.top < marioHitbox.bottom
        ) {
            moedaEl.style.display = 'none';
            moedaEl._ativa = false;
            if (gameBoard.contains(moedaEl)) gameBoard.removeChild(moedaEl);
            coinSound.currentTime = 0;
            coinSound.play();
            contadorMoedas++;
            contadorMoedasSpan.textContent = contadorMoedas;
            return false;
        }
        return true;
    });
}

// Substitui o loop antigo por um novo loop de colisão
setInterval(() => {
    checkCollision();
}, 10);

startBtn.addEventListener('click', () => {
    menu.style.display = 'none';
    gameBoard.style.display = 'block';
    document.querySelector('.barra-status').style.display = 'block';
    contadorMoedas = 0;
    contadorMoedasSpan.textContent = '0';
    contadorMoedasSpan.style.display = 'block';
    tempo = 0;
    contadorTempoSpan.textContent = '0';
    contadorTempoSpan.style.display = 'block';
    if (tempoInterval) clearInterval(tempoInterval);
    tempoInterval = setInterval(() => {
        if (!isGameOver) {
            tempo++;
            contadorTempoSpan.textContent = tempo;
        }
    }, 1000);
    vidas = 3;
    contadorVidasSpan.textContent = '3';
    contadorVidasSpan.style.display = 'block';
    isGameOver = false;
    mario.src = './img/mario.gif';
    mario.classList.remove('game-over');
    currentObstacle = 'pipe';
    resetObstacle(pipe);
    resetObstacle(tartaruga);
    document.addEventListener('keydown', jump);
    bgMusic.currentTime = 0;
    bgMusic.play();
    resumeBackgroundAnimations();
    startGameLoop();
});