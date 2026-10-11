/*
 * ============================================================
 * AdaptiveLearn
 * Authentication Frontend
 *
 * Handles:
 *
 * 1. Login
 * 2. Registration
 * 3. Forgot Password
 * 4. JWT storage
 * ============================================================
 */


"use strict";


/* ============================================================
   API CONFIGURATION
============================================================ */

const API_BASE_URL =
    "http://localhost:5000";


/* ============================================================
   STORAGE HELPERS
============================================================ */

function saveObject(
    key,
    value
) {

    try {

        localStorage.setItem(

            key,

            JSON.stringify(value)

        );

        return true;

    }

    catch (error) {

        console.error(
            `Unable to save ${key}:`,
            error
        );

        return false;

    }

}


/* ============================================================
   SAVE AUTHENTICATED STUDENT
============================================================ */

function saveAuthenticatedStudent(

    token,

    student,

    selectedExam = ""

) {

    if (token) {

        localStorage.setItem(

            "adaptiveLearnToken",

            token

        );

    }


    if (student) {

        const exam =

            selectedExam ||

            student.target_exam ||

            student.exam ||

            "ESIC UDC";


        const userData = {

            student_id:
                student.student_id,

            name:
                student.name,

            email:
                student.email,

            target_exam:
                exam,

            exam:
                exam,

            xp:
                Number(
                    student.xp || 0
                ),

            streak:
                Number(
                    student.streak || 0
                )

        };


        saveObject(

            "adaptiveLearnUser",

            userData

        );


        saveObject(

            "adaptiveLearnStatistics",

            {

                overallProgress:
                    Number(
                        student.overallProgress || 0
                    ),

                streak:
                    Number(
                        student.streak || 0
                    ),

                xp:
                    Number(
                        student.xp || 0
                    ),

                accuracy:
                    Number(
                        student.accuracy || 0
                    )

            }

        );

    }


    localStorage.setItem(

        "adaptiveLearnLoggedIn",

        "true"

    );

}


/* ============================================================
   LOGIN
============================================================ */

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(

        "submit",

        async function (event) {

            event.preventDefault();


            const emailElement =
                document.getElementById(
                    "email"
                );


            const passwordElement =
                document.getElementById(
                    "password"
                );


            const email =
                emailElement
                    ? emailElement.value
                        .trim()
                        .toLowerCase()
                    : "";


            const password =
                passwordElement
                    ? passwordElement.value
                    : "";


            /* ------------------------------------------------
               VALIDATION
            ------------------------------------------------ */

            if (!email || !password) {

                alert(
                    "Please enter your email and password."
                );

                return;

            }


            if (
                emailElement &&
                !emailElement.checkValidity()
            ) {

                alert(
                    "Please enter a valid email address."
                );

                return;

            }


            /* ------------------------------------------------
               BUTTON
            ------------------------------------------------ */

            const loginButton =
                loginForm.querySelector(
                    'button[type="submit"]'
                );


            const originalText =
                loginButton
                    ? loginButton.textContent
                    : "Login";


            if (loginButton) {

                loginButton.disabled =
                    true;

                loginButton.textContent =
                    "Signing In...";

            }


            /* ------------------------------------------------
               API REQUEST
            ------------------------------------------------ */

            try {

                const response =
                    await fetch(

                        `${API_BASE_URL}/api/auth/login`,

                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email:
                                        email,

                                    password:
                                        password

                                })

                        }

                    );


                let data = null;


                try {

                    data =
                        await response.json();

                }

                catch (jsonError) {

                    data = null;

                }


                /* ------------------------------------------------
                   FAILURE
                ------------------------------------------------ */

                if (

                    !response.ok ||

                    !data ||

                    data.success !== true

                ) {

                    alert(

                        data &&
                        data.message

                            ? data.message

                            : "Invalid email or password."

                    );

                    return;

                }


                /* ------------------------------------------------
                   SAVE LOGIN
                ------------------------------------------------ */

                saveAuthenticatedStudent(

                    data.token,

                    data.student

                );


                /* ------------------------------------------------
                   REMEMBER ME
                ------------------------------------------------ */

                const rememberCheckbox =
                    loginForm.querySelector(
                        'input[type="checkbox"]'
                    );


                if (

                    rememberCheckbox &&

                    rememberCheckbox.checked

                ) {

                    localStorage.setItem(

                        "adaptiveLearnRememberMe",

                        "true"

                    );

                }

                else {

                    localStorage.removeItem(

                        "adaptiveLearnRememberMe"

                    );

                }


                /* ------------------------------------------------
                   SUCCESS
                ------------------------------------------------ */

                alert(

                    "Login successful! Welcome back."

                );


                window.location.href =
                    "dashboard.html";

            }

            catch (error) {

                console.error(

                    "Login error:",

                    error

                );


                alert(

                    "Unable to connect to the server. Make sure the backend is running on http://localhost:5000."

                );

            }

            finally {

                if (loginButton) {

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        originalText;

                }

            }

        }

    );

}


/* ============================================================
   REGISTRATION
============================================================ */

const registerForm =
    document.getElementById(
        "registerForm"
    );


if (registerForm) {

    registerForm.addEventListener(

        "submit",

        async function (event) {

            event.preventDefault();


            /* ------------------------------------------------
               FORM ELEMENTS
            ------------------------------------------------ */

            const nameElement =
                document.getElementById(
                    "name"
                );


            const emailElement =
                document.getElementById(
                    "registerEmail"
                );


            const passwordElement =
                document.getElementById(
                    "registerPassword"
                );


            const confirmPasswordElement =
                document.getElementById(
                    "confirmPassword"
                );


            const examElement =
                document.getElementById(
                    "exam"
                );


            /* ------------------------------------------------
               VALUES
            ------------------------------------------------ */

            const name =
                nameElement
                    ? nameElement.value.trim()
                    : "";


            const email =
                emailElement
                    ? emailElement.value
                        .trim()
                        .toLowerCase()
                    : "";


            const password =
                passwordElement
                    ? passwordElement.value
                    : "";


            const confirmPassword =
                confirmPasswordElement
                    ? confirmPasswordElement.value
                    : "";


            const exam =
                examElement
                    ? examElement.value
                    : "";


            /* ------------------------------------------------
               VALIDATION
            ------------------------------------------------ */

            if (

                !name ||

                !email ||

                !password ||

                !confirmPassword ||

                !exam

            ) {

                alert(
                    "Please fill in all fields."
                );

                return;

            }


            if (

                emailElement &&

                !emailElement.checkValidity()

            ) {

                alert(
                    "Please enter a valid email address."
                );

                return;

            }


            if (password.length < 6) {

                alert(

                    "Password must contain at least 6 characters."

                );

                return;

            }


            if (
                password !==
                confirmPassword
            ) {

                alert(
                    "Passwords do not match."
                );

                return;

            }


            /* ------------------------------------------------
               BUTTON
            ------------------------------------------------ */

            const submitButton =
                registerForm.querySelector(
                    'button[type="submit"]'
                );


            const originalText =
                submitButton
                    ? submitButton.textContent
                    : "Create Account";


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Creating Account...";

            }


            /* ------------------------------------------------
               API REQUEST
            ------------------------------------------------ */

            try {

                const response =
                    await fetch(

                        `${API_BASE_URL}/api/auth/register`,

                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    email:
                                        email,

                                    password:
                                        password,

                                    target_exam:
                                        exam

                                })

                        }

                    );


                let data = null;


                try {

                    data =
                        await response.json();

                }

                catch (jsonError) {

                    data = null;

                }


                /* ------------------------------------------------
                   FAILURE
                ------------------------------------------------ */

                if (

                    !response.ok ||

                    !data ||

                    data.success !== true

                ) {

                    alert(

                        data &&
                        data.message

                            ? data.message

                            : "Registration failed. Please try again."

                    );

                    return;

                }


                /* ------------------------------------------------
                   SAVE AUTHENTICATION
                ------------------------------------------------ */

                saveAuthenticatedStudent(

                    data.token,

                    data.student,

                    exam

                );


                /* ------------------------------------------------
                   SUCCESS
                ------------------------------------------------ */

                alert(

                    "Registration successful! Welcome to AdaptiveLearn."

                );


                window.location.href =
                    "dashboard.html";

            }

            catch (error) {

                console.error(

                    "Registration error:",

                    error

                );


                alert(

                    "Unable to connect to the server. Make sure the backend is running on http://localhost:5000."

                );

            }

            finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        originalText;

                }

            }

        }

    );

}


/* ============================================================
   FORGOT PASSWORD
============================================================ */

const forgotPasswordForm =
    document.getElementById(
        "forgotPasswordForm"
    );


if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener(

        "submit",

        async function (event) {

            event.preventDefault();


            /* ------------------------------------------------
               ELEMENTS
            ------------------------------------------------ */

            const emailElement =
                document.getElementById(
                    "forgotEmail"
                );


            const newPasswordElement =
                document.getElementById(
                    "newPassword"
                );


            const confirmPasswordElement =
                document.getElementById(
                    "confirmNewPassword"
                );


            const email =
                emailElement
                    ? emailElement.value
                        .trim()
                        .toLowerCase()
                    : "";


            const newPassword =
                newPasswordElement
                    ? newPasswordElement.value
                    : "";


            const confirmPassword =
                confirmPasswordElement
                    ? confirmPasswordElement.value
                    : "";


            /* ------------------------------------------------
               VALIDATION
            ------------------------------------------------ */

            if (

                !email ||

                !newPassword ||

                !confirmPassword

            ) {

                alert(
                    "Please fill in all fields."
                );

                return;

            }


            if (

                emailElement &&

                !emailElement.checkValidity()

            ) {

                alert(
                    "Please enter a valid email address."
                );

                return;

            }


            if (
                newPassword.length < 6
            ) {

                alert(

                    "New password must contain at least 6 characters."

                );

                return;

            }


            if (
                newPassword !==
                confirmPassword
            ) {

                alert(
                    "Passwords do not match."
                );

                return;

            }


            /* ------------------------------------------------
               BUTTON
            ------------------------------------------------ */

            const resetButton =
                forgotPasswordForm.querySelector(
                    'button[type="submit"]'
                );


            const originalText =
                resetButton
                    ? resetButton.textContent
                    : "Reset Password";


            if (resetButton) {

                resetButton.disabled =
                    true;

                resetButton.textContent =
                    "Resetting...";

            }


            /* ------------------------------------------------
               API REQUEST
            ------------------------------------------------ */

            try {

                const response =
                    await fetch(

                        `${API_BASE_URL}/api/auth/forgot-password`,

                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email:
                                        email,

                                    new_password:
                                        newPassword,

                                    confirm_password:
                                        confirmPassword

                                })

                        }

                    );


                let data = null;


                try {

                    data =
                        await response.json();

                }

                catch (jsonError) {

                    data = null;

                }


                /* ------------------------------------------------
                   FAILURE
                ------------------------------------------------ */

                if (

                    !response.ok ||

                    !data ||

                    data.success !== true

                ) {

                    alert(

                        data &&
                        data.message

                            ? data.message

                            : "Unable to reset password."

                    );

                    return;

                }


                /* ------------------------------------------------
                   SUCCESS
                ------------------------------------------------ */

                alert(

                    "Password reset successfully! You can now login with your new password."

                );


                window.location.href =
                    "login.html";

            }

            catch (error) {

                console.error(

                    "Forgot password error:",

                    error

                );


                alert(

                    "Unable to connect to the server. Make sure the backend is running on http://localhost:5000."

                );

            }

            finally {

                if (resetButton) {

                    resetButton.disabled =
                        false;

                    resetButton.textContent =
                        originalText;

                }

            }

        }

    );

}