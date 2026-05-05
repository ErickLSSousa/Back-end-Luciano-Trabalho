const users = [];

export default {
    create(user) {
        users.push(user);
        return user
    },

    findByEmail(email) {
        return users.find((u) => u.email === email)
    }
}