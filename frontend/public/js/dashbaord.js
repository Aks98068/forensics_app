"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("dashboard-sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    const openButton = document.getElementById("sidebar-open");
    const closeButton = document.getElementById("sidebar-close");

    if (!sidebar || !overlay) {
        return;
    }

    function openSidebar() {
        sidebar.classList.remove("-translate-x-full");

        overlay.classList.remove("hidden");

        document.body.classList.add("overflow-hidden");
    }

    function closeSidebar() {
        sidebar.classList.add("-translate-x-full");

        overlay.classList.add("hidden");

        document.body.classList.remove("overflow-hidden");
    }

    if (openButton) {
        openButton.addEventListener("click", function () {
            openSidebar();
        });
    }

    if (closeButton) {
        closeButton.addEventListener("click", function () {
            closeSidebar();
        });
    }

    overlay.addEventListener("click", function () {
        closeSidebar();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth >= 1024) {
            closeSidebar();
        }
    });
});