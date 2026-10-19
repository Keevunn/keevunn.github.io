function openTaskbarTask(taskID) {
    const task = document.getElementById(taskID);
    if (!task) return;

    task.classList.remove("closed");
}

const desktopIcons = document.querySelectorAll(".desktop-icon");

desktopIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
        if (!compactMode.matches) return;
        if (icon.id === "icon-email") window.location.href = icon.dataset.mailLink;
        openWindowByID(icon.dataset.target);
    });
    
    icon.addEventListener("dblclick", () => {
        if (compactMode.matches) return;
        if (icon.id === "icon-email") window.location.href = icon.dataset.mailLink;
        openWindowByID(icon.dataset.target);
    });
});

const taskbarTasks = document.querySelectorAll(".taskbar-task");

taskbarTasks.forEach((task) => {
    const targetID = task.dataset.target;
    const win = document.getElementById(targetID);
    if (!win) return;
    
    task.addEventListener("click", () => {
        if (win.classList.contains("minimised")) 
            openWindowByElement(win);
        else if (win.style.zIndex < highestZIdx - 1)
            bringToFront(win);
        else 
            minimiseWindow(win);
    });
});

// Click desktop all windows, all tasks inactive
const desktop = document.getElementById("desktop");
desktop.addEventListener("click", () => {
    taskbarTasks.forEach((task) => {
        task.classList.remove("active");
    });
    
    windows.forEach((win) => {
        win.classList.remove("active");
    })
})


// Taskbar clock
function updateClock() {
    const now = new Date();
    
    document.getElementById("clock").textContent = now.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
}

updateClock();
setInterval(updateClock, 1000);

// Non-draggable images
const nonDraggableList = document.querySelectorAll(`
    .desktop-icon img,
    .title-bar img,
    .window-toolbar img,
    .task-action img,
    .taskbar-task img,
    .project-item img
`);

nonDraggableList.forEach((image) => {
    image.addEventListener("dragstart", (event) => {event.preventDefault();});
});