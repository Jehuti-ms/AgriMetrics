// ==================== CROPPER CONTROLS ====================
let cropper = null;
let cropCallback = null;

// Open cropper with image
function openCropper(imageUrl, callback) {
    const modal = document.getElementById('cropper-modal');
    const img = document.getElementById('cropper-image');
    
    if (!modal || !img) return;
    
    // Store callback
    cropCallback = callback;
    
    // Set image source
    img.src = imageUrl;
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Initialize cropper after image is loaded
    img.onload = function() {
        if (cropper) {
            cropper.destroy();
        }
        
        cropper = new Cropper(img, {
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
            ready: function() {
                console.log('Cropper ready');
            }
        });
    };
}

// Close cropper
function closeCropper() {
    const modal = document.getElementById('cropper-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    
    cropCallback = null;
}

// Rotate image
function rotateCropper(degrees) {
    if (cropper) {
        cropper.rotate(degrees);
    }
}

// Scale image
function scaleCropper(direction) {
    if (cropper) {
        if (direction === -1) {
            // Flip horizontal
            cropper.scaleX(-cropper.getData().scaleX || -1);
        } else {
            // Flip vertical
            cropper.scaleY(-cropper.getData().scaleY || -1);
        }
    }
}

// Set aspect ratio
function setAspectRatio(ratio) {
    if (cropper) {
        cropper.setAspectRatio(ratio);
    }
}

// Crop and save
function cropAndSave() {
    if (!cropper || !cropCallback) return;
    
    // Get cropped canvas
    const canvas = cropper.getCroppedCanvas({
        width: 400,
        height: 400,
        fillColor: '#fff'
    });
    
    // Convert to blob
    canvas.toBlob(function(blob) {
        // Create file from blob
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        
        // Call callback with cropped file
        if (cropCallback) {
            cropCallback(file);
        }
        
        // Close modal
        closeCropper();
    }, 'image/jpeg', 0.9);
}

// Example usage in your upload system:
function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        openCropper(e.target.result, function(croppedFile) {
            // Do something with the cropped file
            console.log('Cropped file:', croppedFile);
            
            // Upload cropped file
            uploadCroppedImage(croppedFile);
        });
    };
    reader.readAsDataURL(file);
}
