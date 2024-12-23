import LoadingButton from "@mui/lab/LoadingButton";
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
  Select,
  ListSubheader,
  MenuItem,
  List,
} from "@mui/material";
import {
  generateAudioFile,
  selectFolder,
  fillVoiceDropdown,
  checkProjectStatus,
  generateAudioFileOpenAI,
} from "./../lib";
import { use } from "react";

const App = () => {
  const audioRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState("");
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [folderPath, setFolderPath] = useState("");
  const [fileName, setFileName] = useState("output_audio");
  const [audioSrc, setAudioSrc] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isGenerateButtonDisabled, setIsGenerateButtonDisabled] =
    useState(true);
  const [voiceSelectionExpanded, setVoiceSelectionExpanded] = useState(true);
  const [fileSelectionExpanded, setFileSelectionExpanded] = useState(true);
  const [audioButtonEnabled, setAudioButtonEnabled] = useState(true);
  const [voiceId, setVoiceId] = useState("");

  useEffect(() => {
    const folderPath = localStorage.getItem("folderPath");
    if (folderPath) {
      setFolderPath(folderPath);
    }
  }, []);

  useEffect(() => {
    if (text && folderPath && fileName && voiceId && selectedFile) {
      setIsGenerateButtonDisabled(false);
    } else {
      setIsGenerateButtonDisabled(true);
    }
  }, [text, folderPath, fileName, voiceId, selectedFile]);

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
    setAudioButtonEnabled(false);
    const vendor = voiceId.split(":")[0];
    if (vendor === "labs") {
      await generateAudioFile({
        text,
        folderPath,
        fileName,
        selectedVoice: voiceId.split(":")[1],
        setAudioSrc,
      });
    } else {
      await generateAudioFileOpenAI({
        text,
        folderPath,
        fileName,
        voiceId: voiceId.split(":")[1],
        setAudioSrc,
      });
    }
    setAudioButtonEnabled(true);
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

  const changeVoice = (e) => {
    const value = e.target.value;
    setVoiceId(value);
    audioRef?.current?.load();
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
                {voiceId && <CheckIcon color="success" />}
                <Typography sx={{ ml: 1 }}>Choose a Voice</Typography>
              </Stack>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Select onChange={changeVoice} value={voiceId}>
              <ListSubheader>
                <Typography variant="h6">ElevenLabs</Typography>
              </ListSubheader>
              {voices.map((voice) => (
                <MenuItem
                  key={voice.voice_id}
                  value={"labs:" + voice.voice_id}
                  sx={{ ml: 2 }}
                >
                  {voice.name}
                </MenuItem>
              ))}
              <ListSubheader>
                <Typography variant="h6">OpenAI</Typography>
              </ListSubheader>
              <MenuItem value="openai:alloy" sx={{ ml: 2 }}>
                Alloy
              </MenuItem>
              <MenuItem value="openai:ash" sx={{ ml: 2 }}>
                Ash
              </MenuItem>
              <MenuItem value="openai:coral" sx={{ ml: 2 }}>
                Coral
              </MenuItem>
              <MenuItem value="openai:echo" sx={{ ml: 2 }}>
                Echo
              </MenuItem>
              <MenuItem value="openai:fable" sx={{ ml: 2 }}>
                Fable
              </MenuItem>
              <MenuItem value="openai:onyx" sx={{ ml: 2 }}>
                Onyx
              </MenuItem>
              <MenuItem value="openai:nova" sx={{ ml: 2 }}>
                Nova
              </MenuItem>
              <MenuItem value="openai:sage" sx={{ ml: 2 }}>
                Sage
              </MenuItem>
              <MenuItem value="openai:shimmer" sx={{ ml: 2 }}>
                Shimmer
              </MenuItem>
            </Select>
            {voiceId && (
              <VoiceDetail
                audioRef={audioRef}
                voices={voices}
                voice={voiceId}
              />
            )}
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

        <LoadingButton
          variant="contained"
          onClick={generateAudio}
          loading={!audioButtonEnabled}
        >
          Generate audio
        </LoadingButton>

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

function MyListSubheader(props) {
  return (
    <Typography variant="h3" component="div">
      <ListSubheader {...props} />
    </Typography>
  );
}

export default App;
