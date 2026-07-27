require("dotenv").config();
exports.createToken = function (packageKey) {
    return `${process.env.SUPER_KEY_VALUE}${packageKey}`;
};

exports.getPackageKey = function (token) {
    if (!token) return false;

    const superKey = process.env.SUPER_KEY_VALUE;

    if (!token.startsWith(superKey)) return false;

    return true;
};