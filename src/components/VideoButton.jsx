import React, { useState } from "react";
import { Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

export const VideoButton = ({
  audioSrc,
  generate,
  videoSrc,
  resetForm,
  isGenerateButtonDisabled,
}) => {
  const [videoButtonEnabled, setVideoButtonEnabled] = useState(true);

  const startGenerateVideo = async () => {
    setVideoButtonEnabled(false);
    await generate();
    setVideoButtonEnabled(true);
  };

  return (
    <>
      {audioSrc && (
        <div id="audio-player-wrapper">
          <div className="form-group">
            <label htmlFor="audio-player">Generated audio:</label>
            <audio controls id="audio-player" src={audioSrc}></audio>
          </div>
        </div>
      )}
      <div className="form-group">
        <label htmlFor="video-character">Select Character:</label>
        <input type="file" id="video-character" accept="image/*" />
      </div>
      <LoadingButton
        variant="contained"
        onClick={startGenerateVideo}
        loading={!videoButtonEnabled}
        disabled={isGenerateButtonDisabled}
      >
        Generate Video
      </LoadingButton>
      {videoSrc && (
        <>
          <video id="video-player" controls>
            <source src={videoSrc} type="video/mp4" />
          </video>
          <Button variant="contained" onClick={resetForm}>
            Reset Form and Start Over
          </Button>
        </>
      )}
    </>
  );
};
