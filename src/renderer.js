const elevenVoices = {};
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
  const folderInput = document.getElementById("folder-input").files[0];
  const fileName = document.getElementById("file-name").value || "output.mp3";
  const voiceId = document.getElementById("voice-select").value;

  if (!text || !folderInput || !fileName || !voiceId) {
    alert("Please fill in all fields.");
    return;
  }

  // add "button-pending" class to button
  document.getElementById("generate-btn").classList.add("button-pending");
  document.getElementById("generate-btn").disabled = true;

  const XI_API_KEY = localStorage.getItem("elevenLabsKey");
  const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "xi-api-key": XI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      console.error(response);
      throw new Error(`API Error: ${response.statusText}`);
    }

    const fileStream = response.body;

    const fileHandle = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [
        { description: "Audio Files", accept: { "audio/mpeg": [".mp3"] } },
      ],
      id: "output",
    });
    const writable = await fileHandle.createWritable();

    if (fileStream) {
      const reader = fileStream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await writable.write(value);
      }
    }

    await writable.close();
    alert("MP3 file successfully generated!");

    // add audio player to page to play generated MP3
    const audioPlayer = document.getElementById("audio-player");
    audioPlayer.innerHTML = `
<audio controls>
  <source src="${URL.createObjectURL(
    await fileHandle.getFile()
  )}" type="audio/mpeg">
</audio>
    `;
    document.getElementById("audio-controls").classList.add("hidden");

    document.getElementById("video-controls").classList.remove("hidden");
    document.getElementById("video-controls").classList.add("visible");
  } catch (error) {
    console.error(error);
    // remove "button-pending" class from button
    alert(`Failed to generate MP3: ${error.message}`);
  } finally {
    document.getElementById("generate-btn").classList.remove("button-pending");
    document.getElementById("generate-btn").disabled = false;
  }
};

function generateVideoFile() {
  const folderInput = document.getElementById("folder-input").files[0];
  const fileName = document.getElementById("file-name").value || "output.mp4";
  const character = document.getElementById("video-character").value;

  if (!character) {
    alert("Please fill in all fields.");
    return;
  }

  // add "button-pending" class to button
  document.getElementById("generate-video-btn").classList.add("button-pending");
  document.getElementById("generate-video-btn").disabled = true;

  const XI_API_KEY = localStorage.getItem("hydraKey");
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
};
