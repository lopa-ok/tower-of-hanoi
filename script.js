document.addEventListener("DOMContentLoaded", () => {
    const towers = document.querySelectorAll(".tower");
    const resetButton = document.getElementById("reset");
    const message = document.getElementById("message");

    let selectedDisk = null;

    const createDisks = () => {
        for (let i = 3; i > 0; i--) {
            const disk = document.createElement("div");
            disk.classList.add("disk");
            disk.style.width = `${100 + (i - 1) * 30}px`;
            disk.setAttribute("data-size", i);
            towers[0].appendChild(disk);
        }
    };

    const moveDisk = (tower) => {
        if (selectedDisk) {
            const topDisk = tower.lastElementChild;
            if (!topDisk || parseInt(selectedDisk.getAttribute("data-size")) < parseInt(topDisk.getAttribute("data-size"))) {
                tower.appendChild(selectedDisk);
                selectedDisk = null;
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

    const checkWin = () => {
        if (towers[2].childElementCount === 3) {
            message.textContent = "You won!";
        }
    };

    towers.forEach(tower => {
        tower.addEventListener("click", () => moveDisk(tower));
    });

    resetButton.addEventListener("click", () => {
        towers.forEach(tower => tower.innerHTML = "");
        message.textContent = "Move all the disks from Tower 1 to Tower 3!";
        createDisks();
    });

    createDisks();
});
