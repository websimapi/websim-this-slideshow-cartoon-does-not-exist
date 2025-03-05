const { useState, useEffect, useMemo, useCallback } = React;
const { createRoot } = ReactDOM;

// Main App Component
function App() {
  const [view, setView] = useState('gallery'); // 'gallery' or 'create'
  const [selectedSlideshow, setSelectedSlideshow] = useState(null);
  
  return (
    <div className="container">
      <header>
        <h1>This Slideshow Cartoon Does Not Exist</h1>
        <p>Generate unique cartoon slideshows that have never existed before!</p>
        <nav>
          <button onClick={() => setView('gallery')}>Gallery</button>
          <button onClick={() => setView('create')}>Create New</button>
        </nav>
      </header>
      
      {view === 'gallery' && <Gallery setSelectedSlideshow={setSelectedSlideshow} />}
      {view === 'create' && <SlideshowCreator />}
      {selectedSlideshow && (
        <SlideshowViewer 
          slideshow={selectedSlideshow} 
          onClose={() => setSelectedSlideshow(null)} 
        />
      )}
    </div>
  );
}

// Gallery Component to display all slideshows
function Gallery({ setSelectedSlideshow }) {
  const [slideshows, setSlideshows] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = subscribeToSlideshows((data) => {
      setSlideshows(data);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  if (loading) {
    return (
      <div className="loading-indicator">
        <div className="spinner"></div>
        <p>Loading slideshows...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2>Cartoon Gallery</h2>
      {slideshows.length === 0 ? (
        <p>No slideshows yet. Be the first to create one!</p>
      ) : (
        <div className="gallery">
          {slideshows.map(slideshow => (
            <SlideshowCard 
              key={slideshow.id} 
              slideshow={slideshow} 
              onClick={() => setSelectedSlideshow(slideshow)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Slideshow Card Component
function SlideshowCard({ slideshow, onClick }) {
  const firstSlide = slideshow.slides[0];
  
  return (
    <div className="slideshow" onClick={onClick}>
      <div className="slideshow-header">
        <h3>{slideshow.title}</h3>
        <div className="slideshow-author">By {slideshow.username}</div>
      </div>
      <div className="slideshow-content">
        {firstSlide && (
          <div className="slide">
            <img 
              src={firstSlide.imageUrl} 
              alt={firstSlide.caption} 
              className="slide-image" 
            />
            <div className="slide-text">{firstSlide.caption}</div>
          </div>
        )}
        <div className="slideshow-info">
          <p>{slideshow.numSlides} slides • Theme: {slideshow.theme}</p>
        </div>
      </div>
    </div>
  );
}

// Slideshow Viewer Component
function SlideshowViewer({ slideshow, onClose }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const currentSlide = slideshow.slides[currentSlideIndex];
  
  const goToNextSlide = () => {
    if (currentSlideIndex < slideshow.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
      notifySlideViewed(slideshow.id, currentSlideIndex + 1);
    }
  };
  
  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      notifySlideViewed(slideshow.id, currentSlideIndex - 1);
    }
  };
  
  useEffect(() => {
    notifySlideViewed(slideshow.id, currentSlideIndex);
  }, [slideshow.id, currentSlideIndex]);
  
  return (
    <div className="slideshow-viewer-overlay">
      <div className="slideshow-viewer">
        <div className="slideshow-viewer-header">
          <h2>{slideshow.title}</h2>
          <button onClick={onClose}>Close</button>
        </div>
        
        <div className="slideshow-viewer-content">
          {currentSlide && (
            <div className="slide-full">
              <img 
                src={currentSlide.imageUrl} 
                alt={currentSlide.caption} 
                className="slide-image-full" 
              />
              <div className="slide-caption">{currentSlide.caption}</div>
              <div className="slide-description">{currentSlide.description}</div>
            </div>
          )}
        </div>
        
        <div className="slideshow-viewer-controls">
          <button 
            onClick={goToPrevSlide} 
            disabled={currentSlideIndex === 0}
          >
            Previous
          </button>
          <div className="slide-indicator">
            Slide {currentSlideIndex + 1} of {slideshow.slides.length}
          </div>
          <button 
            onClick={goToNextSlide} 
            disabled={currentSlideIndex === slideshow.slides.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// Slideshow Creator Component
function SlideshowCreator() {
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [numSlides, setNumSlides] = useState(3);
  const [cartoonStyle, setCartoonStyle] = useState('Modern cartoon');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedSlideshow, setGeneratedSlideshow] = useState(null);
  const [progress, setProgress] = useState(0);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setProgress(5);
    
    try {
      // Step 1: Generate the story
      setProgress(10);
      const storyData = await generateStoryPrompt(theme, numSlides);
      setProgress(30);
      
      // Step 2: Generate images for each slide
      const slides = [];
      for (let i = 0; i < storyData.slides.length; i++) {
        const slide = storyData.slides[i];
        setProgress(30 + (i + 1) * (60 / storyData.slides.length));
        
        // Generate image for this slide
        const imageUrl = await generateCartoonImage(slide.description, cartoonStyle);
        
        slides.push({
          description: slide.description,
          caption: slide.caption,
          imageUrl: imageUrl
        });
      }
      
      setProgress(90);
      
      // Step 3: Save the slideshow to the database
      const savedSlideshow = await createSlideshow(
        storyData.title || title,
        theme,
        slides.length,
        slides
      );
      
      setProgress(100);
      setGeneratedSlideshow(savedSlideshow);
    } catch (err) {
      console.error("Error creating slideshow:", err);
      setError("Failed to create slideshow: " + err.message);
    } finally {
      setGenerating(false);
    }
  };
  
  if (generatedSlideshow) {
    return (
      <div className="success-message">
        <h2>Slideshow Created!</h2>
        <p>Your slideshow "{generatedSlideshow.title}" has been created successfully.</p>
        <SlideshowCard slideshow={generatedSlideshow} onClick={() => {}} />
        <button onClick={() => setGeneratedSlideshow(null)}>Create Another</button>
      </div>
    );
  }
  
  return (
    <div className="slideshow-creator">
      <h2>Create a New Cartoon Slideshow</h2>
      
      {generating ? (
        <div className="generation-progress">
          <h3>Generating Your Cartoon Slideshow...</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">{progress}% complete</p>
          
          {progress < 30 && <p>Creating your story...</p>}
          {progress >= 30 && progress < 90 && <p>Generating cartoon images...</p>}
          {progress >= 90 && <p>Finalizing your slideshow...</p>}
        </div>
      ) : (
        <form className="generator-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Slideshow Title (optional)</label>
            <input 
              type="text" 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Leave blank for auto-generated title"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="theme">Theme or Topic (required)</label>
            <input 
              type="text" 
              id="theme" 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)} 
              placeholder="e.g., Space Adventure, Underwater World, Jungle Safari"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="numSlides">Number of Slides</label>
            <select 
              id="numSlides" 
              value={numSlides} 
              onChange={(e) => setNumSlides(parseInt(e.target.value))}
            >
              <option value="3">3 Slides</option>
              <option value="4">4 Slides</option>
              <option value="5">5 Slides</option>
              <option value="6">6 Slides</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="cartoonStyle">Cartoon Style</label>
            <select 
              id="cartoonStyle" 
              value={cartoonStyle} 
              onChange={(e) => setCartoonStyle(e.target.value)}
            >
              <option value="Modern cartoon">Modern Cartoon</option>
              <option value="Classic Disney style">Classic Disney</option>
              <option value="Anime style">Anime</option>
              <option value="Comic book style">Comic Book</option>
              <option value="Pixar style 3D">Pixar-like 3D</option>
              <option value="Hand-drawn sketch">Hand-drawn Sketch</option>
              <option value="Watercolor illustration">Watercolor</option>
            </select>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={!theme || generating}>
            Generate Cartoon Slideshow
          </button>
        </form>
      )}
    </div>
  );
}

// Add some extra CSS to the page for elements not covered in the main CSS
const extraStyles = document.createElement('style');
extraStyles.textContent = `
  .slideshow-viewer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .slideshow-viewer {
    background-color: white;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .slideshow-viewer-header {
    padding: 1rem;
    background-color: var(--primary);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .slideshow-viewer-content {
    padding: 1rem;
    overflow-y: auto;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .slide-full {
    width: 100%;
    text-align: center;
  }
  
  .slide-image-full {
    max-width: 100%;
    max-height: 60vh;
    object-fit: contain;
    margin-bottom: 1rem;
    border-radius: 4px;
  }
  
  .slide-caption {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  .slide-description {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 1rem;
  }
  
  .slideshow-viewer-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-top: 1px solid #eee;
  }
  
  .success-message {
    background-color: var(--surface);
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  .progress-bar {
    width: 100%;
    height: 20px;
    background-color: #eee;
    border-radius: 10px;
    margin: 1rem 0;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background-color: var(--primary);
    transition: width 0.3s ease;
  }
  
  .progress-text {
    font-size: 0.9rem;
    color: var(--primary);
    margin-bottom: 1rem;
  }
  
  .generation-progress {
    background-color: var(--surface);
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  nav {
    margin-top: 1rem;
  }
  
  nav button {
    margin: 0 0.5rem;
  }
  
  .error-message {
    color: var(--error);
    margin-bottom: 1rem;
    padding: 0.5rem;
    background-color: rgba(176, 0, 32, 0.1);
    border-radius: 4px;
  }
`;
document.head.appendChild(extraStyles);

// Render the app
const root = createRoot(document.getElementById('root'));
root.render(<App />);

