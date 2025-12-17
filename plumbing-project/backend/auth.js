import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import db from "./models/index.js"; // Sequelize models

export default function setupAuth(app) {
  // Session middleware
  app.use(
    session({ secret: "secret", resave: false, saveUninitialized: true })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Serialize / deserialize user
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:4000/auth/google/callback",
      },
      (accessToken, refreshToken, profile, done) => done(null, profile)
    )
  );

  // Routes
  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => res.redirect("http://localhost:5173/")
  );

  // Get logged-in user with role
  app.get("/auth/user", async (req, res) => {
    if (!req.user || !req.user.emails?.length) {
      return res.json(null);
    }

    try {
      const email = req.user.emails[0].value;

      // Find user in DB
      const dbUser = await db.User.findOne({ where: { email } });

      if (dbUser) {
        return res.json({
          displayName: req.user.displayName,
          email,
          role: dbUser.role || "user", // fallback to 'user'
        });
      }

      // If user not in DB, default role = user
      res.json({
        displayName: req.user.displayName,
        email,
        role: "user",
      });
    } catch (err) {
      console.error("Failed to fetch user role:", err);
      res.status(500).json({ error: "Failed to fetch user info" });
    }
  });

  // Logout
  app.get("/auth/logout", (req, res) => {
    req.logout(function (err) {
      if (err) return res.status(500).json({ error: "Logout failed" });
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out" });
      });
    });
  });
}

// -------------------------
// RBAC Middleware
// -------------------------
export async function requireAdmin(req, res, next) {
  if (!req.user || !req.user.emails?.length) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const email = req.user.emails[0].value;
    const dbUser = await db.User.findOne({ where: { email } });

    if (!dbUser || dbUser.role !== "admin") {
      return res.status(403).json({ error: "Permission denied: Not admin" });
    }

    // User is admin
    next();
  } catch (err) {
    console.error("RBAC check failed:", err);
    res.status(500).json({ error: "Server error during role check" });
  }
}
