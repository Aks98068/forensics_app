
"use strict";

console.log("FORENSIQ: verify-email.js loaded.");


/*
 * Initialize email verification
 */
function initializeEmailVerification() {

    console.log(
        "FORENSIQ: initializing email verification."
    );


    const waitingState =
        document.getElementById("waitingState");

    const verifyingState =
        document.getElementById("verifyingState");

    const successState =
        document.getElementById("successState");

    const errorState =
        document.getElementById("errorState");

    const successMessage =
        document.getElementById("successMessage");

    const errorMessage =
        document.getElementById("errorMessage");


    /*
     * Show one state and hide the others.
     */
    function showState(state) {

        const states = [
            waitingState,
            verifyingState,
            successState,
            errorState
        ];

        states.forEach(function (element) {

            if (!element) {
                return;
            }

            element.classList.add("hidden");

        });


        if (state) {
            state.classList.remove("hidden");
        }
    }


    /*
     * Read token from:
     *
     * /verify-email?token=xxxxxxxx
     */
    function getToken() {

        const params =
            new URLSearchParams(
                window.location.search
            );

        return params.get("token");
    }


    /*
     * Verify token against Go API.
     */
    async function verifyEmail(token) {

        console.log(
            "FORENSIQ: verification token detected."
        );

        showState(verifyingState);


        try {

            const response =
                await fetch(
                    "/api/v1/auth/verify-email",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        },

                        body: JSON.stringify({
                            token: token
                        })
                    }
                );


            console.log(
                "FORENSIQ: verification API status:",
                response.status
            );


            let data = {};

            const contentType =
                response.headers.get(
                    "content-type"
                ) || "";


            /*
             * Parse JSON only when response is JSON.
             */
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
                        "FORENSIQ: unable to parse JSON response.",
                        error
                    );

                }

            }


            /*
             * Verification failed.
             */
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    data.details ||
                    "Unable to verify your email."
                );
            }


            /*
             * Verification successful.
             */
            console.log(
                "FORENSIQ: email verification successful."
            );


            if (successMessage) {

                successMessage.textContent =
                    data.message ||
                    "Your email has been successfully verified.";

            }


            showState(successState);


        } catch (error) {

            console.error(
                "FORENSIQ: email verification failed:",
                error
            );


            if (errorMessage) {

                errorMessage.textContent =
                    error instanceof Error
                        ? error.message
                        : "Unable to verify your email.";

            }


            showState(errorState);
        }
    }


    /*
     * Get token from URL.
     */
    const token = getToken();


    /*
     * No token.
     */
    if (!token) {

        console.log(
            "FORENSIQ: no verification token found."
        );

        showState(waitingState);

        return;
    }


    /*
     * Token exists.
     */
    verifyEmail(token);
}


/*
 * Safe initialization.
 */
if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeEmailVerification
    );

} else {

    initializeEmailVerification();
}

