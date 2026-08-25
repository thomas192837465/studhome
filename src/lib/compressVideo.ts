// Re-encodes a video client-side by replaying it into a canvas at a capped
// resolution/bitrate and recording that with MediaRecorder — no server and
// no heavy transcoding library (ffmpeg.wasm) required. Falls back to the
// original file untouched if the browser can't do it or anything goes wrong,
// so a video can always still be uploaded.
export async function compressVideoFile(
  file: File,
  maxWidth = 960,
  videoBitsPerSecond = 1_500_000,
): Promise<Blob> {
  if (typeof MediaRecorder === "undefined" || !HTMLCanvasElement.prototype.captureStream) {
    return file;
  }

  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.src = URL.createObjectURL(file);

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Vidéo invalide"));
    });

    const scale = Math.min(1, maxWidth / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale) || video.videoWidth;
    canvas.height = Math.round(video.videoHeight * scale) || video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    const canvasStream = canvas.captureStream(30);
    let outputStream: MediaStream = canvasStream;
    const videoWithCapture = video as HTMLVideoElement & { captureStream?: () => MediaStream };
    if (videoWithCapture.captureStream) {
      const audioTracks = videoWithCapture.captureStream().getAudioTracks();
      if (audioTracks.length > 0) {
        outputStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);
      }
    }

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "";
    if (!mimeType) return file;

    const recorder = new MediaRecorder(outputStream, { mimeType, videoBitsPerSecond });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    const recorded = new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    });

    recorder.start();
    video.currentTime = 0;
    await video.play();

    let stopped = false;
    const stopOnce = () => {
      if (stopped) return;
      stopped = true;
      if (recorder.state !== "inactive") recorder.stop();
    };

    const drawFrame = () => {
      if (video.ended || video.paused) {
        stopOnce();
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      requestAnimationFrame(drawFrame);
    };
    drawFrame();

    await new Promise<void>((resolve) => {
      video.onended = () => resolve();
    });
    stopOnce();

    const blob = await recorded;
    URL.revokeObjectURL(video.src);

    return blob.size > 0 && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}
