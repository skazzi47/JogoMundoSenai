const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const menu = document.getElementById('menu');
const startBtn = document.getElementById('start-btn');
const gameBoard = document.querySelector('.game-board');

const jump = () => {
    mario.classList.add('jump');

    setTimeout(() => {

        mario.classList.remove('jump');

    }, 500);
}

const loop = setInterval(()=> {

    console.log('loop');

    const pipePosition = pipe.offsetLeft;
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
    
    console.log(marioPosition);

    if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80){

        pipe.style.animation = ('none');
        pipe.style.left = `${pipePosition}px`;
        
        mario.style.animation = ('none');
        mario.style.bottom = `${marioPosition}px`;

        mario.src = './img/game-over.png';
        mario.style.width = '75px';
        mario.style.marginLeft = '50px';

        // Remove a classe jump caso esteja presente para evitar conflito de animação
        mario.classList.remove('jump');
        // Força reflow para reiniciar a animação
        void mario.offsetWidth;
        // Adiciona animação de game over
        mario.classList.add('game-over');

        clearInterval(loop);
    }

}, 10)

startBtn.addEventListener('click', () => {
    menu.style.display = 'none';
    gameBoard.style.display = 'block';
    document.addEventListener('keydown', jump);
});