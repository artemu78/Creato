// src/components/App.js
import React, { useState, useEffect } from "react";
import { VideoButton } from "./VideoButton";
import { Button } from "@mui/material";
import { Header } from "./Header";
import { VoiceDetail } from "./VoiceDetail";
import {
  generateAudioFile,
  selectFolder,
  fillVoiceDropdown,
  checkProjectStatus,
} from "./../lib";
const App = () => {
  const [videoSrc, setVideoSrc] = useState("");
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoice] = useState("");
  const [folderPath, setFolderPath] = useState("");
  const [fileName, setFileName] = useState("output_audio");
  const [audioSrc, setAudioSrc] = useState("");

  useEffect(() => {
    fillVoiceDropdown({ setVoices });
  }, []);

  const generateVideoFile = async () => {
    const characterFile = document.getElementById("video-character").files[0];
    const API_KEY = localStorage.getItem("hydraKey");
    const BASE_URL = "https://mercury.dev.dream-ai.com/api";

    try {
      const characterFormData = new FormData();
      characterFormData.append("file", characterFile);

      const characterResponse = await fetch(`${BASE_URL}/v1/portrait`, {
        method: "POST",
        headers: {
          "X-API-KEY": API_KEY,
        },
        body: characterFormData,
      });

      if (!characterResponse.ok) {
        throw new Error(
          `Character upload failed: ${characterResponse.statusText}`
        );
      }

      const characterData = await characterResponse.json();
      const avatarImageUrl = characterData.url;

      const voiceUrl = await window.electron.uploadAudioFile(audioSrc, API_KEY);

      const videoResponse = await fetch(`${BASE_URL}/v1/characters`, {
        method: "POST",
        headers: {
          "X-API-KEY": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarImage: avatarImageUrl,
          voiceUrl: voiceUrl,
          audioSource: "audio",
          aspectRatio: "1:1",
        }),
      });

      if (!videoResponse.ok) {
        throw new Error(`Video generation failed: ${videoResponse.statusText}`);
      }

      const videoData = await videoResponse.json();
      const jobId = videoData.jobId;

      const videoUrl = await checkProjectStatus(jobId, API_KEY, BASE_URL);
      window.electronAPI.downloadVideoHedra({
        videoUrl,
        folderPath,
        fileName: `${fileName}.mp4`,
      });
      alert("Video generated successfully");
      setVideoSrc(videoUrl);
    } catch (error) {
      console.error(error);
      alert(`Failed to generate video: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <Header />
      <form id="mp3-generator-form" className="form">
        <div className="form-group">
          <label htmlFor="text-input">Enter Text:</label>
          <textarea
            id="text-input"
            rows="6"
            placeholder="Type or paste text here..."
            maxLength="10000"
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="voice-select">Choose a Voice:</label>
          <div className="horizontal-layout">
            <input
              type="button"
              id="refresh-voices"
              value="🔄"
              className="refresh-voices"
              onClick={() => fillVoiceDropdown({ setVoices })}
            />
            <select
              id="voice-select"
              value={selectedVoiceId}
              onChange={(e) => setSelectedVoice(e.target.value)}
            >
              <option value="">None</option>
              {voices.map((voice) => (
                <option key={voice.voice_id} value={voice.voice_id}>
                  {voice.name}
                </option>
              ))}
            </select>
            {selectedVoiceId && (
              <VoiceDetail voices={voices} voiceId={selectedVoiceId} />
            )}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="folder-input">Select Output Folder and File</label>
          <table>
            <tbody>
              <tr>
                <td>
                  <button
                    type="button"
                    id="folder-btn"
                    className="button-small"
                    onClick={() => selectFolder(setFolderPath)}
                  >
                    Select Folder
                  </button>
                </td>
                <td>
                  <input
                    type="text"
                    id="folder-path"
                    value={folderPath}
                    disabled
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <span>File Name:</span>
                </td>
                <td>
                  <input
                    type="text"
                    id="file-name"
                    placeholder="Enter file name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Button
          variant="contained"
          onClick={() =>
            generateAudioFile({
              text,
              folderPath,
              fileName,
              selectedVoice: selectedVoiceId,
              setAudioSrc,
            })
          }
        >
          Generate audio
        </Button>
        {audioSrc && (
          <VideoButton
            audioSrc={audioSrc}
            videoSrc={videoSrc}
            generateVideoFile={generateVideoFile}
          />
        )}
      </form>
    </div>
  );
};

export default App;
