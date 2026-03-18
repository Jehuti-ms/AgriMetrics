// cropper.js - Complete Cropper Controls with Debugging
console.log('📷 Cropper.js loading...');
console.log('📷 Cropper library available:', typeof Cropper !== 'undefined');

// ==================== CROPPER CONTROLS ====================
let cropper = null;
let cropCallback = null;
let currentImageFile = null;

// Check DOM ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📷 DOM ready, checking cropper modal...');
    const modal = document.getElementById('cropper-modal');
    console.log('📷 Cropper modal found:', modal !== null);
    
    if (modal) {
        console.log('📷 Modal classes:', modal.className);
        console.log('📷 Modal HTML:', modal.outerHTML.substring(0, 200) + '...');
    } else {
        console.error('❌ Cropper modal NOT FOUND in DOM!');
        console.log('📷 Available modals:', document.querySelectorAll('[id*="modal"]').length);
    }
    
    // Check if cropper image exists
    const img = document.getElementById('cropper-image');
    console.log('📷 Cropper image found:', img !== null);
});

// Open cropper with image
window.openCropper = function(imageUrl, callback, fileName = 'cropped-image.jpg') {
    console.log('📷 openCropper called with:', { 
        imageUrl: imageUrl ? 'present (length: ' + imageUrl.length + ')' : 'missing', 
        callback: typeof callback,
        fileName: fileName 
    });
    
    const modal = document.getElementById('cropper-modal');
    const img = document.getElementById('cropper-image');
    
    console.log('📷 Modal element:', modal);
    console.log('📷 Image element:', img);
    
    if (!modal) {
        console.error('❌ Cropper modal not found in DOM!');
        console.log('📷 Searching for modal...');
        const allModals = document.querySelectorAll('.popout-modal, [id*="modal"]');
        console.log('📷 Found', allModals.length, 'modal elements:');
        allModals.forEach((m, i) => console.log(`  ${i}:`, m.id || 'unnamed', m.className));
        alert('Error: Cropper modal not found. Please check the HTML.');
        return;
    }
    
    if (!img) {
        console.error('❌ Cropper image element not found!');
        alert('Error: Cropper image element not found.');
        return;
    }
    
    // Store callback and file
    cropCallback = callback;
    currentImageFile = fileName;
    
    // Set image source
    console.log('📷 Setting image source...');
    img.src = imageUrl;
    
    // Show modal - remove hidden class
    console.log('📷 Removing hidden class from modal...');
    modal.classList.remove('hidden');
    console.log('📷 Modal should now be visible, classes:', modal.className);
    console.log('📷 Modal display style:', window.getComputedStyle(modal).display);
    
    // Initialize cropper after image is loaded
    img.onload = function() {
        console.log('📷 Image loaded successfully! Dimensions:', img.width, 'x', img.height);
        
        if (window.cropperInstance) {
            console.log('📷 Destroying existing cropper instance');
            window.cropperInstance.destroy();
            window.cropperInstance = null;
        }
        
        // Check if Cropper is available
        if (typeof Cropper === 'undefined') {
            console.error('❌ Cropper library not loaded!');
            alert('Error: Cropper library not loaded. Please check the script tags.');
            return;
        }
        
        console.log('📷 Initializing new Cropper instance...');
        
        try {
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
                background: false,
                modal: false,
                movable: true,
                scalable: true,
                zoomable: true,
                rotatable: true,
                minCropBoxWidth: 50,
                minCropBoxHeight: 50,
                ready: function() {
                    console.log('✅ Cropper ready! Crop box should be visible.');
                    
                    // Make sure crop box is visible
                    setTimeout(() => {
                        const cropBox = document.querySelector('.cropper-crop-box');
                        if (cropBox) {
                            console.log('📷 Crop box found, styling it...');
                            cropBox.style.outline = '2px solid #4CAF50';
                            cropBox.style.outlineOffset = '2px';
                        } else {
                            console.warn('⚠️ Crop box not found yet');
                        }
                        
                        // Log all cropper elements
                        const cropperElements = document.querySelectorAll('[class^="cropper-"]');
                        console.log('📷 Cropper elements found:', cropperElements.length);
                    }, 100);
                },
                crop: function(event) {
                    // Optional: log crop events
                    // console.log('📷 Crop event:', event.detail);
                }
            });
            console.log('✅ Cropper instance created successfully');
        } catch (error) {
            console.error('❌ Error creating cropper:', error);
            console.error('Error details:', error.message);
            alert('Error creating cropper: ' + error.message);
        }
    };
    
    img.onerror = function(e) {
        console.error('❌ Failed to load image', e);
        console.error('Image URL:', imageUrl.substring(0, 100) + '...');
        alert('Failed to load image. Please try another image.');
    };
};

// Close cropper
window.closeCropper = function() {
    console.log('📷 closeCropper called');
    
    const modal = document.getElementById('cropper-modal');
    if (modal) {
        console.log('📷 Adding hidden class to modal');
        modal.classList.add('hidden');
        console.log('📷 Modal classes after hide:', modal.className);
    } else {
        console.warn('📷 Modal not found when trying to close');
    }
    
    if (window.cropperInstance) {
        console.log('📷 Destroying cropper instance');
        window.cropperInstance.destroy();
        window.cropperInstance = null;
    } else {
        console.log('📷 No cropper instance to destroy');
    }
    
    cropCallback = null;
    currentImageFile = null;
    console.log('📷 Cropper closed');
};

// Rotate image
window.rotateCropper = function(degrees) {
    console.log('📷 rotateCropper called with degrees:', degrees);
    if (window.cropperInstance) {
        window.cropperInstance.rotate(degrees);
        console.log('📷 Rotated', degrees, 'degrees');
    } else {
        console.warn('⚠️ No cropper instance to rotate');
    }
};

// Scale image (flip)
window.scaleCropper = function(direction) {
    console.log('📷 scaleCropper called with direction:', direction);
    if (!window.cropperInstance) {
        console.warn('⚠️ No cropper instance to scale');
        return;
    }
    
    const data = window.cropperInstance.getData();
    console.log('📷 Current scale data:', data.scaleX, data.scaleY);
    
    if (direction === 'horizontal') {
        // Flip horizontal
        window.cropperInstance.scaleX(-(data.scaleX || 1));
        console.log('📷 Flipped horizontal');
    } else if (direction === 'vertical') {
        // Flip vertical
        window.cropperInstance.scaleY(-(data.scaleY || 1));
        console.log('📷 Flipped vertical');
    }
};

// Set aspect ratio
window.setAspectRatio = function(ratio) {
    console.log('📷 setAspectRatio called with ratio:', ratio);
    if (window.cropperInstance) {
        if (ratio === 'free') {
            window.cropperInstance.setAspectRatio(NaN);
            console.log('📷 Set aspect ratio to free');
        } else {
            window.cropperInstance.setAspectRatio(parseFloat(ratio));
            console.log('📷 Set aspect ratio to', ratio);
        }
    } else {
        console.warn('⚠️ No cropper instance to set aspect ratio');
    }
};

// Zoom in
window.zoomIn = function() {
    console.log('📷 zoomIn called');
    if (window.cropperInstance) {
        window.cropperInstance.zoom(0.1);
        console.log('📷 Zoomed in');
    } else {
        console.warn('⚠️ No cropper instance to zoom');
    }
};

// Zoom out
window.zoomOut = function() {
    console.log('📷 zoomOut called');
    if (window.cropperInstance) {
        window.cropperInstance.zoom(-0.1);
        console.log('📷 Zoomed out');
    } else {
        console.warn('⚠️ No cropper instance to zoom');
    }
};

// Reset cropper
window.resetCropper = function() {
    console.log('📷 resetCropper called');
    if (window.cropperInstance) {
        window.cropperInstance.reset();
        console.log('📷 Cropper reset');
    } else {
        console.warn('⚠️ No cropper instance to reset');
    }
};

// Crop and save
window.cropAndSave = function() {
    console.log('📷 cropAndSave called - START');
    console.log('📷 cropperInstance exists:', !!window.cropperInstance);
    console.log('📷 cropCallback exists:', !!cropCallback);
    
    if (!window.cropperInstance) {
        console.error('❌ No cropper instance to crop');
        alert('No image to crop');
        return;
    }
    
    if (!cropCallback) {
        console.error('❌ No callback function for crop');
        alert('Error: No callback function');
        return;
    }
    
    console.log('📷 Getting cropped canvas...');
    
    try {
        // Get cropped canvas
        const canvas = window.cropperInstance.getCroppedCanvas({
            width: 800,
            height: 800,
            fillColor: '#fff',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        
        console.log('📷 Canvas created, dimensions:', canvas.width, 'x', canvas.height);
        
        // Convert to blob
        canvas.toBlob(function(blob) {
            console.log('📷 Blob created, size:', blob ? blob.size : 'null', 'bytes');
            
            if (!blob) {
                console.error('❌ Failed to create blob');
                alert('Failed to create image blob');
                return;
            }
            
            // Create file from blob
            const fileName = typeof currentImageFile === 'string' ? currentImageFile : 'cropped-image.jpg';
            const file = new File([blob], fileName, { 
                type: 'image/jpeg',
                lastModified: Date.now()
            });
            
            console.log('📷 File created:', file.name, file.size, 'bytes');
            console.log('📷 Calling crop callback with file');
            
            // Call callback with cropped file
            if (cropCallback) {
                cropCallback(file);
                console.log('📷 Crop callback executed successfully');
                
                // Show success notification
                if (typeof showAgrimetricsNotification === 'function') {
                    showAgrimetricsNotification('Image cropped successfully!', 'success');
                }
            } else {
                console.error('❌ cropCallback is null when trying to call');
            }
            
            // Close modal
            closeCropper();
            
        }, 'image/jpeg', 0.92);
        
    } catch (error) {
        console.error('❌ Error during crop and save:', error);
        alert('Error cropping image: ' + error.message);
    }
};

// Handle paste event for images
window.initCropperFromPaste = function(callback) {
    console.log('📷 initCropperFromPaste called');
    
    document.addEventListener('paste', function(e) {
        console.log('📷 Paste event detected');
        const items = e.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                console.log('📷 Image found in clipboard');
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                
                currentImageFile = blob;
                
                reader.onload = function(readerEvent) {
                    console.log('📷 Clipboard image read complete');
                    openCropper(readerEvent.target.result, callback, 'pasted-image.jpg');
                };
                reader.readAsDataURL(blob);
                
                break;
            }
        }
    });
};

// Log when script is fully loaded
console.log('✅ Cropper.js loaded successfully with debugging');
console.log('📷 Functions available:', {
    openCropper: typeof window.openCropper === 'function',
    closeCropper: typeof window.closeCropper === 'function',
    cropAndSave: typeof window.cropAndSave === 'function',
    rotateCropper: typeof window.rotateCropper === 'function'
});

// ==================== CROPPER EVENT LISTENERS ====================
function setupCropperEventListeners() {
    console.log('📷 Setting up cropper event listeners');
    
    // Close button
    const closeBtn = document.getElementById('cropper-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', window.closeCropper);
    }
    
    // Rotate buttons
    const rotateLeft = document.getElementById('cropper-rotate-left');
    if (rotateLeft) {
        rotateLeft.addEventListener('click', () => window.rotateCropper(-90));
    }
    
    const rotateRight = document.getElementById('cropper-rotate-right');
    if (rotateRight) {
        rotateRight.addEventListener('click', () => window.rotateCropper(90));
    }
    
    // Flip buttons
    const flipHorizontal = document.getElementById('cropper-flip-horizontal');
    if (flipHorizontal) {
        flipHorizontal.addEventListener('click', () => window.scaleCropper('horizontal'));
    }
    
    const flipVertical = document.getElementById('cropper-flip-vertical');
    if (flipVertical) {
        flipVertical.addEventListener('click', () => window.scaleCropper('vertical'));
    }
    
    // Zoom buttons
    const zoomOut = document.getElementById('cropper-zoom-out');
    if (zoomOut) {
        zoomOut.addEventListener('click', window.zoomOut);
    }
    
    const zoomIn = document.getElementById('cropper-zoom-in');
    if (zoomIn) {
        zoomIn.addEventListener('click', window.zoomIn);
    }
    
    // Reset button
    const reset = document.getElementById('cropper-reset');
    if (reset) {
        reset.addEventListener('click', window.resetCropper);
    }
    
    // Aspect ratio buttons
    const ratio1_1 = document.getElementById('cropper-ratio-1-1');
    if (ratio1_1) {
        ratio1_1.addEventListener('click', () => window.setAspectRatio(1));
    }
    
    const ratio4_3 = document.getElementById('cropper-ratio-4-3');
    if (ratio4_3) {
        ratio4_3.addEventListener('click', () => window.setAspectRatio(4/3));
    }
    
    const ratio16_9 = document.getElementById('cropper-ratio-16-9');
    if (ratio16_9) {
        ratio16_9.addEventListener('click', () => window.setAspectRatio(16/9));
    }
    
    const ratioFree = document.getElementById('cropper-ratio-free');
    if (ratioFree) {
        ratioFree.addEventListener('click', () => window.setAspectRatio('free'));
    }
    
    // Cancel and Save buttons
    const cancelBtn = document.getElementById('cropper-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', window.closeCropper);
    }
    
    const saveBtn = document.getElementById('cropper-save');
    if (saveBtn) {
        saveBtn.addEventListener('click', window.cropAndSave);
    }
    
    console.log('📷 Cropper event listeners setup complete');
}

// Also update the DOMContentLoaded event to call the setup
document.addEventListener('DOMContentLoaded', function() {
    console.log('📷 DOM ready, checking cropper modal...');
    const modal = document.getElementById('cropper-modal');
    console.log('📷 Cropper modal found:', modal !== null);
    
    if (modal) {
        console.log('📷 Modal classes:', modal.className);
    }
    
    // Check if cropper image exists
    const img = document.getElementById('cropper-image');
    console.log('📷 Cropper image found:', img !== null);
    
    // Setup event listeners
    setupCropperEventListeners();
});

