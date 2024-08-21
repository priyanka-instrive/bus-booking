const service = require("./service");
const bcrypt = require("bcrypt");
const jwt = require("../../system/middleware/jwt");

const registerUser = async (req, res) => {
  console.log("00000000000");
  const { name, email, password, phone_number, role_id } = req.body;
  console.log("req.body==>>>", name, email, password, phone_number, role_id);

  const existingUser = await service.findUser(email);
  console.log("existingUser==>>>", existingUser);
  if (existingUser) {
    return res.status(400).json({ error: "Email Is Dublicate" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    name,
    email,
    password: hashedPassword,
    phone_number,
    role_id,
  };
  try {
    const doctor = await service.create(user);
    const result = {
      message: "User Details",
      detail: doctor,
    };
    return res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await service.findUser(email);
  if (!user) {
    return res.status(400).json("Invalid Credintial.");
  }
  const match = await bcrypt.compare(password, user.password);
  console.log(password, user.password, match);
  if (match) {
    const token = await jwt.createToken(user._id);
    const refreshToken = await jwt.createRefreshToken(user._id);
    const result = {
      message: "Sign In Successfully",
      accessToken: token,
      refreshToken,
      _id: user._id,
    };
    return res.status(200).json(result);
  } else {
    return res.status(400).json("Invalid Credintial.");
  }
};

module.exports = {
  registerUser,
  signin,
};
