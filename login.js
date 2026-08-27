$(document).ready(function () {

    console.log("login.js loaded");

    initTheme("themeToggle", "themeIcon");

    // Show / hide password
    $("#togglePassword").on("click", function () {

        const input = $("#password");
        const isPassword = input.attr("type") === "password";

        input.attr("type", isPassword ? "text" : "password");

        $(this)
            .toggleClass("bi-eye-slash", !isPassword)
            .toggleClass("bi-eye", isPassword);
    });


    // Login validation
    $("#loginForm").validate({

        rules: {
            username: {
                required: true,
                minlength: 3
            },

            password: {
                required: true
            }
        },

        messages: {
            username: {
                required: "Username is required",
                minlength: "Username must contain at least 3 characters"
            },

            password: {
                required: "Password is required"
            }
        },

        errorClass: "error",

        submitHandler: function (form) {

            console.log("submitHandler called");

            loginUser();

            return false;
        }
    });


    async function loginUser() {

        console.log("loginUser() started");

        const username = $("#username").val().trim();
        const password = $("#password").val();

        $(".login-error").remove();

        try {

            console.log("Searching for user:", username);

            const user = await userService.findByUsername(username);

            console.log("User returned:", user);

            if (!user || !user.password) {

                showLoginError();

                return;
            }

            console.log("Verifying password...");

            const valid = await userService.verifyPassword(
                password,
                user.password
            );

            console.log("Password valid:", valid);

            if (!valid) {

                showLoginError();

                return;
            }

            // Save session
            setCurrentUser(user);

            console.log("Current user:", getCurrentUser());

            // Success popup
            await Swal.fire({
                icon: "success",
                title: "Login Successful",
                text: "Redirecting to dashboard...",
                timer: 1200,
                showConfirmButton: false
            });

            console.log("Redirecting to dashboard...");

            window.location.href = "../dashboard.html";

        } catch (error) {

            console.error("Login error:", error);

            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: error.message || "Unable to connect to server."
            });
        }
    }


    function showLoginError() {

        if ($(".login-error").length === 0) {

            $("#password").after(
                "<div class='error login-error'>Invalid Username or Password</div>"
            );
        }
    }


    // Cancel
    $("#cancelBtn").on("click", function () {

        window.location.href = "../index.html";

    });

});