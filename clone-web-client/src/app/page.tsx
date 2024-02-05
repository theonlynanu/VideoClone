import Image from "next/image";
import { getVideos } from "./_firebase/functions";
import Link from "next/link";
import thumbnail from "../../public/video-thumbnail.webp";

export default async function Home() {
  const videos = await getVideos();

  return (
    <main className="flex flex-row flex-wrap items-center gap-8 p-12">
      {videos.length
        ? videos.map((video) => {
            let videoTitle = video.title;
            if (video.title) {
              videoTitle = Buffer.from(video.title, "base64").toString("utf-8");
            }
            return (
              <Link
                key={video.id}
                className=" w-fit"
                href={`/watch?v=${video.filename}`}
              >
                <h2 className="font-semibold">
                  {videoTitle ? videoTitle : "Untitled Video"}
                </h2>
                <Image className="h-36 w-64" src={thumbnail} alt="video" />
                <p className="text-sm">{video.uid}</p>
              </Link>
            );
          })
        : "No Videos Available"}
    </main>
  );
}
