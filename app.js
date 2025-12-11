/**
 * Moderation Dashboard - User Model & UI System
 * A comprehensive moderation interface for managing users
 */

// ============================================
// USER MODEL
// ============================================

/**
 * User Model Class
 * Represents a user in the moderation system
 */
class UserModel {
    constructor(data) {
        this.id = data.id || this.generateId();
        this.username = data.username || '';
        this.email = data.email || '';
        this.displayName = data.displayName || data.username || '';
        this.avatar = data.avatar || null;
        this.status = data.status || 'active'; // active, warned, muted, banned
        this.riskLevel = data.riskLevel || 'low'; // low, medium, high
        this.riskScore = data.riskScore || 0; // 0-100
        this.createdAt = data.createdAt || new Date();
        this.lastActive = data.lastActive || new Date();
        this.reports = data.reports || 0;
        this.warnings = data.warnings || 0;
        this.posts = data.posts || 0;
        this.flags = data.flags || [];
        this.notes = data.notes || [];
        this.activityLog = data.activityLog || [];
        this.metadata = data.metadata || {};
    }

    generateId() {
        return 'usr_' + Math.random().toString(36).substr(2, 9);
    }

    getInitials() {
        const name = this.displayName || this.username;
        return name.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    getRiskClass() {
        if (this.riskScore >= 70) return 'high';
        if (this.riskScore >= 40) return 'medium';
        return 'low';
    }

    getStatusClass() {
        return `status-${this.status}`;
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    addActivity(action, details) {
        this.activityLog.unshift({
            id: Date.now(),
            action,
            details,
            timestamp: new Date(),
            moderator: 'Current Moderator'
        });
    }

    toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            displayName: this.displayName,
            status: this.status,
            riskLevel: this.riskLevel,
            riskScore: this.riskScore,
            createdAt: this.createdAt,
            lastActive: this.lastActive,
            reports: this.reports,
            warnings: this.warnings,
            posts: this.posts,
            flags: this.flags,
            notes: this.notes,
            activityLog: this.activityLog,
            metadata: this.metadata
        };
    }
}

// ============================================
// MODERATION SYSTEM
// ============================================

class ModerationSystem {
    constructor() {
        this.users = [];
        this.filteredUsers = [];
        this.selectedUser = null;
        this.init();
    }

    init() {
        this.loadSampleUsers();
        this.renderUsers();
        this.setupEventListeners();
    }

    loadSampleUsers() {
        const sampleData = [
            {
                id: 'usr_1a2b3c4d5',
                username: 'john_doe',
                email: 'john.doe@example.com',
                displayName: 'John Doe',
                status: 'active',
                riskScore: 15,
                createdAt: new Date('2023-06-15'),
                lastActive: new Date(Date.now() - 3600000),
                reports: 0,
                warnings: 0,
                posts: 156,
                activityLog: [
                    { action: 'Account created', details: 'User registered via email', timestamp: new Date('2023-06-15'), type: 'info' }
                ]
            },
            {
                id: 'usr_2b3c4d5e6',
                username: 'jane_smith',
                email: 'jane.smith@example.com',
                displayName: 'Jane Smith',
                status: 'warned',
                riskScore: 55,
                createdAt: new Date('2023-03-20'),
                lastActive: new Date(Date.now() - 7200000),
                reports: 3,
                warnings: 1,
                posts: 289,
                activityLog: [
                    { action: 'Warning issued', details: 'Inappropriate language in comments', timestamp: new Date('2024-01-10'), type: 'warning' },
                    { action: 'Report received', details: 'Reported by another user for spam', timestamp: new Date('2024-01-08'), type: 'warning' }
                ]
            },
            {
                id: 'usr_3c4d5e6f7',
                username: 'mike_wilson',
                email: 'mike.wilson@example.com',
                displayName: 'Mike Wilson',
                status: 'muted',
                riskScore: 45,
                createdAt: new Date('2023-09-01'),
                lastActive: new Date(Date.now() - 86400000),
                reports: 2,
                warnings: 1,
                posts: 78,
                activityLog: [
                    { action: 'Muted', details: 'Temporary mute for 24 hours - repeated violations', timestamp: new Date('2024-02-01'), type: 'info' },
                    { action: 'Warning issued', details: 'Harassment of other users', timestamp: new Date('2024-01-25'), type: 'warning' }
                ]
            },
            {
                id: 'usr_4d5e6f7g8',
                username: 'sarah_jones',
                email: 'sarah.jones@example.com',
                displayName: 'Sarah Jones',
                status: 'banned',
                riskScore: 95,
                createdAt: new Date('2022-11-10'),
                lastActive: new Date('2024-01-15'),
                reports: 12,
                warnings: 3,
                posts: 445,
                activityLog: [
                    { action: 'Banned', details: 'Permanent ban - repeated ToS violations', timestamp: new Date('2024-01-15'), type: 'danger' },
                    { action: 'Warning issued', details: 'Final warning - hate speech', timestamp: new Date('2024-01-10'), type: 'warning' },
                    { action: 'Report received', details: 'Multiple reports for harassment', timestamp: new Date('2024-01-05'), type: 'warning' }
                ]
            },
            {
                id: 'usr_5e6f7g8h9',
                username: 'alex_brown',
                email: 'alex.brown@example.com',
                displayName: 'Alex Brown',
                status: 'active',
                riskScore: 25,
                createdAt: new Date('2024-01-01'),
                lastActive: new Date(Date.now() - 1800000),
                reports: 0,
                warnings: 0,
                posts: 34,
                activityLog: [
                    { action: 'Account created', details: 'User registered via Google OAuth', timestamp: new Date('2024-01-01'), type: 'info' }
                ]
            },
            {
                id: 'usr_6f7g8h9i0',
                username: 'emily_davis',
                email: 'emily.davis@example.com',
                displayName: 'Emily Davis',
                status: 'active',
                riskScore: 8,
                createdAt: new Date('2022-05-20'),
                lastActive: new Date(Date.now() - 300000),
                reports: 0,
                warnings: 0,
                posts: 892,
                activityLog: [
                    { action: 'Verified', details: 'Email verification completed', timestamp: new Date('2022-05-21'), type: 'success' },
                    { action: 'Account created', details: 'User registered via email', timestamp: new Date('2022-05-20'), type: 'info' }
                ]
            },
            {
                id: 'usr_7g8h9i0j1',
                username: 'chris_taylor',
                email: 'chris.taylor@example.com',
                displayName: 'Chris Taylor',
                status: 'warned',
                riskScore: 68,
                createdAt: new Date('2023-07-12'),
                lastActive: new Date(Date.now() - 43200000),
                reports: 5,
                warnings: 2,
                posts: 167,
                activityLog: [
                    { action: 'Warning issued', details: 'Sharing misleading information', timestamp: new Date('2024-01-28'), type: 'warning' },
                    { action: 'Report reviewed', details: 'Content flagged for review - no action taken', timestamp: new Date('2024-01-20'), type: 'info' }
                ]
            },
            {
                id: 'usr_8h9i0j1k2',
                username: 'lisa_anderson',
                email: 'lisa.anderson@example.com',
                displayName: 'Lisa Anderson',
                status: 'active',
                riskScore: 12,
                createdAt: new Date('2023-04-05'),
                lastActive: new Date(Date.now() - 600000),
                reports: 0,
                warnings: 0,
                posts: 523,
                activityLog: [
                    { action: 'Badge earned', details: 'Trusted Contributor badge awarded', timestamp: new Date('2023-12-01'), type: 'success' }
                ]
            }
        ];

        this.users = sampleData.map(data => new UserModel(data));
        this.filteredUsers = [...this.users];
    }

    setupEventListeners() {
        // Close modal on overlay click
        document.getElementById('userModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Search on Enter key
        document.getElementById('userSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchUsers();
            }
        });
    }

    renderUsers() {
        const grid = document.getElementById('usersGrid');
        
        if (this.filteredUsers.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">🔍</div>
                    <h3>No users found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredUsers.map(user => this.createUserCard(user)).join('');
    }

    createUserCard(user) {
        const riskClass = user.getRiskClass();
        
        return `
            <div class="user-card" onclick="moderationSystem.openUserModal('${user.id}')">
                <div class="user-card-header">
                    <div class="user-avatar">${user.getInitials()}</div>
                    <div class="user-info">
                        <div class="user-name">${this.escapeHtml(user.displayName)}</div>
                        <div class="user-email">${this.escapeHtml(user.email)}</div>
                        <div class="user-id">${user.id}</div>
                    </div>
                    <span class="status-badge ${user.getStatusClass()}">${user.status}</span>
                </div>
                
                <div class="risk-indicator risk-${riskClass}">
                    <span class="risk-label">Risk</span>
                    <div class="risk-bar">
                        <div class="risk-fill" style="width: ${user.riskScore}%"></div>
                    </div>
                    <span class="risk-value">${user.riskScore}%</span>
                </div>
                
                <div class="user-stats">
                    <div class="stat-item">
                        <div class="stat-value">${user.posts}</div>
                        <div class="stat-label">Posts</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${user.reports}</div>
                        <div class="stat-label">Reports</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${user.warnings}</div>
                        <div class="stat-label">Warnings</div>
                    </div>
                </div>
                
                <div class="user-card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); moderationSystem.viewProfile('${user.id}')">View</button>
                    <button class="btn btn-sm btn-warning" onclick="event.stopPropagation(); moderationSystem.warnUser('${user.id}')">Warn</button>
                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); moderationSystem.banUser('${user.id}')">Ban</button>
                </div>
            </div>
        `;
    }

    openUserModal(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        this.selectedUser = user;
        const modal = document.getElementById('userModal');
        const content = document.getElementById('modalContent');
        
        content.innerHTML = this.createModalContent(user);
        modal.classList.add('active');
    }

    createModalContent(user) {
        const riskClass = user.getRiskClass();
        
        return `
            <div class="modal-user-header">
                <div class="modal-avatar">${user.getInitials()}</div>
                <div class="modal-user-info">
                    <h2>${this.escapeHtml(user.displayName)}</h2>
                    <div class="user-email">${this.escapeHtml(user.email)}</div>
                    <div class="user-id">${user.id}</div>
                    <span class="status-badge ${user.getStatusClass()}" style="margin-top: 0.5rem">${user.status}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>User Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Username</div>
                        <div class="detail-value">@${this.escapeHtml(user.username)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Member Since</div>
                        <div class="detail-value">${user.formatDate(user.createdAt)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Last Active</div>
                        <div class="detail-value">${user.getRelativeTime(user.lastActive)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Total Posts</div>
                        <div class="detail-value">${user.posts}</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Risk Assessment</h3>
                <div class="risk-indicator risk-${riskClass}" style="margin-bottom: 1rem">
                    <span class="risk-label">Score</span>
                    <div class="risk-bar">
                        <div class="risk-fill" style="width: ${user.riskScore}%"></div>
                    </div>
                    <span class="risk-value">${user.riskScore}%</span>
                </div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Reports Received</div>
                        <div class="detail-value">${user.reports}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Warnings Issued</div>
                        <div class="detail-value">${user.warnings}</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Activity Log</h3>
                <div class="activity-log">
                    ${user.activityLog.length > 0 ? user.activityLog.map(activity => `
                        <div class="activity-item">
                            <div class="activity-icon ${activity.type || 'info'}">
                                ${this.getActivityIcon(activity.type || 'info')}
                            </div>
                            <div class="activity-content">
                                <div class="activity-text"><strong>${activity.action}</strong> - ${activity.details}</div>
                                <div class="activity-time">${user.getRelativeTime(activity.timestamp)}</div>
                            </div>
                        </div>
                    `).join('') : '<p style="color: var(--text-muted);">No activity recorded</p>'}
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="moderationSystem.closeModal()">Close</button>
                ${user.status === 'muted' ? 
                    `<button class="btn btn-success" onclick="moderationSystem.unmuteUser('${user.id}')">🔊 Unmute</button>` :
                    `<button class="btn btn-info" onclick="moderationSystem.muteUser('${user.id}')" style="background: var(--info-color)">🔇 Mute</button>`
                }
                <button class="btn btn-warning" onclick="moderationSystem.warnUser('${user.id}')">⚠️ Warn</button>
                ${user.status === 'banned' ? 
                    `<button class="btn btn-success" onclick="moderationSystem.unbanUser('${user.id}')">✓ Unban</button>` :
                    `<button class="btn btn-danger" onclick="moderationSystem.banUser('${user.id}')">🚫 Ban</button>`
                }
            </div>
        `;
    }

    getActivityIcon(type) {
        const icons = {
            warning: '⚠️',
            danger: '🚫',
            success: '✓',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    closeModal() {
        document.getElementById('userModal').classList.remove('active');
        this.selectedUser = null;
    }

    // Moderation Actions
    warnUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        user.status = 'warned';
        user.warnings++;
        user.riskScore = Math.min(100, user.riskScore + 15);
        user.addActivity('Warning issued', 'Manual warning by moderator');
        
        this.showToast(`Warning issued to ${user.displayName}`, 'warning');
        this.refreshUI(userId);
    }

    muteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        user.status = 'muted';
        user.riskScore = Math.min(100, user.riskScore + 10);
        user.addActivity('Muted', 'User muted by moderator');
        
        this.showToast(`${user.displayName} has been muted`, 'info');
        this.refreshUI(userId);
    }

    unmuteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        user.status = 'active';
        user.addActivity('Unmuted', 'Mute lifted by moderator');
        
        this.showToast(`${user.displayName} has been unmuted`, 'success');
        this.refreshUI(userId);
    }

    banUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        user.status = 'banned';
        user.riskScore = 100;
        user.addActivity('Banned', 'Permanent ban by moderator');
        
        this.showToast(`${user.displayName} has been banned`, 'danger');
        this.refreshUI(userId);
    }

    unbanUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        user.status = 'active';
        user.riskScore = Math.max(0, user.riskScore - 30);
        user.addActivity('Unbanned', 'Ban lifted by moderator');
        
        this.showToast(`${user.displayName} has been unbanned`, 'success');
        this.refreshUI(userId);
    }

    viewProfile(userId) {
        this.openUserModal(userId);
    }

    refreshUI(userId) {
        this.filterUsers();
        if (this.selectedUser && this.selectedUser.id === userId) {
            const user = this.users.find(u => u.id === userId);
            if (user) {
                document.getElementById('modalContent').innerHTML = this.createModalContent(user);
            }
        }
    }

    // Search and Filter
    searchUsers() {
        const query = document.getElementById('userSearch').value.toLowerCase().trim();
        
        if (!query) {
            this.filteredUsers = [...this.users];
        } else {
            this.filteredUsers = this.users.filter(user => 
                user.displayName.toLowerCase().includes(query) ||
                user.username.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.id.toLowerCase().includes(query)
            );
        }
        
        this.applyFilters();
        this.renderUsers();
    }

    filterUsers() {
        this.searchUsers();
    }

    applyFilters() {
        const statusFilter = document.getElementById('statusFilter').value;
        const riskFilter = document.getElementById('riskFilter').value;

        if (statusFilter !== 'all') {
            this.filteredUsers = this.filteredUsers.filter(user => user.status === statusFilter);
        }

        if (riskFilter !== 'all') {
            this.filteredUsers = this.filteredUsers.filter(user => user.getRiskClass() === riskFilter);
        }
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✓',
            warning: '⚠️',
            danger: '🚫',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Utility
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ============================================
// GLOBAL FUNCTIONS & INITIALIZATION
// ============================================

let moderationSystem;

document.addEventListener('DOMContentLoaded', () => {
    moderationSystem = new ModerationSystem();
});

// Global function wrappers for HTML onclick handlers
function searchUsers() {
    moderationSystem.searchUsers();
}

function filterUsers() {
    moderationSystem.filterUsers();
}

function closeModal() {
    moderationSystem.closeModal();
}
