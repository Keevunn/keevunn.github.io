let projectsById = new Map();
let selectedProjectId = null;

/*
Valid view states:
{view: "list"}
{view: "detail", <id>}
 */
const projectViewHistory = [{view: "list"}];
let projectViewHistoryIndex = 0;

async function initialiseProjects() {
    const [projectsResponse, templateResponse] = await Promise.all([
        fetch("data/projects.json"),
        fetch("templates/projectDetails.html")
    ]);
    
    if (!projectsResponse.ok || !templateResponse.ok) throw new Error("Project content could not be loaded.");
    
    const projects = await projectsResponse.json();
    const templateMarkup = await templateResponse.text();
    
    document.body.insertAdjacentHTML("beforeend", templateMarkup);
    
    projectsById = new Map(projects.map((project) => [project.id, project]));
    
    initialiseProjectSelection();
    initialiseProjectDeselection();
    initialiseProjectActions();
    initialiseProjectNavigation();
    initialiseSectionNavigation();
    initialiseProjectWindowReset();
    
    renderProjectView(projectViewHistory[0]);
    updateProjectNavigationButtons();
}

/* 
 Open project:
 - double-click
 - enter when item focused
 - pressing "Open project" on left panel
 
 single click focuses item
 */
function initialiseProjectSelection() {
    const items = document.querySelectorAll(".project-item");
    
    items.forEach((item) => {
        item.addEventListener("click", () => {
            selectProject(item.dataset.projectId);
        });
        
        item.addEventListener("dblclick", () => {
            openProject(item.dataset.projectId);
        });
        
        item.addEventListener("keydown", (event) => {
            if (event.key === "Enter") openProject(item.dataset.projectId);
        });
        
    });
}

function initialiseProjectDeselection() {
    const projectsWin = document.getElementById("window-projects");
    const listView = document.getElementById("project-list-view");
    
    projectsWin.addEventListener("click", (event) => {
        const clickedProject = event.target.closest(".project-item");
        if (listView.hidden || clickedProject) return;
        clearProjectSelection();
    })
}

function clearProjectSelection() {
    const selectedItems = document.querySelectorAll(".project-item.selected");
    
    selectedItems.forEach((item) => {
        item.classList.remove("selected");
    });
    
    selectedProjectId = null;
    updateProjectActions(null, false);
}

function initialiseProjectActions() {
    const openAction = document.querySelector("[data-project-open]");
    const showAllAction = document.querySelector("[data-show-project-list]");
    const showDesktopAction = document.querySelector("[data-show-desktop]");
    
    openAction.addEventListener("click", (event) => {
        event.preventDefault();
        
        if (selectedProjectId) openProject(selectedProjectId);
    });
    
    showAllAction.addEventListener("click", (event) => {
        event.preventDefault();
        
        navigateToProjectView({view: "list"});
    });
    
    showDesktopAction.addEventListener("click", (event) => {
        event.preventDefault();
        
        showDesktop();
    })
}

function initialiseSectionNavigation() {
    const navigation = document.querySelector("[data-project-page-navigation]");
    
    navigation.addEventListener("click", (event) => {
       const link = event.target.closest('a[href^="#"]');
       if (!link) return;
       
       event.preventDefault();
       
       const target = document.querySelector(link.getAttribute("href"));
       target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

function initialiseProjectNavigation() {
    const back = document.querySelector("[data-project-back]");
    const forward = document.querySelector("[data-project-forward]");
    
    back.addEventListener("click", (event) => {
        event.preventDefault();
        
        if (projectViewHistoryIndex === 0) return;
        
        projectViewHistoryIndex--;
        renderProjectView(projectViewHistory[projectViewHistoryIndex]);
        
        updateProjectNavigationButtons();
    });
    
    forward.addEventListener("click", (event) => {
        event.preventDefault();
        
        if (projectViewHistoryIndex >= projectViewHistory.length - 1) return;
        
        projectViewHistoryIndex++;
        renderProjectView(projectViewHistory[projectViewHistoryIndex]);
        
        updateProjectNavigationButtons();
    })
}

function initialiseProjectWindowReset() {
    const projectsWin = document.getElementById("window-projects");

    projectsWin.addEventListener("window-closed", resetProjectWindow);
}

function resetProjectWindow() {
    clearProjectSelection();
    
    projectViewHistory.splice(0, projectViewHistory.length, {view: "list"});
    projectViewHistoryIndex = 0;
    
    renderProjectView(projectViewHistory[0]);
    updateProjectNavigationButtons();
}

function selectProject(projectId) {
    const project = projectsById.get(projectId);
    if (!project) return;
    
    document.querySelectorAll(".project-item").forEach((item) => {
        item.classList.toggle("selected", item.dataset.projectId === projectId);
    });
    
    selectedProjectId = projectId;
    updateProjectActions(project, false);
}

function openProject(projectId) {
    if (!projectsById.has(projectId)) return;
    
    selectedProjectId = projectId;
    
    navigateToProjectView({view: "detail", projectId});
}

function showProjectList() {
    const listView = document.getElementById("project-list-view");
    const detailView = document.getElementById("project-detail-view");
    
    listView.hidden = false;
    detailView.hidden = true;
    detailView.replaceChildren();
    
    document.querySelector(".content-rightpanel").scrollTop = 0;
    
    updateProjectAddress(null);
    
    const selectedProject = projectsById.get(selectedProjectId);
    
    updateProjectActions(selectedProject ?? null, false);
}

function showProjectDetails(project) {
    const template = document.getElementById("project-detail-template");
    const fragment = template.content.cloneNode(true);
    
    fragment.querySelector("[data-project-title]").textContent = project.title;
    fragment.querySelector("[data-project-technologies]").textContent = project.info.technologies.join(" | ");
    fragment.querySelector("[data-project-overview]").textContent = project.overview;
    
    const video = fragment.querySelector("[data-project-video]");
    const image = fragment.querySelector("[data-project-image]");
    if (project.video) {
        video.src = project.video.src;
        video.poster = project.image.src;
        video.setAttribute("aria-label", project.image.alt);
        video.hidden = false;
        
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) video.autoplay = true;
    } else {
        image.src = project.image.src;
        image.alt = project.image.alt;
        image.hidden = false;
    }
    
    
    populateProjectProperties(fragment, project);
    populateProjectContributions(fragment, project);
    populateProjectTechnicals(fragment, project);
    populateProjectResults(fragment, project);
    
    const listView = document.getElementById("project-list-view");
    const detailView = document.getElementById("project-detail-view");
    
    detailView.replaceChildren(fragment);
    
    listView.hidden = true; 
    detailView.hidden = false;
    
    document.querySelector(".content-rightpanel").scrollTop = 0;
    
    updateProjectActions(project, true);
    updateProjectAddress(project);
    
    detailView.querySelector("[data-project-title]").focus();
}

function populateProjectProperties(fragment, project) {
    fragment.querySelector("[data-project-type]").textContent = project.info.type;
    
    const roleRow = fragment.querySelector("[data-project-role-row]");
    
    if (project.info.role) 
        roleRow.querySelector("[data-project-role]").textContent = project.info.role;
    else
        roleRow.remove();
    
    const tagsContainer = fragment.querySelector("[data-project-tags]");
    
    project.info.tags.forEach((tag) => {
        const tagElement = document.createElement("span");
        
        tagElement.className = "project-detail-tag";
        tagElement.textContent = tag;
        
        tagsContainer.append(tagElement);
    });
}

function populateProjectContributions(fragment, project) {
    const list = fragment.querySelector("[data-project-contributions]");
    
    project.contributions.forEach((contribution) => {
        const item = document.createElement("li");
        item.textContent = contribution;
        list.append(item);
    });
}

function populateProjectTechnicals(fragment, project) {
    const container = fragment.querySelector("[data-project-technical]");
    
    project.technical.forEach((technical) => {
        const article = document.createElement("article");
        article.className = "project-technical-feature";
        
        const heading = document.createElement("h4");
        const emphasis = document.createElement("em");
        const description = document.createElement("p");
        
        emphasis.textContent = technical.title;
        description.textContent = technical.description;
        
        heading.append(emphasis);
        article.append(heading, description);
        container.append(article);
    });
}

function populateProjectResults(fragment, project) {
    const container = fragment.querySelector("[data-project-results]");
    
    const paragraphs = project.results.split(/\n+/).filter(Boolean);
    
    paragraphs.forEach((paragraphText) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = paragraphText;
        container.append(paragraph);
    });
}

function navigateToProjectView(nextState) {
    projectViewHistory.splice(projectViewHistoryIndex + 1); // remove old forward history
    
    projectViewHistory.push(nextState);
    projectViewHistoryIndex++;
    
    renderProjectView(nextState);
    updateProjectNavigationButtons();
}

function renderProjectView(state) {
    if (state.view === "list") {
        showProjectList();
        return;
    }
    
    if (state.view === "detail") {
        const project = projectsById.get(state.projectId);
        if (project) showProjectDetails(project);
    }
}

function updateProjectNavigationButtons() {
    const back = document.querySelector("[data-project-back]");
    const forward = document.querySelector("[data-project-forward]");
    
    setNavigationDisabled(back, projectViewHistoryIndex === 0);
    setNavigationDisabled(forward, projectViewHistoryIndex === projectViewHistory.length - 1);
}

function updateProjectActions(project, isDetailView) {
    const group = document.querySelector("[data-project-actions]");
    const pageNavigation = document.querySelector("[data-project-page-navigation]");
    
    if (!project) {
        group.hidden = true;
        pageNavigation.hidden = true;
        return;
    }
    
    group.hidden = false;
    pageNavigation.hidden = !isDetailView;
    
    document.querySelector("[data-project-open-row]").hidden = isDetailView;
    
    updateExternalProjectLink("[data-project-github]", "[data-project-github-row]", project.links.github);
    updateExternalProjectLink("[data-project-youtube]", "[data-project-youtube-row]", project.links.youtube);
}

function updateExternalProjectLink(linkSelector, rowSelector, url) {
    const link = document.querySelector(linkSelector);
    const row = document.querySelector(rowSelector);
    
    row.hidden = !url;
    if (!url) {
        link.removeAttribute("href");
        return;
    }
    
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
}

function updateProjectAddress(project) {
    const address = document.querySelector("[data-project-address]");
    address.textContent = project ? `My Projects/${project.title}` : "My Projects";
}

function setNavigationDisabled(control, disabled) {
    control.classList.toggle("disabled", disabled);
    control.setAttribute("aria-disabled", String(disabled));
    control.tabIndex = disabled ? -1 : 0;
}

initialiseProjects().catch((error) => {
    console.error(error);
    
    const detailView = document.getElementById("project-detail-view");
    detailView.hidden = false;
    detailView.textContent = "Project content could not be loaded.";
});