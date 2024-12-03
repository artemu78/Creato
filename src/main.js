const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
// const fetch = require("node-fetch");
// import fetch from "node-fetch";

let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  mainWindow.webContents.openDevTools();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle(
  "generate-audio-file",
  async (event, { apiKey, text, folderPath, fileName, voiceId }) => {
    const fetch = (await import("node-fetch")).default;
    const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const filePath = path.join(folderPath, fileName);
      const buffer = Buffer.from(audioBuffer);
      fs.writeFileSync(filePath, buffer);

      return { success: true, filePath };
    } catch (error) {
      console.error(error);
      return { success: false, error: error.message };
    }
  }
);

ipcMain.handle("dialog:openFolder", async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle(
  "download-video-hedra",
  async (event, { videoUrl, folderPath, fileName }) => {
    const fetch = (await import("node-fetch")).default;

    try {
      const filePath = path.join(folderPath, fileName);
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const videoBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(videoBuffer);
      fs.writeFileSync(filePath, buffer);

      return { success: true, filePath };
    } catch (error) {
      console.error(error);
      return { success: false, error: error.message };
    }
  }
);
