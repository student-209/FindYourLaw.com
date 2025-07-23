// feedback.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('feedbackForm');
    const stars = document.querySelectorAll('.star');
    let userFriendlinessRating = 0;

    // Handle star rating
    function handleStarRating() {
        stars.forEach(star => {
            star.addEventListener('click', function() {
                userFriendlinessRating = parseInt(this.dataset.value);
                updateStars();
            });
        });
    }

    // Update star display
    function updateStars() {
        stars.forEach(star => {
            const value = parseInt(star.dataset.value);
            if (value <= userFriendlinessRating) {
                star.classList.add('filled');
            } else {
                star.classList.remove('filled');
            }
        });
    }

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = {
            email: form.email.value,
            firstVisit: form.firstVisit.value,
            reason: form.reason.value,
            userFriendliness: userFriendlinessRating
        };

        console.log('Form Data:', formData);
        
        // Reset form
        form.reset();
        userFriendlinessRating = 0;
        updateStars();
        
        // You would typically send the data to a server here
        alert('Thank you for your feedback!');
    });

    // Initialize star rating functionality
    handleStarRating();
});