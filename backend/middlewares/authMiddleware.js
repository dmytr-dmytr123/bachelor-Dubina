const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.TOKEN);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error();
    }

    if (!user.isVerified && (!user.verificationTokenExpires || user.verificationTokenExpires < new Date())) {
      throw new Error();
    }

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(401).send({
      msg: {
        title: "Authentication Failed!",
      },
    });
  }
};

module.exports = protect;