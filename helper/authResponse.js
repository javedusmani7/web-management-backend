const jwt = require("jsonwebtoken");

exports.generateAuthResponse = (user, steps = { emailVerification: false, google2FAVerification: false }) => {
  const level = user.type === "admin" ? "1" : "2";

  const token = jwt.sign(
    {
      username: user.userId,
      email: user.email,
      id: user._id,
      level,
      permissions: user.permissions,
    },
    process.env.TOKEN_KEY,
    { expiresIn: "2h" }
  );

  return {
    message: "Login successful",
    token,
    expiresIn: 7200,
    userId: user._id,
    name: user.userId,
    email: user.email,
    level,
    permissions: user.permissions,
    users_status: user.status,
    steps,
  };
};
