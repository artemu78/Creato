export const selectFolder = async (setFolderPath) => {
  const folderPath = await window.electronAPI.selectFolder();
  setFolderPath(folderPath);
  localStorage.setItem("folderPath", folderPath);
};

export const generateAudioFile = async ({
  text,
  folderPath,
  fileName,
  selectedVoice,
  setAudioSrc,
}) => {
  if (!text || !folderPath || !fileName || !selectedVoice) {
    alert("Please fill in all fields.");
    return;
  }

  // check if file extension is .mp3 and add it if not
  if (!fileName.endsWith(".mp3")) {
    fileName += ".mp3";
  }

  const apiKey = localStorage.getItem("elevenLabsKey");
  const result = await window.electronAPI.generateAudioFileOpenAI({
    text,
    folderPath,
    fileName,
    voiceId: selectedVoice,
    apiKey,
  });
  if (result.success) {
    setAudioSrc(result.filePath);
  } else {
    alert(`Error: ${result.error}`);
  }
};

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

export const fillVoiceDropdown = async ({ setVoices }) => {
  const voices = await fetchElevenVoices();
  if (voices) setVoices(voices.voices);
};

export async function checkProjectStatus(projectId, apiKey, baseUrl) {
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

export const generateAudioFileOpenAI = async ({
  text,
  folderPath,
  fileName,
  voiceId,
  setAudioSrc,
}) => {
  if (!text || !folderPath || !fileName || !voiceId) {
    alert("Please fill in all fields.");
    return;
  }

  // check if file extension is .mp3 and add it if not
  if (!fileName.endsWith(".mp3")) {
    fileName += ".mp3";
  }

  const apiKey = localStorage.getItem("openAIKey");
  const result = await window.electronAPI.generateAudioFileOpenAI({
    text,
    folderPath,
    fileName,
    voiceId,
    apiKey,
  });
  if (result.success) {
    setAudioSrc(result.filePath);
  } else {
    alert(`Error: ${result.error}`);
  }
};
