import express from "express";
import {
  convertVideo,
  deleteProcessedVideo,
  deleteRawVideo,
  downloadRawVideo,
  setupDirectories,
  uploadProcessedVideo,
} from "./cloudstorage";

setupDirectories();

const app = express();
app.use(express.json());

// TODO - The typing here seems messy, work on interfaces/typing
app.post("/process-video", async (req, res) => {
  let data;
  try {
    // Basically ripped from Google Cloud's Pub/Sub documentation, which prescribes
    // base64 for the request body data
    const message = Buffer.from(req.body.message.data, "base64").toString(
      "utf-8"
    );
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error("Invalid message payload received.");
    }
  } catch (error) {
    console.error(error);
    return res.status(400).send("Bad request: missing filename.");
  }

  const inputFileName = data.name;
  const outputFileName = `processed-${inputFileName}`;

  // Download the raw video from Cloud Storage
  await downloadRawVideo(inputFileName);

  try {
    await convertVideo(inputFileName, outputFileName);
  } catch (error) {
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName),
    ]);
    console.error(error);
    return res
      .status(500)
      .send(`Internal Server Error: Video Processing Failed - ${error}`);
  }

  // Upload procesed video to Cloud Storage
  await uploadProcessedVideo(outputFileName);
  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName),
  ]);

  return res.status(200).send("Processing finished successfully.");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Video processor listening at http://localhost:${port}`);
});
