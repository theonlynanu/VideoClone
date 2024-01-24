import express from "express";
import ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json());

app.post("/process-video", (req, res) => {
  const inputPath = req.body.inputFilePath;
  const outputPath = req.body.outputFilePath;

  if (!inputPath) {
    res.status(400).send("Bad Request: Missing input path");
  } else if (!outputPath) {
    res.status(400).send("Bad Request: Missing output path");
  }

  ffmpeg(inputPath)
    .outputOptions("-filter:v", "scale=360:-1")
    .on("end", () => {
      res.status(200).send("Video processing successful.");
    })
    .on("error", (error) => {
      console.log(`An exception occurred: ${error.message} `);
      res.status(500).send(`Internal Server Error: ${error.message}`);
    })
    .save(outputPath);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Video processor listening at http://localhost:${port}`);
});
