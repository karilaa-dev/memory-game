class GameState {
    constructor() {
        this.moves = 0;
        this.time = 0;
        this.intervalId = null;
        this.theme = 'colors';
        this.gridSize = 2;
        this.totalMoves = localStorage.getItem("totalMoves");
    }

    startTimer() {
        if (!this.intervalId) {
            this.intervalId = setInterval(() => {
                this.time++;
                document.getElementById('timer').textContent = 
                    `${String(Math.floor(this.time/60)).padStart(2, '0')}:${String(this.time%60).padStart(2, '0')}`;
            }, 1000);
        }
    }

    addTotalMoves() {
        let beforeMoves = parseInt(localStorage.getItem("totalMoves"));
        console.info("Before Total Moves++", beforeMoves)
        if (beforeMoves >= 0) {
            console.info("New Total Moves++", beforeMoves+1)
            localStorage.setItem("totalMoves", beforeMoves+1);
            
        }
        else {
            localStorage.setItem("totalMoves", 1);
        }
        this.totalMoves = localStorage.getItem("totalMoves");
    }

    reset() {
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.time = 0;
        this.moves = 0;
        this.totalMoves = localStorage.getItem("totalMoves");
    }
}

const soundEffects = {
    flip: () => playSound(800, 100),
    match: () => playSound(1200, 300),
    mismatch: () => playSound(300, 500),
    win: () => playSound(1500, 1000)
};

const symbols = [
    '★', '♦', '♠', '♥', '♣', '♛', '♞', '♝', '♚', '♕',
    '✦', '✧', '❄', '❤', '✈', '✂', '⌛', '✏', '✎', '✐',
    '✓', '✕', '✷', '✶', '✵', '⚛', '⚡', '♨', '✹', '❂'
];

const generatePairs = (size, theme) => {
    const pairCount = (size ** 2) / 2;
    const themes = {
        colors: Array.from({length: pairCount}, (_, i) => `hsl(${i * (360/pairCount)}, 70%, 60%)`),
        symbols: [...symbols.slice(0, pairCount)]
    };
    return shuffleArray([...themes[theme], ...themes[theme]]);
};

const createCards = (items, theme) => {
    return items.map(item => {
        const card = document.createElement('div');
        card.className = 'card';
        const content = theme === 'symbols' ? item : '';
        
        card.innerHTML = `
            <div class="card-back"></div>
            <div class="card-front" style="${theme === 'colors' ? `background: ${item}` : ''}">
                ${content}
            </div>
        `;
        card.dataset.value = item.toString();
        return card;
    });
};

const handleCardClick = (e) => {
    if (!canClick) return;
    gameState.startTimer();
    
    const card = e.currentTarget;
    if (card.classList.contains('flipped')) return;

    soundEffects.flip();
    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        canClick = false;
        gameState.moves++;
        gameState.addTotalMoves()
        document.getElementById('moves').textContent = gameState.moves;
        document.getElementById('totalMoves').textContent = gameState.totalMoves;

        const [first, second] = flippedCards;
        if (first.dataset.value === second.dataset.value) {
            soundEffects.match();
            first.classList.add('matched');
            second.classList.add('matched');
            flippedCards = [];
            canClick = true;
            checkGameOver();
        } else {
            soundEffects.mismatch();
            setTimeout(() => {
                first.classList.remove('flipped');
                second.classList.remove('flipped');
                flippedCards = [];
                canClick = true;
            }, 1000);
        }
    }
};

const checkGameOver = () => {
    const matchedCards = document.querySelectorAll('.matched').length;
    const totalCards = document.querySelectorAll('.card').length;
    if (matchedCards === totalCards) {
        soundEffects.win();
        setTimeout(() => {
            alert(`Game Won!\nTime: ${gameState.time}s\nMoves: ${gameState.moves}`);
            gameState.reset();
        }, 100);
    }
};

const initGame = () => {
    gameState.reset();
    document.getElementById('totalMoves').textContent = gameState.totalMoves;
    gameState.gridSize = parseInt(document.getElementById('difficulty').value);
    gameState.theme = document.getElementById('theme').value;
    
    const pairs = generatePairs(gameState.gridSize, gameState.theme);
    const cards = createCards(pairs, gameState.theme);
    
    const grid = document.getElementById('grid');
    grid.style.gridTemplateColumns = `repeat(${gameState.gridSize}, 1fr)`;
    grid.replaceChildren(...cards);
    
    document.getElementById('moves').textContent = '0';
    document.getElementById('timer').textContent = '00:00';
    
    cards.forEach(card => card.addEventListener('click', handleCardClick));
};

const playSound = (frequency = 440, duration = 200) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration/1000);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration/1000);
};

const shuffleArray = array => [...array].sort(() => Math.random() - 0.5);

const gameState = new GameState();
let flippedCards = [];
let canClick = true;

// Event Listeners
document.getElementById('difficulty').addEventListener('change', initGame);
document.getElementById('theme').addEventListener('change', initGame);
document.getElementById('restart').addEventListener('click', initGame);

initGame();