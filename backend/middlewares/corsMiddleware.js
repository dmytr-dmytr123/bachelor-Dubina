const cors = require("cors");

const crossOrigin = (app) => {
  if (process.env.NODE_ENV === "dev") {
    //dev env
    app.use(
      cors({
        origin: process.env.CLIENT_DEV_URL,
      })
    );
  } else {
    //prod env
    app.use(
      cors({
        origin: process.env.CLIENT_PROD_URL,
      })
    );
  }
};
module.exports = { crossOrigin };
