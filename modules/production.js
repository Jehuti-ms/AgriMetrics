// Consolidated Production Module
class ProductionManager {
    constructor() {
        this.productionTypes = {
            CROP: 'crop',
            LIVESTOCK: 'livestock', 
            AQUACULTURE: 'aquaculture'
        };
        
        this.productionData = new Map();
        this.init();
    }

    init() {
        console.log('✅ Production module initialized');
        this.loadProductionData();
    }

    // Unified production calculation
    calculateProduction(type, data) {
        if (!this.validateProductionData(type, data)) {
            throw new Error(`Invalid production data for type: ${type}`);
        }

        switch(type) {
            case this.productionTypes.CROP:
                return this.calculateCropProduction(data);
            case this.productionTypes.LIVESTOCK:
                return this.calculateLivestockProduction(data);
            case this.productionTypes.AQUACULTURE:
                return this.calculateAquacultureProduction(data);
            default:
                throw new Error(`Unknown production type: ${type}`);
        }
    }

    // Crop production calculation
    calculateCropProduction(data) {
        const {
            area,           // in hectares
            yieldPerHectare, // kg/hectare
            soilQuality,    // 0-1 scale
            waterAvailability, // 0-1 scale
            pestPressure,   // 0-1 scale (inverse)
            fertilizerEfficiency // 0-1 scale
        } = data;

        let baseYield = area * yieldPerHectare;
        
        // Environmental factors
        const environmentalFactor = soilQuality * waterAvailability * (1 - pestPressure * 0.3);
        
        // Management factors  
        const managementFactor = 0.7 + (fertilizerEfficiency * 0.3);
        
        return baseYield * environmentalFactor * managementFactor;
    }

    // Livestock production calculation
    calculateLivestockProduction(data) {
        const {
            animalCount,
            productivityPerAnimal, // kg/animal
            animalHealth,          // 0-1 scale
            feedQuality,           // 0-1 scale
            veterinaryCare,        // 0-1 scale
            shelterQuality         // 0-1 scale
        } = data;

        let baseProduction = animalCount * productivityPerAnimal;
        
        // Health and nutrition factors
        const healthFactor = 0.6 + (animalHealth * 0.4);
        const nutritionFactor = 0.7 + (feedQuality * 0.3);
        
        // Management factors
        const managementFactor = 0.8 + (veterinaryCare * 0.1) + (shelterQuality * 0.1);
        
        return baseProduction * healthFactor * nutritionFactor * managementFactor;
    }

    // Aquaculture production calculation
    calculateAquacultureProduction(data) {
        const {
            waterVolume,        // cubic meters
            stockingDensity,    // fish/m³
            speciesProductivity, // kg/fish
            waterQuality,       // 0-1 scale
            feedEfficiency,     // 0-1 scale
            diseaseManagement   // 0-1 scale
        } = data;

        let baseProduction = waterVolume * stockingDensity * speciesProductivity;
        
        // Water quality factors
        const waterQualityFactor = 0.8 + (waterQuality * 0.2);
        
        // Management factors
        const managementFactor = 0.7 + (feedEfficiency * 0.2) + (diseaseManagement * 0.1);
        
        return baseProduction * waterQualityFactor * managementFactor;
    }

    // Resource requirements calculation
    calculateResourceRequirements(type, productionAmount, data) {
        const requirements = {
            water: 0,
            energy: 0,
            labor: 0,
            feed: 0,
            fertilizer: 0
        };

        switch(type) {
            case this.productionTypes.CROP:
                requirements.water = productionAmount * (data.waterRequirementPerKg || 0.5); // liters/kg
                requirements.fertilizer = productionAmount * (data.fertilizerRequirementPerKg || 0.1); // kg/kg
                requirements.labor = productionAmount * (data.laborRequirementPerKg || 0.02); // hours/kg
                break;
                
            case this.productionTypes.LIVESTOCK:
                requirements.water = data.animalCount * (data.waterRequirementPerAnimal || 50); // liters/animal
                requirements.feed = data.animalCount * (data.feedRequirementPerAnimal || 3); // kg/animal
                requirements.labor = data.animalCount * (data.laborRequirementPerAnimal || 0.1); // hours/animal
                break;
                
            case this.productionTypes.AQUACULTURE:
                requirements.water = data.waterVolume;
                requirements.feed = productionAmount * (data.feedConversionRatio || 1.5); // kg feed/kg fish
                requirements.energy = productionAmount * (data.energyRequirementPerKg || 0.3); // kWh/kg
                break;
        }

        return requirements;
    }

    // Save production record
    async saveProductionRecord(record) {
        const recordId = this.generateRecordId();
        const timestamp = new Date().toISOString();
        
        const productionRecord = {
            id: recordId,
            timestamp,
            type: record.type,
            data: record.data,
            productionAmount: record.productionAmount,
            resourceRequirements: record.resourceRequirements,
            revenue: record.revenue || 0,
            cost: record.cost || 0
        };

        this.productionData.set(recordId, productionRecord);
        
        // Save to Firebase or local storage
        await this.saveToStorage(productionRecord);
        
        return recordId;
    }

    // Get production history
    getProductionHistory(type = null, startDate = null, endDate = null) {
        let records = Array.from(this.productionData.values());
        
        // Filter by type if specified
        if (type) {
            records = records.filter(record => record.type === type);
        }
        
        // Filter by date range if specified
        if (startDate && endDate) {
            records = records.filter(record => {
                const recordDate = new Date(record.timestamp);
                return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
            });
        }
        
        return records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Production analytics
    getProductionAnalytics(period = 'month') {
        const records = this.getProductionHistory();
        const analytics = {
            totalProduction: 0,
            productionByType: {},
            averageYield: 0,
            resourceUsage: {},
            trends: {}
        };

        records.forEach(record => {
            analytics.totalProduction += record.productionAmount;
            
            // Production by type
            if (!analytics.productionByType[record.type]) {
                analytics.productionByType[record.type] = 0;
            }
            analytics.productionByType[record.type] += record.productionAmount;
            
            // Resource usage
            Object.keys(record.resourceRequirements).forEach(resource => {
                if (!analytics.resourceUsage[resource]) {
                    analytics.resourceUsage[resource] = 0;
                }
                analytics.resourceUsage[resource] += record.resourceRequirements[resource];
            });
        });

        // Calculate averages
        analytics.averageYield = records.length > 0 ? analytics.totalProduction / records.length : 0;
        
        return analytics;
    }

    // Data validation
    validateProductionData(type, data) {
        const validators = {
            [this.productionTypes.CROP]: this.validateCropData.bind(this),
            [this.productionTypes.LIVESTOCK]: this.validateLivestockData.bind(this),
            [this.productionTypes.AQUACULTURE]: this.validateAquacultureData.bind(this)
        };

        const validator = validators[type];
        return validator ? validator(data) : false;
    }

    validateCropData(data) {
        return data.area > 0 && 
               data.yieldPerHectare > 0 &&
               data.soilQuality >= 0 && data.soilQuality <= 1 &&
               data.waterAvailability >= 0 && data.waterAvailability <= 1;
    }

    validateLivestockData(data) {
        return data.animalCount > 0 &&
               data.productivityPerAnimal > 0 &&
               data.animalHealth >= 0 && data.animalHealth <= 1;
    }

    validateAquacultureData(data) {
        return data.waterVolume > 0 &&
               data.stockingDensity > 0 &&
               data.speciesProductivity > 0;
    }

    // Utility methods
    generateRecordId() {
        return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async saveToStorage(record) {
        // Save to Firebase Firestore
        if (window.farmModules?.firebase) {
            try {
                await window.farmModules.firebase.saveRecord('production', record);
            } catch (error) {
                console.warn('Failed to save to Firebase, using local storage:', error);
                this.saveToLocalStorage(record);
            }
        } else {
            this.saveToLocalStorage(record);
        }
    }

    saveToLocalStorage(record) {
        const key = `production_${record.id}`;
        localStorage.setItem(key, JSON.stringify(record));
    }

    async loadProductionData() {
        // Load from Firebase or local storage
        // Implementation depends on your storage setup
    }

    // Get module info for framework registration
    static getModuleInfo() {
        return {
            id: 'production',
            name: 'Production Manager',
            routes: ['crop-production', 'livestock-production', 'aquaculture-production'],
            menuItems: [
                { id: 'crop-production', label: 'Crop Production', icon: '🌾' },
                { id: 'livestock-production', label: 'Livestock Production', icon: '🐄' },
                { id: 'aquaculture-production', label: 'Aquaculture Production', icon: '🐟' }
            ]
        };
    }
}

// Register with global framework
if (window.farmModules) {
    window.farmModules.registerModule('production', ProductionManager);
} else {
    // Fallback: create global instance
    window.productionManager = new ProductionManager();
}

console.log('🚜 Production module loaded');
