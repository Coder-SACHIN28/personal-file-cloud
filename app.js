// Personal Cloud Storage Application
class CloudStorageApp {
    constructor() {
        this.files = [];
        this.currentView = 'grid';
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.selectedFile = null;
        this.storageStats = {
            totalUsed: "8.8 MB",
            totalAvailable: "15 GB",
            usedPercentage: 0.058,
            fileTypeBreakdown: {
                images: { count: 1, size: "1.8 MB" },
                documents: { count: 1, size: "2.3 MB" },
                text: { count: 1, size: "0.5 KB" },
                audio: { count: 1, size: "4.2 MB" },
                others: { count: 0, size: "0 MB" }
            }
        };
        this.syncStatus = {
            isOnline: true,
            lastSync: new Date('2025-09-07T16:18:00Z'),
            nextSync: 'auto',
            devicesConnected: ['Laptop', 'Phone']
        };
        this.settings = {
            maxFileSize: "100 MB",
            autoSync: true,
            compressionEnabled: true,
            notificationsEnabled: true
        };

        this.init();
    }

    init() {
        this.loadSampleData();
        this.bindEvents();
        this.updateUI();
        this.initChart();
        this.updateSyncStatus();
    }

    loadSampleData() {
        const sampleFiles = [
            {
                id: "1",
                name: "project_presentation.pdf",
                size: "2.3 MB",
                type: "pdf",
                uploadDate: new Date('2025-09-07T10:30:00Z'),
                isShared: false,
                preview: null
            },
            {
                id: "2",
                name: "vacation_photo.jpg",
                size: "1.8 MB",
                type: "image",
                uploadDate: new Date('2025-09-06T15:45:00Z'),
                isShared: true,
                preview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23e0e0e0'/%3E%3Ctext x='50' y='55' text-anchor='middle' font-family='Arial' font-size='12' fill='%23666'%3EImage%3C/text%3E%3C/svg%3E"
            },
            {
                id: "3",
                name: "notes.txt",
                size: "0.5 KB",
                type: "text",
                uploadDate: new Date('2025-09-05T09:20:00Z'),
                isShared: false,
                preview: "This is a sample text file with notes and important information. It contains multiple lines of text that can be previewed directly in the application."
            },
            {
                id: "4",
                name: "music_track.mp3",
                size: "4.2 MB",
                type: "audio",
                uploadDate: new Date('2025-09-04T18:15:00Z'),
                isShared: false,
                preview: null
            }
        ];

        this.files = sampleFiles;
    }

    bindEvents() {
        // Upload functionality
        const uploadBtn = document.getElementById('uploadBtn');
        const uploadArea = document.getElementById('uploadArea');
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');

        uploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            uploadArea.classList.toggle('hidden');
        });

        uploadZone.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
        });

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleFileUpload(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Search and filter
        const searchInput = document.getElementById('searchInput');
        const filterSelect = document.getElementById('filterSelect');

        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.filterFiles();
        });

        filterSelect.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.filterFiles();
        });

        // View toggle
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentView = btn.dataset.view;
                this.updateFilesView();
            });
        });

        // Modal events
        this.bindModalEvents();

        // Settings
        const settingsBtn = document.getElementById('settingsBtn');
        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.openSettingsModal();
        });
    }

    bindModalEvents() {
        // Preview modal
        const previewModal = document.getElementById('previewModal');
        const modalBackdrop = document.getElementById('modalBackdrop');
        const closeModal = document.getElementById('closeModal');

        closeModal.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('previewModal');
        });
        
        modalBackdrop.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('previewModal');
        });

        // Settings modal
        const settingsModal = document.getElementById('settingsModal');
        const settingsBackdrop = document.getElementById('settingsBackdrop');
        const closeSettings = document.getElementById('closeSettings');
        const cancelSettings = document.getElementById('cancelSettings');
        const saveSettings = document.getElementById('saveSettings');

        closeSettings.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('settingsModal');
        });
        
        settingsBackdrop.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('settingsModal');
        });
        
        cancelSettings.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('settingsModal');
        });
        
        saveSettings.addEventListener('click', (e) => {
            e.preventDefault();
            this.saveSettings();
        });

        // Delete modal
        const deleteModal = document.getElementById('deleteModal');
        const deleteBackdrop = document.getElementById('deleteBackdrop');
        const closeDelete = document.getElementById('closeDelete');
        const cancelDelete = document.getElementById('cancelDelete');
        const confirmDelete = document.getElementById('confirmDelete');

        closeDelete.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('deleteModal');
        });
        
        deleteBackdrop.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('deleteModal');
        });
        
        cancelDelete.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('deleteModal');
        });
        
        confirmDelete.addEventListener('click', (e) => {
            e.preventDefault();
            this.confirmDeleteFile();
        });

        // Modal file actions
        const downloadBtn = document.getElementById('downloadBtn');
        const shareBtn = document.getElementById('shareBtn');

        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.downloadFile(this.selectedFile);
        });
        
        shareBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.shareFile(this.selectedFile);
        });
    }

    handleFileUpload(files) {
        if (!files || files.length === 0) return;
        
        const fileArray = Array.from(files);
        const uploadProgress = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        uploadProgress.classList.remove('hidden');

        fileArray.forEach((file, index) => {
            // Validate file
            if (!this.validateFile(file)) {
                return;
            }

            // Simulate upload progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(progressInterval);
                    
                    // Add file to collection
                    this.addFile(file);
                    
                    if (index === fileArray.length - 1) {
                        setTimeout(() => {
                            uploadProgress.classList.add('hidden');
                            progressFill.style.width = '0%';
                            document.getElementById('uploadArea').classList.add('hidden');
                        }, 1000);
                    }
                }
                
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `Uploading ${file.name}... ${Math.round(progress)}%`;
            }, 150);
        });
    }

    validateFile(file) {
        const maxSize = parseInt(this.settings.maxFileSize) * 1024 * 1024; // Convert MB to bytes
        
        if (file.size > maxSize) {
            alert(`File ${file.name} is too large. Maximum size is ${this.settings.maxFileSize}.`);
            return false;
        }

        return true;
    }

    addFile(file) {
        const newFile = {
            id: Date.now().toString(),
            name: file.name,
            size: this.formatFileSize(file.size),
            type: this.getFileType(file.name),
            uploadDate: new Date(),
            isShared: false,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        };

        this.files.unshift(newFile);
        this.updateUI();
        this.updateStorageStats();
        this.showNotification(`${file.name} uploaded successfully!`);
    }

    getFileType(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const typeMap = {
            'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 'webp': 'image',
            'pdf': 'pdf', 'doc': 'document', 'docx': 'document', 'ppt': 'document', 'pptx': 'document',
            'txt': 'text', 'md': 'text', 'csv': 'text',
            'mp3': 'audio', 'wav': 'audio', 'flac': 'audio',
            'mp4': 'video', 'avi': 'video', 'mov': 'video'
        };
        return typeMap[extension] || 'other';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    filterFiles() {
        const filteredFiles = this.files.filter(file => {
            const matchesSearch = file.name.toLowerCase().includes(this.searchQuery);
            const matchesFilter = this.currentFilter === 'all' || file.type === this.currentFilter;
            return matchesSearch && matchesFilter;
        });

        this.renderFiles(filteredFiles);
    }

    updateUI() {
        this.filterFiles();
        this.updateStorageDisplay();
    }

    updateFilesView() {
        const filesGrid = document.getElementById('filesGrid');
        if (this.currentView === 'list') {
            filesGrid.classList.add('list-view');
        } else {
            filesGrid.classList.remove('list-view');
        }
    }

    renderFiles(files) {
        const filesGrid = document.getElementById('filesGrid');
        
        if (files.length === 0) {
            filesGrid.innerHTML = `
                <div class="no-files">
                    <div class="no-files-icon">📁</div>
                    <h3>No files found</h3>
                    <p>Upload some files or adjust your search filters</p>
                </div>
            `;
            return;
        }

        filesGrid.innerHTML = files.map(file => `
            <div class="file-card" data-file-id="${file.id}">
                <div class="file-preview">
                    ${file.preview && file.type === 'image' ? 
                        `<img src="${file.preview}" alt="${file.name}">` : 
                        `<div class="file-icon">${this.getFileIcon(file.type)}</div>`
                    }
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">
                        <span>${file.size}</span>
                        <span>${this.formatDate(file.uploadDate)}</span>
                        ${file.isShared ? '<span class="shared-indicator">🔗 Shared</span>' : ''}
                    </div>
                    <div class="file-actions">
                        <button class="file-action-btn" onclick="app.previewFile('${file.id}')">Preview</button>
                        <button class="file-action-btn" onclick="app.downloadFile('${file.id}')">Download</button>
                        <button class="file-action-btn" onclick="app.toggleShare('${file.id}')">${file.isShared ? 'Unshare' : 'Share'}</button>
                        <button class="file-action-btn danger" onclick="app.deleteFile('${file.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');

        this.updateFilesView();
    }

    getFileIcon(type) {
        const icons = {
            'image': '🖼️',
            'pdf': '📄',
            'document': '📝',
            'text': '📋',
            'audio': '🎵',
            'video': '🎬',
            'other': '📎'
        };
        return icons[type] || icons['other'];
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(date));
    }

    previewFile(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file) return;

        this.selectedFile = file;
        const previewModal = document.getElementById('previewModal');
        const previewTitle = document.getElementById('previewTitle');
        const previewContent = document.getElementById('previewContent');

        previewTitle.textContent = file.name;

        if (file.type === 'image' && file.preview) {
            previewContent.innerHTML = `<img src="${file.preview}" alt="${file.name}" class="preview-image">`;
        } else if (file.type === 'text' && file.preview) {
            previewContent.innerHTML = `<pre class="preview-text">${file.preview}</pre>`;
        } else {
            previewContent.innerHTML = `
                <div class="preview-content">
                    <div class="file-icon" style="font-size: 64px; margin-bottom: 16px;">${this.getFileIcon(file.type)}</div>
                    <p>Preview not available for this file type.</p>
                    <p><strong>File:</strong> ${file.name}</p>
                    <p><strong>Size:</strong> ${file.size}</p>
                    <p><strong>Type:</strong> ${file.type.toUpperCase()}</p>
                </div>
            `;
        }

        previewModal.classList.remove('hidden');
    }

    downloadFile(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file) return;

        // Create a blob with sample content for demonstration
        let blob;
        let content;
        
        if (file.type === 'text') {
            content = file.preview || 'Sample text content';
            blob = new Blob([content], { type: 'text/plain' });
        } else {
            content = `Sample content for ${file.name}`;
            blob = new Blob([content], { type: 'application/octet-stream' });
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = file.name;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification(`Downloading ${file.name}...`);
    }

    toggleShare(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file) return;

        file.isShared = !file.isShared;
        
        if (file.isShared) {
            const shareLink = `https://mycloud.example.com/share/${file.id}`;
            navigator.clipboard.writeText(shareLink).then(() => {
                this.showNotification(`Share link copied to clipboard!`);
            }).catch(() => {
                this.showNotification(`File shared! Link: ${shareLink}`);
            });
        } else {
            this.showNotification(`File unshared successfully.`);
        }

        this.updateUI();
    }

    shareFile(file) {
        if (!file.isShared) {
            file.isShared = true;
            this.updateUI();
        }
        
        const shareLink = `https://mycloud.example.com/share/${file.id}`;
        navigator.clipboard.writeText(shareLink).then(() => {
            this.showNotification(`Share link copied to clipboard!`);
        }).catch(() => {
            this.showNotification(`Share link: ${shareLink}`);
        });
        
        this.closeModal('previewModal');
    }

    deleteFile(fileId) {
        this.selectedFile = this.files.find(f => f.id === fileId);
        document.getElementById('deleteModal').classList.remove('hidden');
    }

    confirmDeleteFile() {
        if (!this.selectedFile) return;

        this.files = this.files.filter(f => f.id !== this.selectedFile.id);
        this.updateUI();
        this.updateStorageStats();
        this.closeModal('deleteModal');
        this.showNotification(`${this.selectedFile.name} deleted successfully.`);
        this.selectedFile = null;
    }

    updateStorageDisplay() {
        document.getElementById('storageText').textContent = `${this.storageStats.totalUsed} / ${this.storageStats.totalAvailable} used`;
        document.getElementById('storageProgress').style.width = `${this.storageStats.usedPercentage * 100}%`;
        document.getElementById('totalUsed').textContent = this.storageStats.totalUsed;
        document.getElementById('totalFiles').textContent = this.files.length.toString();
        document.getElementById('totalAvailable').textContent = this.storageStats.totalAvailable;
    }

    updateStorageStats() {
        // Recalculate storage stats based on current files
        let totalBytes = 0;
        const typeBreakdown = {
            images: { count: 0, size: 0 },
            documents: { count: 0, size: 0 },
            text: { count: 0, size: 0 },
            audio: { count: 0, size: 0 },
            others: { count: 0, size: 0 }
        };

        this.files.forEach(file => {
            // Convert size string to bytes (simplified)
            const sizeValue = parseFloat(file.size);
            const sizeUnit = file.size.split(' ')[1];
            let bytes = sizeValue;
            
            if (sizeUnit === 'KB') bytes *= 1024;
            else if (sizeUnit === 'MB') bytes *= 1024 * 1024;
            else if (sizeUnit === 'GB') bytes *= 1024 * 1024 * 1024;
            
            totalBytes += bytes;

            // Update type breakdown
            const typeKey = file.type === 'image' ? 'images' : 
                           file.type === 'pdf' || file.type === 'document' ? 'documents' :
                           file.type === 'text' ? 'text' :
                           file.type === 'audio' ? 'audio' : 'others';
            
            typeBreakdown[typeKey].count++;
            typeBreakdown[typeKey].size += bytes;
        });

        this.storageStats.totalUsed = this.formatFileSize(totalBytes);
        this.storageStats.usedPercentage = totalBytes / (15 * 1024 * 1024 * 1024); // 15GB total
        
        this.updateChart();
    }

    initChart() {
        const ctx = document.getElementById('storageChart').getContext('2d');
        const data = this.storageStats.fileTypeBreakdown;
        
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Images', 'Documents', 'Text Files', 'Audio', 'Others'],
                datasets: [{
                    data: [
                        data.images.count,
                        data.documents.count,
                        data.text.count,
                        data.audio.count,
                        data.others.count
                    ],
                    backgroundColor: [
                        '#1FB8CD',
                        '#FFC185', 
                        '#B4413C',
                        '#ECEBD5',
                        '#5D878F'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Files by Type'
                    }
                }
            }
        });
    }

    updateChart() {
        if (!this.chart) return;

        const typeCount = { images: 0, documents: 0, text: 0, audio: 0, others: 0 };
        
        this.files.forEach(file => {
            const typeKey = file.type === 'image' ? 'images' : 
                           file.type === 'pdf' || file.type === 'document' ? 'documents' :
                           file.type === 'text' ? 'text' :
                           file.type === 'audio' ? 'audio' : 'others';
            typeCount[typeKey]++;
        });

        this.chart.data.datasets[0].data = [
            typeCount.images,
            typeCount.documents,
            typeCount.text,
            typeCount.audio,
            typeCount.others
        ];
        
        this.chart.update();
    }

    updateSyncStatus() {
        const syncIndicator = document.getElementById('syncIndicator');
        const syncText = document.getElementById('syncText');
        
        if (this.syncStatus.isOnline) {
            syncIndicator.className = 'sync-indicator online';
            const timeDiff = new Date() - this.syncStatus.lastSync;
            const minutes = Math.floor(timeDiff / 60000);
            syncText.textContent = `Synced ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else {
            syncIndicator.className = 'sync-indicator offline';
            syncText.textContent = 'Offline';
        }

        // Update sync status every minute
        setTimeout(() => this.updateSyncStatus(), 60000);
    }

    openSettingsModal() {
        document.getElementById('maxFileSize').value = parseInt(this.settings.maxFileSize);
        document.getElementById('autoSync').checked = this.settings.autoSync;
        document.getElementById('compression').checked = this.settings.compressionEnabled;
        document.getElementById('notifications').checked = this.settings.notificationsEnabled;
        
        document.getElementById('settingsModal').classList.remove('hidden');
    }

    saveSettings() {
        this.settings.maxFileSize = document.getElementById('maxFileSize').value + ' MB';
        this.settings.autoSync = document.getElementById('autoSync').checked;
        this.settings.compressionEnabled = document.getElementById('compression').checked;
        this.settings.notificationsEnabled = document.getElementById('notifications').checked;
        
        this.closeModal('settingsModal');
        this.showNotification('Settings saved successfully!');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    showNotification(message) {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--color-success);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.style.opacity = '1', 100);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CloudStorageApp();
});