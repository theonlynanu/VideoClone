"use client";
import { useSearchParams } from "next/navigation";

export default function Watch() {
  const videoPrefix =
    "https://storage.googleapis.com/theonlynanu-processed-videos/";
  const videoSrc = useSearchParams().get("v");

  console.log(videoSrc);

  return (
    <div>
      <video
        controls
        className="w-auto max-h-[2000px] mx-auto"
        src={videoPrefix + videoSrc}
      ></video>
    </div>
  );
}
