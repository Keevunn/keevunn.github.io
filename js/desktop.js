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
    
    task.addEventListener("click", () => {
        openWindowByID(targetID);
    });
});