// Study Guide App
class StudyGuideApp {
    constructor() {
        this.sections = [
            { id: 'section-1', file: '01_Azure_Identities_and_Governance.md', title: 'Azure Identities and Governance' },
            { id: 'section-2', file: '02_Implement_and_Manage_Storage.md', title: 'Implement and Manage Storage' },
            { id: 'section-3', file: '03_Deploy_and_Manage_Compute_Resources.md', title: 'Deploy and Manage Compute Resources' },
            { id: 'section-4', file: '04_Implement_and_Manage_Virtual_Networking.md', title: 'Implement and Manage Virtual Networking' },
            { id: 'section-5', file: '05_Monitor_and_Maintain_Azure_Resources.md', title: 'Monitor and Maintain Azure Resources' }
        ];

        this.currentSection = null;
        this.currentTopic = null;
        this.sectionData = {};
        this.progress = this.loadProgress();
        this.notes = this.loadNotes();

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderSidebar();
        this.updateProgressDashboard();
    }

    setupEventListeners() {
        // Notes panel toggle
        document.getElementById('toggle-notes').addEventListener('click', () => {
            document.getElementById('notes-panel').classList.toggle('open');
        });

        document.getElementById('close-notes').addEventListener('click', () => {
            document.getElementById('notes-panel').classList.remove('open');
        });

        // Save notes
        document.getElementById('save-notes').addEventListener('click', () => {
            this.saveCurrentNotes();
        });

        // Topic completion checkbox
        document.getElementById('topic-complete-checkbox').addEventListener('change', (e) => {
            if (this.currentSection && this.currentTopic) {
                this.toggleTopicCompletion(this.currentSection, this.currentTopic, e.target.checked);
            }
        });
    }

    // Local Storage Management
    loadProgress() {
        const saved = localStorage.getItem('az104-progress');
        return saved ? JSON.parse(saved) : {};
    }

    saveProgress() {
        localStorage.setItem('az104-progress', JSON.stringify(this.progress));
        this.updateProgressDashboard();
    }

    loadNotes() {
        const saved = localStorage.getItem('az104-notes');
        return saved ? JSON.parse(saved) : {};
    }

    saveNotes() {
        localStorage.setItem('az104-notes', JSON.stringify(this.notes));
    }

    // Render Sidebar Navigation
    async renderSidebar() {
        const nav = document.getElementById('section-nav');

        for (let i = 0; i < this.sections.length; i++) {
            const section = this.sections[i];

            // Load markdown content
            try {
                const content = await this.loadMarkdownFile(section.file);
                const topics = this.extractTopics(content);
                this.sectionData[section.id] = { content, topics };

                // Create section element
                const sectionEl = this.createSectionElement(section, topics, i + 1);
                nav.appendChild(sectionEl);
            } catch (error) {
                console.error(`Error loading ${section.file}:`, error);
            }
        }

        this.updateProgressDashboard();
    }

    createSectionElement(section, topics, number) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'section-item';

        const completed = this.getSectionProgress(section.id, topics);
        const isCompleted = completed.completed === completed.total && completed.total > 0;

        // Section header
        const header = document.createElement('div');
        header.className = `section-header ${isCompleted ? 'completed' : ''}`;
        header.innerHTML = `
            <div class="section-title">
                <span class="section-number">${number}</span>
                <span>${section.title}</span>
            </div>
            <div>
                <span class="section-progress">${completed.completed}/${completed.total}</span>
                <span class="expand-icon">›</span>
            </div>
        `;

        // Topic list
        const topicList = document.createElement('div');
        topicList.className = 'topic-list';

        topics.forEach(topic => {
            const topicEl = this.createTopicElement(section.id, topic);
            topicList.appendChild(topicEl);
        });

        // Toggle expansion
        header.addEventListener('click', () => {
            header.classList.toggle('expanded');
            topicList.classList.toggle('expanded');
        });

        sectionDiv.appendChild(header);
        sectionDiv.appendChild(topicList);

        return sectionDiv;
    }

    createTopicElement(sectionId, topic) {
        const topicDiv = document.createElement('div');
        const topicKey = this.getTopicKey(sectionId, topic.title);
        const isCompleted = this.progress[topicKey] || false;

        topicDiv.className = `topic-item ${isCompleted ? 'completed' : ''}`;
        topicDiv.innerHTML = `
            <div class="topic-checkbox"></div>
            <span>${topic.title}</span>
        `;

        topicDiv.addEventListener('click', (e) => {
            this.loadTopic(sectionId, topic, e);
        });

        return topicDiv;
    }

    // Load and Parse Markdown
    async loadMarkdownFile(filename) {
        const response = await fetch(filename);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}`);
        }
        return await response.text();
    }

    extractTopics(markdown) {
        const topics = [];
        const lines = markdown.split('\n');
        let currentH2 = null;
        let currentH3 = null;
        let content = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith('## ') && !line.includes('Overview')) {
                // Save previous topic
                if (currentH2) {
                    topics.push({
                        title: currentH2,
                        subtitle: currentH3,
                        content: content.join('\n')
                    });
                }

                // Start new H2 topic
                currentH2 = line.replace('## ', '').trim();
                currentH3 = null;
                content = [line];
            } else if (line.startsWith('### ')) {
                // H3 creates a subtopic
                if (currentH2 && currentH3) {
                    // Save previous subtopic
                    topics.push({
                        title: currentH2,
                        subtitle: currentH3,
                        content: content.join('\n')
                    });
                    content = [];
                }

                currentH3 = line.replace('### ', '').trim();
                content.push(line);
            } else {
                content.push(line);
            }
        }

        // Save last topic
        if (currentH2) {
            topics.push({
                title: currentH2,
                subtitle: currentH3,
                content: content.join('\n')
            });
        }

        return topics;
    }

    // Load Topic Content
    loadTopic(sectionId, topic, event) {
        this.currentSection = sectionId;
        this.currentTopic = topic.title;

        const section = this.sections.find(s => s.id === sectionId);
        const topicKey = this.getTopicKey(sectionId, topic.title);

        // Update breadcrumb
        document.getElementById('breadcrumb').textContent =
            `${section.title} > ${topic.title}`;

        // Render content
        const contentEl = document.getElementById('study-content');
        const html = marked.parse(topic.content);
        contentEl.innerHTML = html;

        // Update active state in sidebar
        document.querySelectorAll('.topic-item').forEach(el => el.classList.remove('active'));
        if (event) {
            event.target.closest('.topic-item').classList.add('active');
        }

        // Show topic footer
        const footer = document.getElementById('topic-footer');
        footer.style.display = 'flex';

        // Update checkbox
        const checkbox = document.getElementById('topic-complete-checkbox');
        checkbox.checked = this.progress[topicKey] || false;

        // Load notes
        this.loadTopicNotes(topicKey);

        // Scroll to top
        contentEl.scrollTop = 0;
    }

    // Progress Tracking
    toggleTopicCompletion(sectionId, topicTitle, completed) {
        const topicKey = this.getTopicKey(sectionId, topicTitle);
        this.progress[topicKey] = completed;
        this.saveProgress();

        // Update sidebar
        this.updateSidebarProgress();
    }

    getSectionProgress(sectionId, topics) {
        let completed = 0;
        topics.forEach(topic => {
            const topicKey = this.getTopicKey(sectionId, topic.title);
            if (this.progress[topicKey]) {
                completed++;
            }
        });
        return { completed, total: topics.length };
    }

    updateSidebarProgress() {
        // Update topic checkmarks and section progress counts
        Object.keys(this.sectionData).forEach((sectionId, index) => {
            const topics = this.sectionData[sectionId].topics;
            const progress = this.getSectionProgress(sectionId, topics);

            // Update section progress text
            const sectionHeaders = document.querySelectorAll('.section-header');
            const sectionHeader = sectionHeaders[index];
            if (sectionHeader) {
                const progressSpan = sectionHeader.querySelector('.section-progress');
                if (progressSpan) {
                    progressSpan.textContent = `${progress.completed}/${progress.total}`;
                }

                // Update completed class on section
                if (progress.completed === progress.total && progress.total > 0) {
                    sectionHeader.classList.add('completed');
                } else {
                    sectionHeader.classList.remove('completed');
                }
            }

            // Update topic checkmarks
            topics.forEach(topic => {
                const topicKey = this.getTopicKey(sectionId, topic.title);
                const isCompleted = this.progress[topicKey] || false;

                document.querySelectorAll('.topic-item').forEach(topicEl => {
                    const topicText = topicEl.querySelector('span').textContent;
                    if (topicText === topic.title) {
                        if (isCompleted) {
                            topicEl.classList.add('completed');
                        } else {
                            topicEl.classList.remove('completed');
                        }
                    }
                });
            });
        });
    }

    updateProgressDashboard() {
        let totalTopics = 0;
        let completedTopics = 0;

        Object.keys(this.sectionData).forEach(sectionId => {
            const topics = this.sectionData[sectionId].topics;
            totalTopics += topics.length;

            topics.forEach(topic => {
                const topicKey = this.getTopicKey(sectionId, topic.title);
                if (this.progress[topicKey]) {
                    completedTopics++;
                }
            });
        });

        const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

        // Update circle
        const circle = document.getElementById('progress-circle');
        circle.setAttribute('stroke-dasharray', `${percentage}, 100`);

        // Update text
        document.getElementById('progress-text').textContent = `${percentage}%`;
        document.getElementById('completed-topics').textContent = completedTopics;
        document.getElementById('total-topics').textContent = totalTopics;
    }

    // Notes Management
    loadTopicNotes(topicKey) {
        const notesTextarea = document.getElementById('notes-textarea');
        const notesInfo = document.getElementById('notes-info');

        notesTextarea.value = this.notes[topicKey] || '';
        notesInfo.textContent = `Notes for: ${this.currentTopic}`;
    }

    saveCurrentNotes() {
        if (!this.currentSection || !this.currentTopic) return;

        const topicKey = this.getTopicKey(this.currentSection, this.currentTopic);
        const notesTextarea = document.getElementById('notes-textarea');

        this.notes[topicKey] = notesTextarea.value;
        this.saveNotes();

        // Show feedback
        const btn = document.getElementById('save-notes');
        const originalText = btn.textContent;
        btn.textContent = 'Saved!';
        btn.style.backgroundColor = 'var(--success-color)';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
        }, 2000);
    }

    // Utility
    getTopicKey(sectionId, topicTitle) {
        return `${sectionId}-${topicTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new StudyGuideApp();
});
