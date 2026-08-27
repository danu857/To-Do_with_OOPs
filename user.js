class User {

    constructor(data = {}, objectName) {

        if (!objectName) {
            throw new Error(
                "User constructor requires the db.json object name."
            );
        }

        this.id = data.id || "";
        this.firstName = data.firstName || "";
        this.lastName = data.lastName || "";
        this.username = data.username || "";
        this.email = data.email || "";
        this.password = data.password || "";
        this.contact = data.contact || "";
        this.dob = data.dob || "";
        this.age = data.age ?? "";
        this.nationality = data.nationality || "";
        this.gender = data.gender || "";
        this.skills = Array.isArray(data.skills)
            ? data.skills
            : [];

        this.objectName = objectName;
    }

    async hashPassword(password) {

        return bcrypt.hash(password, 10);
    }

    async verifyPassword(password, hashedPassword) {

        return bcrypt.compare(
            password,
            hashedPassword
        );
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

        const userData =
            data instanceof User
                ? data.toJSON()
                : { ...data };

        if (
            userData.password &&
            !userData.password.startsWith("$2a$") &&
            !userData.password.startsWith("$2b$") &&
            !userData.password.startsWith("$2y$")
        ) {
            userData.password =
                await this.hashPassword(
                    userData.password
                );
        }

        return apiRequest(
            `${API_BASE_URL}/${this.objectName}`,
            "POST",
            userData
        );
    }

    async update(id, data) {

        const userData =
            data instanceof User
                ? data.toJSON()
                : { ...data };

        if (
            userData.password &&
            !userData.password.startsWith("$2a$") &&
            !userData.password.startsWith("$2b$") &&
            !userData.password.startsWith("$2y$")
        ) {
            userData.password =
                await this.hashPassword(
                    userData.password
                );
        }

        return apiRequest(
            `${API_BASE_URL}/${this.objectName}/${id}`,
            "PUT",
            userData
        );
    }

    async updatePartial(id, data) {

        const userData = { ...data };

        if (
            userData.password &&
            !userData.password.startsWith("$2a$") &&
            !userData.password.startsWith("$2b$") &&
            !userData.password.startsWith("$2y$")
        ) {
            userData.password =
                await this.hashPassword(
                    userData.password
                );
        }

        return apiRequest(
            `${API_BASE_URL}/${this.objectName}/${id}`,
            "PATCH",
            userData
        );
    }

    async delete(id) {

        return apiRequest(
            `${API_BASE_URL}/${this.objectName}/${id}`,
            "DELETE"
        );
    }

    async findByUsername(username) {

        const users = await apiRequest(
            `${API_BASE_URL}/${this.objectName}?username=${encodeURIComponent(username)}`,
            "GET"
        );

        return users[0] || null;
    }

    async findByEmail(email) {

        const users = await apiRequest(
            `${API_BASE_URL}/${this.objectName}?email=${encodeURIComponent(email)}`,
            "GET"
        );

        return users[0] || null;
    }

    async usernameExists(username) {

        return Boolean(
            await this.findByUsername(username)
        );
    }

    async emailExists(email) {

        return Boolean(
            await this.findByEmail(email)
        );
    }

    toJSON() {

        const data = {
            firstName: this.firstName,
            lastName: this.lastName,
            username: this.username,
            email: this.email,
            password: this.password,
            contact: this.contact,
            dob: this.dob,
            age: this.age,
            nationality: this.nationality
        };

        if (this.gender) {
            data.gender = this.gender;
        }

        if (this.skills.length) {
            data.skills = this.skills;
        }

        if (this.id) {
            data.id = this.id;
        }

        return data;
    }
}

const userService = new User({}, "users");