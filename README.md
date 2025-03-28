# Ship 🚢

Ship your files without internet! 🚀

[![GitHub Repo stars](https://img.shields.io/github/stars/babyo77/ship?style=social)](https://github.com/babyo77/ship)
[![GitHub Issues](https://img.shields.io/github/issues/babyo77/ship)](https://github.com/babyo77/ship/issues)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## Description 📄

Ship is a file-sharing application designed for local networks. It allows you to transfer files between devices without needing an internet connection. It uses technologies like Electron, React, and Socket.IO for a seamless and efficient experience.

## Key Features ✨

*   **Local File Sharing**: Transfer files quickly within a local network. 🌐
*   **No Internet Required**: Operates independently of internet connectivity. 📶
*   **Cross-Platform**: Built with Electron for compatibility across Windows, macOS, and Linux. 💻
*   **Easy to Use**: Simple and intuitive user interface. 🖱️
*   **QR Code Sharing**: Quickly connect devices by scanning a QR code. 📷
*   **Clipboard Integration**: Copy and paste files. 📋
*   **Context Menu**: Send files directly from the file explorer. 📂
*   **Automatic Updates**: Stays up-to-date with the latest features and fixes. ⬆️

## Tech Stack 🛠️

*   [Electron](https://www.electronjs.org/)
*   [React](https://react.dev/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Electron Vite](https://github.com/electron-vite/electron-vite)
*   [Socket.IO](https://socket.io/)
*   [Axios](https://axios-http.com/)
*   [Radix UI](https://www.radix-ui.com/)
*   [Electron Builder](https://www.electron.build/)

## Directory Structure 📂
```
└── babyo77-ship/
    ├── check.bin
    ├── dev-app-update.yml
    ├── electron.vite.config.1718457916797.mjs
    ├── electron.vite.config.ts
    ├── msg.nsh
    ├── package.json
    ├── postcss.config.js
    ├── security.json
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── tsconfig.web.json
    ├── .editorconfig
    ├── .eslintignore
    ├── .eslintrc.cjs
    ├── .npmrc
    ├── .prettierignore
    ├── .prettierrc.yaml
    ├── public/
    │   ├── index.html
    │   ├── manifest.json
    │   └── assets/
    ├── resources/
    └── src/
        ├── main/
        │   └── index.ts
        ├── preload/
        │   ├── index.d.ts
        │   └── index.ts
        └── renderer/
            ├── index.html
            └── src/
                ├── App.tsx
                ├── env.d.ts
                ├── index.css
                ├── main.tsx
                ├── Socket/
                │   └── socket.ts
                ├── api/
                │   └── api.ts
                ├── assets/
                ├── components/
                │   ├── Changelog.tsx
                │   ├── analytics.tsx
                │   ├── clipboard.tsx
                │   ├── file.tsx
                │   ├── header.tsx
                │   ├── info.tsx
                │   ├── qr.tsx
                │   ├── qrPopup.tsx
                │   ├── sendfile.tsx
                │   └── ui/
                │       └── dialog.tsx
                └── lib/
                    └── utils.ts
```

*   `check.bin`: Binary file used for updates.
*   `dev-app-update.yml`: Configuration file for application updates.
*   `electron.vite.config.ts`: Configuration file for Electron Vite.
*   `msg.nsh`: NSIS script for custom installer messages.
*   `package.json`: Node.js package manifest file.
*   `postcss.config.js`: Configuration file for PostCSS.
*   `security.json`: JSON file related to security configurations.
*   `tailwind.config.js`: Configuration file for Tailwind CSS.
*   `src/`: Contains the main application source code.
    *   `main/`: Electron main process code.
    *   `renderer/`: React-based renderer process code.
    *   `preload/`: Preload scripts for secure context exposure.
*   `public/`: Static assets such as `index.html` and `manifest.json`.

## Installation ⬇️

1.  Clone the repository:

    bash
    git clone https://github.com/babyo77/ship.git
    cd ship
    2.  Install dependencies:

    bash
    npm install
    
## Development 💻

1.  Start the development server:

    bash
    npm run dev
    
## Building 📦

1.  Build the application:

    bash
    npm run build
    
    or, build for a specific platform:

    bash
    npm run build:win
    npm run build:mac
    npm run build:linux
    
## Usage 🚀

1.  Run the built application.
2.  Share files by either sending a file or receiving a file.
3.  Make sure both devices are on the same network.

## Custom Installation (NSIS)
  The `msg.nsh` file is an NSIS script that handles custom installation steps, including:
  * Displaying a message box at the start of the installation.
  * Adding a context menu item in the Windows Explorer for easy file sharing.

## Contributing 🤝

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License 📜

[ISC License](https://opensource.org/licenses/ISC)
