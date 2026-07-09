import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    console.log("Authorization Header:", authHeader);

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Token:", token);

    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token:", token);
    console.log("Token Length:", token.length);
    console.log("Decoded Token:", decodedToken);
    const user = await User.findById(decodedToken.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
  console.log(error);

  return res.status(401).json({
    success: false,
    message: "Invalid or expired token",
  });
}
};

export { verifyJWT };