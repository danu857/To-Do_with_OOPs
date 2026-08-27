class Task {

    constructor(data = {}, objectName) {

        if (!objectName) {
            throw new Error(
                "Task constructor requires the db.json object name."
            );
        }

        this.id = data.id || "";
        this.username = data.username || "";
        this.taskName = data.taskName || "";
        this.description = data.description || "";
        this.priority = data.priority || "Medium";
        this.taskDate = data.taskDate || data.date || "";
        this.dueDate = data.dueDate || data.date || "";
        this.status =
            data.status ||
            (data.completed ? "completed" : "notstarted");

        this.completed = Boolean(data.completed);
        this.deleted = Boolean(data.deleted);

        this.objectName = objectName;
    }

    async getAll() {

        return apiRequest(
            `${API_BASE_URL}/${this.objectName}`,
            "GET"
        );
    }

    async getById(id) {

        return apiRequest(
            `${API_BASE_URL}/${this.objectName}/${id}`,
            "GET"
        );
    }

    async create(data = this) {

        return apiRequest(
            `${API_BASE_URL}/${this.objectName}`,
            "POST",
            data instanceof Task
                ? data.toJSON()
                : { ...data }
        );
    }

    async update(id, data) {

        return apiRequest(
            `${API_BASE_URL}/${this.objectName}/${id}`,
            "PUT",
            data instanceof Task
                ? data.toJSON()
                : { ...data }
        );
    }

    async updatePartial(id, data) {

        return apiRequest(
            `${API_BASE_URL}/${this.objectName}/${id}`,
            "PATCH",
            data
        );
    }

    async delete(id) {

        return apiRequest(
            `${API_BASE_URL}/${this.objectName}/${id}`,
            "DELETE"
        );
    }

    async complete(id) {

        return this.updatePartial(
            id,
            {
                completed: true,
                status: "completed",
                deleted: false
            }
        );
    }

    async remove(id) {

        return this.updatePartial(
            id,
            {
                deleted: true
            }
        );
    }

    async restore(id) {

        return this.updatePartial(
            id,
            {
                deleted: false,
                completed: false,
                status: "pending"
            }
        );
    }

    toJSON() {

        const data = {
            username: this.username,
            taskName: this.taskName,
            description: this.description,
            priority: this.priority,
            taskDate: this.taskDate,
            dueDate: this.dueDate,
            status: this.status,
            completed: this.completed,
            deleted: this.deleted
        };

        if (this.id) {
            data.id = this.id;
        }

        return data;
    }
}

const taskService = new Task({}, "tasks");