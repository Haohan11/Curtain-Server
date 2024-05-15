import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
  CombinationRouter,
} = Routers;

import connectDbMiddleWare from "./middleware/connectDbMiddleware.js";
import responseMiddleware from "./middleware/responseMiddleware.js";
import authenticationMiddleware from "./middleware/authenticationMiddleware.js";
import addUserMiddleware from "./middleware/addUser.js";
import notFoundResponse from "./middleware/404reponse.js";
import establishAssociation from "./middleware/establishAssociation.js";
import staticPathName from "./model/staticPathName.js";

import connectToDataBase from "./model/connectToDatabase.js";
import Schemas from "./model/schema/schema.js";
import createSchema from "./model/createSchema.js";

const app = express();

app.use(cors());

app.use(express.static(staticPathName));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Add custom response method to res.response
app.use(responseMiddleware);

app.post("/login", async function (req, res) {
  try {
    const { account, password } = req.body;
    const { UserSchema } = Schemas;

    const sequelize = await connectToDataBase();
    const User = createSchema(sequelize, UserSchema);

    sequelize.sync().then(() => {
      User.findOne({
        where: {
          account: account
        }
      }).then(user => {
        if (!user) {
          return res.response(404, "帳號錯誤");
        }
        const isPasswordCorrect = bcrypt.compareSync(password, user.password);
        if (!isPasswordCorrect) {
          return res.response(403, "密碼錯誤");
        }

        const payload = {
          user_account: account,
          user_password: password
        };
        const exp = Math.floor(Date.now() / 1000) + (60 * 60)
        const token = jwt.sign({ payload, exp }, 'my_secret_key');

        res.response(200, { 
          "id": user.id,
          "name": user.name,
          "token": token,
          'token_type': 'bearer',
          "_exp": exp,     
        });
      });
    });
  } catch (error) {
    console.log(error);
    res.response(500, { error });
  }
});

// jwt token authentication
// app.use(authenticationMiddleware);

// Add connection to res.app
app.use(connectDbMiddleWare);
app.use(establishAssociation);

// app.use(addUserMiddleware);

app.use("/employee", EmployeeRouter);
app.use("/series", SeriesRouter);
app.use("/environment", EnvironmentRouter);
app.use("/color-scheme", ColorSchemeRouter);
app.use("/material", MaterialRouter);
app.use("/design", DesignRouter);
app.use("/supplier", SupplierRouter);
app.use("/stock", StockRouter);
app.use("/color-name", ColorNameRouter);
app.use("/combination", CombinationRouter);

app.post("/logout", async function (req, res) {
  try {
    res.response(200, "登出成功");
  } catch (error) {
    console.log(error);
    res.response(500, { error });
  }
});

app.get("/", (req, res) => {
  res.response(200, "Hello world");
});

app.use("*", notFoundResponse);

const port = 3005;
app.listen(port, () => console.log(`server run at ${port}`));
