const express = require("express");
const { clerkMiddleware } = require("@clerk/express");
const app = express();

const router = express.Router();

app.use(
  clerkMiddleware(
    process.env.CLERK_PUBLISHABLE_KEY,
    process.env.CLERK_SECRET_KEY
  )
);

router.get("/", (req, res) => {
  res.send(`
<script>
            const clerk = new Clerk({
                frontendApi: '${process.env.CLERK_FRONTEND_API}',
            });

            clerk.renderSignIn({ element: '#sign-in' });
            clerk.renderSignUp({ element: '#sign-up' });
        </script>
      <h1>Welcome</h1>
    <a href="/sign-up">Sign Up</a>
    <a href="/sign-in">Sign In</a>
`);
});

router.get("/dashboard", (req, res) => {
  if (!req.auth.userId) {
    return res.redirect("/");
  }
  res.send(`<h1>Dashboard</h1><p>User ID: ${req.auth.userId}</p>`);
});

router.get("/:userId/dashboard", (req, res) => {
  const userId = req.params.userId;
  res.send(`<h1>Dashboard for User ID: ${userId}</h1>`);
});

module.exports = router;
