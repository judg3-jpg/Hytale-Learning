// CSV Data Manager
// Handles CSV import, export, and local storage of creator data

class CSVManager {
  constructor() {
    this.data = [];
    this.headers = [];
    this.isLoaded = false;
    this.lastUpdated = null;
    
    // Expected column headers (in order)
    this.EXPECTED_HEADERS = [
      'UUID', 'Name (At Last Check)', 'Main Channel (Hover For Other Channels)',
      'Date Accepted', 'Verified By', 'Accepted By', 'Last Checked',
      'Content Review By', 'Creator code', 'Subscribers (At last check)',
      'Last Upload', 'Last Upload', 'Rank Given', 'Content Type',
      'Video Category', 'Locale', 'Content Language', 'Contact Email',
      'Zendesk ID', 'Notes', 'Reference Tags', 'Reports', 'Warnings',
      'Requires Checkup'
    ];
    
    // Column indices for easy access
    this.COLUMNS = {
      UUID: 0,
      NAME: 1,
      MAIN_CHANNEL: 2,
      DATE_ACCEPTED: 3,
      VERIFIED_BY: 4,
      ACCEPTED_BY: 5,
      LAST_CHECKED: 6,
      CONTENT_REVIEW_BY: 7,
      CREATOR_CODE: 8,
      SUBSCRIBERS: 9,
      LAST_UPLOAD_DATE: 10,
      LAST_UPLOAD_AGO: 11,
      RANK_GIVEN: 12,
      CONTENT_TYPE: 13,
      VIDEO_CATEGORY: 14,
      LOCALE: 15,
      CONTENT_LANGUAGE: 16,
      CONTACT_EMAIL: 17,
      ZENDESK_ID: 18,
      NOTES: 19,
      REFERENCE_TAGS: 20,
      REPORTS: 21,
      WARNINGS: 22,
      REQUIRES_CHECKUP: 23
    };
  }

  // Initialize - load data from storage
  async init() {
    try {
      const stored = await chrome.storage.local.get(['creatorData', 'creatorHeaders', 'lastUpdated']);
      
      if (stored.creatorData && stored.creatorData.length > 0) {
        // Make a deep copy to avoid reference issues
        this.data = stored.creatorData.map(row => Array.isArray(row) ? [...row] : []);
        this.headers = stored.creatorHeaders ? [...stored.creatorHeaders] : [...this.EXPECTED_HEADERS];
        this.lastUpdated = stored.lastUpdated;
        this.isLoaded = true;
        console.log(`Loaded ${this.data.length} creators from storage`);
      }
      
      return this.isLoaded;
    } catch (error) {
      console.error('Failed to load from storage:', error);
      return false;
    }
  }

  // Parse CSV string into array
  parseCSV(csvString) {
    const lines = [];
    let currentLine = '';
    let insideQuotes = false;
    
    // Handle different line endings
    const normalized = csvString.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentLine += char;
      } else if (char === '\n' && !insideQuotes) {
        if (currentLine.trim()) {
          lines.push(this.parseCSVLine(currentLine));
        }
        currentLine = '';
      } else {
        currentLine += char;
      }
    }
    
    // Don't forget the last line
    if (currentLine.trim()) {
      lines.push(this.parseCSVLine(currentLine));
    }
    
    return lines;
  }

  // Parse a single CSV line
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"' && insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  // Import CSV file
  async importCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const csvString = e.target.result;
          const parsed = this.parseCSV(csvString);
          
          if (parsed.length < 2) {
            reject(new Error('CSV file is empty or has no data rows'));
            return;
          }
          
          // First row is headers
          this.headers = parsed[0];
          this.data = parsed.slice(1);
          this.isLoaded = true;
          this.lastUpdated = new Date().toISOString();
          
          // Save to storage
          await this.saveToStorage();
          
          resolve({
            success: true,
            rowCount: this.data.length,
            headers: this.headers
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Import from CSV string (for pasting)
  async importFromString(csvString) {
    try {
      const parsed = this.parseCSV(csvString);
      
      if (parsed.length < 2) {
        throw new Error('CSV data is empty or has no data rows');
      }
      
      this.headers = parsed[0];
      this.data = parsed.slice(1);
      this.isLoaded = true;
      this.lastUpdated = new Date().toISOString();
      
      await this.saveToStorage();
      
      return {
        success: true,
        rowCount: this.data.length,
        headers: this.headers
      };
    } catch (error) {
      throw error;
    }
  }

  // Save data to local storage
  async saveToStorage() {
    try {
      // Validate data before saving
      if (!Array.isArray(this.data)) {
        throw new Error('Data is not an array');
      }
      
      // Make a clean copy of the data to avoid reference issues
      const dataCopy = this.data.map(row => [...row]);
      
      await chrome.storage.local.set({
        creatorData: dataCopy,
        creatorHeaders: [...this.headers],
        lastUpdated: this.lastUpdated
      });
      
      console.log(`Saved ${dataCopy.length} creators to storage`);
      return true;
    } catch (error) {
      console.error('Failed to save to storage:', error);
      // Try to log storage usage
      try {
        const usage = await chrome.storage.local.getBytesInUse();
        console.log('Storage usage:', usage, 'bytes');
      } catch (e) {}
      return false;
    }
  }

  // Export to CSV string
  exportToCSV() {
    const escapeField = (field) => {
      if (field === null || field === undefined) return '';
      const str = String(field);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    
    const headerLine = this.headers.map(escapeField).join(',');
    const dataLines = this.data.map(row => row.map(escapeField).join(','));
    
    return [headerLine, ...dataLines].join('\n');
  }

  // Download CSV file
  downloadCSV(filename = 'hypixel-creators.csv') {
    const csv = this.exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Get all creators as objects
  getAllCreators() {
    return this.data.map((row, index) => ({
      rowIndex: index,
      creator: this.parseCreatorRow(row)
    }));
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

  // Get a specific row
  getRow(index) {
    if (index < 0 || index >= this.data.length) {
      console.warn(`getRow: Invalid index ${index}, data length is ${this.data.length}`);
      return null;
    }
    const row = this.data[index];
    if (!row || !Array.isArray(row)) {
      console.warn(`getRow: Row at index ${index} is invalid:`, row);
      return null;
    }
    return this.parseCreatorRow(row);
  }

  // Update a cell
  async updateCell(rowIndex, columnIndex, value, skipSave = false) {
    if (rowIndex < 0 || rowIndex >= this.data.length) return false;
    
    // Ensure row has enough columns
    while (this.data[rowIndex].length <= columnIndex) {
      this.data[rowIndex].push('');
    }
    
    this.data[rowIndex][columnIndex] = value;
    this.lastUpdated = new Date().toISOString();
    
    if (!skipSave) {
      await this.saveToStorage();
    }
    return true;
  }

  // Update multiple cells at once (batch update)
  async updateMultipleCells(rowIndex, updates) {
    if (rowIndex < 0 || rowIndex >= this.data.length) return false;
    
    // Ensure row has enough columns for any update
    const maxColumn = Math.max(...Object.keys(updates).map(k => parseInt(k)));
    while (this.data[rowIndex].length <= maxColumn) {
      this.data[rowIndex].push('');
    }
    
    // Apply all updates
    for (const [columnIndex, value] of Object.entries(updates)) {
      this.data[rowIndex][parseInt(columnIndex)] = value;
    }
    
    this.lastUpdated = new Date().toISOString();
    await this.saveToStorage();
    return true;
  }

  // Update entire row at once
  async updateRow(rowIndex, newRowData) {
    if (rowIndex < 0 || rowIndex >= this.data.length) return false;
    
    // Preserve original row length if new data is shorter
    const originalLength = this.data[rowIndex].length;
    
    // Update the row
    this.data[rowIndex] = newRowData;
    
    // Ensure minimum columns
    while (this.data[rowIndex].length < originalLength) {
      this.data[rowIndex].push('');
    }
    
    this.lastUpdated = new Date().toISOString();
    await this.saveToStorage();
    return true;
  }

  // Quick review - update Last Checked and Content Review By
  async quickReview(rowIndex, reviewerName) {
    const today = new Date().toISOString().split('T')[0];
    
    await this.updateCell(rowIndex, this.COLUMNS.LAST_CHECKED, today);
    await this.updateCell(rowIndex, this.COLUMNS.CONTENT_REVIEW_BY, reviewerName);
    
    return true;
  }

  // Add a note with timestamp
  async addNote(rowIndex, note) {
    const today = new Date().toISOString().split('T')[0];
    const existingNotes = this.data[rowIndex][this.COLUMNS.NOTES] || '';
    const newNote = `[${today}] ${note}`;
    const fullNotes = existingNotes ? `${existingNotes}\n${newNote}` : newNote;
    
    await this.updateCell(rowIndex, this.COLUMNS.NOTES, fullNotes);
    return true;
  }

  // Add a warning with timestamp
  async addWarning(rowIndex, warning) {
    const today = new Date().toISOString().split('T')[0];
    const existingWarnings = this.data[rowIndex][this.COLUMNS.WARNINGS] || '';
    const newWarning = `[${today}] ${warning}`;
    const fullWarnings = existingWarnings ? `${existingWarnings}\n${newWarning}` : newWarning;
    
    await this.updateCell(rowIndex, this.COLUMNS.WARNINGS, fullWarnings);
    return true;
  }

  // Clear the requires checkup flag
  async clearCheckup(rowIndex) {
    await this.updateCell(rowIndex, this.COLUMNS.REQUIRES_CHECKUP, '');
    return true;
  }

  // Add a new row (creator)
  async addRow(rowData) {
    // Ensure we have headers
    if (this.headers.length === 0) {
      this.headers = this.EXPECTED_HEADERS;
    }
    
    // Ensure row has correct number of columns
    while (rowData.length < this.headers.length) {
      rowData.push('');
    }
    
    // Add to data array
    this.data.push(rowData);
    this.isLoaded = true;
    this.lastUpdated = new Date().toISOString();
    
    // Save to storage
    await this.saveToStorage();
    
    return {
      success: true,
      rowIndex: this.data.length - 1
    };
  }

  // Delete a row
  async deleteRow(rowIndex) {
    if (rowIndex < 0 || rowIndex >= this.data.length) {
      throw new Error('Invalid row index');
    }
    
    this.data.splice(rowIndex, 1);
    this.lastUpdated = new Date().toISOString();
    
    await this.saveToStorage();
    return true;
  }

  // Get creators that need review
  getReviewQueue(overdueMonths = 3) {
    const queue = [];
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - overdueMonths);

    for (let i = 0; i < this.data.length; i++) {
      const creator = this.parseCreatorRow(this.data[i]);
      
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
          rowIndex: i,
          creator,
          reason
        });
      }
    }

    return queue;
  }

  // Get statistics
  getStatistics() {
    const stats = {
      totalCreators: this.data.length,
      needsReview: 0,
      hasWarnings: 0,
      inactive: 0,        // 24+ months
      semiInactive: 0,    // 12-24 months
      active: 0,          // under 12 months
      byRank: {},
      byLanguage: {}
    };

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 3);

    for (let i = 0; i < this.data.length; i++) {
      const creator = this.parseCreatorRow(this.data[i]);
      
      // Check review status
      const lastChecked = creator.lastChecked ? new Date(creator.lastChecked) : null;
      if (creator.requiresCheckup || !lastChecked || lastChecked < cutoffDate) {
        stats.needsReview++;
      }

      // Check warnings
      if (creator.warnings && creator.warnings.trim() !== '') {
        stats.hasWarnings++;
      }

      // Check activity based on last upload
      const months = this.parseMonthsFromUpload(creator.lastUploadAgo);
      if (months !== null) {
        if (months >= 24) {
          stats.inactive++;
        } else if (months >= 12) {
          stats.semiInactive++;
        } else {
          stats.active++;
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

  // Parse months from last upload string
  parseMonthsFromUpload(lastUploadAgo) {
    if (!lastUploadAgo) return null;
    
    const str = lastUploadAgo.toLowerCase();
    
    // Try to match "X months" pattern
    const monthMatch = str.match(/(\d+)\s*month/i);
    if (monthMatch) {
      return parseInt(monthMatch[1]);
    }
    
    // Try to match "X years" pattern and convert to months
    const yearMatch = str.match(/(\d+)\s*year/i);
    if (yearMatch) {
      return parseInt(yearMatch[1]) * 12;
    }
    
    // Try to match "X weeks" or "X days" - these are active
    if (str.includes('week') || str.includes('day') || str.includes('hour')) {
      return 0;
    }
    
    return null;
  }

  // Search creators
  searchCreators(query) {
    const searchQuery = query.toLowerCase();
    const results = [];

    for (let i = 0; i < this.data.length; i++) {
      const creator = this.parseCreatorRow(this.data[i]);
      
      if (
        creator.name.toLowerCase().includes(searchQuery) ||
        creator.channel.toLowerCase().includes(searchQuery) ||
        creator.uuid.toLowerCase().includes(searchQuery)
      ) {
        results.push({
          rowIndex: i,
          creator
        });
      }
    }

    return results;
  }

  // Clear all data
  async clearData() {
    this.data = [];
    this.headers = [];
    this.isLoaded = false;
    this.lastUpdated = null;
    
    await chrome.storage.local.remove(['creatorData', 'creatorHeaders', 'lastUpdated']);
    return true;
  }

  // Get unsaved changes count (for UI indicator)
  hasData() {
    return this.isLoaded && this.data.length > 0;
  }

  // Get last updated timestamp
  getLastUpdated() {
    return this.lastUpdated;
  }

  // Debug function to check data integrity
  debugData() {
    console.log('=== CSV Manager Debug ===');
    console.log('Is Loaded:', this.isLoaded);
    console.log('Headers count:', this.headers.length);
    console.log('Data rows:', this.data.length);
    console.log('Last Updated:', this.lastUpdated);
    
    // Check for invalid rows
    let invalidRows = 0;
    for (let i = 0; i < this.data.length; i++) {
      if (!Array.isArray(this.data[i])) {
        console.warn(`Row ${i} is not an array:`, this.data[i]);
        invalidRows++;
      } else if (this.data[i].length < 2) {
        console.warn(`Row ${i} has too few columns:`, this.data[i].length);
        invalidRows++;
      }
    }
    console.log('Invalid rows found:', invalidRows);
    console.log('=========================');
    
    return {
      isLoaded: this.isLoaded,
      headerCount: this.headers.length,
      rowCount: this.data.length,
      invalidRows: invalidRows
    };
  }
}

// Export singleton instance
const csvManager = new CSVManager();

// Make available globally
if (typeof window !== 'undefined') {
  window.csvManager = csvManager;
}
