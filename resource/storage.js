const fs = require('fs');
const path = require('path');

const STORAGE_FILE = path.join(__dirname, '../user_prefs.json');

class Storage {
    constructor() {
        this.data = {};
        this.load();
    }

    load() {
        try {
            if (fs.existsSync(STORAGE_FILE)) {
                const fileContent = fs.readFileSync(STORAGE_FILE, 'utf8');
                this.data = JSON.parse(fileContent);
            }
        } catch (err) {
            console.error('Error loading user prefs:', err);
            this.data = {};
        }
    }

    save() {
        try {
            fs.writeFileSync(STORAGE_FILE, JSON.stringify(this.data, null, 2));
        } catch (err) {
            console.error('Error saving user prefs:', err);
        }
    }

    saveUserPref(userId, key, value) {
        if (!this.data[userId]) {
            this.data[userId] = {};
        }
        this.data[userId][key] = value;
        this.save();
    }

    getUserPref(userId, key) {
        if (this.data[userId] && this.data[userId][key]) {
            return this.data[userId][key];
        }
        return null;
    }
}

module.exports = Storage;
