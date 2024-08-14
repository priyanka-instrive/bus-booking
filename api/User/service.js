const { UserRegistrationSchema } = require("./index");

const create = async (params) => {
  let newData;

  try {
    newData = await UserRegistrationSchema.create(params);
  } catch (error) {
    console.error("Error in service create method:", error);
    throw error;
  }

  return newData;
};

const findUser = async (email) => {
  const data = await UserRegistrationSchema.findOne({ email: email });
  return data;
};

const update = async (userId, body) => {
  const updatePwd = await UserRegistrationSchema.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      ...body,
    },
    {
      new: true,
    }
  );
  return updatePwd;
};

module.exports = {
  create,
  findUser,
  update,
};
