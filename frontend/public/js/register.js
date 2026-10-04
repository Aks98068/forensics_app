
"use strict";

console.log("FORENSIQ: register.js loaded.");

/**
 * FORENSIQ Registration
 * ---------------------
 * Handles:
 * - Registration form submission
 * - Client-side validation
 * - Password visibility
 * - API request
 * - Loading state
 * - Success/error messages
 */

function initializeRegistration() {
    console.log("FORENSIQ: initializing registration form.");

    const form = document.getElementById("registerForm");

    if (!form) {
        console.error(
            "FORENSIQ: registerForm was not found."
        );
        return;
    }

    console.log(
        "FORENSIQ: registerForm found. Submit handler attached."
    );

    const errorBox = document.getElementById("registerError");
    const successBox = document.getElementById("registerSuccess");

    const registerButton = document.getElementById("registerButton");
    const registerButtonText = document.getElementById("registerButtonText");
    const registerSpinner = document.getElementById("registerSpinner");

    const firstNameInput = document.getElementById("firstName");
    const lastNameInput = document.getElementById("lastName");
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const termsInput = document.getElementById("terms");

    /**
     * Password visibility
     */
    document
        .querySelectorAll("[data-password-toggle]")
        .forEach((button) => {

            button.addEventListener("click", () => {

                const targetId =
                    button.getAttribute("data-password-toggle");

                const input =
                    document.getElementById(targetId);

                if (!input) {
                    return;
                }

                if (input.type === "password") {

                    input.type = "text";
                    button.textContent = "Hide";
                    button.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                } else {

                    input.type = "password";
                    button.textContent = "Show";
                    button.setAttribute(
                        "aria-label",
                        "Show password"
                    );
                }
            });
        });

    /**
     * Show error
     */
    function showError(message) {

        if (successBox) {
            successBox.classList.add("hidden");
            successBox.textContent = "";
        }

        if (errorBox) {
            errorBox.textContent = message;
            errorBox.classList.remove("hidden");
        }
    }

    /**
     * Show success
     */
    function showSuccess(message) {

        if (errorBox) {
            errorBox.classList.add("hidden");
            errorBox.textContent = "";
        }

        if (successBox) {
            successBox.textContent = message;
            successBox.classList.remove("hidden");
        }
    }

    /**
     * Loading state
     */
    function setLoading(loading) {

        if (registerButton) {
            registerButton.disabled = loading;
        }

        if (registerButtonText) {
            if (loading) {
                registerButtonText.classList.add("hidden");
            } else {
                registerButtonText.classList.remove("hidden");
            }
        }

        if (registerSpinner) {
            if (loading) {
                registerSpinner.classList.remove("hidden");
                registerSpinner.classList.add("flex");
            } else {
                registerSpinner.classList.add("hidden");
                registerSpinner.classList.remove("flex");
            }
        }
    }

    /**
     * Form submission
     */
    form.addEventListener("submit", async (event) => {

        /*
         * THIS IS THE IMPORTANT PART.
         *
         * It prevents:
         *
         * GET /register?firstName=...
         *
         * and allows JavaScript to send:
         *
         * POST /api/v1/auth/register
         */
        event.preventDefault();
        event.stopPropagation();

        console.log(
            "FORENSIQ: registration form submission intercepted."
        );

        if (errorBox) {
            errorBox.classList.add("hidden");
        }

        if (successBox) {
            successBox.classList.add("hidden");
        }

        const firstName =
            firstNameInput?.value.trim() || "";

        const lastName =
            lastNameInput?.value.trim() || "";

        const username =
            usernameInput?.value.trim().toLowerCase() || "";

        const email =
            emailInput?.value.trim().toLowerCase() || "";

        const password =
            passwordInput?.value || "";

        const confirmPassword =
            confirmPasswordInput?.value || "";

        const termsAccepted =
            termsInput?.checked === true;

        /**
         * Validation
         */
        if (!firstName) {
            showError("First name is required.");
            firstNameInput?.focus();
            return;
        }

        if (!lastName) {
            showError("Last name is required.");
            lastNameInput?.focus();
            return;
        }

        if (!username) {
            showError("Username is required.");
            usernameInput?.focus();
            return;
        }

        if (username.length < 3 || username.length > 50) {
            showError(
                "Username must be between 3 and 50 characters."
            );
            usernameInput?.focus();
            return;
        }

        if (!/^[a-z0-9_]+$/.test(username)) {
            showError(
                "Username can contain only lowercase letters, numbers, and underscores."
            );
            usernameInput?.focus();
            return;
        }

        if (!email) {
            showError("Email address is required.");
            emailInput?.focus();
            return;
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            showError(
                "Please enter a valid email address."
            );
            emailInput?.focus();
            return;
        }

        if (!password) {
            showError("Password is required.");
            passwordInput?.focus();
            return;
        }

        if (password.length < 8 || password.length > 128) {
            showError(
                "Password must be between 8 and 128 characters."
            );
            passwordInput?.focus();
            return;
        }

        if (!confirmPassword) {
            showError(
                "Please confirm your password."
            );
            confirmPasswordInput?.focus();
            return;
        }

        if (password !== confirmPassword) {
            showError(
                "Passwords do not match."
            );
            confirmPasswordInput?.focus();
            return;
        }

        if (!termsAccepted) {
            showError(
                "You must accept the Terms of Service and Privacy Policy."
            );
            termsInput?.focus();
            return;
        }

        /**
         * API payload
         *
         * Password is never logged.
         */
        const data = {
            email: email,
            username: username,
            password: password,
            firstName: firstName,
            lastName: lastName
        };

        console.log(
            "FORENSIQ: sending registration request."
        );

        setLoading(true);

        try {

            const response = await fetch(
                "/api/v1/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },

                    body: JSON.stringify(data)
                }
            );

            console.log(
                "FORENSIQ: registration response:",
                response.status
            );

            let result = {};

            const contentType =
                response.headers.get("content-type") || "";

            if (
                contentType.includes(
                    "application/json"
                )
            ) {
                result = await response.json();
            }

            /**
             * Successful registration
             */
            if (
                response.ok &&
                response.status >= 200 &&
                response.status < 300
            ) {

                showSuccess(
                    result.message ||
                    "Registration successful. Please check your email to verify your account."
                );

                form
                    .querySelectorAll("input, button")
                    .forEach((element) => {
                        element.disabled = true;
                    });

                setTimeout(() => {

                    window.location.href =
                        "/verify-email?email=" +
                        encodeURIComponent(email);

                }, 1000);

                return;
            }

            /**
             * Duplicate username/email
             */
            if (response.status === 409) {

                showError(
                    result.error ||
                    "Username or email already exists."
                );

                return;
            }

            /**
             * Validation error
             */
            if (response.status === 400) {

                showError(
                    result.details ||
                    result.error ||
                    "Please check your registration information."
                );

                return;
            }

            /**
             * Server error
             */
            if (response.status >= 500) {

                showError(
                    result.error ||
                    "The server could not complete your registration. Please try again."
                );

                return;
            }

            /**
             * Other errors
             */
            showError(
                result.error ||
                "Registration failed. Please try again."
            );

        } catch (error) {

            console.error(
                "FORENSIQ: registration request failed:",
                error
            );

            showError(
                "Unable to connect to the server. Please check your connection and try again."
            );

        } finally {

            setLoading(false);
        }
    });
}


/*
 * The script uses defer, so normally DOMContentLoaded will still
 * be available. This also makes the file safe if loaded differently.
 */
if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeRegistration
    );

} else {

    initializeRegistration();
}

