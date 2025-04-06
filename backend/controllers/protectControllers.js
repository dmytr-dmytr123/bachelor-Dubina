const checkLogin = async (req, res) => {
  res
    .status(200)
    .send({ msg: { title: "We're good!", desc: "You are authorized!" } });
};

module.exports = {
  checkLogin,
};
