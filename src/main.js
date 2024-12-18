const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
require("electron-reload")(path.join(__dirname, "src"), {
  electron: path.join(__dirname, "..", "node_modules", ".bin", "electron"),
  forceHardReset: true,
});

let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.loadFile(path.join(__dirname, "index_react.html"));
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
    const model_id = "eleven_multilingual_v2";
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({ text, model_id }),
      });

      if (!response.ok) {
        console.error(response);
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
