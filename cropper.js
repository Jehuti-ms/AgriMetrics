// cropper.js - Complete Cropper Controls
console.log('📷 Loading cropper.js...');

// ==================== CROPPER CONTROLS ====================
let cropper = null;
let cropCallback = null;
let currentImageFile = null;

// Initialize cropper when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📷 Cropper module ready');
});

// Open cropper with image
window.openCropper = function(imageUrl, callback, fileName = 'cropped-image.jpg') {
    console.log('📷 Opening cropper...');
    
    const modal = document.getElementById('cropper-modal');
    const img = document.getElementById('cropper-image');
    
    if (!modal || !img) {
        console.error('❌ Cropper modal elements not found');
        return;
    }
    
    // Store callback
    cropCallback = callback;
    
    // Set image source
    img.src = imageUrl;
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Initialize cropper after image is loaded
    img.onload = function() {
        if (window.cropperInstance) {
            window.cropperInstance.destroy();
        }
        
        window.cropperInstance = new Cropper(img, {
            aspectRatio: NaN, // Free aspect ratio by default
            viewMode: 1,
            dragMode: 'crop',
            autoCropArea: 0.8,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
            background: true,
            modal: true,
            movable: true,
            scalable: true,
            zoomable: true,
            rotatable: true,
            minCropBoxWidth: 50,
            minCropBoxHeight: 50,
            ready: function() {
                console.log('✅ Cropper ready');
                
                // Make sure crop box is visible
                const cropBox = document.querySelector('.cropper-crop-box');
                if (cropBox) {
                    cropBox.style.outline = '2px solid #4CAF50';
                }
            }
        });
    };
    
    // Handle image load error
    img.onerror = function() {
        console.error('❌ Failed to load image');
        alert('Failed to load image');
        closeCropper();
    };
};

// Close cropper
window.closeCropper = function() {
    console.log('📷 Closing cropper');
    
    const modal = document.getElementById('cropper-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    if (window.cropperInstance) {
        window.cropperInstance.destroy();
        window.cropperInstance = null;
    }
    
    cropCallback = null;
    currentImageFile = null;
};

// Rotate image
window.rotateCropper = function(degrees) {
    if (window.cropperInstance) {
        window.cropperInstance.rotate(degrees);
    }
};

// Scale image (flip)
window.scaleCropper = function(direction) {
    if (!window.cropperInstance) return;
    
    const data = window.cropperInstance.getData();
    
    if (direction === 'horizontal') {
        // Flip horizontal
        window.cropperInstance.scaleX(-(data.scaleX || 1));
    } else if (direction === 'vertical') {
        // Flip vertical
        window.cropperInstance.scaleY(-(data.scaleY || 1));
    }
};

// Set aspect ratio
window.setAspectRatio = function(ratio) {
    if (window.cropperInstance) {
        if (ratio === 'free') {
            window.cropperInstance.setAspectRatio(NaN);
        } else {
            window.cropperInstance.setAspectRatio(parseFloat(ratio));
        }
    }
};

// Zoom in
window.zoomIn = function() {
    if (window.cropperInstance) {
        window.cropperInstance.zoom(0.1);
    }
};

// Zoom out
window.zoomOut = function() {
    if (window.cropperInstance) {
        window.cropperInstance.zoom(-0.1);
    }
};

// Reset cropper
window.resetCropper = function() {
    if (window.cropperInstance) {
        window.cropperInstance.reset();
    }
};

// Crop and save
window.cropAndSave = function() {
    if (!window.cropperInstance || !cropCallback) {
        console.error('❌ No cropper instance or callback');
        return;
    }
    
    console.log('📷 Cropping and saving...');
    
    // Get cropped canvas
    const canvas = window.cropperInstance.getCroppedCanvas({
        width: 800,
        height: 800,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });
    
    // Convert to blob
    canvas.toBlob(function(blob) {
        // Create file from blob
        const fileName = currentImageFile ? currentImageFile.name : 'cropped-image.jpg';
        const file = new File([blob], fileName, { 
            type: 'image/jpeg',
            lastModified: Date.now()
        });
        
        // Call callback with cropped file
        if (cropCallback) {
            cropCallback(file);
        }
        
        // Close modal
        closeCropper();
    }, 'image/jpeg', 0.92);
};

// Handle file input for cropping
window.initCropperFromFileInput = function(fileInputId, callback) {
    const input = document.getElementById(fileInputId);
    if (!input) return;
    
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        currentImageFile = file;
        
        const reader = new FileReader();
        reader.onload = function(readerEvent) {
            openCropper(readerEvent.target.result, callback, file.name);
        };
        reader.readAsDataURL(file);
    });
};

// Handle paste event for images
window.initCropperFromPaste = function(callback) {
    document.addEventListener('paste', function(e) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                
                currentImageFile = blob;
                
                reader.onload = function(readerEvent) {
                    openCropper(readerEvent.target.result, callback, 'pasted-image.jpg');
                };
                reader.readAsDataURL(blob);
                
                break;
            }
        }
    });
};

console.log('✅ Cropper.js loaded successfully');
