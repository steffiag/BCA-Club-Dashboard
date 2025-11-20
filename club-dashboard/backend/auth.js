import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

export default function setupAuth(app) {
  app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

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

  app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => res.redirect("http://localhost:5173/")
  );

  app.get("/auth/user", (req, res) => res.json(req.user || null));

  app.get("/auth/logout", (req, res) => {
  req.logout(function (err) {
    if (err) { return res.status(500).json({ error: "Logout failed" }); }

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });
});

}
