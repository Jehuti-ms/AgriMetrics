// Basic modal
ModalManager.show({
    title: 'My Modal',
    content: '<p>Hello World!</p>',
    footer: '<button class="btn btn-primary">Close</button>'
});

// Form modal
ModalManager.createForm({
    title: 'Add Item',
    fields: [
        { name: 'name', type: 'text', label: 'Item Name', required: true },
        { name: 'price', type: 'number', label: 'Price', required: true },
        { name: 'category', type: 'select', label: 'Category', options: [
            { value: 'food', label: 'Food' },
            { value: 'supplies', label: 'Supplies' }
        ]}
    ],
    onSubmit: (data) => {
        console.log('Form submitted:', data);
    }
});

// Confirmation modal
ModalManager.confirm({
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    confirmText: 'Delete',
    danger: true
}).then(confirmed => {
    if (confirmed) {
        // Delete item
    }
});

// Alert modal
ModalManager.alert({
    title: 'Information',
    message: 'Operation completed successfully!'
});

// Loading modal
ModalManager.showLoading({ message: 'Processing...' });
// Later...
ModalManager.hideLoading();
