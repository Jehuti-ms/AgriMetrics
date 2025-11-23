// ==================== FEED RECORDS MODULE ====================
FarmModules.registerModule('feed-records', {
    name: 'Feed Records',
    icon: '🌾',
    template: `
        <div id="feed-records" class="section">
            <h1>Feed Records</h1>
            
            <div class="form-group">
                <label for="feed-date">Date</label>
                <input type="date" id="feed-date">
            </div>
            
            <div class="form-group">
                <label for="animal-type">Animal Type</label>
                <select id="animal-type">
                    <option value="broilers">Broilers</option>
                    <option value="layers">Layers</option>
                    <option value="cattle">Cattle</option>
                    <option value="sheep">Sheep</option>
                    <option value="goats">Goats</option>
                    <option value="pigs">Pigs</option>
                    <option value="other">Other</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Feed Type</label>
                <div class="feed-type-grid">
                    <div class="feed-type-item" data-type="starter">Starter Feed</div>
                    <div class="feed-type-item" data-type="grower">Grower Feed</div>
                    <div class="feed-type-item" data-type="finisher">Finisher Feed</div>
                    <div class="feed-type-item" data-type="layer">Layer Mash</div>
                    <div class="feed-type-item" data-type="dairy">Dairy Meal</div>
                    <div class="feed-type-item" data-type="custom">Custom Mix</div>
                </div>
            </div>
            
            <div class="form-group">
                <label for="feed-quantity">Quantity (kg)</label>
                <input type="number" id="feed-quantity" step="0.1" placeholder="Enter quantity in kilograms">
            </div>
            
            <div class="form-group">
                <label for="feed-cost">Cost per kg ($)</label>
                <input type="number" id="feed-cost" step="0.01" placeholder="Cost per kilogram">
            </div>
            
            <div class="form-group">
                <label for="number-animals">Number of Animals</label>
                <input type="number" id="number-animals" placeholder="Number of animals fed">
            </div>
            
            <div class="form-group">
                <label for="feeding-time">Feeding Time</label>
                <select id="feeding-time">
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="full-day">Full Day</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="feed-notes">Notes</label>
                <textarea id="feed-notes" rows="3" placeholder="Any additional notes about the feeding"></textarea>
            </div>
            
            <div class="nutrient-breakdown">
                <h4>Estimated Nutrient Breakdown</h4>
                <div class="nutrient-row">
                    <span class="nutrient-label">Crude Protein:</span>
                    <span class="nutrient-value" id="protein-value">--%</span>
                </div>
                <div class="nutrient-row">
                    <span class="nutrient-label">Crude Fiber:</span>
                    <span class="nutrient-value" id="fiber-value">--%</span>
                </div>
                <div class="nutrient-row">
                    <span class="nutrient-label">Calcium:</span>
                    <span class="nutrient-value" id="calcium-value">--%</span>
                </div>
                <div class="nutrient-row">
                    <span class="nutrient-label">Phosphorus:</span>
                    <span class="nutrient-value" id="phosphorus-value">--%</span>
                </div>
            </div>
            
            <button class="btn" id="save-feed-record">Save Feed Record</button>
            
            <div class="feed-schedule">
                <h3>Recent Feeding Schedule</h3>
                <div id="recent-feeding">
                    <p>No recent feeding records</p>
                </div>
            </div>
            
            <h3>Feed History</h3>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Animal Type</th>
                        <th>Feed Type</th>
                        <th>Quantity (kg)</th>
                        <th>Cost</th>
                        <th>Animals Fed</th>
                        <th>Time</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="feed-history">
                    <!-- Feed records will be added here dynamically -->
                </tbody>
            </table>
        </div>
    `,
    
    sidebar: `
        <h3>Quick Actions</h3>
        <ul>
            <li><a href="#" class="sidebar-link" data-target="feed-records">Add Feed Record</a></li>
            <li><a href="#" class="sidebar-link" data-target="inventory-check">Check Feed Inventory</a></li>
            <li><a href="#" class="sidebar-link" data-target="production">Animal Production</a></li>
        </ul>
        
        <h3>Feed Types</h3>
        <div class="production-veins">
            <div class="production-item" data-type="starter">Starter</div>
            <div class="production-item" data-type="grower">Grower</div>
            <div class="production-item" data-type="finisher">Finisher</div>
            <div class="production-item" data-type="layer">Layer</div>
        </div>
        
        <div class="running-total">
            Monthly Feed Cost: $<span id="monthly-feed-cost">0.00</span>
        </div>
    `,
    
    initialize: function() {
        this.loadData();
        this.renderFeedHistory();
        this.updateMonthlyCost();
        this.attachEventListeners();
    },
    
    loadData: function() {
        // Data is loaded by core module
    },
    
    attachEventListeners: function() {
        // Feed type selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('feed-type-item')) {
                this.updateNutrientBreakdown(e.target.getAttribute('data-type'));
            }
        });
        
        // Save feed record
        const saveBtn = FarmModules.safeQuerySelector('#save-feed-record');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveFeedRecord());
        }
        
        // Auto-update nutrient breakdown when feed type changes
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('feed-type-item')) {
                this.updateNutrientBreakdown(e.target.getAttribute('data-type'));
            }
        });
    },
    
    updateNutrientBreakdown: function(feedType) {
        const nutrientValues = {
            starter: { protein: '20-24%', fiber: '3-5%', calcium: '1.0%', phosphorus: '0.45%' },
            grower: { protein: '18-20%', fiber: '4-6%', calcium: '0.9%', phosphorus: '0.40%' },
            finisher: { protein: '16-18%', fiber: '4-6%', calcium: '0.8%', phosphorus: '0.35%' },
            layer: { protein: '16-18%', fiber: '4-6%', calcium: '3.5-4.0%', phosphorus: '0.45%' },
            dairy: { protein: '16-18%', fiber: '6-8%', calcium: '0.8%', phosphorus: '0.40%' },
            custom: { protein: 'Variable', fiber: 'Variable', calcium: 'Variable', phosphorus: 'Variable' }
        };
        
        const nutrients = nutrientValues[feedType] || nutrientValues.custom;
        
        FarmModules.safeQuerySelector('#protein-value').textContent = nutrients.protein;
        FarmModules.safeQuerySelector('#fiber-value').textContent = nutrients.fiber;
        FarmModules.safeQuerySelector('#calcium-value').textContent = nutrients.calcium;
        FarmModules.safeQuerySelector('#phosphorus-value').textContent = nutrients.phosphorus;
    },
    
    saveFeedRecord: function() {
        const feedDate = FarmModules.safeQuerySelector('#feed-date').value;
        const animalType = FarmModules.safeQuerySelector('#animal-type').value;
        const feedTypeElement = FarmModules.safeQuerySelector('.feed-type-item.active');
        const feedType = feedTypeElement ? feedTypeElement.getAttribute('data-type') : '';
        const quantity = parseFloat(FarmModules.safeQuerySelector('#feed-quantity').value) || 0;
        const costPerKg = parseFloat(FarmModules.safeQuerySelector('#feed-cost').value) || 0;
        const numberOfAnimals = parseInt(FarmModules.safeQuerySelector('#number-animals').value) || 0;
        const feedingTime = FarmModules.safeQuerySelector('#feeding-time').value;
        const notes = FarmModules.safeQuerySelector('#feed-notes').value;
        
        if (!feedDate || !feedType) {
            alert('Please fill in all required fields');
            return;
        }
        
        const totalCost = quantity * costPerKg;
        
        const feedRecord = {
            id: FarmModules.generateId(),
            date: feedDate,
            animalType,
            feedType,
            quantity,
            costPerKg,
            totalCost,
            numberOfAnimals,
            feedingTime,
            notes
        };
        
        FarmModules.appData.feedRecords.push(feedRecord);
        this.renderFeedHistory();
        this.updateMonthlyCost();
        this.updateRecentFeeding();
        FarmModules.saveDataToStorage();
        
        // Clear form
        FarmModules.safeQuerySelector('#feed-date').value = '';
        FarmModules.safeQuerySelector('#feed-quantity').value = '';
        FarmModules.safeQuerySelector('#feed-cost').value = '';
        FarmModules.safeQuerySelector('#number-animals').value = '';
        FarmModules.safeQuerySelector('#feed-notes').value = '';
        FarmModules.safeQuerySelectorAll('.feed-type-item').forEach(item => item.classList.remove('active'));
        
        alert('Feed record saved successfully!');
    },
    
    renderFeedHistory: function() {
        const table = FarmModules.safeQuerySelector('#feed-history');
        if (!table) return;
        
        table.innerHTML = '';
        FarmModules.appData.feedRecords.forEach(record => {
            const row = table.insertRow();
            row.innerHTML = `
                <td>${record.date}</td>
                <td>${record.animalType}</td>
                <td>${record.feedType}</td>
                <td>${record.quantity} kg</td>
                <td>$${record.totalCost.toFixed(2)}</td>
                <td>${record.numberOfAnimals}</td>
                <td>${record.feedingTime}</td>
                <td class="action-buttons">
                    <button class="btn btn-warning edit-feed" data-id="${record.id}">Edit</button>
                    <button class="btn btn-danger delete-feed" data-id="${record.id}">Delete</button>
                </td>
            `;
        });
        
        // Add event listeners for edit and delete buttons
        FarmModules.safeQuerySelectorAll('.edit-feed').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.editFeedRecord(id);
            });
        });
        
        FarmModules.safeQuerySelectorAll('.delete-feed').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.deleteFeedRecord(id);
            });
        });
    },
    
    editFeedRecord: function(id) {
        const record = FarmModules.appData.feedRecords.find(r => r.id === id);
        if (!record) return;
        
        // Create edit form
        const editForm = document.createElement('div');
        editForm.className = 'edit-form';
        editForm.innerHTML = `
            <h4>Edit Feed Record</h4>
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="edit-feed-date" value="${record.date}">
            </div>
            <div class="form-group">
                <label>Animal Type</label>
                <select id="edit-animal-type">
                    <option value="broilers" ${record.animalType === 'broilers' ? 'selected' : ''}>Broilers</option>
                    <option value="layers" ${record.animalType === 'layers' ? 'selected' : ''}>Layers</option>
                    <option value="cattle" ${record.animalType === 'cattle' ? 'selected' : ''}>Cattle</option>
                    <option value="sheep" ${record.animalType === 'sheep' ? 'selected' : ''}>Sheep</option>
                    <option value="goats" ${record.animalType === 'goats' ? 'selected' : ''}>Goats</option>
                    <option value="pigs" ${record.animalType === 'pigs' ? 'selected' : ''}>Pigs</option>
                    <option value="other" ${record.animalType === 'other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Feed Type</label>
                <input type="text" id="edit-feed-type" value="${record.feedType}" readonly>
            </div>
            <div class="form-group">
                <label>Quantity (kg)</label>
                <input type="number" id="edit-feed-quantity" step="0.1" value="${record.quantity}">
            </div>
            <div class="form-group">
                <label>Cost per kg ($)</label>
                <input type="number" id="edit-feed-cost" step="0.01" value="${record.costPerKg}">
            </div>
            <div class="form-group">
                <label>Number of Animals</label>
                <input type="number" id="edit-number-animals" value="${record.numberOfAnimals}">
            </div>
            <div class="form-group">
                <label>Feeding Time</label>
                <select id="edit-feeding-time">
                    <option value="morning" ${record.feedingTime === 'morning' ? 'selected' : ''}>Morning</option>
                    <option value="afternoon" ${record.feedingTime === 'afternoon' ? 'selected' : ''}>Afternoon</option>
                    <option value="evening" ${record.feedingTime === 'evening' ? 'selected' : ''}>Evening</option>
                    <option value="full-day" ${record.feedingTime === 'full-day' ? 'selected' : ''}>Full Day</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea id="edit-feed-notes" rows="3">${record.notes}</textarea>
            </div>
            <button class="btn btn-info update-feed" data-id="${id}">Update</button>
            <button class="btn btn-danger cancel-edit">Cancel</button>
        `;
        
        // Find the record row and insert edit form after it
        const recordRow = FarmModules.safeQuerySelector(`.edit-feed[data-id="${id}"]`).closest('tr');
        recordRow.parentNode.insertBefore(editForm, recordRow.nextSibling);
        
        // Add event listeners
        FarmModules.safeQuerySelector('.update-feed').addEventListener('click', (e) => {
            const updatedRecord = {
                ...record,
                date: FarmModules.safeQuerySelector('#edit-feed-date').value,
                animalType: FarmModules.safeQuerySelector('#edit-animal-type').value,
                quantity: parseFloat(FarmModules.safeQuerySelector('#edit-feed-quantity').value) || 0,
                costPerKg: parseFloat(FarmModules.safeQuerySelector('#edit-feed-cost').value) || 0,
                numberOfAnimals: parseInt(FarmModules.safeQuerySelector('#edit-number-animals').value) || 0,
                feedingTime: FarmModules.safeQuerySelector('#edit-feeding-time').value,
                notes: FarmModules.safeQuerySelector('#edit-feed-notes').value
            };
            
            updatedRecord.totalCost = updatedRecord.quantity * updatedRecord.costPerKg;
            
            const index = FarmModules.appData.feedRecords.findIndex(r => r.id === id);
            FarmModules.appData.feedRecords[index] = updatedRecord;
            this.renderFeedHistory();
            this.updateMonthlyCost();
            FarmModules.saveDataToStorage();
        });
        
        FarmModules.safeQuerySelector('.cancel-edit').addEventListener('click', () => {
            editForm.remove();
        });
    },
    
    deleteFeedRecord: function(id) {
        if (confirm('Are you sure you want to delete this feed record?')) {
            FarmModules.appData.feedRecords = FarmModules.appData.feedRecords.filter(r => r.id !== id);
            this.renderFeedHistory();
            this.updateMonthlyCost();
            FarmModules.saveDataToStorage();
        }
    },
    
    updateMonthlyCost: function() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const monthlyCost = FarmModules.appData.feedRecords
            .filter(record => {
                const recordDate = new Date(record.date);
                return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
            })
            .reduce((sum, record) => sum + record.totalCost, 0);
        
        const monthlyCostElement = FarmModules.safeQuerySelector('#monthly-feed-cost');
        if (monthlyCostElement) {
            monthlyCostElement.textContent = monthlyCost.toFixed(2);
        }
    },
    
    updateRecentFeeding: function() {
        const recentElement = FarmModules.safeQuerySelector('#recent-feeding');
        if (!recentElement) return;
        
        const recentRecords = FarmModules.appData.feedRecords
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        if (recentRecords.length === 0) {
            recentElement.innerHTML = '<p>No
