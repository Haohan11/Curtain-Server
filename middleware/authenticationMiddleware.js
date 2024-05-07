import jwt from "jsonwebtoken";

const authenticationMiddleware = (req, res, next) => {
  let token;
  try {
    token = req.headers['authorization'].split(' ')[1];
  } catch (e) {
    token = '';
  }

  jwt.verify(token, 'my_secret_key', function (err, decoded) {
    if (err) {
      return res.response(401);
    } else {
      next();
    }
  });
};

export default authenticationMiddleware;