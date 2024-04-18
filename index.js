import express from "express";
import cors from "cors";
import multer from "multer";

import { Routers } from "./routes.js";

const {
  SeriesRouter,
  EmployeeRouter,
  EnvironmentRouter,
  ColorSchemeRouter,
  MaterialRouter,
  DesignRouter,
  SupplierRouter,
  StockRouter,
  ColorNameRouter,
} = Routers;

import connectDbMiddleWare from "./middleware/connectDbMiddleware.js";
import responseMiddleware from "./middleware/responseMiddleware.js";
import notFoundResponse from "./middleware/404reponse.js";

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(multer().array());

// Add custom response method to res.response
app.use(responseMiddleware);

// Add connection to res.app
app.use(connectDbMiddleWare);

app.use("/employee", EmployeeRouter);
app.use("/series", SeriesRouter);
app.use("/environment", EnvironmentRouter);
app.use("/color-scheme", ColorSchemeRouter);
app.use("/material", MaterialRouter);
app.use("/design", DesignRouter);
app.use("/supplier", SupplierRouter);
app.use("/stock", StockRouter);
app.use("/color-name", ColorNameRouter);

app.get("/", (req, res) => {
  res.response(200, "Hello world");
});

app.use("*", notFoundResponse);

const port = 3005;
app.listen(port, () => console.log(`server run at ${port}`));
