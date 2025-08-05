# ChatGPT Data Export Viewer

![GitHub stars](https://img.shields.io/github/stars/lalajani68/ChatGPT-Data-Export-Viewer)
![GitHub issues](https://img.shields.io/github/issues/lalajani68/ChatGPT-Data-Export-Viewer)
![License](https://img.shields.io/github/license/lalajani68/ChatGPT-Data-Export-Viewer)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)

**A privacy-focused tool to securely view and manage your ChatGPT conversation exports. Take control of your data with an intuitive interface that replicates the original ChatGPT experience.**

![Preview](https://via.placeholder.com/800x450?text=App+Preview+Image)

## 🌟 Key Features

- 🔒 **Privacy-First**: View your conversations locally without uploading to external servers
- 📁 **Easy Import**: Simple drag-and-drop interface for ChatGPT export ZIP files
- 🔍 **Powerful Search**: Instantly find conversations with real-time filtering
- 🖼️ **Media Support**: View images, play audio recordings, and render code snippets
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🛠️ **Error Recovery**: Handles corrupted exports with repair functionality
- 🌙 **Dark Theme**: Eye-friendly interface matching ChatGPT's appearance
- 💾 **Offline Access**: Completely browser-based with no server dependencies

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- ChatGPT conversation export (ZIP file)

### Step-by-Step Guide

1. **Export Your Data from ChatGPT**
   - Go to ChatGPT Settings > Data controls > Export
   - Wait for the email with your download link

2. **Prepare Your Export File (Critical Step)**
   - Download the ZIP file from the email
   - Extract the ZIP to a folder (ignore extraction errors)
   - Recompress the contents into a new ZIP file
   - Rename it simply (e.g., `my-chats.zip`)

3. **View Your Conversations**
   - Open `index.html` in your browser
   - Drag your prepared ZIP file onto the upload area
   - Browse conversations using the sidebar
   - Search and filter your chat history

## 🔧 Installation

No installation required! This is a standalone HTML application:

1. Download the latest release
2. Extract the ZIP file
3. Open `index.html` in your web browser
4. Upload your ChatGPT export ZIP file

## 📸 Screenshots

| Conversation View | Media Support | Search Interface |
|-------------------|----------------|------------------|
| ![Conversation View](https://via.placeholder.com/300x200?text=Conversation+View) | ![Media Support](https://via.placeholder.com/300x200?text=Media+Support) | ![Search Interface](https://via.placeholder.com/300x200?text=Search+Interface) |

## 🔍 Troubleshooting

### Common Issues

**Problem**: "Corrupted zip: can't find end of central directory"
- **Solution**: You're using the original ZIP from ChatGPT. Follow the preparation steps to create a new ZIP file.

**Problem**: Images show as "[File: -Deleted-]"
- **Solution**: Ensure you've properly prepared the ZIP file. The app includes multiple fallback methods to locate images.

**Problem**: Browser becomes unresponsive with large files
- **Solution**: Be patient during processing. The app handles large files (tested up to 500MB) with progress tracking.

### Enable Debug Mode
Click the bug icon (bottom-right) to see detailed processing logs and error information.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [JSZip](https://stuk.github.io/jszip/) for ZIP file processing
- [Marked.js](https://marked.js.org/) for Markdown parsing
- [Highlight.js](https://highlightjs.org/) for syntax highlighting
- [Font Awesome](https://fontawesome.com/) for icons

## 📞 Contact

- Project Link: [https://github.com/lalajani68/ChatGPT-Data-Export-Viewer](https://github.com/lalajani68/ChatGPT-Data-Export-Viewer)
- Issues: [https://github.com/lalajani68/ChatGPT-Data-Export-Viewer/issues](https://github.com/lalajani68/ChatGPT-Data-Export-Viewer/issues)

---

⭐ If this tool helped you take control of your data, please consider starring the repository!