import React from "react";

export const VoiceDetail = ({ voice, voices, voiceId }) => {
  voice = voices.find((v) => v.voice_id === voiceId);
  return (
    <div>
      <div>
        {voice?.labels?.accent} {voice?.labels?.description}
        {voice?.labels?.age} {voice?.labels?.gender} {voice?.labels?.use_case}
      </div>
      <audio controls>
        <source src={voice?.preview_url} type="audio/mpeg" />
      </audio>
    </div>
  );
};
