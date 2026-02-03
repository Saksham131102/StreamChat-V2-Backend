import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("jwt_refreshToken", refreshToken, {
    httpOnly: true, // prevents javascript access
    secure: true, // only over https
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return accessToken;
};
