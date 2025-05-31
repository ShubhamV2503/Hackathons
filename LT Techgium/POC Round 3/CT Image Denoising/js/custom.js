document.getElementById('imageUpload').addEventListener('change', function (event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const popupImage = document.getElementById('popupImage');
            popupImage.src = e.target.result;

            // Show popup
            document.getElementById('imagePopup').classList.add('active');
        };

        reader.readAsDataURL(file);
    }
});

// Close popup when clicking the close button
document.getElementById('closePopup').addEventListener('click', function () {
    document.getElementById('imagePopup').classList.remove('active');
});

// Close popup when clicking outside the popup-content
document.getElementById('imagePopup').addEventListener('click', function (event) {
    if (event.target === this) {
        this.classList.remove('active');
    }
});

// Placeholder function for the "Denoise Image" button
document.getElementById('denoiseImage').addEventListener('click', function () {
    alert("Denoise process started...");
});
