const windows = document.querySelectorAll(".window");
let highestZIdx = 100;

windows.forEach((win) => {
    // Taskbar control buttons ----------------
    const titleBar = win.querySelector(".title-bar");
    const minimizeBtn = win.querySelector(".window-min");
    const maximizeBtn = win.querySelector(".window-max");
    const restoreBtn = win.querySelector(".window-restore");
    const closeBtn = win.querySelector(".window-close");
    
    maximizeBtn.style.display = "none";
    
    // window to front
    win.addEventListener("mousedown", () => {
        win.style.zindex = highestZIdx;
        highestZIdx++;
    });
    
    // Minimize
    minimizeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        win.classList.add("minimized");
    });
    
    // Maximize
    maximizeBtn.addEventListener("click", (event) => {
        maximizeBtn.style.display = "none";
        restoreBtn.style.display = "block";
        win.classList.toggle("maximized");
    });
    
    // Restore (fullscreen)
    restoreBtn.addEventListener("click", (event) => {
        restoreBtn.style.display = "none";
        maximizeBtn.style.display = "block";
        win.classList.toggle("maximized");
    });
    
    // Close
    closeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        win.classList.add("closed");
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
        
        win.style.zindex = highestZIdx;
        highestZIdx++;
    });
    
    document.addEventListener("mousemove", (event) => {
        if (!isDragging) return;
        
        win.style.left = `${event.clientX - offsetX}px`;
        win.style.top = `${event.clientY - offsetY}px`;
    });
    
    document.addEventListener("mouseup", (event) => {
        isDragging = false;
    })
});

