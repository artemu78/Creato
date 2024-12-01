const closeSettingsClick = () => {
  document.getElementById("settings-modal").style.display = "none";
};

const settingsClick = async (e) => {
  document.getElementById("settings-modal").style.display = "flex";
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

const generateClick = async () => {
  const text = document.getElementById("text-input").value;
  const folderInput = document.getElementById("folder-input").files[0];
  const fileName = document.getElementById("file-name").value || "output.mp3";

  if (!text || !folderInput || !fileName) {
    alert("Please fill in all fields.");
    return;
  }

  const XI_API_KEY = localStorage.getItem("elevenLabsKey");
  const VOICE_ID = "Xb7hH8MSUJpSbSDYk0k2"; // Replace with a valid voice ID
  const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`;

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
  } catch (error) {
    console.error(error);
    alert(`Failed to generate MP3: ${error.message}`);
  }
};

// run function on window load
window.onload = function () {
  document
    .getElementById("generate-btn")
    .addEventListener("click", generateClick);

  document
    .getElementById("settings-btn")
    .addEventListener("click", settingsClick);

  document
    .getElementById("close-settings")
    .addEventListener("click", closeSettingsClick);

  document
    .getElementById("settings-form")
    .addEventListener("submit", saveSettingsClick);
};
