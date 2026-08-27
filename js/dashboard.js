$(document).ready(function () {

    const loggedInUser = getCurrentUser();

    if (!loggedInUser) {
        window.location.href = "../pages/login.html";
        return;
    }

    $("#profileName").text(
        `${loggedInUser.firstName} ${loggedInUser.lastName}`
    );

    $("#profileUsername").text(loggedInUser.username);
    $("#profileEmail").text(loggedInUser.email);
    $("#profileContact").text(loggedInUser.contact);
    $("#profileAge").text(loggedInUser.age);
    $("#profileNationality").text(loggedInUser.nationality);

    const today = new Date();
    const nextDay = new Date(today);

    nextDay.setDate(today.getDate() + 1);

    $("#taskDate").val(formatDate(today));
    $("#dueDate").attr("min", formatDate(nextDay));

    let currentFilter = "alltasks";

    async function loadTasks() {

        try {

            const tasks = await taskService.getAll();

            let userTasks = tasks.filter(
                task => task.username === loggedInUser.username
            );

            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);

            if (currentFilter === "alltasks") {

                userTasks = userTasks.filter(
                    task => !task.deleted
                );

            } else if (currentFilter === "pending") {

                userTasks = userTasks.filter(
                    task =>
                        !task.completed &&
                        !task.deleted &&
                        (task.status === "pending" || !task.status)
                );

            } else if (currentFilter === "completed") {

                userTasks = userTasks.filter(
                    task =>
                        task.completed &&
                        !task.deleted
                );

            } else if (currentFilter === "deleted") {

                userTasks = userTasks.filter(
                    task => task.deleted
                );

            } else if (currentFilter === "overdue") {

                userTasks = userTasks.filter(task => {

                    const d = new Date(task.dueDate);

                    d.setHours(0, 0, 0, 0);

                    return (
                        d < todayDate &&
                        !task.completed &&
                        !task.deleted
                    );
                });

            } else if (currentFilter === "notstarted") {

                userTasks = userTasks.filter(
                    task =>
                        task.status === "notstarted" &&
                        !task.completed &&
                        !task.deleted
                );
            }

            const priority = $("#priorityFilter").val();

            if (priority !== "all") {

                userTasks = userTasks.filter(
                    task => task.priority === priority
                );
            }

            const from = $("#fromDate").val();
            const to = $("#toDate").val();

            if (from) {

                userTasks = userTasks.filter(
                    task =>
                        (task.taskDate || task.date) >= from
                );
            }

            if (to) {

                userTasks = userTasks.filter(
                    task =>
                        (task.taskDate || task.date) <= to
                );
            }

            const search = $("#searchTask")
                .val()
                .toLowerCase();

            if (search) {

                userTasks = userTasks.filter(
                    task =>
                        (task.taskName || "")
                            .toLowerCase()
                            .includes(search)
                );
            }

            userTasks.sort(
                (a, b) =>
                    new Date(b.taskDate || b.date) -
                    new Date(a.taskDate || a.date)
            );

            $("#taskTableBody").html("");

            userTasks.forEach(task => {

                const due = new Date(
                    task.dueDate || task.date
                );

                due.setHours(0, 0, 0, 0);

                const taskDate =
                    task.taskDate || task.date;

                $("#taskTableBody").append(`
                    <tr class="${task.completed ? "table-success" : ""}">

                        <td class="${task.completed ? "completed" : ""}">
                            ${task.taskName || ""}
                        </td>

                        <td>
                            ${task.description || ""}
                        </td>

                        <td>
                            ${
                                task.priority === "High"
                                    ? '<span class="badge bg-danger">High</span>'
                                    : task.priority === "Medium"
                                        ? '<span class="badge bg-warning text-dark">Medium</span>'
                                        : '<span class="badge bg-info text-dark">Low</span>'
                            }
                        </td>

                        <td>
                            ${formatDisplayDate(taskDate)}
                        </td>

                        <td>
                            ${formatDisplayDate(task.dueDate || task.date)}

                            ${
                                due < todayDate &&
                                !task.completed &&
                                !task.deleted
                                    ? '<span class="badge bg-danger ms-2">Overdue</span>'
                                    : ""
                            }
                        </td>

                        <td>
                            ${
                                !task.deleted
                                    ? `
                                        <button
                                            class="btn btn-warning btn-sm editBtn"
                                            data-id="${task.id}"
                                            ${task.completed ? "disabled" : ""}
                                        >
                                            <i class="bi bi-pencil-square"></i>
                                        </button>

                                        <button
                                            class="btn btn-success btn-sm completeBtn"
                                            data-id="${task.id}"
                                            ${task.completed ? "disabled" : ""}
                                        >
                                            <i class="bi bi-check-circle"></i>
                                        </button>

                                        <button
                                            class="btn btn-danger btn-sm deleteBtn"
                                            data-id="${task.id}"
                                        >
                                            <i class="bi bi-trash3"></i>
                                        </button>
                                    `
                                    : `
                                        <button
                                            class="btn btn-secondary btn-sm restoreBtn"
                                            data-id="${task.id}"
                                        >
                                            <i class="bi bi-arrow-clockwise"></i>
                                        </button>
                                    `
                            }
                        </td>

                    </tr>
                `);
            });

        } catch (e) {

            console.error(e);

            showToast(
                "error",
                "Unable to load tasks. Start JSON Server."
            );
        }
    }

    loadTasks();

    $("#taskForm").submit(async function (e) {

        e.preventDefault();

        const task = new Task(
            {
                username: loggedInUser.username,
                taskName: $("#taskName").val().trim(),
                description: $("#taskDescription").val().trim(),
                priority: $("#taskPriority").val(),
                taskDate: $("#taskDate").val(),
                dueDate: $("#dueDate").val(),
                status: "notstarted",
                completed: false,
                deleted: false
            },
            "tasks"
        );

        try {

            await taskService.create(task);

            showToast(
                "success",
                "Task Added Successfully"
            );

            $("#taskForm")[0].reset();

            $("#taskDate").val(
                formatDate(today)
            );

            $("#dueDate").attr(
                "min",
                formatDate(nextDay)
            );

            bootstrap.Modal
                .getInstance(
                    document.getElementById("taskModal")
                )
                .hide();

            loadTasks();

        } catch (e) {

            showToast(
                "error",
                "Task could not be added"
            );
        }
    });

    $(document).on(
        "click",
        ".completeBtn",
        async function () {

            const id = $(this).data("id");

            const result = await Swal.fire({
                title: "Complete Task?",
                text: "Mark this task as completed?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Yes"
            });

            if (result.isConfirmed) {

                try {

                    await taskService.complete(id);

                    showToast(
                        "success",
                        "Task Completed"
                    );

                    loadTasks();

                } catch (e) {

                    showToast(
                        "error",
                        "Update failed"
                    );
                }
            }
        }
    );

    $(document).on(
        "click",
        ".deleteBtn",
        async function () {

            const id = $(this).data("id");

            const result = await Swal.fire({
                title: "Delete Task?",
                text: "You can restore it later.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                confirmButtonText: "Delete"
            });

            if (result.isConfirmed) {

                try {

                    await taskService.remove(id);

                    showToast(
                        "success",
                        "Task Deleted"
                    );

                    loadTasks();

                } catch (e) {

                    showToast(
                        "error",
                        "Delete failed"
                    );
                }
            }
        }
    );

    $(document).on(
        "click",
        ".restoreBtn",
        async function () {

            const id = $(this).data("id");

            const result = await Swal.fire({
                title: "Restore Task?",
                text: "Move task back to Pending?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Restore"
            });

            if (result.isConfirmed) {

                try {

                    await taskService.restore(id);

                    showToast(
                        "success",
                        "Task Restored To Pending"
                    );

                    loadTasks();

                } catch (e) {

                    showToast(
                        "error",
                        "Restore failed"
                    );
                }
            }
        }
    );

    $(document).on(
        "click",
        ".editBtn",
        async function () {

            const id = $(this).data("id");

            try {

                const task = await taskService.getById(id);

                const { value: values } = await Swal.fire({

                    title: "Edit Task",
                    width: 700,

                    html: `
                        <input
                            id="swalTaskName"
                            class="swal2-input"
                            placeholder="Task Name"
                            value="${task.taskName || ""}"
                        >

                        <textarea
                            id="swalDescription"
                            class="swal2-textarea"
                        >${task.description || ""}</textarea>

                        <select
                            id="swalPriority"
                            class="swal2-select"
                        >
                            <option
                                value="High"
                                ${task.priority === "High" ? "selected" : ""}
                            >
                                High
                            </option>

                            <option
                                value="Medium"
                                ${task.priority === "Medium" ? "selected" : ""}
                            >
                                Medium
                            </option>

                            <option
                                value="Low"
                                ${task.priority === "Low" ? "selected" : ""}
                            >
                                Low
                            </option>
                        </select>

                        <input
                            type="date"
                            id="swalDueDate"
                            class="swal2-input"
                            value="${task.dueDate || ""}"
                        >
                    `,

                    showCancelButton: true,

                    preConfirm: () => ({
                        taskName: $("#swalTaskName")
                            .val()
                            .trim(),

                        description: $("#swalDescription")
                            .val()
                            .trim(),

                        priority: $("#swalPriority")
                            .val(),

                        dueDate: $("#swalDueDate")
                            .val(),

                        status: "pending"
                    })
                });

                if (values) {

                    const confirmation = await Swal.fire({
                        title: "Update Task?",
                        icon: "question",
                        showCancelButton: true
                    });

                    if (confirmation.isConfirmed) {

                        await taskService.updatePartial(
                            id,
                            values
                        );

                        showToast(
                            "success",
                            "Task Updated Successfully"
                        );

                        loadTasks();
                    }
                }

            } catch (e) {

                showToast(
                    "error",
                    "Update failed"
                );
            }
        }
    );

    $(".nav-link").click(function () {

        $(".nav-link").removeClass("active");

        $(this).addClass("active");

        currentFilter = $(this).data("filter");

        loadTasks();
    });

    $("#priorityFilter, #fromDate, #toDate")
        .change(loadTasks);

    $("#searchTask")
        .keyup(loadTasks);

    initTheme("themeToggle");

    setupLogout("logoutBtn");

});