async function initialiseAbout() {
    const [templateResponse, dataResponse] = await Promise.all([
        fetch("../templates/about.html"),
        fetch("../data/about.json")
    ]);
    
    if (!templateResponse.ok || !dataResponse.ok) throw new Error("About content could not be loaded.");
    
    const templateMarkup = await templateResponse.text();
    const about = await dataResponse.json();
    
    document.body.insertAdjacentHTML("beforeend", templateMarkup);
    
    const template = document.getElementById("about-window-template");
    const host = document.querySelector("[data-about-window-content]")
    
    const content = template.content.cloneNode(true);
    host.replaceChildren(content);
    
    renderIntroduction(about.intro);
    renderTerms(about.qualifications, "[data-about-qualifications]", "qualification-row");
    renderDevInterests(about.development);
    renderTerms(about.working, "[data-about-working]", "working-style-row");
    renderLinks(about.links);
    
    initialiseInterestPlayer(about.interests);
    initialiseAboutWindowReset();
}

function renderIntroduction(content) {
    const container = document.querySelector("[data-about-intro]");
    const paragraphs = content.split(/\n+/).filter(Boolean);
    const fragment = document.createDocumentFragment();
    
    paragraphs.forEach((paragraphText) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = paragraphText;
        fragment.append(paragraph);
    });
    
    container.replaceChildren(fragment);
}

function renderTerms(content, docSource, className) {
    const list = document.querySelector(docSource);
    const fragment = document.createDocumentFragment();

    content.forEach((data) => {
        const row = document.createElement("div");
        row.className = className;

        const label = document.createElement("dt");
        label.textContent = data.label;

        const description = document.createElement("dd");
        description.textContent = data.value;

        row.append(label, description);
        fragment.append(row);
    });

    list.replaceChildren(fragment);
}

function renderDevInterests(content) {
    const container = document.querySelector("[data-about-development]");
    const fragment = document.createDocumentFragment();
    
    content.forEach((data) => {
        const article = document.createElement("article");
        article.className = "development-interest";
        
        const heading = document.createElement("h3");
        heading.textContent = data.title;
        
        const description = document.createElement("p");
        description.textContent = data.description;
        
        article.append(heading, description);
        fragment.append(article);
    });
    
    container.replaceChildren(fragment);
}

function renderLinks(links) {
    const list = document.querySelector("[data-about-links]");
    const fragment = document.createDocumentFragment();
    
    links.forEach((data) => {
        const item = document.createElement("li");
        
        const link = document.createElement("a");
        link.href = data.href;
        link.textContent = `${data.label}: ${data.text}`;
        
        if (data.href.startsWith("http")) {
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        }
        
        item.append(link);
        fragment.append(item);
    });
    
    list.replaceChildren(fragment);
}

const interestCategories = {
    games: {heading: "Games"},
    songs: {heading: "Songs"},
    filmTv: {heading: "Films & TV Shows"}
};

function initialiseInterestPlayer(interests) {
    const tabs = document.querySelectorAll("[data-interest-key]");
    
    tabs.forEach(tab => {
       tab.addEventListener("click", () => {
           showInterestCategory(tab.dataset.interestKey, interests);
       }); 
    });

    showInterestCategory("games", interests);
}

function initialiseAboutWindowReset() {
    
    const aboutWin = document.getElementById("window-about"); 
    const scrollArea = aboutWin.querySelector("[data-scroll-area]");
    
    aboutWin.addEventListener("window-closed", () => {
        scrollArea.scrollTop = 0;
    });
}

function showInterestCategory(key, interests) {
    const category = interestCategories[key];
    const items = interests[key];
    
    if (!category || !items) return;
    
    const heading = document.querySelector("[data-interest-heading]");
    const list = document.querySelector("[data-interest-list]");
    const tabs = document.querySelectorAll("[data-interest-key]");
    
    heading.textContent = category.heading;
    
    tabs.forEach(tab => {
        const isSelected = tab.dataset.interestKey === key;
        
        tab.classList.toggle("selected", isSelected);
        tab.setAttribute("aria-selected", String(isSelected));
    });
    
    const fragment = document.createDocumentFragment();
    
    items.forEach(interest => {
        const item = document.createElement("li");
        item.className = "interest-list-item";
        
        const title = document.createElement("strong");
        title.textContent = interest.title;
        
        const detail = document.createElement("span");
        detail.textContent = interest.note;
        
        item.append(title, detail);
        fragment.append(item);
    });
    
    list.replaceChildren(fragment);
}

initialiseAbout().catch(error => {
    console.error(error);
    
    const host = document.querySelector("[data-about-window-content]");
    if (host) host.textContent = "About Me content could not be loaded.";
});