import MenuIcon from "@mui/icons-material/Menu";
import packageJson from "../../package.json";
import React, { useState, useEffect } from "react";
import {
  Button,
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  MenuItem,
  Menu,
  Divider,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

export const Header = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogAbout, setOpenDialogAbout] = useState(false);
  const [menuAnchorEl, setAnchorEl] = useState(null);
  const [openAIKey, setOpenAIKey] = useState("");
  const [hedraKey, setHedraKey] = useState("");
  const [elevenKey, setElevenKey] = useState("");
  const version = packageJson.version;

  const fillSettings = () => {
    const openAIKey = localStorage.getItem("openAIKey");
    const hedraKey = localStorage.getItem("hedraKey");
    const elevenKey = localStorage.getItem("elevenLabsKey");
    setOpenAIKey(openAIKey);
    setHedraKey(hedraKey);
    setElevenKey(elevenKey);
  };

  const handleElevenKeyChange = (event) => {
    setElevenKey(event.target.value);
  };
  const handleHedraKeyChange = (event) => {
    setHedraKey(event.target.value);
  };
  const handleOpenAIKeyChange = (event) => {
    setOpenAIKey(event.target.value);
  };

  const handleSaveKeys = () => {
    localStorage.setItem("openAIKey", openAIKey);
    localStorage.setItem("hedraKey", hedraKey);
    localStorage.setItem("elevenLabsKey", elevenKey);
    alert("Keys saved successfully.");
    setOpenDialog(false);
  };

  const openMenu = Boolean(menuAnchorEl);
  const handleClickMenu = (event) => {
    fillSettings();
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleDialogCloseAbout = () => {
    setOpenDialogAbout(false);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleSettingsClick = () => {
    handleCloseMenu();
    setOpenDialog(true);
  };

  const handleAboutClick = () => {
    handleCloseMenu();
    setOpenDialogAbout(true);
  };

  return (
    <Box sx={{ flexGrow: 1, paddingBottom: 2 }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 1 }}
            aria-controls={openMenu ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={openMenu ? "true" : undefined}
            onClick={handleClickMenu}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="basic-menu"
            anchorEl={menuAnchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem onClick={handleSettingsClick}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleAboutClick}>About</MenuItem>
          </Menu>
          <Dialog
            open={openDialog}
            onClose={handleDialogClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">Settings</DialogTitle>
            <DialogContent>
              <TextField
                label="Eleven Labs API Key"
                variant="outlined"
                margin="normal"
                onChange={handleElevenKeyChange}
                value={elevenKey}
                fullWidth
              />
              <TextField
                label="Hedra API Key"
                variant="outlined"
                margin="normal"
                onChange={handleHedraKeyChange}
                value={hedraKey}
                fullWidth
              />
              <TextField
                label="OpenAI API Key"
                variant="outlined"
                margin="normal"
                onChange={handleOpenAIKeyChange}
                value={openAIKey}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Close</Button>
              <Button onClick={handleSaveKeys} autoFocus>
                Save
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={openDialogAbout}
            onClose={handleDialogCloseAbout}
            aria-describedby="alert-dialog-description-about"
          >
            <DialogContent>
              <DialogContentText id="alert-dialog-description-about">
                Convert your text into MP3 and then into MP4.
                <br />
                API used: Hedra, Eleven Labs.
                <br />
                Version: {version}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogCloseAbout} autoFocus>
                Close
              </Button>
            </DialogActions>
          </Dialog>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Generate Video From Text
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
