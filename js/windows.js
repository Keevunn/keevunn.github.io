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
}
function openWindowByID(windowID) {
    const win = document.getElementById(windowID);
    if (!win) return;

    win.classList.remove("closed", "minimized");
    bringToFront(win);

    const taskID = win.getAttribute("data-target");
    openTaskbarTask(taskID);
}

function openWindowByElement(win) {
    win.classList.remove("closed", "minimized");
    bringToFront(win);

    const taskID = win.getAttribute("data-target");
    openTaskbarTask(taskID);
}

function openTaskbarTask(taskID) {
    const task = document.getElementById(taskID);
    if (!task) return;
    
    task.classList.remove("closed");
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
    
    maximiseBtn.style.display = "none";
    
    // Minimize
    minimiseBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        win.classList.add("minimized");
    });
    
    // Maximize
    maximiseBtn.addEventListener("click", (event) => {
        maximiseBtn.style.display = "none";
        restoreBtn.style.display = "block";
        win.classList.toggle("maximized");
    });
    
    // Restore (fullscreen)
    restoreBtn.addEventListener("click", (event) => {
        restoreBtn.style.display = "none";
        maximiseBtn.style.display = "block";
        win.classList.toggle("maximized");
    });
    
    // Close
    closeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        win.classList.add("closed");

        // Taskbar task
        const targetID = win.getAttribute("data-target");
        const task = document.getElementById(targetID);
        if (!task) return;
        
        task.classList.add("closed");
    });

    // Draggable windows ----------------
    let isDragging = false;
    let offsetX, offsetY = 0;
    
    titleBar.addEventListener("mousedown", (event) => {
        if (event.target.closest(".title-bar-controls")) return;
        
        isDragging = true;
        
        const winRect = win.getBoundingClientRect();
        offsetX = event.clientX - winRect.left;
        offsetY = event.clientY - winRect.top;
        
        bringToFront(win);
    });
    
    document.addEventListener("mousemove", (event) => {
        if (!isDragging) return;
        
        win.style.left = `${event.clientX - offsetX}px`;
        win.style.top = `${event.clientY - offsetY}px`;
    });
    
    document.addEventListener("mouseup", (event) => {
        isDragging = false;
    });
    
});

