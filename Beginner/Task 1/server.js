const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req, res) {
  res.render("index.ejs");
});

app.post("/submit", function(req, res) {
  const { name, email } = req.body;
  res.render("index1.ejs", { name, email });
});

app.listen(3000, () => {
  console.log(`Server is Listening in port ${port}`)
});