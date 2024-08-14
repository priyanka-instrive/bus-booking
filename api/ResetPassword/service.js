const Password = require("./index");

const create = async (params) => {
  const newResetPass = await Password.create(params);
  return newResetPass;
};

const find = async (secretKey) => {
  const newResetPass = await Password.findOne({ secretKey });
  return newResetPass;
};

const deletePass = async (_id) => {
  await Password.findByIdAndDelete(_id);
  return;
};

module.exports = {
  create,
  find,
  deletePass,
};
