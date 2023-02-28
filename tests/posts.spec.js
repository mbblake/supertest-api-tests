const request = require("supertest");
const baseUrl = require("../config");
const { expect } = require("chai");
const {
    restorePostData,
    getDB,
    register,
    removeUserData,
} = require("../helpers/db");
const user = require("../fixtures/user.json");

let accessToken;

describe("/posts endpoint test suite", () => {
    before(async () => {
        // Remove all the user data from previous test runs
        await removeUserData();
        // Need an access token to allow the user to make requests to /posts endpoint
        accessToken = await register(user);
    });

    beforeEach(async () => {
        // Restore the state of the database before each test
        await restorePostData(accessToken);
    });

    describe("GET", () => {
        describe("GET /posts", () => {
            it("Should return JSON", async () => {
                const res = await request(baseUrl)
                    .get("/posts")
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(res.headers["content-type"]).to.equal(
                    "application/json; charset=utf-8"
                );
                expect(res.status).to.equal(200);
            });

            it("Should list all posts", async () => {
                const res = await request(baseUrl)
                    .get("/posts")
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(res.body).to.have.length(5);
                expect(res.body).to.deep.equal(getDB().posts);
            });

            it("Should list posts using properties", async () => {
                const res = await request(baseUrl)
                    .get("/posts")
                    .query("id=2&id=4")
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(res.body).to.have.length(2);
                expect(res.body)
                    .to.deep.include(getDB().posts[1])
                    .to.deep.include(getDB().posts[3]);
            });
        });

        describe("GET /posts/:id", () => {
            it("Should return JSON", async () => {
                const res = await request(baseUrl)
                    .get("/posts/1")
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(res.status).to.equal(200);
                expect(res.headers).to.have.property(
                    "content-type",
                    "application/json; charset=utf-8"
                );
            });

            it("Should list a single post", async () => {
                const res = await request(baseUrl)
                    .get("/posts/1")
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(res.body).to.deep.equal(getDB().posts[0]);
            });

            it("Should return an error for non-existent post", async () => {
                const res = await request(baseUrl)
                    .get("/posts/100")
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(res.status).to.equal(404);
                expect(res.body).to.deep.equal({});
            });
        });
    });

    describe("POST", () => {
        describe("POST /posts", () => {
            it("Should return JSON", async () => {
                const res = await request(baseUrl)
                    .post("/posts")
                    .send({
                        id: 100,
                        title: "Title of the 100th post",
                        author: "100th Author",
                    })
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(res.status).to.equal(201);
                expect(res.headers).to.have.property(
                    "content-type",
                    "application/json; charset=utf-8"
                );
            });

            it("Should create a new post", async () => {
                const testPost = {
                    id: 101,
                    title: "Title of the 101st post",
                    author: "101st Author",
                };
                const res = await request(baseUrl)
                    .post("/posts")
                    .send(testPost)
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(res.body).to.deep.equal(testPost);
            });

            it("Should fail to create post if the id already exists", async () => {
                const newPost = {
                    id: 102,
                    title: "Title of the 102nd post",
                    author: "102nd Author",
                };
                await request(baseUrl)
                    .post("/posts")
                    .send(newPost)
                    .set("Authorization", `Bearer ${accessToken}`);
                const res = await request(baseUrl)
                    .post("/posts")
                    .send(newPost)
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(res.status).to.equal(500);
                expect(res.text).to.include(
                    "Error: Insert failed, duplicate id"
                );
            });
        });
    });

    describe("PUT", () => {
        describe("PUT /posts/:id", () => {
            it("Should return JSON", async () => {
                const res = await request(baseUrl)
                    .put("/posts/1")
                    .send({
                        id: 1,
                        title: "Title of the new updated 1st post",
                        author: "New Updated 1st Author",
                    })
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(res.status).to.equal(200);
                expect(res.headers).to.have.property(
                    "content-type",
                    "application/json; charset=utf-8"
                );
            });

            it("Should update a post", async () => {
                const updatedPost = {
                    id: 1,
                    title: "Title of the new updated 1st post",
                    author: "New Updated 1st Author",
                };
                const res = await request(baseUrl)
                    .put("/posts/1")
                    .send(updatedPost)
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(res.body).to.deep.equal(updatedPost);
            });

            it("Should fail to update post that does not exist", async () => {
                const updatedPost = {
                    id: 101,
                    title: "Title of the new updated 101st post",
                    author: "New Updated 101st Author",
                };
                const res = await request(baseUrl)
                    .put("/posts/101")
                    .send(updatedPost)
                    .set("Authorization", `Bearer ${accessToken}`);

                expect(res.body).to.be.empty;
            });
        });
    });

    describe("PATCH", () => {
        describe("PATCH /posts/:id", () => {
            it("Should return JSON", async () => {
                const res = await request(baseUrl)
                    .patch("/posts/1")
                    .send({
                        id: 1,
                        author: "New Updated 1st Author",
                    })
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(res.status).to.equal(200);
                expect(res.headers).to.have.property(
                    "content-type",
                    "application/json; charset=utf-8"
                );
            });

            it("Should partially update a post", async () => {
                const res = await request(baseUrl)
                    .patch("/posts/1")
                    .send({
                        id: 1,
                        author: "New Updated 1st Author",
                    })
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(res.body).to.deep.equal({
                    id: 1,
                    title: "Title of the 1st post",
                    author: "New Updated 1st Author",
                });
            });

            it("Should fail to partially update post that does not exist", async () => {
                const res = await request(baseUrl)
                    .patch("/posts/101")
                    .send({
                        id: 101,
                        author: "New Updated 101st Author",
                    })
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(res.status).to.equal(404);
                expect(res.body).to.be.empty;
            });
        });
    });

    describe("DELETE", () => {
        describe("DELETE /posts/:id", () => {
            it("Should return JSON", async () => {
                const res = await request(baseUrl)
                    .delete("/posts/1")
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(res.status).to.equal(200);
                expect(res.headers).to.have.property(
                    "content-type",
                    "application/json; charset=utf-8"
                );
            });

            it("Should delete a post", async () => {
                const res = await request(baseUrl)
                    .delete("/posts/1")
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(res.body).to.be.empty;
            });

            it("Should fail to delete post that does not exist", async () => {
                const res = await request(baseUrl)
                    .delete("/posts/100")
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(res.status).to.equal(404);
                expect(res.body).to.be.empty;
            });
        });
    });
});
