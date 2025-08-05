const jwt = require("jsonwebtoken");

const socketAuthMiddleware = (socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error("Access denied. No token provided."));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // Attach user info to socket
        next();
    } catch (err) {
        return next(new Error("Invalid or expired token."));
    }
};

module.exports = socketAuthMiddleware;
