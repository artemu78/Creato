import React, { useState, useEffect } from "react";
import { VideoButton } from "./VideoButton";
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
  const [audioButtonEnabled, setAudioButtonEnabled] = useState(true);
  const [isGenerateButtonDisabled, setIsGenerateButtonDisabled] =
    useState(true);

  useEffect(() => {
    if (text && folderPath && fileName && selectedVoiceId) {
      setIsGenerateButtonDisabled(false);
    } else {
      setIsGenerateButtonDisabled(true);
    }
  }, [text, folderPath, fileName, selectedVoiceId]);

  useEffect(() => {
    fillVoiceDropdown({ setVoices });
  }, []);

  const resetForm = () => {
    setText("");
    setFileName("output_audio");
    setAudioSrc("");
    setVideoSrc("");
  };

  const generateAudio = async () => {
    await generateAudioFile({
      text,
      folderPath,
      fileName,
      selectedVoice: selectedVoiceId,
      setAudioSrc,
    });
  };

  const generate = async () => {
    await generateAudio();
    await generateVideoFile();
  };

  const generateVideoFile = async () => {
    const characterFile = document.getElementById("video-character").files[0];
    const API_KEY = localStorage.getItem("hydraKey");
    const BASE_URL = "https://mercury.dev.dream-ai.com/api";
    let voiceUrl;
    let avatarImageUrl;

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
      avatarImageUrl = characterData.url;
    } catch (error) {
      console.error(error);
      alert(`Failed to upload character: ${error.message}`);
      return;
    }

    try {
      voiceUrl = await window.electron.uploadAudioFile(audioSrc, API_KEY);
    } catch (error) {
      console.error(error);
      alert(`Failed to upload audio: ${error.message}`);
      return;
    }

    try {
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
                    onClick={() => selectFolder(setFolderPath)}
                    readOnly
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
        {/* <LoadingButton
          variant="contained"
          onClick={generateAudio}
          loading={!audioButtonEnabled}
        >
          Generate audio
        </LoadingButton> */}
        <VideoButton
          audioSrc={audioSrc}
          videoSrc={videoSrc}
          generate={generate}
          resetForm={resetForm}
          isGenerateButtonDisabled={isGenerateButtonDisabled}
        />
      </form>
    </div>
  );
};

export default App;
