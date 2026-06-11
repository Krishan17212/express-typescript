import app from "./src/app.js";
import { config } from "./src/config/config.js";

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
