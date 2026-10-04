
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    /*
     * =========================================================
     * ELEMENTS
     * =========================================================
     */

    const form =
        document.getElementById("forgotPasswordForm");

    const emailInput =
        document.getElementById("email");

    const button =
        document.getElementById("forgotButton");

    const buttonText =
        document.getElementById("forgotButtonText");

    const spinner =
        document.getElementById("forgotSpinner");

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
            "If an account exists with this email, a password reset link has been sent.";

        successMessage.classList.remove("hidden");

    }


    function showError(message) {

        if (!errorMessage || !errorText) {
            return;
        }

        errorText.textContent =
            message ||
            "Unable to process your request.";

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

        if (emailInput) {
            emailInput.disabled = loading;
        }

        if (loading) {

            spinner.classList.remove("hidden");

            buttonText.textContent =
                "Sending...";

        } else {

            spinner.classList.add("hidden");

            buttonText.textContent =
                "Send reset link";

        }

    }


    /*
     * =========================================================
     * FORM CHECK
     * =========================================================
     */

    if (!form) {

        console.error(
            "FORENSIQ forgot password form was not found."
        );

        return;

    }


    /*
     * =========================================================
     * SUBMIT
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
             * EMAIL
             * =================================================
             */

            const email =
                emailInput
                    ? emailInput.value.trim().toLowerCase()
                    : "";


            /*
             * =================================================
             * EMPTY EMAIL
             * =================================================
             */

            if (!email) {

                showError(
                    "Please enter your email address."
                );

                if (emailInput) {
                    emailInput.focus();
                }

                return;

            }


            /*
             * =================================================
             * EMAIL LENGTH
             * =================================================
             */

            if (email.length > 255) {

                showError(
                    "Your email address is too long."
                );

                if (emailInput) {
                    emailInput.focus();
                }

                return;

            }


            /*
             * =================================================
             * EMAIL FORMAT
             * =================================================
             */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(email)) {

                showError(
                    "Please enter a valid email address."
                );

                if (emailInput) {
                    emailInput.focus();
                }

                return;

            }


            /*
             * =================================================
             * LOADING
             * =================================================
             */

            setLoading(true);


            try {

                /*
                 * =================================================
                 * API REQUEST
                 * =================================================
                 *
                 * Backend endpoint:
                 *
                 * POST /api/v1/auth/forgot-password
                 *
                 * Request:
                 *
                 * {
                 *     "identifier": "user@example.com"
                 * }
                 *
                 * =================================================
                 */

                const response =
                    await fetch(
                        "/api/v1/auth/forgot-password",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                identifier: email
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
                        "FORENSIQ forgot password response was not JSON.",
                        jsonError
                    );

                }


                /*
                 * =================================================
                 * RATE LIMIT
                 * =================================================
                 */

                if (response.status === 429) {

                    throw new Error(
                        "Too many password reset requests. Please wait a few minutes and try again."
                    );

                }


                /*
                 * =================================================
                 * OTHER ERRORS
                 * =================================================
                 */

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        data.error ||
                        "Unable to process your request."
                    );

                }


                /*
                 * =================================================
                 * SUCCESS
                 * =================================================
                 *
                 * Keep the message generic.
                 *
                 * Do NOT reveal whether the email exists.
                 *
                 * =================================================
                 */

                showSuccess(
                    "If an account exists with this email, a password reset link has been sent."
                );


                /*
                 * Clear input after successful request.
                 */

                if (emailInput) {
                    emailInput.value = "";
                }


            } catch (error) {

                console.error(
                    "FORENSIQ forgot password request failed."
                );


                showError(
                    error instanceof Error
                        ? error.message
                        : "Unable to process your request."
                );


            } finally {

                setLoading(false);

            }

        }
    );

});

