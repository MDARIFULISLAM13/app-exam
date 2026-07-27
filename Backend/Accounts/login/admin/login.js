const dotenv = require('dotenv');
const { jwtgen_admin, jwtVerify_admin } = require('../../../jwt/admin/jwt_admin');
const { admin_secret } = require('../../../models/admin_secret');


exports.admin_login = async (req, res) => {
    try {
        const { username, password, secret } = req.body;

        if (!username || !password || !secret) {
            return res.status(401).json({
                message: "All fields are required."
            });
        }

        const admin_user = process.env.admin_user;
        const admin_pass = process.env.admin_pass;

        // ✅ find or create once
        let secretData = await admin_secret.findOne();

        if (!secretData) {
            secretData = await admin_secret.create({
                secret: "admin" // default
            });
        }

        if (
            username === admin_user &&
            password === admin_pass &&
            secretData.secret === secret
        ) {
            const token = jwtgen_admin(username);


            return res.status(200).json({
                token
            });
        }

        return res.status(401).json({
            message: "Invalid username or password / secret."
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error"
        });
    }
};






exports.admin_secret_change = async (req, res) => {
    try {
        const { old_secret, new_secret, admin_pass, token } = req.body;



        if (!token) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again."
            });

        }
        const decoded = jwtVerify_admin(token);
        if (!decoded) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again."
            });
        }

        const admin_username = decoded.username;
        if (admin_username != process.env.admin_user) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again."
            });
        }







        if (!old_secret || !new_secret || !admin_pass) {
            return res.status(400).send({
                message: "All fields are required."
            });
        }

        if (admin_pass !== process.env.admin_pass) {
            return res.status(401).send({
                message: "Invalid admin password."
            });
        }

        const secretData = await admin_secret.findOne();

        if (!secretData) {
            return res.status(404).send({
                message: "Admin secret not found."
            });
        }

        if (secretData.secret !== old_secret) {
            return res.status(400).send({
                message: "Old secret is incorrect."
            });
        }

        secretData.secret = new_secret;
        await secretData.save();

        res.status(200).send({
            message: "Admin secret updated successfully."
        });

    } catch (err) {
        res.status(500).send(err);
    }
};
