import React, { useState, useEffect, useRef } from "react";
import { VideoButton } from "./VideoButton";
import { Header } from "./Header";
import { VoiceDetail } from "./VoiceDetail";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";
import {
  Box,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import {
  generateAudioFile,
  selectFolder,
  fillVoiceDropdown,
  checkProjectStatus,
} from "./../lib";

const App = () => {
  const audioRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState("");
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoice] = useState("");
  const [folderPath, setFolderPath] = useState("");
  const [fileName, setFileName] = useState("output_audio");
  const [audioSrc, setAudioSrc] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isGenerateButtonDisabled, setIsGenerateButtonDisabled] =
    useState(true);
  const [voiceSelectionExpanded, setVoiceSelectionExpanded] = useState(true);
  const [fileSelectionExpanded, setFileSelectionExpanded] = useState(true);

  useEffect(() => {
    if (text && folderPath && fileName && selectedVoiceId && selectedFile) {
      setIsGenerateButtonDisabled(false);
    } else {
      setIsGenerateButtonDisabled(true);
    }
  }, [text, folderPath, fileName, selectedVoiceId, selectedFile]);

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
    const API_KEY = localStorage.getItem("hydraKey");
    const BASE_URL = "https://mercury.dev.dream-ai.com/api";
    let voiceUrl;
    let avatarImageUrl;

    try {
      const characterFormData = new FormData();
      characterFormData.append("file", selectedFile);

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

        <Accordion
          expanded={voiceSelectionExpanded}
          onChange={() => setVoiceSelectionExpanded(!voiceSelectionExpanded)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box>
              <Stack direction="row">
                {selectedVoiceId && <CheckIcon color="success" />}
                <Typography sx={{ ml: 1 }}>Choose a Voice</Typography>
              </Stack>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <div className="form-group">
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
                  onChange={(e) => {
                    setSelectedVoice(e.target.value);
                    audioRef?.current?.load();
                  }}
                >
                  <option value="">None</option>
                  {voices.map((voice) => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedVoiceId && (
                <VoiceDetail
                  audioRef={audioRef}
                  voices={voices}
                  voiceId={selectedVoiceId}
                />
              )}
            </div>
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={fileSelectionExpanded}
          onChange={() => {
            setFileSelectionExpanded(!fileSelectionExpanded);
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {folderPath && fileName && (
              <CheckIcon color="success" sx={{ mr: 1 }} />
            )}
            <Typography>Select Output Folder and File</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="form-group">
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
          </AccordionDetails>
        </Accordion>

        <VideoButton
          audioSrc={audioSrc}
          videoSrc={videoSrc}
          generate={generate}
          resetForm={resetForm}
          isGenerateButtonDisabled={isGenerateButtonDisabled}
          setSelectedFile={setSelectedFile}
          selectedFile={selectedFile}
        />
      </form>
    </div>
  );
};

export default App;
