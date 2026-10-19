const compactMode = window.matchMedia("(max-width: 760px), (hover: none) and (pointer: coarse)");

const windows = document.querySelectorAll(".window");
let highestZIdx = 100;

/*
Window classes:
    minimised       window hidden, task visible in taskbar
    maximised       window fullscreen
    closed          window hidden, task hidden in taskbar
    default state   window open, not fullscreen
    
Taskbar classes:
    closed          task hidden in taskbar
    default state   task visible in taskbar
 */

function bringToFront(win) {
    win.style.zIndex = highestZIdx++;
    windows.forEach((win) => {win.classList.remove("active");});
    win.classList.add("active");

    taskbarTasks.forEach((task) => {
        task.classList.remove("active");
    });
    
    const taskID = win.getAttribute("data-target");
    if (!taskID) return;
    
    const activeTask = document.getElementById(taskID);
    if (activeTask) activeTask.classList.add("active");
}

function clearActiveWindow() {
    windows.forEach(win => win.classList.remove("active"));
    taskbarTasks.forEach(task => task.classList.remove("active"));
}

function getWindowZIndex(win) {
    const zIndex = Number.parseInt(getComputedStyle(win).zIndex, 10);
    return Number.isNaN(zIndex) ? 0 : zIndex;
}

function activateTopVisibleWindow() {
    const visibleWindows = [...windows].filter(win =>
        !win.classList.contains("closed") &&
        !win.classList.contains("minimised")
    );

    if (visibleWindows.length === 0) {
        clearActiveWindow();
        return;
    }

    const topWindow = visibleWindows.reduce((highest, candidate) =>
        getWindowZIndex(candidate) > getWindowZIndex(highest)
            ? candidate
            : highest
    );

    bringToFront(topWindow);
}

function openWindowByID(windowID) {
    const win = document.getElementById(windowID);
    if (!win) return;

    win.classList.remove("closed", "minimised");
    bringToFront(win);

    const taskID = win.getAttribute("data-target");
    openTaskbarTask(taskID);
}

function openWindowByElement(win) {
    win.classList.remove("closed", "minimised");
    bringToFront(win);

    const taskID = win.getAttribute("data-target");
    openTaskbarTask(taskID);
}

function minimiseWindow(win, activateNext = true) {
    const wasActive = win.classList.contains("active");

    win.classList.add("minimised");
    win.classList.remove("active");

    const taskID = win.dataset.target;
    const task = document.getElementById(taskID);

    if (task) task.classList.remove("active");
    if (activateNext && wasActive) activateTopVisibleWindow();
    
}

function showDesktop() {
    windows.forEach(win => {
        minimiseWindow(win, false);
    });
    
    clearActiveWindow();
}

// TODO if window closed add appropriate classes
windows.forEach((win) => {
    // On start only about (or portfolio) page open
    
    
    // window to front
    win.addEventListener("mousedown", () => {
        bringToFront(win);
    });
    
    // Title bar control buttons ----------------
    const titleBar = win.querySelector(".title-bar");
    const minimiseBtn = win.querySelector(".window-min");
    const maximiseBtn = win.querySelector(".window-max");
    const restoreBtn = win.querySelector(".window-restore");
    const closeBtn = win.querySelector(".window-close");

    restoreBtn.style.display = "none";
    
    // Minimise
    minimiseBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        minimiseWindow(win);
    });
    
    // Maximise
    maximiseBtn.addEventListener("click", (event) => {
        maximiseBtn.style.display = "none";
        restoreBtn.style.display = "block";
        win.classList.toggle("maximised");
    });
    
    // Restore (fullscreen)
    restoreBtn.addEventListener("click", (event) => {
        restoreBtn.style.display = "none";
        maximiseBtn.style.display = "block";
        win.classList.toggle("maximised");
    });
    
    // Close
    closeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        const wasActive = win.classList.contains("active");

        win.dispatchEvent(new CustomEvent("window-closed"));
        win.classList.add("closed");
        win.classList.remove("active");

        const task = document.getElementById(win.dataset.target);

        if (task) {
            task.classList.add("closed");
            task.classList.remove("active");
        }
        if (wasActive) activateTopVisibleWindow();
    });

    // Draggable windows ----------------
    let isDragging = false;
    let offsetX = 0, offsetY = 0;
    
    titleBar.addEventListener("mousedown", (event) => {
        if (compactMode.matches) return;
        if (event.target.closest(".title-bar-controls")) return;

        isDragging = true;
        
        const winRect = win.getBoundingClientRect();
        offsetX = event.clientX - winRect.left;
        offsetY = event.clientY - winRect.top;
        
        bringToFront(win);
    });
    
    document.addEventListener("mousemove", (event) => {
        if (!isDragging) return;
        
        const desktop = document.getElementById("desktop");
        const desktopRect = desktop.getBoundingClientRect();
        const winRect = win.getBoundingClientRect();
        
        const maxLeft = desktopRect.width - winRect.width;
        const maxTop = desktopRect.height - winRect.height;
        
        let newLeft = Math.max(0, Math.min(event.clientX - offsetX, maxLeft));
        let newTop = Math.max(0, Math.min(event.clientY - offsetY, maxTop));
        
        win.style.left = `${newLeft}px`;
        win.style.top = `${newTop}px`;
    });
    
    document.addEventListener("mouseup", (event) => {
        isDragging = false;
    });
    
});

const windowLinks = document.querySelectorAll("[data-window-id]");
windowLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        openWindowByID(link.dataset.windowId);
    });
});