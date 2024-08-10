document.addEventListener("DOMContentLoaded", () => {
    const towers = document.querySelectorAll(".tower");
    const resetButton = document.getElementById("reset");
    const undoButton = document.getElementById("undo");
    const hintButton = document.getElementById("hint");
    const moveCountElement = document.getElementById("moveCount");
    const message = document.getElementById("message");

    let selectedDisk = null;
    let moveCount = 0;
    let moveHistory = [];

    const createDisks = (numDisks = 3) => {
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
            } else {
                message.textContent = "Invalid move!";
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
        if (towers[2].childElementCount === 3) {
            message.textContent = "You won!";
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
        const numDisks = towers[0].childElementCount + towers[1].childElementCount + towers[2].childElementCount;
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

    towers.forEach(tower => {
        tower.addEventListener("click", () => moveDisk(tower));
    });

    resetButton.addEventListener("click", () => {
        towers.forEach(tower => tower.innerHTML = "");
        message.textContent = "Move all the disks from Tower 1 to Tower 3!";
        moveCount = 0;
        moveHistory = [];
        updateMoveCount();
        createDisks();
    });

    undoButton.addEventListener("click", () => undoMove());
    hintButton.addEventListener("click", () => provideHint());

    createDisks();
});
