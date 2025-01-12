let deferredPrompt;
const installNotification = document.getElementById('install-notification');
const installButton = document.getElementById('install-btn');

// Function to check if the user is on a mobile device
function isMobileDevice() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

// If the user is on a mobile device, show the install notification after 5 seconds
if (isMobileDevice()) {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (event) => {
    // Prevent the default installation prompt
    event.preventDefault();
    // Save the event to trigger later
    deferredPrompt = event;

    // Wait 5 seconds before showing the install notification
    setTimeout(() => {
      // Show the custom install notification with animation
      installNotification.style.top = '20px';

      // When the user clicks the install button, show the installation prompt
      installButton.addEventListener('click', () => {
        // Hide the notification
        installNotification.style.top = '-500px'; // Slide it out of view

        // Show the native install prompt
        deferredPrompt.prompt();

        // Wait for the user's response to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          } else {
            console.log('User dismissed the install prompt');
          }
          // Reset deferredPrompt
          deferredPrompt = null;
        });
      });

      // After 30 seconds, hide the notification automatically
      setTimeout(() => {
        installNotification.style.top = '-500px'; // Slide it out of view
      }, 4000); // 4 seconds
    }, 5000); // 5 seconds delay before showing the notification
  });
}
