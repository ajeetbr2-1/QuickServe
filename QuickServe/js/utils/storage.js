/**
 * QuickServe LocalStorage Data Management Layer
 * Implements secure JSON-based storage with collections for all entities
 */

class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'quickserve_data';
        this.initializeStorage();
    }

    /**
     * Initialize storage with default schema
     */
    initializeStorage() {
        if (!this.getData()) {
            const defaultSchema = {
                version: '1.0.0',
                lastUpdated: new Date().toISOString(),
                collections: {
                    users: [],
                    providers: [],
                    customers: [],
                    bookings: [],
                    reviews: [],
                    services: [],
                    products: [],
                    otherWorkers: [], // Quick gig workers
                    transactions: [],
                    notifications: [],
                    cart: []
                },
                settings: {
                    currentUser: null,
                    language: 'en',
                    location: null,
                    theme: 'light'
                },
                cache: {
                    pinCodes: {},
                    searchHistory: []
                }
            };
            this.setData(defaultSchema);
        }
    }

    /**
     * Get all data from storage
     */
    getData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    /**
     * Set all data to storage
     */
    setData(data) {
        try {
            data.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    }

    /**
     * Get a specific collection
     */
    getCollection(collectionName) {
        const data = this.getData();
        return data?.collections?.[collectionName] || [];
    }

    /**
     * Set a specific collection
     */
    setCollection(collectionName, collectionData) {
        const data = this.getData();
        if (data && data.collections) {
            data.collections[collectionName] = collectionData;
            return this.setData(data);
        }
        return false;
    }

    /**
     * Add item to collection
     */
    addToCollection(collectionName, item) {
        const collection = this.getCollection(collectionName);
        const newItem = {
            ...item,
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        collection.push(newItem);
        this.setCollection(collectionName, collection);
        return newItem;
    }

    /**
     * Update item in collection
     */
    updateInCollection(collectionName, itemId, updates) {
        const collection = this.getCollection(collectionName);
        const index = collection.findIndex(item => item.id === itemId);
        
        if (index !== -1) {
            collection[index] = {
                ...collection[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.setCollection(collectionName, collection);
            return collection[index];
        }
        return null;
    }

    /**
     * Remove item from collection
     */
    removeFromCollection(collectionName, itemId) {
        const collection = this.getCollection(collectionName);
        const filtered = collection.filter(item => item.id !== itemId);
        
        if (filtered.length < collection.length) {
            this.setCollection(collectionName, filtered);
            return true;
        }
        return false;
    }

    /**
     * Find item in collection
     */
    findInCollection(collectionName, predicate) {
        const collection = this.getCollection(collectionName);
        return collection.find(predicate);
    }

    /**
     * Filter items in collection
     */
    filterCollection(collectionName, predicate) {
        const collection = this.getCollection(collectionName);
        return collection.filter(predicate);
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        const data = this.getData();
        const userId = data?.settings?.currentUser;
        if (userId) {
            return this.findInCollection('users', user => user.id === userId);
        }
        return null;
    }

    /**
     * Set current user
     */
    setCurrentUser(userId) {
        const data = this.getData();
        if (data && data.settings) {
            data.settings.currentUser = userId;
            return this.setData(data);
        }
        return false;
    }

    /**
     * Clear current user session
     */
    clearSession() {
        const data = this.getData();
        if (data && data.settings) {
            data.settings.currentUser = null;
            return this.setData(data);
        }
        return false;
    }

    /**
     * Get user settings
     */
    getSettings() {
        const data = this.getData();
        return data?.settings || {};
    }

    /**
     * Update settings
     */
    updateSettings(updates) {
        const data = this.getData();
        if (data && data.settings) {
            data.settings = { ...data.settings, ...updates };
            return this.setData(data);
        }
        return false;
    }

    /**
     * Add notification
     */
    addNotification(notification) {
        return this.addToCollection('notifications', {
            ...notification,
            read: false,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Mark notification as read
     */
    markNotificationRead(notificationId) {
        return this.updateInCollection('notifications', notificationId, { read: true });
    }

    /**
     * Get unread notifications count
     */
    getUnreadNotificationsCount() {
        const notifications = this.getCollection('notifications');
        return notifications.filter(n => !n.read).length;
    }

    /**
     * Add to cart
     */
    addToCart(item) {
        const cart = this.getCollection('cart');
        const existingItem = cart.find(i => i.productId === item.productId);
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1);
            this.setCollection('cart', cart);
            return existingItem;
        } else {
            return this.addToCollection('cart', {
                ...item,
                quantity: item.quantity || 1
            });
        }
    }

    /**
     * Remove from cart
     */
    removeFromCart(itemId) {
        return this.removeFromCollection('cart', itemId);
    }

    /**
     * Clear cart
     */
    clearCart() {
        return this.setCollection('cart', []);
    }

    /**
     * Get cart total
     */
    getCartTotal() {
        const cart = this.getCollection('cart');
        return cart.reduce((total, item) => {
            return total + (item.price * (item.quantity || 1));
        }, 0);
    }

    /**
     * Save search to history
     */
    saveSearchHistory(searchTerm) {
        const data = this.getData();
        if (data && data.cache) {
            const history = data.cache.searchHistory || [];
            
            // Remove if already exists
            const filtered = history.filter(h => h.term !== searchTerm);
            
            // Add to beginning
            filtered.unshift({
                term: searchTerm,
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 20 searches
            data.cache.searchHistory = filtered.slice(0, 20);
            this.setData(data);
        }
    }

    /**
     * Get search history
     */
    getSearchHistory() {
        const data = this.getData();
        return data?.cache?.searchHistory || [];
    }

    /**
     * Cache PIN code data
     */
    cachePinCode(pinCode, data) {
        const storage = this.getData();
        if (storage && storage.cache) {
            storage.cache.pinCodes[pinCode] = {
                ...data,
                cachedAt: new Date().toISOString()
            };
            this.setData(storage);
        }
    }

    /**
     * Get cached PIN code data
     */
    getCachedPinCode(pinCode) {
        const data = this.getData();
        return data?.cache?.pinCodes?.[pinCode] || null;
    }

    /**
     * Export all data (for backup)
     */
    exportData() {
        const data = this.getData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quickserve_backup_${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Import data (restore from backup)
     */
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data && data.version && data.collections) {
                        this.setData(data);
                        resolve(true);
                    } else {
                        reject(new Error('Invalid backup file format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * Clear all data
     */
    clearAllData() {
        if (confirm('This will delete all QuickServe data. Are you sure?')) {
            localStorage.removeItem(this.STORAGE_KEY);
            this.initializeStorage();
            return true;
        }
        return false;
    }
}

// Create singleton instance
const Storage = new StorageManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
