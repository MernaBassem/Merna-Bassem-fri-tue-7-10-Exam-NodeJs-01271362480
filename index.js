// index.js file
import { config } from "dotenv";
import express from "express";
import { connection_db } from "./DB/connection.js";

import userRouter from "./src/Modules/User/user.routes.js";
import companyRouter from "./src/Modules/Company/company.routes.js";
import { globaleResponse } from "./src/Middlewares/error-handling.middleware.js";

const app = express();
config();
const port = process.env.PORT;
connection_db()
app.use(express.json());
app.get("/", (req, res) => res.send("Welcome Job App"));

app.use("/user", userRouter);
app.use("/company",companyRouter);

app.use(globaleResponse);


app.listen(port, () => console.log(`Example app listening on port ${port}!`));

