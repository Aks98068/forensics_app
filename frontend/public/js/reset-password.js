
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    /*
     * =========================================================
     * ELEMENTS
     * =========================================================
     */

    const form =
        document.getElementById("resetPasswordForm");

    const passwordInput =
        document.getElementById("password");

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const button =
        document.getElementById("resetButton");

    const buttonText =
        document.getElementById("resetButtonText");

    const spinner =
        document.getElementById("resetSpinner");

    const successMessage =
        document.getElementById("successMessage");

    const successText =
        document.getElementById("successText");

    const errorMessage =
        document.getElementById("errorMessage");

    const errorText =
        document.getElementById("errorText");


    /*
     * =========================================================
     * RESET TOKEN
     * =========================================================
     */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const token =
        params.get("token");


    /*
     * =========================================================
     * MESSAGE HELPERS
     * =========================================================
     */

    function hideMessages() {

        if (successMessage) {
            successMessage.classList.add("hidden");
        }

        if (errorMessage) {
            errorMessage.classList.add("hidden");
        }

    }


    function showSuccess(message) {

        if (!successMessage || !successText) {
            return;
        }

        successText.textContent =
            message ||
            "Your password has been updated successfully. Redirecting you to login...";

        successMessage.classList.remove("hidden");

    }


    function showError(message) {

        if (!errorMessage || !errorText) {
            return;
        }

        errorText.textContent =
            message ||
            "The password reset link may be invalid or expired.";

        errorMessage.classList.remove("hidden");

    }


    /*
     * =========================================================
     * LOADING STATE
     * =========================================================
     */

    function setLoading(loading) {

        if (!button || !buttonText || !spinner) {
            return;
        }

        button.disabled = loading;

        if (passwordInput) {
            passwordInput.disabled = loading;
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.disabled = loading;
        }

        if (loading) {

            spinner.classList.remove("hidden");

            buttonText.textContent =
                "Resetting...";

        } else {

            spinner.classList.add("hidden");

            buttonText.textContent =
                "Reset password";

        }

    }


    /*
     * =========================================================
     * PASSWORD VISIBILITY
     * =========================================================
     */

    function setupPasswordToggle(
        buttonId,
        input
    ) {

        const toggle =
            document.getElementById(buttonId);

        if (!toggle || !input) {
            return;
        }

        toggle.addEventListener(
            "click",
            function () {

                const visible =
                    input.type === "text";

                input.type =
                    visible
                        ? "password"
                        : "text";

                toggle.setAttribute(
                    "aria-label",
                    visible
                        ? "Show password"
                        : "Hide password"
                );

            }
        );

    }


    setupPasswordToggle(
        "togglePassword",
        passwordInput
    );


    setupPasswordToggle(
        "toggleConfirmPassword",
        confirmPasswordInput
    );


    /*
     * =========================================================
     * PASSWORD REQUIREMENTS
     * =========================================================
     */

    function updateRequirement(
        id,
        valid
    ) {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        const icon =
            element.querySelector(
                ".requirement-icon"
            );

        if (valid) {

            element.classList.remove(
                "text-[#777773]"
            );

            element.classList.add(
                "text-[#0F766E]"
            );

            if (icon) {
                icon.textContent = "✓";
            }

        } else {

            element.classList.remove(
                "text-[#0F766E]"
            );

            element.classList.add(
                "text-[#777773]"
            );

            if (icon) {
                icon.textContent = "•";
            }

        }

    }


    function updateRequirements() {

        const password =
            passwordInput
                ? passwordInput.value
                : "";


        updateRequirement(
            "requirementLength",
            password.length >= 8
        );


        updateRequirement(
            "requirementUpper",
            /[A-Z]/.test(password)
        );


        updateRequirement(
            "requirementLower",
            /[a-z]/.test(password)
        );


        updateRequirement(
            "requirementNumber",
            /[0-9]/.test(password)
        );

    }


    if (passwordInput) {

        passwordInput.addEventListener(
            "input",
            updateRequirements
        );

    }


    /*
     * =========================================================
     * INITIAL PASSWORD REQUIREMENTS
     * =========================================================
     */

    updateRequirements();


    /*
     * =========================================================
     * FORM VALIDATION
     * =========================================================
     */

    if (!form) {

        console.error(
            "FORENSIQ reset password form was not found."
        );

        return;

    }


    /*
     * =========================================================
     * FORM SUBMISSION
     * =========================================================
     */

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            event.stopPropagation();

            hideMessages();


            /*
             * =================================================
             * TOKEN VALIDATION
             * =================================================
             */

            if (!token) {

                showError(
                    "This password reset link is missing or invalid. Please request a new reset link."
                );

                return;

            }


            /*
             * =================================================
             * GET PASSWORD VALUES
             * =================================================
             */

            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            const confirmPassword =
                confirmPasswordInput
                    ? confirmPasswordInput.value
                    : "";


            /*
             * =================================================
             * PASSWORD LENGTH
             * =================================================
             */

            if (password.length < 8) {

                showError(
                    "Your password must contain at least 8 characters."
                );

                if (passwordInput) {
                    passwordInput.focus();
                }

                return;

            }


            /*
             * =================================================
             * PASSWORD MAXIMUM LENGTH
             * =================================================
             */

            if (password.length > 128) {

                showError(
                    "Your password cannot contain more than 128 characters."
                );

                if (passwordInput) {
                    passwordInput.focus();
                }

                return;

            }


            /*
             * =================================================
             * UPPERCASE VALIDATION
             * =================================================
             */

            if (!/[A-Z]/.test(password)) {

                showError(
                    "Your password must contain at least one uppercase letter."
                );

                if (passwordInput) {
                    passwordInput.focus();
                }

                return;

            }


            /*
             * =================================================
             * LOWERCASE VALIDATION
             * =================================================
             */

            if (!/[a-z]/.test(password)) {

                showError(
                    "Your password must contain at least one lowercase letter."
                );

                if (passwordInput) {
                    passwordInput.focus();
                }

                return;

            }


            /*
             * =================================================
             * NUMBER VALIDATION
             * =================================================
             */

            if (!/[0-9]/.test(password)) {

                showError(
                    "Your password must contain at least one number."
                );

                if (passwordInput) {
                    passwordInput.focus();
                }

                return;

            }


            /*
             * =================================================
             * PASSWORD CONFIRMATION
             * =================================================
             */

            if (password !== confirmPassword) {

                showError(
                    "The passwords do not match."
                );

                if (confirmPasswordInput) {
                    confirmPasswordInput.focus();
                }

                return;

            }


            /*
             * =================================================
             * START REQUEST
             * =================================================
             */

            setLoading(true);


            try {

                /*
                 * IMPORTANT:
                 *
                 * Your backend expects:
                 *
                 * {
                 *     token: "...",
                 *     newPassword: "..."
                 * }
                 */

                const response =
                    await fetch(
                        "/api/v1/auth/reset-password",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                token: token,
                                newPassword: password
                            })
                        }
                    );


                /*
                 * =================================================
                 * RESPONSE
                 * =================================================
                 */

                let data = {};


                try {

                    data =
                        await response.json();

                } catch (jsonError) {

                    console.warn(
                        "FORENSIQ reset password response was not JSON.",
                        jsonError
                    );

                }


                /*
                 * =================================================
                 * ERROR RESPONSE
                 * =================================================
                 */

                if (!response.ok) {

                    let message =
                        "Unable to reset your password.";

                    if (
                        data &&
                        typeof data.error === "string" &&
                        data.error.trim() !== ""
                    ) {

                        message =
                            data.error;

                    } else if (
                        data &&
                        typeof data.message === "string" &&
                        data.message.trim() !== ""
                    ) {

                        message =
                            data.message;

                    }


                    throw new Error(message);

                }


                /*
                 * =================================================
                 * SUCCESS
                 * =================================================
                 */

                showSuccess(
                    data.message ||
                    "Your password has been updated successfully. Redirecting you to login..."
                );


                /*
                 * Clear password fields
                 */

                if (passwordInput) {
                    passwordInput.value = "";
                }

                if (confirmPasswordInput) {
                    confirmPasswordInput.value = "";
                }


                /*
                 * Update password requirement indicators
                 */

                updateRequirements();


                /*
                 * =================================================
                 * REDIRECT TO LOGIN
                 * =================================================
                 */

                setTimeout(
                    function () {

                        window.location.replace(
                            "/login"
                        );

                    },
                    2000
                );


            } catch (error) {

                console.error(
                    "FORENSIQ password reset failed."
                );


                showError(
                    error instanceof Error
                        ? error.message
                        : "Unable to reset your password."
                );


            } finally {

                setLoading(false);

            }

        }
    );

});

