import React, { useState } from "react";
import {
  Button,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const VideoButton = ({
  audioSrc,
  generate,
  videoSrc,
  resetForm,
  isGenerateButtonDisabled,
  setSelectedFile,
  selectedFile,
}) => {
  const [videoButtonEnabled, setVideoButtonEnabled] = useState(true);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

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
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          {selectedFile && <CheckIcon color="success" sx={{ mr: 1 }} />}
          Select Character
        </AccordionSummary>
        <AccordionDetails>
          <input
            onChange={handleFileChange}
            type="file"
            id="video-character"
            accept="image/*"
          />
        </AccordionDetails>
      </Accordion>
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
