
"use strict";

console.log("FORENSIQ: resend-verification.js loaded.");


/*
 * Initialize resend verification page.
 */
function initializeResendVerification() {

    console.log(
        "FORENSIQ: initializing resend verification."
    );


    const form =
        document.getElementById(
            "resendVerificationForm"
        );

    const emailInput =
        document.getElementById("email");

    const button =
        document.getElementById("resendButton");

    const buttonText =
        document.getElementById(
            "resendButtonText"
        );

    const spinner =
        document.getElementById(
            "resendSpinner"
        );

    const successMessage =
        document.getElementById(
            "successMessage"
        );

    const successText =
        document.getElementById(
            "successText"
        );

    const errorMessage =
        document.getElementById(
            "errorMessage"
        );

    const errorText =
        document.getElementById(
            "errorText"
        );


    /*
     * Verify that the form exists.
     */
    if (!form) {

        console.error(
            "FORENSIQ: resendVerificationForm was not found."
        );

        return;
    }


    console.log(
        "FORENSIQ: resend verification form initialized."
    );


    /*
     * Hide messages.
     */
    function hideMessages() {

        if (successMessage) {
            successMessage.classList.add("hidden");
        }

        if (errorMessage) {
            errorMessage.classList.add("hidden");
        }
    }


    /*
     * Loading state.
     */
    function setLoading(loading) {

        if (button) {
            button.disabled = loading;
        }

        if (emailInput) {
            emailInput.disabled = loading;
        }


        if (loading) {

            if (spinner) {
                spinner.classList.remove("hidden");
            }

            if (buttonText) {
                buttonText.textContent =
                    "Sending...";
            }

        } else {

            if (spinner) {
                spinner.classList.add("hidden");
            }

            if (buttonText) {
                buttonText.textContent =
                    "Resend verification email";
            }
        }
    }


    /*
     * Show success message.
     */
    function showSuccess(message) {

        if (errorMessage) {
            errorMessage.classList.add("hidden");
        }

        if (successText) {

            successText.textContent =
                message ||
                "If an account exists with this email, a new verification email has been sent.";
        }

        if (successMessage) {
            successMessage.classList.remove(
                "hidden"
            );
        }
    }


    /*
     * Show error.
     */
    function showError(message) {

        if (successMessage) {
            successMessage.classList.add(
                "hidden"
            );
        }

        if (errorText) {

            errorText.textContent =
                message ||
                "Unable to resend the verification email.";
        }

        if (errorMessage) {
            errorMessage.classList.remove(
                "hidden"
            );
        }
    }


    /*
     * Submit.
     */
    form.addEventListener(
        "submit",
        async function (event) {

            /*
             * Prevent normal browser GET.
             */
            event.preventDefault();
            event.stopPropagation();


            console.log(
                "FORENSIQ: resend form submission intercepted."
            );


            hideMessages();


            const email =
                emailInput
                    ? emailInput.value.trim().toLowerCase()
                    : "";


            /*
             * Required email.
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
             * Email validation.
             */
            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(email) ||
                email.length > 255
            ) {

                showError(
                    "Please enter a valid email address."
                );

                if (emailInput) {
                    emailInput.focus();
                }

                return;
            }


            setLoading(true);


            try {

                console.log(
                    "FORENSIQ: sending resend verification request."
                );


                const response =
                    await fetch(
                        "/api/v1/auth/resend-verification",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email: email
                            })
                        }
                    );


                console.log(
                    "FORENSIQ: resend API response:",
                    response.status
                );


                let data = {};

                const contentType =
                    response.headers.get(
                        "content-type"
                    ) || "";


                if (
                    contentType.includes(
                        "application/json"
                    )
                ) {

                    try {

                        data =
                            await response.json();

                    } catch (error) {

                        console.warn(
                            "FORENSIQ: unable to parse resend response.",
                            error
                        );
                    }
                }


                /*
                 * Success.
                 */
                if (response.ok) {

                    showSuccess(
                        data.message ||
                        "If an account exists with this email, a new verification email has been sent."
                    );

                    /*
                     * Clear the input after successful request.
                     */
                    if (emailInput) {
                        emailInput.value = "";
                    }

                    return;
                }


                /*
                 * Bad request.
                 */
                if (response.status === 400) {

                    showError(
                        data.error ||
                        data.message ||
                        data.details ||
                        "Please provide a valid email address."
                    );

                    return;
                }


                /*
                 * Rate limited.
                 */
                if (response.status === 429) {

                    showError(
                        data.error ||
                        data.message ||
                        "Too many requests. Please wait before requesting another verification email."
                    );

                    return;
                }


                /*
                 * Server error.
                 */
                if (response.status >= 500) {

                    showError(
                        "The server could not send the verification email. Please try again later."
                    );

                    return;
                }


                /*
                 * Other error.
                 */
                showError(
                    data.error ||
                    data.message ||
                    "Unable to resend the verification email."
                );


            } catch (error) {

                console.error(
                    "FORENSIQ: resend verification failed:",
                    error
                );


                showError(
                    "Unable to connect to the FORENSIQ server. Please check your connection and try again."
                );


            } finally {

                setLoading(false);
            }
        }
    );
}


/*
 * Safe initialization.
 */
if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeResendVerification
    );

} else {

    initializeResendVerification();
}

