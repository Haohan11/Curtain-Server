import connectToDataBase from "../model/connectToDatabase.js";

const connectDbMiddleWare = async (req, res, next) => {
  const sequelize = await connectToDataBase();
  if (!sequelize) return res.response(500);

  req.app.sequelize = sequelize;
  next();
};

export default connectDbMiddleWare;
