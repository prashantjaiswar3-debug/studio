# StreamWeaver - A Modern IPTV Player

StreamWeaver is a sleek, modern IPTV player built with Next.js and Tailwind CSS. It allows you to load M3U playlists, browse channels, and watch streams directly in your browser.

![StreamWeaver Screenshot](https://placehold.co/800x600.png?text=StreamWeaver+UI)

## Features

- **M3U Playlist Support**: Load playlists from a URL or by uploading a local `.m3u` file.
- **Channel Browser**: Easily navigate through channels with a searchable and sortable list.
- **Favorites & Recents**: Mark your favorite channels and quickly access recently watched streams.
- **Modern Player**: A clean and intuitive video player with standard controls.
- **Responsive Design**: Works on both desktop and mobile devices.
- **Customizable**: Configure default playlists via a simple JSON file.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) (version 18 or later) and [npm](https://www.npmjs.com/) installed on your computer.

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    This command will install all the necessary packages for the application.
    ```bash
    npm install
    ```

3.  **Run the development server:**
    This will start the application on your local machine.
    ```bash
    npm run dev
    ```

4.  **Open the application:**
    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## How to Use

### Loading a Playlist

There are three ways to load a playlist:

1.  **From a URL**: Paste the URL of an M3U playlist into the input field in the sidebar and click "Load from URL".
2.  **From a File**: Click the "Upload M3U File" button to select and load a playlist from your computer. This playlist will be saved in your browser's local storage for future sessions.
3.  **From Configuration**: Set up default playlists by editing the `streamweaver.config.json` file.

### Customizing Default Playlists

You can configure the application to load specific playlists by default.

1.  Open the `streamweaver.config.json` file in the project's root directory.
2.  Add an array of M3U URLs to the `defaultPlaylistUrls` key:

    ```json
    {
      "defaultPlaylistUrls": [
        "https://iptv-org.github.io/iptv/countries/us.m3u",
        "https://iptv-org.github.io/iptv/countries/ca.m3u"
      ]
    }
    ```

The application will fetch and merge these playlists on startup.

## Built With

- [Next.js](https://nextjs.org/) - React Framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Shadcn/ui](https://ui.shadcn.com/) - Component Library
- [HLS.js](https://github.com/video-dev/hls.js/) - HLS Video Playback
- [Lucide React](https://lucide.dev/) - Icons
