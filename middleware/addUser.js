const addUserMiddleware = async (req, res, next) => {
  if (!req._user) return next();

  try {
    const account = req._user.user_account;
    const { user: User } = req.app.sequelize.models;
    const { id } = await User.findOne({ where: { account } });
    req._user.user_id = id
    next();
  } catch {
    res.response(500);
  }
};

export default addUserMiddleware;
