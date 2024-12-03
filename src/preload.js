const { contextBridge, ipcRenderer, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

const HEDRA_BASE_URL = "https://mercury.dev.dream-ai.com/api";

contextBridge.exposeInMainWorld("electron", {
  send: (channel, data) => {
    // ipcRenderer.send(channel, data);
    console.log("data", data);
  },
  receive: (channel, callback) =>
    ipcRenderer.on(channel, (event, ...args) => callback(...args)),
  uploadAudioFile: async (filePath, apiKey) => {
    const fileData = fs.readFileSync(filePath);
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([fileData], { type: "audio/mpeg" }),
      path.basename(filePath)
    );

    try {
      const response = await fetch(`${HEDRA_BASE_URL}/v1/audio`, {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        console.error(`Audio upload failed: ${response.statusText}`);
        throw new Error(`Audio upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
});

contextBridge.exposeInMainWorld("electronAPI", {
  selectFolder: async () => {
    try {
      const folderPath = await ipcRenderer.invoke("dialog:openFolder");
      return folderPath;
    } catch (error) {
      console.error("Error selecting folder:", error);
    }
  },
  generateAudioFile: (data) => ipcRenderer.invoke("generate-audio-file", data),
  downloadVideoHedra: (data) =>
    ipcRenderer.invoke("download-video-hedra", data),
});
