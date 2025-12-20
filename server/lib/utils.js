import jwt from "jsonwebtoken";

// Utility function to generate JWT token
export const generateToken = (userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
    return token;
};