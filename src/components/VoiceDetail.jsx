import React from "react";
import { Box } from "@mui/material";

export const VoiceDetail = ({ voice, voices, voiceId, audioRef }) => {
  voice = voices.find((v) => v.voice_id === voiceId);
  return (
    <Box sx={{ mt: 1, ml: 3 }}>
      <div>
        <b>{voice?.name}</b> {voice?.labels?.accent}{" "}
        {voice?.labels?.description} {voice?.labels?.age}{" "}
        {voice?.labels?.gender} {voice?.labels?.use_case}
      </div>
      <audio controls ref={audioRef}>
        <source src={voice?.preview_url} type="audio/mpeg" />
      </audio>
    </Box>
  );
};
