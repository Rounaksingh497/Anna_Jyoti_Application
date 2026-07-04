document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-link");
    const pages = document.querySelectorAll(".page");

    function navigateTo(pageId) {
        navLinks.forEach(link => link.classList.remove("active"));
        pages.forEach(page => page.classList.remove("active"));

        const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
        if (activeLink) activeLink.classList.add("active");

        const targetPage = document.getElementById(`page-${pageId}`);
        if (targetPage) targetPage.classList.add("active");
    }

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            navigateTo(e.currentTarget.getAttribute("data-page"));
        });
    });

    window.navigate = navigateTo;
});