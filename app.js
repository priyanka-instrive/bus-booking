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

app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.ENDPOINTSECRETE
    );

    switch (event.type) {
      case "payment_method.attached": {
        break;
      }
      case "payment_method.detached": {
        break;
      }
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed": {
        paymentcontroller.createPaymentLog(event.data.object, event.type);
        break;
      }
      default:
        break;
    }
    res.status(200).end();
  } catch (err) {
    console.error(`Error verifying webhook: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors(middlewareConfig.cors));
app.use(helmet());
app.use(morgan(middlewareConfig.morganRequestFormat));
app.use(express.urlencoded({ extended: true }));

const userInfo = require("./api/User/route");
const passwordRoute = require("./api/ResetPassword/route");
const busRoute = require("./api/Bus/route");
const bookingRoute = require("./api/Booking/route");
const seatRoute = require("./api/Seat/route");
const paymentRoute = require("./api/Payment/route");
const stripeRoute = require("./api/StripePayment/route");
const paymentcontroller = require("../bus-booking/api/Booking/controller");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
app.use(express.static("public"));

//public route
app.get("/", () => {
  res.send("hello world");
});
app.use("/user", userInfo);
app.use("/password", passwordRoute);
app.use("/bus", busRoute);
app.use("/payment", paymentRoute);
app.use("/stripe", stripeRoute);

//private route
app.use(auth.authenticate);
app.use("/booking", bookingRoute);
app.use("/seat", seatRoute);

app.listen(3000, function () {
  console.log("Listening on http://localhost:3000");
});
