document.addEventListener("DOMContentLoaded", () => {
    const towers = document.querySelectorAll(".tower");
    const startButton = document.getElementById("start");
    const resetButton = document.getElementById("reset");
    const undoButton = document.getElementById("undo");
    const hintButton = document.getElementById("hint");
    const difficultySelect = document.getElementById("difficulty");
    const moveCountElement = document.getElementById("moveCount");
    const timerElement = document.getElementById("timer");
    const message = document.getElementById("message");
    const saveButton = document.getElementById("save");
    const loadButton = document.getElementById("load");
    const themeSelect = document.getElementById("theme");
    const achievementElement = document.getElementById("achievements");

    let selectedDisk = null;
    let moveCount = 0;
    let moveHistory = [];
    let timer = null;
    let timeElapsed = 0;
    let numDisks = 3;
    let achievements = [];

    const moveSound = new Audio("move.wav");
    const winSound = new Audio("win.wav");
    const errorSound = new Audio("error.wav");

    const createDisks = () => {
        towers.forEach(tower => tower.innerHTML = "");
        for (let i = numDisks; i > 0; i--) {
            const disk = document.createElement("div");
            disk.classList.add("disk");
            disk.style.width = `${100 + (i - 1) * 30}px`;
            disk.setAttribute("data-size", i);
            disk.setAttribute("data-tower", "tower1");
            towers[0].appendChild(disk);
        }
    };

    const moveDisk = (tower) => {
        if (!timer) startTimer();

        if (selectedDisk) {
            const topDisk = tower.lastElementChild;
            if (!topDisk || parseInt(selectedDisk.getAttribute("data-size")) < parseInt(topDisk.getAttribute("data-size"))) {
                tower.appendChild(selectedDisk);
                moveHistory.push({ disk: selectedDisk, from: selectedDisk.dataset.tower, to: tower.id });
                selectedDisk.setAttribute("data-tower", tower.id);
                selectedDisk = null;
                moveCount++;
                updateMoveCount();
                checkWin();
                moveSound.play();
            } else {
                message.textContent = "Invalid move!";
                errorSound.play();
            }
        } else {
            selectedDisk = tower.lastElementChild;
            if (selectedDisk) {
                selectedDisk.remove();
            }
        }
    };

    const undoMove = () => {
        if (moveHistory.length > 0) {
            const lastMove = moveHistory.pop();
            const disk = lastMove.disk;
            const fromTower = document.getElementById(lastMove.from);
            fromTower.appendChild(disk);
            moveCount--;
            updateMoveCount();
        }
    };

    const updateMoveCount = () => {
        moveCountElement.textContent = moveCount;
    };

    const checkWin = () => {
        if (towers[2].childElementCount === numDisks) {
            clearInterval(timer);
            message.textContent = "You won!";
            winSound.play();
            recordAchievement();
        }
    };

    const getOptimalMove = (n, from, to, aux) => {
        if (n === 1) {
            return [{ from, to }];
        }
        const moves = [];
        moves.push(...getOptimalMove(n - 1, from, aux, to));
        moves.push({ from, to });
        moves.push(...getOptimalMove(n - 1, aux, to, from));
        return moves;
    };

    const provideHint = () => {
        const optimalMoves = getOptimalMove(numDisks, "tower1", "tower3", "tower2");

        for (const move of optimalMoves) {
            const fromTower = document.getElementById(move.from);
            const toTower = document.getElementById(move.to);

            const fromDisk = fromTower.lastElementChild;
            const toDisk = toTower.lastElementChild;

            if (fromDisk && (!toDisk || parseInt(fromDisk.getAttribute("data-size")) < parseInt(toDisk.getAttribute("data-size")))) {
                message.textContent = `Hint: Move disk from ${move.from.toUpperCase()} to ${move.to.toUpperCase()}`;
                break;
            }
        }
    };

    const startTimer = () => {
        timer = setInterval(() => {
            timeElapsed++;
            const minutes = Math.floor(timeElapsed / 60);
            const seconds = timeElapsed % 60;
            timerElement.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        }, 1000);
    };

    const saveGame = () => {
        const gameState = {
            moveCount,
            timeElapsed,
            numDisks,
            towers: Array.from(towers).map(tower => {
                return Array.from(tower.children).map(disk => ({
                    size: disk.getAttribute("data-size"),
                    tower: disk.getAttribute("data-tower")
                }));
            }),
            achievements
        };
        localStorage.setItem("towerOfHanoiState", JSON.stringify(gameState));
    };

    const loadGame = () => {
        const savedState = JSON.parse(localStorage.getItem("towerOfHanoiState"));
        if (savedState) {
            moveCount = savedState.moveCount;
            timeElapsed = savedState.timeElapsed;
            numDisks = savedState.numDisks;
            achievements = savedState.achievements;
            updateMoveCount();
            timerElement.textContent = `${Math.floor(timeElapsed / 60)}:${timeElapsed % 60 < 10 ? "0" : ""}${timeElapsed % 60}`;
            savedState.towers.forEach((towerState, index) => {
                const tower = towers[index];
                tower.innerHTML = "";
                towerState.forEach(diskState => {
                    const disk = document.createElement("div");
                    disk.classList.add("disk");
                    disk.style.width = `${100 + (diskState.size - 1) * 30}px`;
                    disk.setAttribute("data-size", diskState.size);
                    disk.setAttribute("data-tower", `tower${index + 1}`);
                    tower.appendChild(disk);
                });
            });
            displayAchievements();
        }
    };

    const applyTheme = (theme) => {
        document.body.className = theme;
    };

    const recordAchievement = () => {
        if (numDisks === 3 && moveCount <= 7) {
            achievements.push("Quick 3-Disks Solve");
        }
        displayAchievements();
    };

    const displayAchievements = () => {
        achievementElement.innerHTML = achievements.map(ach => `<li>${ach}</li>`).join("");
    };

    const resetGame = () => {
        clearInterval(timer);
        timer = null;
        timeElapsed = 0;
        timerElement.textContent = "0:00";
        moveCount = 0;
        moveHistory = [];
        achievements = [];
        updateMoveCount();
        createDisks();
    };

    towers.forEach(tower => {
        tower.addEventListener("click", () => moveDisk(tower));
    });

    resetButton.addEventListener("click", () => resetGame());
    undoButton.addEventListener("click", () => undoMove());
    hintButton.addEventListener("click", () => provideHint());
    saveButton.addEventListener("click", () => saveGame());
    loadButton.addEventListener("click", () => loadGame());
    themeSelect.addEventListener("change", () => applyTheme(themeSelect.value));

    startButton.addEventListener("click", () => {
        numDisks = parseInt(difficultySelect.value);
        resetGame();
    });

    resetGame();
    loadGame();
});
