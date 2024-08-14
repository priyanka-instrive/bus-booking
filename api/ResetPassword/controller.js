const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const Password = require("./index");
const service = require("./service");
const userService = require("../User/service");
const sendMail = require("../../system/sendmail/index");

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await userService.findUser(email);
  if (!user) {
    const result = {
      message: "User Not Found",
    };
    return res.status(400).json(result);
  }

  const secretKey = uuidv4();
  const link = `http://localhost:3000/update_password/?token=${secretKey}`;
  const resetPass = new Password({
    _id: user?._id,
    secretKey,
  });

  const add = await service.create(resetPass);
  if (!add._id) {
    return res.status(400).json("Something Went Wrong");
  }
  await sendMail(email, link);

  const result = {
    data: link,
    message: "To Reset Password Link Sended Successfully",
  };
  return res.status(200).json(result);
};

const updatePassword = async (req, res) => {
  const secretKey = req?.query?.token;
  let password = req?.body?.password;

  try {
    const findPass = await service.find(secretKey);

    if (!findPass) {
      throw boom.badRequest("Reset Password Link Is Expired");
    }

    if (!password) {
      throw boom.badRequest("Password is required.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let updateBody = { password: hashedPassword };
    const data = await userService.update(findPass._id, updateBody);

    if (!data) {
      throw boom.internal("Failed to update password.");
    }

    const result = {
      message: "User Password Updated Successfully",
      detail: data,
    };

    await service.deletePass(findPass._id);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error during password update:", error);
    return res.status(500).json("An internal server error occurred");
  }
};

const changePassword = async (req, res) => {
  const { email, currPassword, newPassword } = req.body;

  const user = await userService.findUser(email);
  if (!user) {
    const result = {
      message: "User Not Found",
    };
    return res.status(400).json(result);
  }
  const match = await bcrypt.compare(currPassword, user.password);
  if (!match) {
    res.status(400).json("Password Not Match");
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userService.update(user._id, { password: hashedPassword });

  const result = {
    message: " Password  Changed Successfully",
  };
  return res.status(400).json(result);
};

module.exports = {
  forgotPassword,
  changePassword,
  updatePassword,
};
