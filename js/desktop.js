function openTaskbarTask(taskID) {
    const task = document.getElementById(taskID);
    if (!task) return;

    task.classList.remove("closed");
}

const desktopIcons = document.querySelectorAll(".desktop-icon");

desktopIcons.forEach((icon) => {
    icon.addEventListener("dblclick", () => {
       const targetID = icon.getAttribute("data-target");
       openWindowByID(targetID);
    });
});

const taskbarTasks = document.querySelectorAll(".taskbar-task");

taskbarTasks.forEach((task) => {
    const targetID = task.getAttribute("data-target");
    const win = document.getElementById(targetID);
    if (!win) return;
    
    task.addEventListener("click", () => {
        if (win.classList.contains("minimised")) 
            openWindowByElement(win);
        else if (win.style.zIndex < highestZIdx - 1)
            bringToFront(win);
        else {
            win.classList.add("minimised");
            
            const taskID = win.getAttribute("data-target");
            if (!taskID) return;

            const activeTask = document.getElementById(taskID);
            if (activeTask) activeTask.classList.remove("active");
        }
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