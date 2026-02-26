(function updateSidebar() {
    const urlParts = document.location.pathname.split("/").filter(n => n)

    if (urlParts.length === 0) {
        return
    }

    const tenant = urlParts[0];

    /* A list of page that is not part of the tenant */
    if (tenant === 'help' || tenant === 'upload-trace') {
        return;
    }

    const contactsLink = document.getElementById("contacts");
    const documentLink = document.getElementById("documents");
    const teamsLink = document.getElementById("teams");

    if (contactsLink) {
        contactsLink.href = `/${tenant}/contacts`;
        contactsLink.style.display = 'flex';
    }

    if (documentLink) {
        documentLink.href = `/${tenant}/documents`;
        documentLink.style.display = 'flex';
    }

    if (teamsLink) {
        teamsLink.href = `/${tenant}/teams`;
        teamsLink.style.display = 'flex';
    }
})();


(function settings() {
    const settingButton = document.getElementById("settings");
    const modalContainer = document.getElementById("settings-modal");
    const modalForm = document.getElementById("settings-form");

    settingButton.addEventListener("click", () => {
        modalContainer.style.display = "flex";
    });

    modalContainer.addEventListener("click", (event) => {
        if (event.target === modalContainer) {
            modalContainer.style.display = "none";
        }
    });

    modalForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(modalForm);
        const url = new URL(document.location);


        const role = formData.get("role");
        if (role) {
            document.cookie = `role=${role};max-age=31536000;path=/`;
        }

        const impersonateLogin = formData.get("impersonateLogin");
        if (impersonateLogin !== null) {
            if (impersonateLogin === "") {
                url.searchParams.delete("login");
            } else {
                url.searchParams.set("login", impersonateLogin.toString());
            }
        }

        document.location.href = url.toString();
    });

})();