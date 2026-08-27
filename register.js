$(document).ready(function () {

    initTheme("themeToggle", "themeIcon");

    function loadFormData() {
        const saved = localStorage.getItem("registerFormData");

        if (!saved) return;

        const data = JSON.parse(saved);

        Object.entries(data).forEach(([key, value]) => {

            if (key === "skills" && Array.isArray(value)) {

                value.forEach(v =>
                    $(`input[name='skills'][value='${v}']`)
                        .prop("checked", true)
                );

            } else if (key === "gender") {

                $(`input[name='gender'][value='${value}']`)
                    .prop("checked", true);

            } else {

                $(`#${key === "firstname" ? "firstname" : key}`)
                    .val(value || "");
            }
        });
    }

    function saveFormData() {

        const skills = $("input[name='skills']:checked")
            .map(function () {
                return $(this).val();
            })
            .get();

        localStorage.setItem(
            "registerFormData",
            JSON.stringify({
                firstname: $("#firstname").val(),
                lastname: $("#lastname").val(),
                username: $("#username").val(),
                email: $("#email").val(),
                contact: $("#contact").val(),
                dob: $("#dob").val(),
                age: $("#age").val(),
                nationality: $("#nationality").val(),
                gender: $('input[name="gender"]:checked').val(),
                skills
            })
        );
    }

    loadFormData();

    $(document).on(
        "input change",
        "#registerForm input, #registerForm select",
        saveFormData
    );

    $("#togglePassword, #toggleConfirmPassword").click(function () {

        const id =
            this.id === "togglePassword"
                ? "#password"
                : "#confirmPassword";

        const input = $(id);
        const show = input.attr("type") === "password";

        input.attr("type", show ? "text" : "password");

        $(this)
            .toggleClass("bi-eye-slash", !show)
            .toggleClass("bi-eye", show);
    });

    $.validator.addMethod(
        "phoneIN",
        function (value) {
            return /^[6-9][0-9]{9}$/.test(value);
        },
        "Enter a valid 10 digit mobile number"
    );

    $.validator.addMethod(
        "strongPassword",
        function (value) {
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(value);
        },
        "Minimum 8 characters with uppercase, lowercase, number and special character"
    );

    $("#dob").change(function () {

        const dob = new Date(this.value);
        const today = new Date();

        let age =
            today.getFullYear() -
            dob.getFullYear();

        const md =
            today.getMonth() -
            dob.getMonth();

        if (
            md < 0 ||
            (md === 0 && today.getDate() < dob.getDate())
        ) {
            age--;
        }

        $("#age").val(age);

        saveFormData();
    });

    $("#registerForm").validate({

        rules: {

            firstname: {
                required: true,
                minlength: 2,
                pattern: /^[A-Za-z ]+$/
            },

            lastname: {
                required: true,
                minlength: 1,
                pattern: /^[A-Za-z ]+$/
            },

            username: {
                required: true,
                minlength: 3
            },

            email: {
                required: true,
                email: true
            },

            password: {
                required: true,
                strongPassword: true
            },

            confirmPassword: {
                required: true,
                equalTo: "#password"
            },

            contact: {
                required: true,
                phoneIN: true
            },

            dob: {
                required: true
            },

            age: {
                required: true,
                min: 13
            },

            nationality: {
                required: true
            }
        },

        messages: {

            firstname: {
                required: "First Name Required",
                pattern: "Only alphabets and spaces allowed"
            },

            lastname: {
                required: "Last Name Required",
                pattern: "Only alphabets and spaces allowed"
            },

            username: {
                required: "Username Required"
            },

            email: {
                required: "Email Required",
                email: "Enter Valid Email Address"
            },

            password: {
                required: "Password Required"
            },

            confirmPassword: {
                required: "Confirm Password",
                equalTo: "Passwords do not match"
            },

            contact: {
                required: "Contact Required"
            },

            dob: {
                required: "Select DOB"
            },

            age: {
                required: "Age is required",
                min: "Age must be at least 13"
            },

            nationality: {
                required: "Select Nationality"
            }
        },

        errorClass: "error",

        submitHandler: async function () {
            await saveUser();
        }
    });

    async function saveUser() {

        const skills = $("input[name='skills']:checked")
            .map(function () {
                return $(this).val();
            })
            .get();

        const user = new User(
            {
                firstName: $("#firstname").val().trim(),
                lastName: $("#lastname").val().trim(),
                username: $("#username").val().trim(),
                email: $("#email").val().trim(),
                password: $("#password").val(),
                contact: $("#contact").val().trim(),
                dob: $("#dob").val(),
                age: $("#age").val(),
                nationality: $("#nationality").val(),
                gender: $('input[name="gender"]:checked').val(),
                skills
            },
            "users"
        );

        try {

            if (await user.usernameExists(user.username)) {

                $("#username")
                    .after("<div class='error'>Username already exists</div>");

                return;
            }

            if (await user.emailExists(user.email)) {

                $("#email")
                    .after("<div class='error'>Email already exists</div>");

                return;
            }

            await user.create();

            $("#registerForm")[0].reset();

            localStorage.removeItem("registerFormData");

            await Swal.fire({
                icon: "success",
                title: "Registration Successful!",
                text: "Redirecting to Login Page...",
                timer: 1500,
                showConfirmButton: false
            });
            window.location.href = "../login.html";
        } 

        catch (error) {
            console.error(error);
            showToast(
                "error",
                "Registration Failed. Start JSON Server and try again."
            );
        }
    }
});