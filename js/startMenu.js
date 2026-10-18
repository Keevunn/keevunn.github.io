const startButton = document.getElementById("start-button");
const startMenu = document.querySelector(".start-menu");

function setStartMenuOpen(isOpen) {
    startMenu.hidden = !isOpen;
    startButton.setAttribute("aria-expanded", String(isOpen));
}

function toggleStartMenu() {
    setStartMenuOpen(startMenu.hidden);
}

startButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleStartMenu();
});

startMenu.addEventListener("click", (event) => {
    const windowItem = event.target.closest("[data-window-id]");

    if (windowItem) {
        setStartMenuOpen(false);
    }
});

document.addEventListener("click", (event) => {
    if (startMenu.hidden) return;

    const clickedMenu = startMenu.contains(event.target);
    const clickedStartButton = startButton.contains(event.target);

    if (!clickedMenu && !clickedStartButton) {
        setStartMenuOpen(false);
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || startMenu.hidden) return;

    setStartMenuOpen(false);
    startButton.focus();
});