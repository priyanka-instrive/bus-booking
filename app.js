const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const middlewareConfig = require("../bus-booking/system/middleware/config");
const auth = require("./system/middleware/authentication");

if (process.env.NODE_ENV === "local") {
  require("dotenv").config({
    path: `./${process.env.NODE_ENV}.env`,
  });
} else {
  require("dotenv").config({
    path: `./local.env`,
  });
}

app.use(express.json());
app.use(cors(middlewareConfig.cors));
app.use(helmet());
app.use(morgan(middlewareConfig.morganRequestFormat));
app.use(express.urlencoded({ extended: true }));

const userInfo = require("./api/User/route");
const passwordRoute = require("./api/ResetPassword/route");
const busRoute = require("./api/Bus/route");
const bookingRoute = require("./api/Booking/route");
const seatRoute = require("./api/Seat/route");

//public route
app.get("/", () => {
  res.send("hello world");
});
app.use("/user", userInfo);
app.use("/password", passwordRoute);
app.use("/bus", busRoute);

//private route
app.use(auth.authenticate);
app.use("/booking", bookingRoute);
app.use("/seat", seatRoute);

app.listen(3000, function () {
  console.log("Listening on http://localhost:3000");
});
