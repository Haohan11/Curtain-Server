import jwt from "jsonwebtoken";

const authenticationMiddleware = (req, res, next) => {
  let token;
  try {
    token = req.headers["authorization"].split(" ")[1];
  } catch (e) {
    token = "";
  }

  const locationDict = {
    3001: "my",
    3000: "front",
  };

  const keyChunk = locationDict[req.headers.host.split(":")[1]];
  if (!keyChunk) return res.response(401);

  jwt.verify(token, `${keyChunk}_secret_key`, function (err, decoded) {
    if (err) return res.response(401);

    const {
      payload: { user_account },
    } = decoded;

    req._user = { user_account };

    next();
  });
};

export default authenticationMiddleware;