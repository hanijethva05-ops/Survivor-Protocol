const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { OAuth2Client } = require("google-auth-library");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const oauth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    "postmessage"
);

console.log("GOOGLE CLIENT ID:", GOOGLE_CLIENT_ID);
console.log("GOOGLE SECRET LOADED:", !!GOOGLE_CLIENT_SECRET);

app.get("/", (req, res) => {
    res.send("Zombie Survival Backend ONLINE");
});

app.post("/auth/google", async (req, res) => {

    try {

        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                error: "Google authorization code missing"
            });
        }

        console.log("Google authorization code received.");

        const { tokens } = await oauth2Client.getToken(code);

        console.log("Google tokens received.");

        oauth2Client.setCredentials(tokens);

        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        console.log("Google user:", payload.email);

        res.json({
            success: true,
            user: {
                name: payload.name,
                email: payload.email,
                picture: payload.picture
            }
        });

    } catch (error) {

        console.error("");
        console.error("====================================");
        console.error("       GOOGLE AUTH ERROR");
        console.error("====================================");
        console.error(error);
        console.error("MESSAGE:", error.message);
        console.error("====================================");
        console.error("");

        res.status(500).json({
            success: false,
            error: error.message
        });
    }

});

app.listen(3000, () => {

    console.log("--------------------------------");
    console.log("ZOMBIE SURVIVAL BACKEND ONLINE");
    console.log("http://localhost:3000");
    console.log("--------------------------------");

});
