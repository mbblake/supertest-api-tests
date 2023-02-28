const request = require("supertest");
const baseUrl = require("../config");
const defaultData = require("../fixtures/defaultData.json");

// Remove all the posts from the database and then restore the default posts data
const restorePostData = (accessToken) => {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await request(baseUrl)
                .get("/posts")
                .set("Authorization", `Bearer ${accessToken}`);
            const resPosts = res.body;
            for (const post of resPosts) {
                await request(baseUrl)
                    .delete(`/posts/${post.id}`)
                    .set("Authorization", `Bearer ${accessToken}`);
            }

            for (const post of defaultData.posts) {
                await request(baseUrl)
                    .post("/posts")
                    .send(post)
                    .set("Authorization", `Bearer ${accessToken}`);
            }

            resolve();
        } catch (err) {
            reject(err);
        }
    });
};

// Get all of the data from the database. Makes sure the data is not cached.
const getDB = (modulePath = "../db.json") => {
    delete require.cache[require.resolve(modulePath)];
    return require(modulePath);
};

// Register a new user in order to obtain an access token
const register = ({ email, password }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await request(baseUrl)
                .post("/register")
                .send({ email, password });
            resolve(res.body.accessToken);
        } catch (err) {
            reject(err);
        }
    });
};

// Remove all users from the database
const removeUserData = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await request(baseUrl).get("/users");
            const users = res.body;
            for (const user of users) {
                await request(baseUrl).delete(`/users/${user.id}`);
            }
            resolve();
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { restorePostData, getDB, register, removeUserData };
