const { app } = require("./src/app.js");
const connectDB = require("./src/db/index.js");

connectDB()
  .then(async () => {
    try {
      app.listen(process.env.PORT, async () => {
        console.log(`port is running at port ${process.env.PORT}`);
      });
    } catch (error) {
      console.log(`error while connecting to database ${error}`);
    }
  })
  .catch();
