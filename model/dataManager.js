const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const TrieSearch = require('trie-search');
const DateIndex = require('../utils/dateIndex');

class DataManager {
    constructor() {
        this.userMap = new Map();
        this.countryMap = new Map();
        this.emailMap = new Map();
        this.dobIndex = new DateIndex();
        this.nameTrie = new TrieSearch('name', {
            min: 3,
            ignoreCase: true,
            splitOnRegEx: false
        });
        this.lastProcessedByte = 0;
    }

    async init() {
        const filePath = path.join(__dirname, '..', 'data.csv');
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => {
                    this.indexItem(row);
                })
                .on('end', () => {
                    console.log('CSV file successfully processed');
                    this.watchFileChanges(filePath);
                    resolve();
                })
                .on('error', (error) => {
                    console.error('Error processing CSV file:', error);
                    reject(error);
                });
        });
    }

    watchFileChanges(filePath) {
        fs.watch(filePath, (eventType) => {
            if (eventType === 'change') {
                console.log(`File change detected at ${new Date().toLocaleString()}`);
                this.processNewData(filePath);
            }
        });
    }
    

    processNewData(filePath) {
        const stream = fs.createReadStream(filePath, { start: this.lastProcessedByte });
        stream.pipe(csv())
            .on('data', (row) => {
                this.indexItem(row);
            })
            .on('end', () => {
                this.lastProcessedByte += stream.bytesRead;
            })
            .on('error', (error) => {
                console.error('Error processing new data:', error);
            });
    }

    indexItem(row) {
        const { Id: id, Name: name, DOB: dob, Country: country, Email: email } = row;
        const user = { id, name, dob, country, email };
        this.indexId(id, user);
        this.indexName(name, id);
        this.indexCountry(country, id);
        this.indexDob(dob, id);
        this.indexEmail(email, id);
    }

    indexId(id, user) {
        this.userMap.set(id, user);
    }

    indexName(name, id) {
        const nameParts = name.trim().split(' ');
        // Add full name
        this.nameTrie.add({ name: name, id });

        // Add name parts
        nameParts.forEach(part => {
            this.nameTrie.add({ name: part, id });

        });
    }

    indexCountry(country, id) {
        if (!this.countryMap.has(country)) {
            this.countryMap.set(country, new Set());
        }
        this.countryMap.get(country).add(id);
    }

    indexDob(dob, id) {
        this.dobIndex.insert(dob, id);
    }

    indexEmail(email, id) {
        this.emailMap.set(email, id);
    }

    SetToArray(userIds) {
        return Array.from(userIds).map(id => {
            const { id: userId, name, dob, country } = this.userMap.get(id);
            return { id: userId, name, dob, country };
        });
    }

    getUserById(id) {
        return this.userMap.get(id);
    }

    getUsersByCountry(country) {
        const userIds = this.countryMap.get(country) || new Set();
        return this.SetToArray(userIds);
    }

    getUsersByName(name) {
        const result = this.nameTrie.get(name);
        const uniqueUserIds = new Set(result.map(match => match.id));
        return this.SetToArray(uniqueUserIds);
    }

    getUsersByAge(age) {
        const userIds = this.dobIndex.searchByAge(age) || new Set();
        return this.SetToArray(userIds);
    }

    getUserByEmail(email) {
        const id = this.emailMap.get(email);
        return this.getUserById(id);
    }

    deleteUser(id) {
        const user = this.userMap.get(id);
        if (user) {
            this.userMap.delete(id);
            this.countryMap.get(user.country).delete(id);
            if (this.countryMap.get(user.country).size === 0) {
                this.countryMap.delete(user.country);
            }
            this.emailMap.delete(user.email);
            const dob = user.dob;
            this.dobIndex.delete(dob, id);
            this.removeFromTrie(user.name, id);
            return true;
        }
        return false;
    }

    removeFromTrie(name, id) {
        const removeIdFromNode = (node, id) => {
            if (node && node.value) {
                node.value = node.value.filter(item => item.id !== id);
                if (node.value.length === 0) {
                    delete node.value;
                    return true;
                }
            }
            return false;
        };

        const removePath = (path) => {
            if (path.length < 3) {
                return;
            }

            const prefix = path.slice(0, 3);
            let current = this.nameTrie.root[prefix];
            if (!current) {
                return;
            }

            const stack = [[this.nameTrie.root, prefix]];

            for (let i = 3; i < path.length; i++) {
                if (current[path[i]]) {
                    stack.push([current, path[i]]);
                    current = current[path[i]];
                } else {
                    break;
                }
            }

            removeIdFromNode(current, id);

            for (let i = stack.length - 1; i >= 0; i--) {
                const [parent, key] = stack[i];
                if (Object.keys(parent[key]).length === 0) {
                    delete parent[key];
                } else {
                    break;
                }
            }
        };

        removePath(name.toLowerCase());

        const nameParts = name.toLowerCase().split(' ');
        nameParts.forEach(part => removePath(part));

        const tempTrie = new TrieSearch('name', {
            min: 3,
            ignoreCase: true,
            splitOnRegEx: false
        });
        Object.keys(this.nameTrie.root).forEach(key => {
            tempTrie.root[key] = this.nameTrie.root[key];
        });
        this.nameTrie = tempTrie;
    }

}

module.exports = DataManager;