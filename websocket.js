// Initializing WebSocket connection
const room = new WebsimSocket();

// Handle connection events
room.onmessage = (event) => {
  const data = event.data;
  switch (data.type) {
    case "connected":
      console.log(`Client ${data.clientId}, ${data.username} connected`);
      break;
    case "disconnected":
      console.log(`Client ${data.clientId}, ${data.username} disconnected`);
      break;
    case "slide_viewed":
      // Handle when another user views a slide
      console.log(`${data.username} is viewing slide ${data.slideIndex} of slideshow ${data.slideshowId}`);
      break;
    default:
      console.log("Received event:", data);
  }
};

// Notify others when a slide is being viewed
function notifySlideViewed(slideshowId, slideIndex) {
  room.send({
    type: "slide_viewed",
    slideshowId: slideshowId,
    slideIndex: slideIndex
  });
}

// Get all slideshows
function getAllSlideshows() {
  return room.collection('slideshow').getList();
}

// Get a specific slideshow
function getSlideshow(id) {
  return room.collection('slideshow').filter({ id }).getList()[0];
}

// Subscribe to slideshows
function subscribeToSlideshows(callback) {
  return room.collection('slideshow').subscribe(callback);
}

// Create a new slideshow
async function createSlideshow(title, theme, numSlides, slides) {
  return await room.collection('slideshow').create({
    title,
    theme,
    numSlides,
    slides,
    created_at: new Date().toISOString()
  });
}

// Update a slideshow
async function updateSlideshow(id, data) {
  return await room.collection('slideshow').update(id, data);
}

// Delete a slideshow
async function deleteSlideshow(id) {
  return await room.collection('slideshow').delete(id);
}

