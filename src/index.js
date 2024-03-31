import { app } from "./app.js";
import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    try {
      app.listen(process.env.PORT, () => {
        console.log(`port is running at port ${process.env.PORT}`);
      });
    } catch (error) {
      console.log(`error while connecting to database ${error}`);
    }
  })
  .catch();
