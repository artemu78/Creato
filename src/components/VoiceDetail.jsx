import React from "react";
import { Box } from "@mui/material";

export const VoiceDetail = ({ voice, voices, audioRef }) => {
  let voiceObject = {};
  const vendor = voice.split(":")[0];
  const voiceId = voice.split(":")[1];

  if (vendor === "labs") {
    voiceObject = voices.find((v) => v.voice_id === voiceId);
  } else {
    voiceObject = {
      preview_url: `https://cdn.openai.com/API/docs/audio/${voiceId}.wav`,
    };
  }

  return (
    <Box sx={{ mt: 1, ml: 3 }}>
      <div>
        <b>{voiceObject?.name}</b> {voiceObject?.labels?.accent}{" "}
        {voiceObject?.labels?.description} {voiceObject?.labels?.age}{" "}
        {voiceObject?.labels?.gender} {voiceObject?.labels?.use_case}
      </div>
      <audio controls ref={audioRef}>
        <source src={voiceObject?.preview_url} type="audio/mpeg" />
      </audio>
    </Box>
  );
};
