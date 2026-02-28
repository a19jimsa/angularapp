const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/api/hello", (req, res) => {
  res.json({ msg: "API works" });
});

app.post("/api/saveMap", (req, res) => {
  const sceneData = req.body.json;

  const filePath = path.join(__dirname, "maps", "scene.json");

  fs.writeFile(filePath, JSON.stringify(sceneData, null, 2), (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Failed to save");
    }

    res.send({ message: "Scene saved!" });
  });
});

const angularPath = path.join(__dirname, "../dist/my-app");

app.use(express.static(angularPath));

app.use((req, res) => {
  res.sendFile(path.join(angularPath, "index.html"));
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
