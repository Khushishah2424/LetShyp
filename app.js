const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/letsshyp")
  .then(() => console.log("DB Connected"));

app.use("/api/orders", require("./src/Routes/OrderRoutes"));

app.listen(3000, () => console.log("Server started"));
