// Google Sheets API Integration
// This module handles all communication with Google Sheets

class SheetsAPI {
  constructor() {
    this.accessToken = null;
    this.sheetId = null;
    this.isConnected = false;
    this.sheetData = null;
    
    // Column mapping based on the Hypixel creator sheet structure
    this.COLUMNS = {
      UUID: 0,              // A
      NAME: 1,              // B
      MAIN_CHANNEL: 2,      // C
      DATE_ACCEPTED: 3,     // D
      VERIFIED_BY: 4,       // E
      ACCEPTED_BY: 5,       // F
      LAST_CHECKED: 6,      // G
      CONTENT_REVIEW_BY: 7, // H
      CREATOR_CODE: 8,      // I
      SUBSCRIBERS: 9,       // J
      LAST_UPLOAD_DATE: 10, // K
      LAST_UPLOAD_AGO: 11,  // L
      RANK_GIVEN: 12,       // M
      CONTENT_TYPE: 13,     // N
      VIDEO_CATEGORY: 14,   // O
      LOCALE: 15,           // P
      CONTENT_LANGUAGE: 16, // Q
      CONTACT_EMAIL: 17,    // R
      ZENDESK_ID: 18,       // S
      NOTES: 19,            // T
      REFERENCE_TAGS: 20,   // U
      REPORTS: 21,          // V
      WARNINGS: 22,         // W
      REQUIRES_CHECKUP: 23  // X
    };
    
    // Column letters for easy reference
    this.COL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWX'.split('');
  }

  // Initialize the API with stored settings
  async init() {
    try {
      const settings = await chrome.storage.sync.get(['sheetId', 'accessToken']);
      this.sheetId = settings.sheetId || null;
      this.accessToken = settings.accessToken || null;
      
      if (this.sheetId && this.accessToken) {
        // Verify the token is still valid
        const isValid = await this.verifyToken();
        this.isConnected = isValid;
      }
      
      return this.isConnected;
    } catch (error) {
      console.error('Failed to initialize Sheets API:', error);
      return false;
    }
  }

  // Authenticate with Google OAuth2
  async authenticate() {
    try {
      // Use Chrome Identity API for OAuth2
      const token = await new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(token);
          }
        });
      });
      
      this.accessToken = token;
      await chrome.storage.sync.set({ accessToken: token });
      this.isConnected = true;
      
      return true;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  // Verify the current token is valid
  async verifyToken() {
    if (!this.accessToken) return false;
    
    try {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + this.accessToken
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  // Set the spreadsheet ID
  async setSheetId(sheetId) {
    // Extract sheet ID from URL if full URL is provided
    const match = sheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    this.sheetId = match ? match[1] : sheetId;
    
    await chrome.storage.sync.set({ sheetId: this.sheetId });
    return this.sheetId;
  }

  // Get sheet ID from URL
  extractSheetIdFromUrl(url) {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }

  // Fetch all data from the sheet
  async fetchAllData(range = 'Sheet1!A:X') {
    if (!this.isConnected || !this.sheetId) {
      throw new Error('Not connected to a sheet');
    }

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(range)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          await this.authenticate();
          return this.fetchAllData(range);
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      this.sheetData = data.values || [];
      
      return this.sheetData;
    } catch (error) {
      console.error('Failed to fetch sheet data:', error);
      throw error;
    }
  }

  // Get a specific row by index (0-based, excluding header)
  async getRow(rowIndex) {
    if (!this.sheetData) {
      await this.fetchAllData();
    }
    
    // Add 1 to skip header row
    return this.sheetData[rowIndex + 1] || null;
  }

  // Get a creator by UUID
  async getCreatorByUUID(uuid) {
    if (!this.sheetData) {
      await this.fetchAllData();
    }

    for (let i = 1; i < this.sheetData.length; i++) {
      if (this.sheetData[i][this.COLUMNS.UUID] === uuid) {
        return {
          rowIndex: i,
          data: this.parseCreatorRow(this.sheetData[i])
        };
      }
    }
    return null;
  }

  // Get a creator by name
  async getCreatorByName(name) {
    if (!this.sheetData) {
      await this.fetchAllData();
    }

    const searchName = name.toLowerCase();
    for (let i = 1; i < this.sheetData.length; i++) {
      if (this.sheetData[i][this.COLUMNS.NAME]?.toLowerCase().includes(searchName)) {
        return {
          rowIndex: i,
          data: this.parseCreatorRow(this.sheetData[i])
        };
      }
    }
    return null;
  }

  // Parse a row into a creator object
  parseCreatorRow(row) {
    return {
      uuid: row[this.COLUMNS.UUID] || '',
      name: row[this.COLUMNS.NAME] || '',
      channel: row[this.COLUMNS.MAIN_CHANNEL] || '',
      dateAccepted: row[this.COLUMNS.DATE_ACCEPTED] || '',
      verifiedBy: row[this.COLUMNS.VERIFIED_BY] || '',
      acceptedBy: row[this.COLUMNS.ACCEPTED_BY] || '',
      lastChecked: row[this.COLUMNS.LAST_CHECKED] || '',
      contentReviewBy: row[this.COLUMNS.CONTENT_REVIEW_BY] || '',
      creatorCode: row[this.COLUMNS.CREATOR_CODE] || '',
      subscribers: row[this.COLUMNS.SUBSCRIBERS] || '',
      lastUploadDate: row[this.COLUMNS.LAST_UPLOAD_DATE] || '',
      lastUploadAgo: row[this.COLUMNS.LAST_UPLOAD_AGO] || '',
      rankGiven: row[this.COLUMNS.RANK_GIVEN] || '',
      contentType: row[this.COLUMNS.CONTENT_TYPE] || '',
      videoCategory: row[this.COLUMNS.VIDEO_CATEGORY] || '',
      locale: row[this.COLUMNS.LOCALE] || '',
      contentLanguage: row[this.COLUMNS.CONTENT_LANGUAGE] || '',
      contactEmail: row[this.COLUMNS.CONTACT_EMAIL] || '',
      zendeskId: row[this.COLUMNS.ZENDESK_ID] || '',
      notes: row[this.COLUMNS.NOTES] || '',
      referenceTags: row[this.COLUMNS.REFERENCE_TAGS] || '',
      reports: row[this.COLUMNS.REPORTS] || '',
      warnings: row[this.COLUMNS.WARNINGS] || '',
      requiresCheckup: row[this.COLUMNS.REQUIRES_CHECKUP] || ''
    };
  }

  // Update a specific cell
  async updateCell(row, column, value) {
    if (!this.isConnected || !this.sheetId) {
      throw new Error('Not connected to a sheet');
    }

    const colLetter = typeof column === 'number' ? this.COL_LETTERS[column] : column;
    const range = `Sheet1!${colLetter}${row}`;

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [[value]]
          })
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          await this.authenticate();
          return this.updateCell(row, column, value);
        }
        throw new Error(`API Error: ${response.status}`);
      }

      // Update local cache
      if (this.sheetData && this.sheetData[row - 1]) {
        const colIndex = typeof column === 'number' ? column : this.COL_LETTERS.indexOf(column);
        this.sheetData[row - 1][colIndex] = value;
      }

      return true;
    } catch (error) {
      console.error('Failed to update cell:', error);
      throw error;
    }
  }

  // Update multiple cells in a row
  async updateRow(rowNumber, updates) {
    if (!this.isConnected || !this.sheetId) {
      throw new Error('Not connected to a sheet');
    }

    const requests = [];
    
    for (const [column, value] of Object.entries(updates)) {
      const colLetter = typeof column === 'number' ? this.COL_LETTERS[column] : column;
      const range = `Sheet1!${colLetter}${rowNumber}`;
      
      requests.push({
        range,
        values: [[value]]
      });
    }

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values:batchUpdate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            valueInputOption: 'USER_ENTERED',
            data: requests
          })
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          await this.authenticate();
          return this.updateRow(rowNumber, updates);
        }
        throw new Error(`API Error: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to update row:', error);
      throw error;
    }
  }

  // Quick review - update Last Checked and Content Review By
  async quickReview(rowNumber, reviewerName) {
    const today = new Date().toISOString().split('T')[0];
    
    return this.updateRow(rowNumber, {
      'G': today,           // Last Checked
      'H': reviewerName     // Content Review By
    });
  }

  // Add a note with timestamp
  async addNote(rowNumber, note, existingNotes = '') {
    const today = new Date().toISOString().split('T')[0];
    const newNote = `[${today}] ${note}`;
    const fullNotes = existingNotes ? `${existingNotes}\n${newNote}` : newNote;
    
    return this.updateCell(rowNumber, 'T', fullNotes);
  }

  // Add a warning with timestamp
  async addWarning(rowNumber, warning, existingWarnings = '') {
    const today = new Date().toISOString().split('T')[0];
    const newWarning = `[${today}] ${warning}`;
    const fullWarnings = existingWarnings ? `${existingWarnings}\n${newWarning}` : newWarning;
    
    return this.updateCell(rowNumber, 'W', fullWarnings);
  }

  // Clear the requires checkup flag
  async clearCheckup(rowNumber) {
    return this.updateCell(rowNumber, 'X', '');
  }

  // Get creators that need review (overdue or flagged)
  async getReviewQueue(overdueMonths = 3) {
    if (!this.sheetData) {
      await this.fetchAllData();
    }

    const queue = [];
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - overdueMonths);

    for (let i = 1; i < this.sheetData.length; i++) {
      const row = this.sheetData[i];
      const creator = this.parseCreatorRow(row);
      
      let needsReview = false;
      let reason = '';

      // Check if flagged for checkup
      if (creator.requiresCheckup && creator.requiresCheckup.trim() !== '') {
        needsReview = true;
        reason = 'Flagged for checkup';
      }
      // Check if overdue
      else if (creator.lastChecked) {
        const lastCheckedDate = new Date(creator.lastChecked);
        if (lastCheckedDate < cutoffDate) {
          needsReview = true;
          reason = `Not checked since ${creator.lastChecked}`;
        }
      }
      // Never checked
      else if (!creator.lastChecked || creator.lastChecked.trim() === '') {
        needsReview = true;
        reason = 'Never reviewed';
      }

      if (needsReview) {
        queue.push({
          rowIndex: i + 1, // 1-based for sheet
          creator,
          reason
        });
      }
    }

    return queue;
  }

  // Get statistics
  async getStatistics() {
    if (!this.sheetData) {
      await this.fetchAllData();
    }

    const stats = {
      totalCreators: 0,
      needsReview: 0,
      hasWarnings: 0,
      inactive: 0,
      byRank: {},
      byLanguage: {}
    };

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 3);

    for (let i = 1; i < this.sheetData.length; i++) {
      const creator = this.parseCreatorRow(this.sheetData[i]);
      
      stats.totalCreators++;

      // Check review status
      if (creator.requiresCheckup || !creator.lastChecked || new Date(creator.lastChecked) < cutoffDate) {
        stats.needsReview++;
      }

      // Check warnings
      if (creator.warnings && creator.warnings.trim() !== '') {
        stats.hasWarnings++;
      }

      // Check activity (assuming "Months" in lastUploadAgo indicates inactivity)
      if (creator.lastUploadAgo && creator.lastUploadAgo.includes('Month')) {
        const months = parseInt(creator.lastUploadAgo) || 0;
        if (months >= 6) {
          stats.inactive++;
        }
      }

      // Count by rank
      if (creator.rankGiven) {
        stats.byRank[creator.rankGiven] = (stats.byRank[creator.rankGiven] || 0) + 1;
      }

      // Count by language
      if (creator.contentLanguage) {
        stats.byLanguage[creator.contentLanguage] = (stats.byLanguage[creator.contentLanguage] || 0) + 1;
      }
    }

    return stats;
  }

  // Search creators
  async searchCreators(query) {
    if (!this.sheetData) {
      await this.fetchAllData();
    }

    const results = [];
    const searchQuery = query.toLowerCase();

    for (let i = 1; i < this.sheetData.length; i++) {
      const creator = this.parseCreatorRow(this.sheetData[i]);
      
      if (
        creator.name.toLowerCase().includes(searchQuery) ||
        creator.channel.toLowerCase().includes(searchQuery) ||
        creator.uuid.toLowerCase().includes(searchQuery)
      ) {
        results.push({
          rowIndex: i + 1,
          creator
        });
      }
    }

    return results;
  }
}

// Export singleton instance
const sheetsAPI = new SheetsAPI();

// Make available globally
if (typeof window !== 'undefined') {
  window.sheetsAPI = sheetsAPI;
}

// For service worker
if (typeof self !== 'undefined') {
  self.sheetsAPI = sheetsAPI;
}
