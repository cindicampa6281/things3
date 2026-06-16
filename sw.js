self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const title = data.title || 'think3';
      const options = {
        body: data.body,
        icon: '/favicon.ico', // fallback
        badge: '/favicon.ico',
        data: {
          taskId: data.task_id,
          sound: data.sound
        },
        // We can request vibration
        vibrate: [100, 50, 100],
        tag: 'think3-reminder-' + data.task_id,
        renotify: true
      };

      event.waitUntil(
        self.registration.showNotification(title, options).then(() => {
          // Play custom sound if specified (in some clients, we can do it by sending postMessage to active client window, or using Audio API if window is active. Browsers do not support arbitrary mp3 sounds inside background push notification directly, but they support custom channel/sounds on some platforms, or we can play it via the client page).
        })
      );
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Focus if window already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.indexOf(location.origin) !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
