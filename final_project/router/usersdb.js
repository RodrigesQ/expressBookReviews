// usersdb.js

const users = [
    { username: "user1", password: "password1" },
    { username: "user2", password: "password2" },
    { username: "user3", password: "password3" }
];

function addUser(username, password) {
    users.push({ username, password });
}

module.exports = { users, addUser };
