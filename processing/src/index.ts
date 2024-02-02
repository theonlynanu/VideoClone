import express from "express";
import {
  convertVideo,
  deleteProcessedVideo,
  deleteRawVideo,
  downloadRawVideo,
  setupDirectories,
  uploadProcessedVideo,
} from "./cloudstorage";
import { isVideoNew, setVideo } from "./firestore";

setupDirectories();

const app = express();
app.use(express.json());

// TODO - The typing here seems messy, work on interfaces/typing
app.post("/process-video", async (req, res) => {
  let data;
  try {
    // Basically ripped from Google Cloud's Pub/Sub documentation, which uses
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
  const videoId = inputFileName.split(".")[0];

  // This sends a 208 and not a 4xx level error to prevent http request timeout
  // with the Pub/Sub. Sending an ack here is meant to prevent the request from
  // being resent from Pub/Sub
  if (!isVideoNew(videoId)) {
    console.log(
      `Video processing for ${inputFileName} has already been requested. This should return a 208.`
    );
    return res.status(208).send("Video already processing/processed");
  } else {
    console.log("Video not already processed - moving forward with conversion");
    await setVideo(videoId, {
      id: videoId,
      uid: videoId.split("-")[0],
      status: "processing",
    });
  }
  // Download the raw video from Cloud Storage
  await downloadRawVideo(inputFileName);

  console.log("Converting video...");

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
  console.log("Processing video...");
  await uploadProcessedVideo(outputFileName);

  console.log("Updating video status...");
  await setVideo(videoId, {
    status: "processed",
    filename: outputFileName,
  });

  console.log("Cleaning up...");
  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName),
  ]);

  return res.status(200).send("Processing finished successfully.");
  console.log("This should not be getting logged.");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Video processor listening at http://localhost:${port}`);
});
