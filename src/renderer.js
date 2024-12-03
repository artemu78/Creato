const elevenVoices = {};
let resultAudioFileName = "";
const BASE_URL = "https://mercury.dev.dream-ai.com/api";

const closeSettingsClick = () => {
  document.getElementById("settings-modal").style.display = "none";
};

const settingsClick = async (e) => {
  document.getElementById("settings-modal").style.display = "flex";
};

// fetch voices from Eleven Labs API https://api.elevenlabs.io/v1/voices
const fetchElevenVoices = async () => {
  const XI_API_KEY = localStorage.getItem("elevenLabsKey");
  const API_URL = "https://api.elevenlabs.io/v1/voices";

  try {
    const response = await fetch(API_URL, {
      headers: {
        "xi-api-key": XI_API_KEY,
      },
    });

    if (!response.ok) {
      console.error(response);
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// fill voice dropdown with voices from Eleven Labs API, dropdown id: "voice-select", item value: voice ID, item text: voice name
const fillVoiceDropdown = async () => {
  const voices = await fetchElevenVoices();
  if (!voices) return;
  const voiceSelect = document.getElementById("voice-select");

  voices?.voices?.forEach((voice) => {
    elevenVoices[voice.voice_id] = voice;
    const option = document.createElement("option");
    option.value = voice.voice_id;
    option.text = voice.name;
    voiceSelect.appendChild(option);
  });
};

// show voice details in ""voice-details" div, voice ID: selected option value
const showVoiceDetails = () => {
  const voiceId = document.getElementById("voice-select").value;
  const voice = elevenVoices[voiceId];
  if (!voice) return;

  const voiceDetails = document.getElementById("voice-details");
  voiceDetails.innerHTML = `
${voice?.labels?.accent} ${voice?.labels?.description} ${voice?.labels?.age} ${voice?.labels?.gender} ${voice?.labels?.use_case} 
<audio controls>
  <source src="${voice?.preview_url}" type="audio/mpeg">
</audio>
    `;
};

const saveSettingsClick = async (e) => {
  e.preventDefault();

  const elevenLabsKey = document.getElementById("eleven-labs-key").value;
  const hydraKey = document.getElementById("hydra-key").value;
  const openAIKey = document.getElementById("openai-key").value;

  localStorage.setItem("elevenLabsKey", elevenLabsKey);
  localStorage.setItem("hydraKey", hydraKey);
  localStorage.setItem("openAIKey", openAIKey);

  alert("API keys saved!");
  document.getElementById("settings-modal").style.display = "none";
};

const generateAudioFile = async () => {
  const text = document.getElementById("text-input").value;
  const folderPath = document.getElementById("folder-path").value;
  let fileName = document.getElementById("file-name").value;
  const voiceId = document.getElementById("voice-select").value;

  if (!text) {
    alert("Please enter some text.");
    return;
  }

  if (!folderPath) {
    alert("Please select a folder.");
    return;
  }

  if (!fileName) {
    alert("Please enter a file name.");
    return;
  }

  if (!voiceId) {
    alert("Please select a voice.");
    return;
  }

  if (!fileName.endsWith(".mp3")) fileName += ".mp3";
  document.getElementById("generate-btn").classList.add("button-pending");
  document.getElementById("generate-btn").disabled = true;
  const apiKey = localStorage.getItem("elevenLabsKey");

  try {
    const result = await window.electronAPI.generateAudioFile({
      text,
      folderPath,
      fileName,
      voiceId,
      apiKey,
    });
    if (result.success) {
      alert(`Audio file saved at ${result.filePath}`);
    } else {
      alert(`Error: ${result.error}`);
    }

    document.getElementById("audio-player-wrapper").classList.remove("hidden");
    document.getElementById("audio-controls").classList.add("hidden");
    // set audio player source
    resultAudioFileName = result.filePath;
    document.getElementById("audio-player").src = result.filePath;
    document.getElementById("audio-player").load();

    document.getElementById("video-controls").classList.remove("hidden");
  } catch (error) {
    console.error(error);
    // remove "button-pending" class from button
    alert(`Failed to generate MP3: ${error.message}`);
  } finally {
    document.getElementById("generate-btn").classList.remove("button-pending");
    document.getElementById("generate-btn").disabled = false;
  }
};

async function checkProjectStatus(projectId, apiKey, baseUrl) {
  const projectUrl = `${baseUrl}/v1/projects/${projectId}`;
  while (true) {
    const response = await fetch(projectUrl, {
      method: "GET",
      headers: {
        "X-API-KEY": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check project status: ${response.statusText}`);
    }

    const projectData = await response.json();
    if (projectData.videoUrl) {
      return projectData.videoUrl;
    }

    await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10 seconds
  }
}

async function generateVideoFile() {
  const folderPath = document.getElementById("folder-path").value;
  const fileName = document.getElementById("file-name").value + ".mp4";
  const characterFile = document.getElementById("video-character").files[0];

  // Add "button-pending" class to button
  document.getElementById("generate-video-btn").classList.add("button-pending");
  document.getElementById("generate-video-btn").disabled = true;

  const API_KEY = localStorage.getItem("hydraKey");
  const BASE_URL = "https://mercury.dev.dream-ai.com/api";

  try {
    // Upload character image
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

    // Upload audio file
    const voiceUrl = await window.electron.uploadAudioFile(
      resultAudioFileName,
      API_KEY
    );

    // Generate video
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

    // Check project status
    const videoUrl = await checkProjectStatus(jobId, API_KEY, BASE_URL);

    window.electronAPI.downloadVideoHedra({ videoUrl, folderPath, fileName });
    alert(`Video generated successfully`);
    document.getElementById("video-player").src = videoUrl;
    document.getElementById("video-player").load();
    document.getElementById("video-player").classList.remove("hidden");
  } catch (error) {
    console.error(error);
    alert(`Failed to generate video: ${error.message}`);
  } finally {
    document
      .getElementById("generate-video-btn")
      .classList.remove("button-pending");
    document.getElementById("generate-video-btn").disabled = false;
  }
}

// run function on window load
window.onload = function () {
  document
    .getElementById("generate-btn")
    .addEventListener("click", generateAudioFile);

  document
    .getElementById("settings-btn")
    .addEventListener("click", settingsClick);

  document
    .getElementById("close-settings")
    .addEventListener("click", closeSettingsClick);

  document
    .getElementById("settings-form")
    .addEventListener("submit", saveSettingsClick);

  fillVoiceDropdown();

  document
    .getElementById("voice-select")
    .addEventListener("change", showVoiceDetails);

  document
    .getElementById("generate-video-btn")
    .addEventListener("click", generateVideoFile);

  document
    .getElementById("refresh-voices")
    .addEventListener("click", fillVoiceDropdown);
};

document.getElementById("folder-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const folderPath = await window.electronAPI.selectFolder();
    if (folderPath) {
      document.getElementById("folder-path").value = folderPath;
    } else {
      console.log("No folder selected");
    }
  } catch (error) {
    console.error("Error selecting folder:", error);
  }
});
