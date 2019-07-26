console.log('Loaded service worker!');

self.addEventListener('push', ev => {
  const data = ev.data.json();
  console.log('Got push', data);
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: window.location.protocol + '//' + window.location.hostname +':3000/img/logo.png'
  });
});
