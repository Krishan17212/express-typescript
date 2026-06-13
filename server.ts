import app from "./src/app.js";
import { config } from "./src/config/config.js";
import connectDb from "./src/config/db.js";

const PORT = config.port;

async function startServer() {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

startServer();
