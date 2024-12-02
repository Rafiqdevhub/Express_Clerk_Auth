const express = require("express");
const dotenv = require("dotenv");
const { clerkMiddleware, requireAuth } = require("@clerk/express");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();
app.use(bodyParser.json());

const port = 5000;

app.use(require("body-parser").json());
app.use(
  clerkMiddleware(
    process.env.CLERK_PUBLISHABLE_KEY,
    process.env.CLERK_SECRET_KEY
  )
);

app.get("/", (req, res) => {
  const html = `
  <div style="text-align:center; margin-top:50px;">
    <h1>Welcome Clerk Auth</h1>
    <a href="/auth/sign-in">Sign In</a> | 
    <a href="/auth/sign-up">Sign Up</a>
  </div>`;
  res.send(html);
});

app.get(
  "/protected",
  requireAuth({ signInUrl: "/sign-in" }),
  async (req, res) => {
    const { userId } = req.auth;
    const user = await clerkClient.users.getUser(userId);
    return res.json({ user });
  }
);

app.get("/auth/sign-in", (req, res) => {
  const redirectUrl = `http://localhost:${port}/dashboard`;
  console.log("Redirect URL:", redirectUrl);
  const backUrl = `https://clerk.dev/sign-in?redirect_url=${redirectUrl}`;
  res.redirect(backUrl);
  console.log("Redirect URL:", backUrl);
});

app.get("/auth/sign-up", (req, res) => {
  const redirectUrl = `http://localhost:${port}/dashboard`;
  res.redirect(`https://clerk.dev/sign-up?redirect_url=${redirectUrl}`);
});

app.get("/dashboard", requireAuth(), async (req, res) => {
  if (req.user) {
    const userId = req.user.id;
    res.redirect(`/${userId}/dashboard`);
  } else {
    res.status(401).send("Unauthorized");
  }
});

app.get("/:userId/dashboard", requireAuth(), (req, res) => {
  const { userId } = req.params;

  if (req.user && req.user.id === userId) {
    res.send(`
    <h1>Welcome to your Dashboard</h1>
    <p>User ID: ${userId}</p>
    <p>Full Name: ${req.user.firstName} ${req.user.lastName}</p>
  `);
  } else {
    res.status(403).send("Access Denied");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
