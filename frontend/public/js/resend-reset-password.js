"use strict";

document.addEventListener("DOMContentLoaded", () => {
const form = document.getElementById("resendResetForm");
const emailInput = document.getElementById("email");


const button = document.getElementById("resendButton");
const buttonText = document.getElementById("resendButtonText");
const spinner = document.getElementById("resendSpinner");

const successMessage = document.getElementById("successMessage");
const successText = document.getElementById("successText");

const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");

if (
    !form ||
    !emailInput ||
    !button ||
    !buttonText ||
    !spinner ||
    !successMessage ||
    !successText ||
    !errorMessage ||
    !errorText
) {
    console.error(
        "FORENSIQ resend password reset form initialization failed."
    );
    return;
}

function hideMessages() {
    successMessage.classList.add("hidden");
    errorMessage.classList.add("hidden");

    successText.textContent = "";
    errorText.textContent = "";
}

function showSuccess(message) {
    successText.textContent = message;

    successMessage.classList.remove("hidden");
    errorMessage.classList.add("hidden");
}

function showError(message) {
    errorText.textContent = message;

    errorMessage.classList.remove("hidden");
    successMessage.classList.add("hidden");
}

function setLoading(loading) {
    button.disabled = loading;

    if (loading) {
        buttonText.textContent = "Sending...";
        spinner.classList.remove("hidden");
    } else {
        buttonText.textContent = "Send new reset link";
        spinner.classList.add("hidden");
    }
}

function isValidEmail(email) {
    if (!email || email.length > 255) {
        return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    hideMessages();

    const email = emailInput.value.trim().toLowerCase();

    if (!email) {
        showError("Please enter your email address.");
        emailInput.focus();
        return;
    }

    if (!isValidEmail(email)) {
        showError("Please enter a valid email address.");
        emailInput.focus();
        return;
    }

    setLoading(true);

    try {
        const response = await fetch(
            "/api/v1/auth/forgot-password",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    identifier: email
                })
            }
        );

        let data = {};

        try {
            data = await response.json();
        } catch (_) {
            data = {};
        }

        if (response.status === 429) {
            showError(
                "Too many password reset requests. Please wait a few minutes and try again."
            );
            return;
        }

        if (!response.ok) {
            showError(
                data.message ||
                data.error ||
                "Unable to process your request. Please try again."
            );
            return;
        }

        showSuccess(
            data.message ||
            "If an account exists with this email, a new password reset link has been sent."
        );

        form.reset();

    } catch (error) {
        console.error(
            "FORENSIQ password reset request failed:",
            error
        );

        showError(
            "Unable to connect to FORENSIQ. Please check your connection and try again."
        );
    } finally {
        setLoading(false);
    }
});


});
