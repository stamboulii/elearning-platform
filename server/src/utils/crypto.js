const crypto = require("crypto");

const hashPassword = async (password) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
    return salt + "$" + derivedKey;
};