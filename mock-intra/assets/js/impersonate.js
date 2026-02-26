const stopImpersonateButton = document.querySelector("#stop-impersonate");
if (stopImpersonateButton) {
    stopImpersonateButton.addEventListener('click', () => {
        window.location.href = window.location.pathname;
    });
}

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

if (params.login != null) {
    const links = Array.from(document.querySelectorAll("a"));
    const linksToEdit = links.filter(a => a.href);
    linksToEdit.forEach(a => a.href += `?login=${params.login}`);
}