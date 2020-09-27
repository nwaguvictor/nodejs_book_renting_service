const helper = require('../../lib/helper');

describe("Helper", () => {
    describe("generateRandomString", () => {
        it("should return a random string of length greater than 0 if the given arguement is not a type of number", () => {
            const result = helper.generateRandomString('str');
            expect(result.length).toBeGreaterThan(0);
        });
        it("should return a random string of length equal to param given", () => {
            const result = helper.generateRandomString(2);
            expect(result.length).toBe(2);
        });
        it("should return a random string", () => {
            const result = helper.generateRandomString(1);
            expect(result).toMatch(/[a-z0-9]/);
        })
    });

    describe("formatObject", () => {
        it("should match object properties from old and new object passed as arguements", () => {
            const result = helper.formatObject({ id: 1, title: "book1", isAvailable: false }, { isAvailable: true });
            expect(result).toMatchObject({ id: 1, title: "book1", isAvailable: true });
        })
    })
});