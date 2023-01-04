const AccessModel = require("../models/AccessModel");
const rateLimiting = async (req, res, next) => {
  const sessionId = req.session.id;

  if (!sessionId) {
    return res.send({
      status: 404,
      message: "Invalid Session. Please log in",
    });
  }

  const sessionTimeDb = await AccessModel.findOne({ sessionId: sessionId });

  if (!sessionTimeDb) {
    const accessTime = new AccessModel({
      sessionId: req.session.id,
      time: Date.now(),
    });
    await accessTime.save();
    next();
    return;
  }

  const previousAccessTime = sessionTimeDb.time;
  const currentTime = Date.now();

  if (currentTime - previousAccessTime < 1000) {
    return res.send({
      status: 401,
      message: "Too many requests, Please try in some time",
    });
  }

  await AccessModel.findOneAndUpdate(
    { sessionId: sessionId },
    { time: Date.now() }
  );
  next();
};

module.exports = rateLimiting;
