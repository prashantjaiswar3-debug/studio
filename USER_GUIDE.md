# StreamWeaver User Guide

Welcome to StreamWeaver! This guide will walk you through all the features of your new IPTV player.

## 1. Loading a Playlist

You have several ways to load channels into the player.

### Load from URL
- **How to use**: Find the input field at the top of the left sidebar that says "M3U Playlist URL". Paste the URL of your playlist (`.m3u` or `.m3u8` file) into this field and click the **Load from URL** button.
- **What it does**: The player will fetch and display all the channels from that online playlist.

### Upload an M3U File
- **How to use**: Click the **Upload M3U File** button in the sidebar. This will open a file dialog, allowing you to select an M3U playlist file from your computer.
- **What it does**: This is the recommended method for playlists you use often. The player will load the channels and automatically save the playlist content in your browser's local storage. The next time you open the app, it will load this playlist automatically.

### Load a Preset Playlist
- **Load from Setup File**: Click this button to load the default playlist configured in the `streamweaver.config.json` file. This is useful for developers who want to set a standard playlist for the application.
- **Load Sample Playlist**: Click this to load a sample playlist provided with the app. It's a great way to test the player's functionality without needing your own playlist.

## 2. Navigating Channels

Once your channels are loaded, you can find something to watch using the dashboard or the sidebar.

### Dashboard View
- When you first load the app (or close the video player), you will see the dashboard.
- Channels are automatically grouped by their category (e.g., "News", "Sports", "Movies").
- A **search bar** at the top allows you to instantly filter all channels by name.
- Simply click on any channel card to start playback.

### Sidebar Controls
The sidebar on the left provides more tools for navigation:

- **Filter**: Use the "Filter channels..." input to quickly find channels by name.
- **Sort**: Click the sort button to arrange the channel list in the sidebar alphabetically (A-Z or Z-A) or return to the default order.
- **Categories**: The sidebar lists all available categories from your playlist, plus special categories:
    - **All**: Shows every channel.
    - **Favorites**: Shows only channels you have marked as a favorite.
    - **Recents**: Shows the last 20 channels you've watched.

## 3. The Video Player

The player is designed to be clean and intuitive.

### Player Controls
- Player controls appear when you move your mouse over the video and hide automatically after a few seconds.
- **Play/Pause**: The central button to play or pause the stream.
- **Rewind/Fast Forward**: Skip backward or forward by 10 seconds. These buttons are disabled for live streams.
- **Volume**: Control the volume using the slider that appears when you hover over the volume icon.
- **Time Display**: For videos, you'll see the current time and total duration. For live streams, you'll see a **LIVE** indicator and the current stream time.
- **Settings (Gear Icon)**: Adjust the playback speed of the video.
- **Picture-in-Picture (PiP)**: Click this to pop the video out into a small, floating window that stays on top of your other applications.
- **Fullscreen**: Enter or exit fullscreen mode.
- **Close Player (X Button)**: In the header above the player, click the **X** button to close the video and return to the dashboard.

### Favorites
- You can add a channel to your favorites by clicking the **Star icon**. The star is available in two places:
    1. In the player header when you are watching a channel.
    2. Next to each channel's name in the sidebar list (it appears when you hover over the item).
- A yellow star indicates the channel is a favorite. Click it again to remove it from your favorites.

## 4. EPG (Electronic Program Guide)

- The **EPG** tab provides a visual layout of a television schedule.
- This feature is currently a visual placeholder to demonstrate what a full EPG would look like. It shows channels on the left and a timeline at the top, but does not yet load real-time program data from an XMLTV source.

---

Enjoy your StreamWeaver experience!
