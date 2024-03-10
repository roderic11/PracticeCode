const path = require("path");
const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const { errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const cors = require("cors");
/*const cors = require('cors');
const multer = require('multer');
const bodyParser = require("body-parser");
const fs = require("fs");*/
const PORT = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use("/api/goals", require("./routes/goalRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admins", require("./routes/adminRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/projects", require("./routes/bomRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api", require("./routes/newSupplierRoutes"));
app.use("/api/mrf", require("./routes/mrfRoutes"));
app.use("/api/deliveries", require("./routes/deliveryRoutes"));
app.use("/api/storages", require("./routes/storageRoute"));
app.use("/api/manpowerCost", require("./routes/mancostPowerRoutes"));
app.use("/api/manpowerInfo", require("./routes/manpowerInfoRoutes"));
app.use("/api/opsTools", require("./routes/opsToolsRoutes"));
app.use(
  "/api/EquipmentInstalled",
  require("./routes/equipmentInstalledRoutes")
);
app.use(
  "/api/MaterialRequestOps",
  require("./routes/materialRequestOpsRoutes")
);
app.use("/api/projectStatus", require("./routes/projectStatusRoutes"));
app.use(
  cors({
    origin: "http://localhost:3001", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: false, // allow session cookie from browser to pass through
  })
);
app.use("/", require("./routes/newInventoryRoutes"));
app.use("/inventories", require("./routes/newInventoryRoutes"));

//img
/*app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/create", upload.single("testImage"), (req, res) => {
  const saveImage =  connectDB({
    name: req.body.name,
    img: {
      data: fs.readFileSync("uploads/" + req.file.filename),
      contentType: "image/png",
    },
  });
  saveImage
    .save()
    .then((res) => {
      console.log("image is saved");
    })
    .catch((err) => {
      console.log(err, "error has occur");
    });
    res.send('image is saved')
});


app.get('/admin',async (req,res)=>{
  const allData = await imageModel.find()
  res.json(allData)
}) */
// Serve frontend
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(
      path.resolve(__dirname, "../", "frontend", "build", "index.html")
    )
  );
} else {
  app.get("/", (req, res) => res.send("Please set to production"));
}

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
