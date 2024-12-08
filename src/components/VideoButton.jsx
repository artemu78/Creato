import React, { useState } from "react";
import { Button } from "@mui/material";

export const VideoButton = ({ audioSrc, generateVideoFile, videoSrc }) => {
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
      <Button variant="contained" onClick={generateVideoFile}>
        Generate Video
      </Button>
      {videoSrc && (
        <video id="video-player" controls>
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
    </>
  );
};
