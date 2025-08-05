// Configure marked options
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(code, { language: lang }).value;
            } catch (err) {}
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
});

// Global variables
let conversationsData = [];
let assetsMapping = {};
let currentConversation = null;
let audioFiles = {};
let imageFiles = {};
let debugMode = false;
let zipFile = null;
let corruptedFile = null;

// DOM elements
const uploadContainer = document.getElementById('uploadContainer');
const loadingContainer = document.getElementById('loadingContainer');
const errorContainer = document.getElementById('errorContainer');
const uploadArea = document.getElementById('uploadArea');
const uploadButton = document.getElementById('uploadButton');
const fileInput = document.getElementById('fileInput');
const conversationsList = document.getElementById('conversationsList');
const searchInput = document.getElementById('searchInput');
const chatHeader = document.getElementById('chatHeader');
const chatTitle = document.getElementById('chatTitle');
const messagesContainer = document.getElementById('messagesContainer');
const emptyState = document.getElementById('emptyState');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const refreshBtn = document.getElementById('refreshBtn');
const downloadBtn = document.getElementById('downloadBtn');
const loadingText = document.getElementById('loadingText');
const loadingProgressBar = document.getElementById('loadingProgressBar');
const errorTitle = document.getElementById('errorTitle');
const errorDescription = document.getElementById('errorDescription');
const errorDetails = document.getElementById('errorDetails');
const errorSolutions = document.getElementById('errorSolutions');
const solutionsList = document.getElementById('solutionsList');
const repairSection = document.getElementById('repairSection');
const repairButton = document.getElementById('repairButton');
const retryButton = document.getElementById('retryButton');
const backButton = document.getElementById('backButton');
const debugToggle = document.getElementById('debugToggle');
const debugPanel = document.getElementById('debugPanel');
const imageModal = document.getElementById('imageModal');
const imageModalContent = document.getElementById('imageModalContent');
const imageModalClose = document.getElementById('imageModalClose');

// Remembered file elements
const rememberedFileContainer = document.getElementById('rememberedFileContainer');
const rememberedFileInfo = document.getElementById('rememberedFileInfo');
const loadRememberedFileBtn = document.getElementById('loadRememberedFileBtn');
const clearRememberedFileBtn = document.getElementById('clearRememberedFileBtn');

// Event listeners
uploadButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
searchInput.addEventListener('input', filterConversations);
menuToggle.addEventListener('click', toggleSidebar);
refreshBtn.addEventListener('click', refreshCurrentChat);
downloadBtn.addEventListener('click', downloadCurrentChat);
retryButton.addEventListener('click', () => {
    errorContainer.style.display = 'none';
    uploadContainer.style.display = 'flex';
});
backButton.addEventListener('click', () => {
    errorContainer.style.display = 'none';
    uploadContainer.style.display = 'flex';
});
repairButton.addEventListener('click', attemptRepair);
debugToggle.addEventListener('click', toggleDebugPanel);
imageModalClose.addEventListener('click', closeImageModal);
imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
        closeImageModal();
    }
});

// Remembered file event listeners
loadRememberedFileBtn.addEventListener('click', loadRememberedFile);
clearRememberedFileBtn.addEventListener('click', clearRememberedFile);

// Initialize app
function initApp() {
    // Check for remembered file
    checkForRememberedFile();
}

// Remembered file functions
function checkForRememberedFile() {
    const rememberedFile = localStorage.getItem('rememberedChatExportFile');
    if (rememberedFile) {
        try {
            const fileData = JSON.parse(rememberedFile);
            if (fileData && fileData.name && fileData.size && fileData.lastModified) {
                // Display remembered file info
                const lastAccessDate = new Date(fileData.lastAccessed);
                const formattedDate = lastAccessDate.toLocaleDateString() + ' ' + lastAccessDate.toLocaleTimeString();
                
                rememberedFileInfo.innerHTML = `
                    <strong>${fileData.name}</strong> (${formatFileSize(fileData.size)})<br>
                    Last accessed: ${formattedDate}
                `;
                
                rememberedFileContainer.style.display = 'block';
            }
        } catch (e) {
            console.error('Error parsing remembered file data:', e);
            localStorage.removeItem('rememberedChatExportFile');
        }
    }
}

function rememberFile(file) {
    const fileData = {
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        lastAccessed: new Date().toISOString()
    };
    
    localStorage.setItem('rememberedChatExportFile', JSON.stringify(fileData));
    checkForRememberedFile();
}

function loadRememberedFile() {
    const rememberedFile = localStorage.getItem('rememberedChatExportFile');
    if (rememberedFile) {
        try {
            const fileData = JSON.parse(rememberedFile);
            if (fileData) {
                // Create a mock file object
                const mockFile = {
                    name: fileData.name,
                    size: fileData.size,
                    lastModified: fileData.lastModified,
                    type: 'application/zip'
                };
                
                // Update the last accessed time
                fileData.lastAccessed = new Date().toISOString();
                localStorage.setItem('rememberedChatExportFile', JSON.stringify(fileData));
                
                // Show loading state
                uploadContainer.style.display = 'none';
                loadingContainer.style.display = 'flex';
                loadingText.textContent = `Loading remembered file: ${fileData.name}...`;
                loadingProgressBar.style.width = '0%';
                
                // Since we can't access the actual file content without user selection,
                // we'll show a message asking the user to select the file again
                setTimeout(() => {
                    loadingContainer.style.display = 'none';
                    uploadContainer.style.display = 'flex';
                    
                    // Show a message to the user
                    const messageDiv = document.createElement('div');
                    messageDiv.style.position = 'fixed';
                    messageDiv.style.top = '20px';
                    messageDiv.style.left = '50%';
                    messageDiv.style.transform = 'translateX(-50%)';
                    messageDiv.style.backgroundColor = 'rgba(16, 163, 127, 0.9)';
                    messageDiv.style.color = 'white';
                    messageDiv.style.padding = '12px 24px';
                    messageDiv.style.borderRadius = '6px';
                    messageDiv.style.zIndex = '1000';
                    messageDiv.style.maxWidth = '80%';
                    messageDiv.style.textAlign = 'center';
                    messageDiv.innerHTML = `
                        <i class="fas fa-info-circle"></i> 
                        To load your remembered file "${fileData.name}", please select it again using the "Browse Files" button.
                        <br><small>This limitation exists for security reasons - browsers don't allow automatic access to local files.</small>
                    `;
                    document.body.appendChild(messageDiv);
                    
                    // Auto-remove after 5 seconds
                    setTimeout(() => {
                        messageDiv.style.opacity = '0';
                        messageDiv.style.transition = 'opacity 0.5s';
                        setTimeout(() => {
                            if (document.body.contains(messageDiv)) {
                                document.body.removeChild(messageDiv);
                            }
                        }, 500);
                    }, 5000);
                }, 1000);
            }
        } catch (e) {
            console.error('Error loading remembered file:', e);
            showError('Error', 'Could not load the remembered file. Please select it manually.');
        }
    }
}

function clearRememberedFile() {
    localStorage.removeItem('rememberedChatExportFile');
    rememberedFileContainer.style.display = 'none';
    
    // Show confirmation message
    const messageDiv = document.createElement('div');
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.backgroundColor = 'rgba(16, 163, 127, 0.9)';
    messageDiv.style.color = 'white';
    messageDiv.style.padding = '12px 24px';
    messageDiv.style.borderRadius = '6px';
    messageDiv.style.zIndex = '1000';
    messageDiv.textContent = 'Remembered file cleared successfully.';
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 500);
    }, 3000);
}

// Debug functions
function toggleDebugPanel() {
    debugMode = !debugMode;
    debugPanel.style.display = debugMode ? 'block' : 'none';
}

function debugLog(message) {
    if (debugMode) {
        const timestamp = new Date().toLocaleTimeString();
        debugPanel.innerHTML += `[${timestamp}] ${message}\n`;
        debugPanel.scrollTop = debugPanel.scrollHeight;
    }
    console.log(message);
}

// File handling functions
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.zip')) {
        debugLog(`Selected file: ${file.name}, Size: ${formatFileSize(file.size)}`);
        zipFile = file;
        rememberFile(file);
        processZipFile(file);
    } else {
        showError('Invalid File Type', 'Please select a valid ZIP file containing your ChatGPT export.');
    }
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
        debugLog(`Dropped file: ${file.name}, Size: ${formatFileSize(file.size)}`);
        zipFile = file;
        rememberFile(file);
        processZipFile(file);
    } else {
        showError('Invalid File Type', 'Please drop a valid ZIP file containing your ChatGPT export.');
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function processZipFile(file) {
    uploadContainer.style.display = 'none';
    loadingContainer.style.display = 'flex';
    loadingText.textContent = `Processing ${file.name} (${formatFileSize(file.size)})...`;
    loadingProgressBar.style.width = '0%';
    
    try {
        debugLog('Starting ZIP file processing...');
        
        // Check file size and warn if very large
        if (file.size > 100 * 1024 * 1024) { // 100MB
            debugLog('Large file detected, this may take some time...');
        }
        
        // Use a more robust approach for large files
        debugLog('Creating JSZip instance...');
        const zip = new JSZip();
        
        // Update progress for loading the ZIP
        loadingProgressBar.style.width = '10%';
        loadingText.textContent = 'Loading ZIP file...';
        
        debugLog('Loading ZIP file...');
        const contents = await zip.loadAsync(file, { stream: true });
        
        // Update progress for reading file list
        loadingProgressBar.style.width = '20%';
        loadingText.textContent = 'Reading file list...';
        
        debugLog(`ZIP file loaded with ${Object.keys(contents.files).length} files`);
        
        // List all files in the ZIP for debugging
        const fileList = [];
        contents.forEach((relativePath, file) => {
            fileList.push(relativePath);
        });
        debugLog(`Files in ZIP: ${fileList.slice(0, 10).join(', ')}${fileList.length > 10 ? '...' : ''}`);
        
        // Check for required files
        const hasConversations = contents.file('conversations.json') !== null;
        const hasChatHtml = contents.file('chat.html') !== null;
        
        debugLog(`Required files check - conversations.json: ${hasConversations}, chat.html: ${hasChatHtml}`);
        
        if (!hasConversations) {
            throw new Error('Required file "conversations.json" not found in the ZIP file. This may not be a valid ChatGPT export.');
        }
        
        // Extract conversations.json
        loadingProgressBar.style.width = '40%';
        loadingText.textContent = 'Loading conversations...';
        
        debugLog('Extracting conversations.json...');
        const conversationsJson = await contents.file('conversations.json').async('text');
        
        try {
            conversationsData = JSON.parse(conversationsJson);
            debugLog(`Loaded ${conversationsData.length} conversations`);
        } catch (e) {
            throw new Error(`Failed to parse conversations.json: ${e.message}`);
        }
        
        // Extract assets mapping from chat.html if available
        if (hasChatHtml) {
            loadingProgressBar.style.width = '60%';
            loadingText.textContent = 'Processing assets...';
            
            debugLog('Extracting assets mapping from chat.html...');
            const chatHtml = await contents.file('chat.html').async('text');
            extractAssetsMapping(chatHtml);
            debugLog(`Assets mapping extracted with ${Object.keys(assetsMapping).length} entries`);
        } else {
            debugLog('chat.html not found, skipping assets mapping');
        }
        
        // Extract audio files
        loadingProgressBar.style.width = '80%';
        loadingText.textContent = 'Processing audio files...';
        
        debugLog('Extracting audio files...');
        await extractAudioFiles(contents);
        debugLog(`Extracted ${Object.keys(audioFiles).length} audio files`);
        
        // Extract image files
        loadingProgressBar.style.width = '85%';
        loadingText.textContent = 'Processing image files...';
        
        debugLog('Extracting image files...');
        await extractImageFiles(contents);
        debugLog(`Extracted ${Object.keys(imageFiles).length} image files`);
        
        // Extract user info if available
        try {
            if (contents.file('user.json')) {
                debugLog('Extracting user.json...');
                const userJson = await contents.file('user.json').async('text');
                const userData = JSON.parse(userJson);
                debugLog(`User data loaded: ${userData.email || 'Unknown email'}`);
            }
        } catch (e) {
            debugLog(`Warning: Could not load user.json: ${e.message}`);
        }
        
        // Display conversations
        loadingProgressBar.style.width = '100%';
        loadingText.textContent = 'Finalizing...';
        
        debugLog('Displaying conversations...');
        displayConversations();
        
        // Show chat interface
        setTimeout(() => {
            loadingContainer.style.display = 'none';
            chatHeader.style.display = 'flex';
            debugLog('Processing complete!');
        }, 500);
        
    } catch (error) {
        console.error('Error processing ZIP file:', error);
        
        // Check if it's a corrupted ZIP file error
        if (error.message && error.message.includes('Corrupted zip') || error.message.includes('end of central directory')) {
            handleCorruptedZip(error);
        } else {
            showError('Error Processing ZIP File', error.message || error.toString());
        }
        
        loadingContainer.style.display = 'none';
    }
}

function handleCorruptedZip(error) {
    debugLog('Handling corrupted ZIP file...');
    corruptedFile = zipFile;
    
    // Show specific error message for corrupted ZIP
    errorTitle.textContent = 'Corrupted ZIP File Detected';
    errorDescription.textContent = 'The ZIP file appears to be corrupted or incomplete. This can happen with large files during download or export.';
    
    // Show solutions
    errorSolutions.style.display = 'block';
    solutionsList.innerHTML = `
        <li><strong>Re-export your data:</strong> Try exporting your ChatGPT data again. Make sure the download completes fully.</li>
        <li><strong>Check your internet connection:</strong> A stable connection is important for downloading large files.</li>
        <li><strong>Try a different browser:</strong> Sometimes browser-specific issues can affect downloads.</li>
        <li><strong>Use a download manager:</strong> For very large files, a download manager can help ensure complete downloads.</li>
    `;
    
    // Show repair option
    repairSection.style.display = 'block';
    
    // Create error details
    let errorDetailsText = `Error: ${error.message}\n\n`;
    errorDetailsText += `File: ${zipFile ? zipFile.name : 'Unknown'}\n`;
    errorDetailsText += `Size: ${zipFile ? formatFileSize(zipFile.size) : 'Unknown'}\n`;
    errorDetailsText += `Timestamp: ${new Date().toISOString()}\n\n`;
    
    // Add browser information
    errorDetailsText += `Browser: ${navigator.userAgent}\n\n`;
    
    // Add stack trace if available
    if (error.stack) {
        errorDetailsText += `Stack Trace:\n${error.stack}`;
    }
    
    errorDetails.textContent = errorDetailsText;
    errorContainer.style.display = 'flex';
    
    debugLog(`Corrupted ZIP file detected: ${error.message}`);
}

async function attemptRepair() {
    if (!corruptedFile) return;
    
    debugLog('Attempting to repair corrupted ZIP file...');
    loadingContainer.style.display = 'flex';
    loadingText.textContent = 'Attempting to repair ZIP file...';
    loadingProgressBar.style.width = '0%';
    errorContainer.style.display = 'none';
    
    try {
        // Try to use a different approach to read the ZIP file
        // This is a basic attempt and may not work for all corruption types
        
        // Update progress
        loadingProgressBar.style.width = '30%';
        loadingText.textContent = 'Reading file data...';
        
        // Read the file as an array buffer
        const arrayBuffer = await corruptedFile.arrayBuffer();
        
        // Update progress
        loadingProgressBar.style.width = '60%';
        loadingText.textContent = 'Attempting to extract data...';
        
        // Try to create a new JSZip instance with the data
        const zip = new JSZip();
        
        try {
            // Try to load the data
            const contents = await zip.loadAsync(arrayBuffer);
            
            // If we get here, the file was successfully read
            debugLog('Successfully read potentially corrupted ZIP file');
            
            // Continue with normal processing
            loadingProgressBar.style.width = '80%';
            loadingText.textContent = 'Processing recovered data...';
            
            // Check for required files
            const hasConversations = contents.file('conversations.json') !== null;
            
            if (!hasConversations) {
                throw new Error('Required file "conversations.json" not found in the repaired ZIP file.');
            }
            
            // Extract conversations.json
            const conversationsJson = await contents.file('conversations.json').async('text');
            
            try {
                conversationsData = JSON.parse(conversationsJson);
                debugLog(`Loaded ${conversationsData.length} conversations from repaired file`);
            } catch (e) {
                throw new Error(`Failed to parse conversations.json from repaired file: ${e.message}`);
            }
            
            // Try to extract assets mapping if chat.html exists
            const hasChatHtml = contents.file('chat.html') !== null;
            if (hasChatHtml) {
                try {
                    const chatHtml = await contents.file('chat.html').async('text');
                    extractAssetsMapping(chatHtml);
                    debugLog(`Assets mapping extracted with ${Object.keys(assetsMapping).length} entries`);
                } catch (e) {
                    debugLog(`Warning: Could not extract assets mapping: ${e.message}`);
                }
            }
            
            // Try to extract audio files
            try {
                await extractAudioFiles(contents);
                debugLog(`Extracted ${Object.keys(audioFiles).length} audio files`);
            } catch (e) {
                debugLog(`Warning: Could not extract all audio files: ${e.message}`);
            }
            
            // Try to extract image files
            try {
                await extractImageFiles(contents);
                debugLog(`Extracted ${Object.keys(imageFiles).length} image files`);
            } catch (e) {
                debugLog(`Warning: Could not extract all image files: ${e.message}`);
            }
            
            // Display conversations
            loadingProgressBar.style.width = '100%';
            loadingText.textContent = 'Finalizing...';
            
            debugLog('Displaying conversations from repaired file...');
            displayConversations();
            
            // Show chat interface
            setTimeout(() => {
                loadingContainer.style.display = 'none';
                chatHeader.style.display = 'flex';
                debugLog('Repair and processing complete!');
                
                // Show a success message
                const successMessage = document.createElement('div');
                successMessage.style.position = 'fixed';
                successMessage.style.top = '20px';
                successMessage.style.left = '50%';
                successMessage.style.transform = 'translateX(-50%)';
                successMessage.style.backgroundColor = 'rgba(16, 163, 127, 0.9)';
                successMessage.style.color = 'white';
                successMessage.style.padding = '12px 24px';
                successMessage.style.borderRadius = '6px';
                successMessage.style.zIndex = '1000';
                successMessage.textContent = 'Successfully repaired and loaded your ChatGPT data!';
                document.body.appendChild(successMessage);
                
                setTimeout(() => {
                    successMessage.style.opacity = '0';
                    successMessage.style.transition = 'opacity 0.5s';
                    setTimeout(() => {
                        document.body.removeChild(successMessage);
                    }, 500);
                }, 3000);
            }, 500);
            
        } catch (innerError) {
            // If we still can't read the file, show a more detailed error
            throw new Error(`Unable to repair the ZIP file. ${innerError.message}`);
        }
        
    } catch (error) {
        console.error('Error repairing ZIP file:', error);
        showError('Repair Failed', `Could not repair the ZIP file. ${error.message || error.toString()}`);
        loadingContainer.style.display = 'none';
    }
}

function extractAssetsMapping(html) {
    try {
        // Extract the assetsJson variable from the HTML
        const match = html.match(/var assetsJson = ({.*?});/s);
        if (match && match[1]) {
            assetsMapping = JSON.parse(match[1]);
            debugLog(`Successfully parsed assets mapping with ${Object.keys(assetsMapping).length} entries`);
        } else {
            debugLog('Could not find assetsJson in chat.html');
        }
    } catch (e) {
        debugLog(`Error parsing assets mapping: ${e.message}`);
        // Don't throw an error here, just continue without assets mapping
    }
}

async function extractAudioFiles(zip) {
    // Find all audio files in the ZIP
    const audioFilesPromises = [];
    let audioCount = 0;
    
    zip.forEach((relativePath, file) => {
        if (relativePath.endsWith('.wav') || relativePath.endsWith('.mp3') || relativePath.endsWith('.m4a')) {
            audioCount++;
            audioFilesPromises.push(
                file.async('blob').then(blob => {
                    const url = URL.createObjectURL(blob);
                    audioFiles[relativePath] = url;
                    return { path: relativePath, url };
                }).catch(e => {
                    debugLog(`Error loading audio file ${relativePath}: ${e.message}`);
                })
            );
        }
    });
    
    debugLog(`Found ${audioCount} audio files`);
    await Promise.all(audioFilesPromises);
}

async function extractImageFiles(zip) {
    // Find all image files in the ZIP
    const imageFilesPromises = [];
    let imageCount = 0;
    
    zip.forEach((relativePath, file) => {
        if (relativePath.endsWith('.png') || relativePath.endsWith('.jpg') || 
            relativePath.endsWith('.jpeg') || relativePath.endsWith('.gif') || 
            relativePath.endsWith('.webp') || relativePath.endsWith('.bmp')) {
            imageCount++;
            imageFilesPromises.push(
                file.async('blob').then(blob => {
                    const url = URL.createObjectURL(blob);
                    imageFiles[relativePath] = url;
                    return { path: relativePath, url };
                }).catch(e => {
                    debugLog(`Error loading image file ${relativePath}: ${e.message}`);
                })
            );
        }
    });
    
    debugLog(`Found ${imageCount} image files`);
    await Promise.all(imageFilesPromises);
}

function displayConversations() {
    conversationsList.innerHTML = '';
    
    if (conversationsData.length === 0) {
        conversationsList.innerHTML = '<div style="padding: 16px; color: var(--text-secondary); text-align: center;">No conversations found</div>';
        return;
    }
    
    conversationsData.forEach(conversation => {
        const conversationItem = document.createElement('div');
        conversationItem.className = 'conversation-item';
        conversationItem.dataset.id = conversation.id;
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-message conversation-icon';
        
        const title = document.createElement('div');
        title.className = 'conversation-title';
        title.textContent = conversation.title || 'Untitled Conversation';
        
        conversationItem.appendChild(icon);
        conversationItem.appendChild(title);
        
        conversationItem.addEventListener('click', () => {
            loadConversation(conversation.id);
            
            // Update active state
            document.querySelectorAll('.conversation-item').forEach(item => {
                item.classList.remove('active');
            });
            conversationItem.classList.add('active');
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
        
        conversationsList.appendChild(conversationItem);
    });
}

function filterConversations() {
    const searchTerm = searchInput.value.toLowerCase();
    
    document.querySelectorAll('.conversation-item').forEach(item => {
        const title = item.querySelector('.conversation-title').textContent.toLowerCase();
        if (title.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function loadConversation(conversationId) {
    const conversation = conversationsData.find(c => c.id === conversationId);
    if (!conversation) return;
    
    currentConversation = conversation;
    chatTitle.textContent = conversation.title || 'Untitled Conversation';
    
    // Clear previous messages
    messagesContainer.innerHTML = '';
    
    // Get messages from conversation
    const messages = getConversationMessages(conversation);
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = '<div class="empty-state"><i class="fas fa-comments empty-icon"></i><h3 class="empty-title">No Messages</h3><p class="empty-description">This conversation doesn\'t contain any messages.</p></div>';
        return;
    }
    
    // Display messages
    messages.forEach(message => {
        displayMessage(message);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getConversationMessages(conversation) {
    const messages = [];
    let currentNode = conversation.current_node;
    
    while (currentNode) {
        const node = conversation.mapping[currentNode];
        
        if (
            node.message &&
            node.message.content &&
            node.message.content.parts &&
            node.message.content.parts.length > 0 &&
            (node.message.author.role !== "system" || node.message.metadata?.is_user_system_message)
        ) {
            let author = node.message.author.role;
            
            if (author === "assistant" || author === "tool") {
                author = "ChatGPT";
            } else if (author === "system" && node.message.metadata?.is_user_system_message) {
                author = "Custom user info";
            }
            
            if (node.message.content.content_type === "text" || node.message.content.content_type === "multimodal_text") {
                const parts = [];
                
                for (const part of node.message.content.parts) {
                    if (typeof part === "string" && part.length > 0) {
                        parts.push({ type: "text", content: part });
                    } else if (part.content_type === "audio_transcription") {
                        parts.push({ type: "transcript", content: part.text });
                    } else if (part.content_type === "audio_asset_pointer" || part.content_type === "image_asset_pointer" || part.content_type === "video_container_asset_pointer") {
                        parts.push({ type: "asset", asset: part });
                    } else if (part.content_type === "real_time_user_audio_video_asset_pointer") {
                        if (part.audio_asset_pointer) {
                            parts.push({ type: "asset", asset: part.audio_asset_pointer });
                        }
                        if (part.video_container_asset_pointer) {
                            parts.push({ type: "asset", asset: part.video_container_asset_pointer });
                        }
                        for (const frameAsset of part.frames_asset_pointers || []) {
                            parts.push({ type: "asset", asset: frameAsset });
                        }
                    }
                }
                
                if (parts.length > 0) {
                    messages.push({ author, parts, timestamp: node.message.create_time });
                }
            }
        }
        
        currentNode = node.parent;
    }
    
    return messages.reverse();
}

function renderMarkdown(text) {
    // Use marked to parse markdown to HTML
    const html = marked.parse(text);
    return html;
}

function findImageFile(assetPointer) {
    // First, try to find the image in the assets mapping
    const assetPath = assetsMapping[assetPointer];
    if (assetPath && imageFiles[assetPath]) {
        return imageFiles[assetPath];
    }
    
    // If not found in assets mapping, try to find it directly in the image files
    // by looking for a filename that contains the asset pointer
    for (const [path, url] of Object.entries(imageFiles)) {
        if (path.includes(assetPointer)) {
            debugLog(`Found image for asset pointer ${assetPointer} at path ${path}`);
            return url;
        }
    }
    
    // If still not found, try to extract the UUID from the asset pointer and match it
    // Asset pointers are typically in the format "file-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    const uuidMatch = assetPointer.match(/file-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/);
    if (uuidMatch) {
        const uuid = uuidMatch[1];
        for (const [path, url] of Object.entries(imageFiles)) {
            if (path.includes(uuid)) {
                debugLog(`Found image for asset pointer ${assetPointer} using UUID ${uuid} at path ${path}`);
                return url;
            }
        }
    }
    
    // If still not found, try a simpler substring match
    const simpleId = assetPointer.replace('file-', '').replace(/[-_]/g, '').substring(0, 8);
    for (const [path, url] of Object.entries(imageFiles)) {
        const simplePath = path.replace(/[-_]/g, '').replace(/\.[^/.]+$/, "");
        if (simplePath.includes(simpleId)) {
            debugLog(`Found image for asset pointer ${assetPointer} using simple ID match at path ${path}`);
            return url;
        }
    }
    
    return null;
}

function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    
    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${message.author === 'ChatGPT' ? 'assistant-avatar' : 'user-avatar'}`;
    avatar.innerHTML = message.author === 'ChatGPT' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const author = document.createElement('div');
    author.className = 'message-author';
    author.textContent = message.author;
    
    const text = document.createElement('div');
    text.className = 'message-text markdown-content';
    
    // Process message parts
    message.parts.forEach(part => {
        if (part.type === 'text') {
            // Render markdown for text content
            const markdownHtml = renderMarkdown(part.content);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = markdownHtml;
            
            // Copy all child nodes to preserve formatting
            while (tempDiv.firstChild) {
                text.appendChild(tempDiv.firstChild);
            }
        } else if (part.type === 'transcript') {
            text.innerHTML += `<div style="margin-top: 8px; padding: 8px; background-color: rgba(16, 163, 127, 0.1); border-radius: 4px;">[Audio Transcript]: ${part.content}</div>`;
        } else if (part.type === 'asset') {
            const assetPointer = part.asset.asset_pointer;
            
            // Try to find the image file using our enhanced search
            const imageUrl = findImageFile(assetPointer);
            
            if (imageUrl) {
                // Check if it's an image file
                const imgElement = document.createElement('img');
                imgElement.className = 'message-image';
                imgElement.src = imageUrl;
                imgElement.alt = 'Image from conversation';
                
                // Add click event to open image in modal
                imgElement.addEventListener('click', () => {
                    imageModalContent.src = imageUrl;
                    imageModal.style.display = 'flex';
                });
                
                text.appendChild(imgElement);
            } 
            // Check if it's an audio file
            else if (audioFiles[assetPointer]) {
                const audioElement = document.createElement('audio');
                audioElement.className = 'message-audio';
                audioElement.controls = true;
                audioElement.src = audioFiles[assetPointer];
                text.appendChild(audioElement);
            } 
            // If we can't find the file
            else {
                debugLog(`Could not find file for asset pointer: ${assetPointer}`);
                text.innerHTML += `<div style="margin-top: 8px; color: var(--text-secondary);">[File: ${assetPointer}]</div>`;
            }
        }
    });
    
    content.appendChild(author);
    content.appendChild(text);
    
    messageElement.appendChild(avatar);
    messageElement.appendChild(content);
    
    messagesContainer.appendChild(messageElement);
}

function closeImageModal() {
    imageModal.style.display = 'none';
    imageModalContent.src = '';
}

function toggleSidebar() {
    sidebar.classList.toggle('open');
}

function refreshCurrentChat() {
    if (currentConversation) {
        loadConversation(currentConversation.id);
    }
}

function downloadCurrentChat() {
    if (!currentConversation) return;
    
    // Create a simple text representation of the conversation
    let textContent = `Title: ${currentConversation.title}\n\n`;
    
    const messages = getConversationMessages(currentConversation);
    messages.forEach(message => {
        textContent += `${message.author}:\n`;
        message.parts.forEach(part => {
            if (part.type === 'text') {
                textContent += `${part.content}\n\n`;
            } else if (part.type === 'transcript') {
                textContent += `[Audio Transcript]: ${part.content}\n\n`;
            } else if (part.type === 'asset') {
                const assetPointer = part.asset.asset_pointer;
                const assetPath = assetsMapping[assetPointer];
                textContent += `[File: ${assetPath || assetPointer}]\n\n`;
            }
        });
    });
    
    // Create and download the file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentConversation.title || 'Untitled Conversation'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showError(title, message) {
    errorTitle.textContent = title;
    errorDescription.textContent = message;
    
    // Hide solutions and repair sections for general errors
    errorSolutions.style.display = 'none';
    repairSection.style.display = 'none';
    
    // Create a more detailed error message
    let errorDetailsText = `Error: ${message}\n\n`;
    errorDetailsText += `File: ${zipFile ? zipFile.name : 'Unknown'}\n`;
    errorDetailsText += `Size: ${zipFile ? formatFileSize(zipFile.size) : 'Unknown'}\n`;
    errorDetailsText += `Timestamp: ${new Date().toISOString()}\n\n`;
    
    // Add browser information
    errorDetailsText += `Browser: ${navigator.userAgent}\n\n`;
    
    // Add stack trace if available
    const error = new Error();
    if (error.stack) {
        errorDetailsText += `Stack Trace:\n${error.stack}`;
    }
    
    errorDetails.textContent = errorDetailsText;
    errorContainer.style.display = 'flex';
    
    // Also log to debug panel if enabled
    debugLog(`Error: ${message}`);
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && 
        sidebar.classList.contains('open') && 
        !sidebar.contains(e.target) && 
        !menuToggle.contains(e.target)) {
        sidebar.classList.remove('open');
    }
});

// Initialize the app when the page loads
window.addEventListener('load', initApp);