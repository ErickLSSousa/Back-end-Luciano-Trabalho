const accounts = [];

export default {
    create(account) {
        accounts.push(account);
        return account;
    },

    findByUser(userId) {
        return accounts.filter((a) => a.userId === userId);
    },

    findById(id) {
        return accounts.find((a) => a.id === id);
    },

    remove(id) {
        const index = accounts.findIndex((a) => a.id === id);
        if (index !== -1) accounts.splice(index, 1);
    },
};