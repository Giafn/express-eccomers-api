require("dotenv").config();
const cors = require("cors");

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// log request
app.use((req, res, next) => {
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("Params:", req.params);
    console.log("Query:", req.query);
    next();
});


app.use("/api/items", itemRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
