import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { router } from "./routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use("/api", router);

const port = process.env.SERVER_PORT ?? process.env.PORT ?? 4000;

app.listen(port, () => {
  console.log(`HarborPilot API listening on http://localhost:${port}`);
});
