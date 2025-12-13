/**
 * Simple logging utility with colored output
 */

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

function getTimestamp() {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

const logger = {
    info: (message, ...args) => {
        console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.blue}ℹ${colors.reset}  ${message}`, ...args);
    },

    success: (message, ...args) => {
        console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.green}✓${colors.reset}  ${message}`, ...args);
    },

    warn: (message, ...args) => {
        console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.yellow}⚠${colors.reset}  ${message}`, ...args);
    },

    error: (message, ...args) => {
        console.error(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.red}✗${colors.reset}  ${message}`, ...args);
    },

    filter: (message, ...args) => {
        console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.magenta}🛡${colors.reset} ${message}`, ...args);
    },

    command: (message, ...args) => {
        console.log(`${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.cyan}⌘${colors.reset}  ${message}`, ...args);
    },

    debug: (message, ...args) => {
        if (process.env.DEBUG === 'true') {
            console.log(`${colors.gray}[${getTimestamp()}] 🔍 ${message}${colors.reset}`, ...args);
        }
    }
};

module.exports = logger;
