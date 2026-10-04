"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");

    const identifierInput = document.getElementById("identifier");
    const passwordInput = document.getElementById("password");

    const loginButton = document.getElementById("loginButton");
    const loginButtonText = document.getElementById("loginButtonText");
    const loginSpinner = document.getElementById("loginSpinner");
    const loginError = document.getElementById("loginError");

    const togglePassword = document.getElementById("togglePassword");

    if (!form) {
        return;
    }

    // ============================================================
    // PASSWORD VISIBILITY
    // ============================================================

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            const isPassword = passwordInput.type === "password";

            passwordInput.type = isPassword
                ? "text"
                : "password";

            togglePassword.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );
        });
    }

    // ============================================================
    // ERROR MESSAGE
    // ============================================================

    function showError(message) {
        if (!loginError) {
            console.error(message);
            return;
        }

        loginError.textContent = message;
        loginError.classList.remove("hidden");
    }

    function clearError() {
        if (!loginError) {
            return;
        }

        loginError.textContent = "";
        loginError.classList.add("hidden");
    }

    // ============================================================
    // LOADING STATE
    // ============================================================

    function setLoading(loading) {
        if (loginButton) {
            loginButton.disabled = loading;
        }

        if (loginButtonText) {
            loginButtonText.textContent = loading
                ? "Authenticating..."
                : "Sign in to workspace";
        }

        if (loginSpinner) {
            loginSpinner.classList.toggle(
                "hidden",
                !loading
            );
        }
    }

    // ============================================================
    // LOGIN
    // ============================================================

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        clearError();

        const identifier = identifierInput
            ? identifierInput.value.trim()
            : "";

        const password = passwordInput
            ? passwordInput.value
            : "";

        if (!identifier) {
            showError("Please enter your email address.");
            return;
        }

        if (!password) {
            showError("Please enter your password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "/api/v1/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        identifier: identifier,
                        password: password
                    })
                }
            );

            let data;

            try {
                data = await response.json();
            } catch (jsonError) {
                console.error(
                    "Login response was not valid JSON:",
                    jsonError
                );

                showError(
                    "The server returned an invalid response. Please try again."
                );

                return;
            }

            console.log("Login response:", data);

            // ====================================================
            // BACKEND ERROR
            // ====================================================

            if (!response.ok) {
                const message =
                    data?.error ||
                    data?.message ||
                    "Authentication failed. Please check your credentials.";

                showError(message);
                return;
            }

            // ====================================================
            // ACCESS TOKEN
            //
            // Prefer snake_case, but support camelCase while
            // we align the backend response.
            // ====================================================

            const accessToken =
                data?.access_token ||
                data?.accessToken ||
                data?.token ||
                data?.data?.access_token ||
                data?.data?.accessToken;

            const refreshToken =
                data?.refresh_token ||
                data?.refreshToken ||
                data?.data?.refresh_token ||
                data?.data?.refreshToken;

            if (
                typeof accessToken !== "string" ||
                accessToken.trim() === ""
            ) {
                console.error(
                    "Authentication succeeded, but no access token was found.",
                    data
                );

                showError(
                    "Authentication succeeded, but no access token was received. Please try again."
                );

                return;
            }

            // ====================================================
            // STORE TOKENS
            // ====================================================

            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("refresh_token");

            sessionStorage.setItem(
                "access_token",
                accessToken
            );

            if (
                typeof refreshToken === "string" &&
                refreshToken.trim() !== ""
            ) {
                sessionStorage.setItem(
                    "refresh_token",
                    refreshToken
                );
            }

            // ====================================================
            // USER ROLE
            // ====================================================

            const user =
                data?.user ||
                data?.data?.user ||
                null;

            const role = String(
                user?.role ||
                data?.role ||
                data?.data?.role ||
                ""
            )
                .trim()
                .toUpperCase();

            console.log("Authenticated role:", role);

            // ====================================================
            // REDIRECT
            // ====================================================

            if (role === "USER") {
                window.location.replace("/dashboard");
                return;
            }

            if (role === "ANALYST") {
                window.location.replace("/analyst");
                return;
            }

            if (role === "ADMIN") {
                window.location.replace("/admin");
                return;
            }

            // ====================================================
            // UNKNOWN ROLE
            // ====================================================

            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("refresh_token");

            showError(
                "Your account has an invalid or unsupported role."
            );

        } catch (error) {
            console.error(
                "Login request failed:",
                error
            );

            showError(
                "Unable to connect to the authentication server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    });
});