import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const storage = new Storage();

const rawVideoBucket = "theonlynanu-raw-videos";
const processedVideoBucket = "theonlynanu-processed-videos";

const localRawVideoDir = "./raw-videos";
const localProcessedVideoDir = "./processed-videos";

// Creates directories for both raw and processed videos
export function setupDirectories() {
  verifyDirectory(localRawVideoDir);
  verifyDirectory(localProcessedVideoDir);
}

export async function downloadRawVideo(filename: string) {
  await storage
    .bucket(rawVideoBucket)
    .file(filename)
    .download({ destination: `${localRawVideoDir}/${filename}` });

  console.log(
    `gs://${rawVideoBucket}/${filename} downloaded to ${localRawVideoDir}/${filename}.`
  );
}

// TODO - Add private video functionality?
export async function uploadProcessedVideo(filename: string) {
  const bucket = storage.bucket(processedVideoBucket);

  await bucket.upload(`${localProcessedVideoDir}/${filename}`, {
    destination: filename,
  });
  console.log(
    `${localProcessedVideoDir}/${filename} uploaded to gs://${processedVideoBucket}/${filename}`
  );

  await bucket.file(filename).makePublic();
}

// Cleanup files from the container after processing and uploading
function deleteFile(filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      fs.unlink(filepath, (error) => {
        if (error) {
          console.log(`Failed to delete file at ${filepath}`, error);
          reject(error);
        }
      });
    } else {
      console.log(`File at ${filepath} could not be found.`);
      resolve();
    }
  });
}

export function deleteRawVideo(filename: string) {
  return deleteFile(`${localRawVideoDir}/${filename}`);
}
export function deleteProcessedVideo(filename: string) {
  return deleteFile(`${localProcessedVideoDir}/${filename}`);
}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoDir}
 * @param processedVideoName - The name of processed output file, writes to {@link localProcessedVideoDir}
 * @returns a Promise that resolves once the video has been converted
 */

export function convertVideo(rawVideoName: string, processedVideoName: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(`${localRawVideoDir}/${rawVideoName}`)
      .outputOptions("-filter:v", "scale=360:-1")
      .on("end", () => {
        console.log("Video processing successful.");
        resolve();
      })
      .on("error", (error) => {
        console.log(`An exception occurred: ${error.message} `);
        reject(error);
      })
      .save(`${localProcessedVideoDir}/${processedVideoName}`);
  });
}

// Ensures that if directory is not present, it will be created
function verifyDirectory(directoryPath: string) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true }); // Recursion allows nested directories
    console.log(`Directory created at ${directoryPath}.`);
  }
}
