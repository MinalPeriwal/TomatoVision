import { useState, useRef, useEffect } from 'react';
import { UploadCloud, Moon, Sun, Leaf, Camera, AlertCircle, CheckCircle2, HeartPulse, Activity, Sprout } from 'lucide-react';

const getTreatmentSuggestion = (label) => {
  const treatments = {
    'Tomato___Bacterial_spot': 'Apply copper-based fungicides. Remove and destroy infected leaves to prevent spread.',
    'Tomato___Early_blight': 'Apply a suitable fungicide. Ensure proper plant spacing for air circulation and avoid overhead watering.',
    'Tomato___Late_blight': 'Apply fungicide containing chlorothalonil. Remove infected plants immediately.',
    'Tomato___Leaf_Mold': 'Improve air circulation. Apply fungicides like chlorothalonil if severity increases.',
    'Tomato___Septoria_leaf_spot': 'Remove infected bottom leaves. Apply copper-based fungicides and rotate crops.',
    'Tomato___Spider_mites Two-spotted_spider_mite': 'Use insecticidal soap or neem oil. Mites thrive in hot, dry conditions so keep plants watered.',
    'Tomato___Target_Spot': 'Ensure good ventilation. Apply suitable fungicide and remove severely affected lower leaves.',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus': 'Control whitefly populations. Remove infected plants immediately to prevent spread.',
    'Tomato___Tomato_mosaic_virus': 'No cure exists. Remove and destroy infected plants. Disinfect tools before touching healthy plants.',
    'Tomato___healthy': 'Your plant looks healthy! Keep maintaining good watering and sunlight habits.'
  };
  
  for (const [key, value] of Object.entries(treatments)) {
    if (label && label === key) return value;
  }
  return 'Consult a local agricultural extension or plant nursery for specific treatment options for this condition.';
};
import './App.css';

function App() {
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('disease'); // 'disease' or 'growth'

  // Disease State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  // Growth State
  const [growthForm, setGrowthForm] = useState({
    temperature: 25,
    humidity: 60,
    sunlight: 8,
    soil: 'loamy',
    fertilizer: 'organic',
    watering: 4
  });
  const [isPredictingGrowth, setIsPredictingGrowth] = useState(false);
  const [growthResult, setGrowthResult] = useState(null);
  const [growthError, setGrowthError] = useState(null);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    if (!file.type.match('image.*')) {
      setError("Please select an image file (JPG, PNG).");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPrediction(null);
    setError(null);
  };

  const handlePredict = async () => {
    if (!selectedFile) return;
    setIsPredicting(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.label && data.confidence !== undefined) {
        const result = { label: data.label, confidence: data.confidence };
        setPrediction(result);
        setHistory(prev => [{ file: selectedFile, previewUrl, prediction: result }, ...prev].slice(0, 3));
      } else {
        const result = { label: data.prediction || JSON.stringify(data), confidence: null };
        setPrediction(result);
        setHistory(prev => [{ file: selectedFile, previewUrl, prediction: result }, ...prev].slice(0, 3));
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to the backend. Is it running?');
    } finally {
      setIsPredicting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const restoreHistory = (item) => {
    setSelectedFile(item.file);
    setPreviewUrl(item.previewUrl);
    setPrediction(item.prediction);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGrowthChange = (e) => {
    setGrowthForm({ ...growthForm, [e.target.name]: e.target.value });
  };

  const submitGrowthPredict = async () => {
    setIsPredictingGrowth(true);
    setGrowthError(null);
    setGrowthResult(null);
    
    try {
      const response = await fetch('http://localhost:8000/growth-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature: parseFloat(growthForm.temperature),
          humidity: parseFloat(growthForm.humidity),
          sunlight: parseFloat(growthForm.sunlight),
          soil: growthForm.soil,
          fertilizer: growthForm.fertilizer,
          watering: parseInt(growthForm.watering)
        })
      });
      
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Prediction failed');
      setGrowthResult(data);
    } catch (err) {
      setGrowthError(err.message || 'Failed to connect to backend.');
    } finally {
      setIsPredictingGrowth(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-container flex items-center gap-2">
          <span className="text-4xl">🍅</span>
          <h1 className="title">TomatoVision</h1>
        </div>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
        </button>
      </header>

      {/* Background blobs for visual depth */}
      <div className="blob-container">
        <div className="blob-1"></div>
        <div className="blob-2"></div>
      </div>

      <main className="main-content">
        <div className="hero-text">
          <h2>Smart Tomato Analyzer</h2>
          <p>Detect Diseases. Predict Growth. Protect Crops.</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'disease' ? 'active' : ''}`}
            onClick={() => setActiveTab('disease')}
          >
            <Activity size={20} /> Disease Diagnosis
          </button>
          <button 
            className={`tab-btn ${activeTab === 'growth' ? 'active' : ''}`}
            onClick={() => setActiveTab('growth')}
          >
            <Sprout size={20} /> Growth Predictor
          </button>
        </div>

        {activeTab === 'disease' && (
          <>
            <div className="card fade-in">
              {!previewUrl ? (
                <div 
                  className={`dropzone ${isDragging ? 'active' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <div className="dropzone-content">
                    <UploadCloud className="upload-icon" />
                    <h3>Upload Tomato Leaf Image</h3>
                    <p>Drag and drop or click to browse</p>
                    <p style={{fontSize: '0.8rem', marginTop: '0.5rem'}}>Supports JPG, JPEG, PNG</p>
                  </div>
                  <input 
                    type="file" 
                    className="file-input" 
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept="image/*"
                  />
                </div>
              ) : (
                <div className="preview-container flex-layout">
                  <div className="image-section">
                    <img src={previewUrl} alt="Selected tomato leaf" className="image-preview" />
                  </div>
                  
                  <div className="result-section">
                    {!prediction && !error && (
                      <button 
                        className="predict-btn" 
                        onClick={handlePredict}
                        disabled={isPredicting}
                      >
                        {isPredicting ? (
                          <>
                            <div className="loading-spinner">
                              <Leaf />
                            </div>
                            Analyzing image...
                          </>
                        ) : (
                          <>
                            <Camera size={20} />
                            Diagnose Plant
                          </>
                        )}
                      </button>
                    )}

                    {error && (
                      <div className="result-container error">
                        <div className="result-title">Error</div>
                        <div className="result-value" style={{fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          <AlertCircle size={20} /> {error}
                        </div>
                      </div>
                    )}

                    {prediction && (
                      <>
                        <div className="result-container">
                          <div className="result-title">Diagnosis Result</div>
                          <div className="result-value" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap'}}>
                            <CheckCircle2 size={24} color="var(--secondary-color)" style={{flexShrink: 0}} />
                            <span>{prediction.label}</span>
                          </div>
                          
                          {prediction.confidence !== null && (
                            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-color)', opacity: 0.8 }}>
                                <span>Confidence</span>
                                <span>{(prediction.confidence * 100).toFixed(1)}%</span>
                              </div>
                              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--card-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div 
                                  style={{ 
                                    height: '100%', 
                                    width: `${(prediction.confidence * 100)}%`, 
                                    background: 'linear-gradient(90deg, var(--secondary-color), #22c55e)', 
                                    borderRadius: '4px',
                                    transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)'
                                  }} 
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="result-container" style={{ borderLeftColor: 'var(--primary-color)', backgroundColor: 'var(--glass-bg)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                          <div className="result-title" style={{ color: 'var(--primary-color)' }}>
                            Treatment Suggestion
                          </div>
                          <div style={{ fontSize: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.25rem', lineHeight: '1.5' }}>
                            <HeartPulse size={20} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{getTreatmentSuggestion(prediction.label)}</span>
                          </div>
                        </div>
                      </>
                    )}

                    <button className="reset-btn" onClick={handleReset}>
                      Upload Another Image
                    </button>
                  </div>
                </div>
              )}
            </div>

            {history.length > 0 && (
              <div className="history-section">
                <h3 style={{ marginBottom: '1rem', opacity: 0.8, fontSize: '1.1rem', fontWeight: '600' }}>Recent Diagnoses</h3>
                <div className="history-grid">
                  {history.map((item, index) => (
                    <div key={index} className="history-card" onClick={() => restoreHistory(item)}>
                      <img src={item.previewUrl} alt={`History scan ${index + 1}`} />
                      <div className="history-info">
                        <div className="history-label">{item.prediction.label.replace('Tomato___', '').replace(/_/g, ' ')}</div>
                        {item.prediction.confidence !== null && (
                          <div className="history-conf" style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: '600' }}>
                            {(item.prediction.confidence * 100).toFixed(0)}% Match
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'growth' && (
          <div className="card fade-in">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>Simulate Environment</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Temperature (°C): <b>{growthForm.temperature}</b></label>
                <input type="range" name="temperature" min="10" max="40" value={growthForm.temperature} onChange={handleGrowthChange} />
              </div>
              <div className="form-group">
                <label>Humidity (%): <b>{growthForm.humidity}</b></label>
                <input type="range" name="humidity" min="10" max="100" value={growthForm.humidity} onChange={handleGrowthChange} />
              </div>
              <div className="form-group">
                <label>Sunlight (hrs/day): <b>{growthForm.sunlight}</b></label>
                <input type="range" name="sunlight" min="0" max="14" step="0.5" value={growthForm.sunlight} onChange={handleGrowthChange} />
              </div>
              <div className="form-group">
                <label>Watering (times/week): <b>{growthForm.watering}</b></label>
                <input type="range" name="watering" min="0" max="14" value={growthForm.watering} onChange={handleGrowthChange} />
              </div>
              <div className="form-group">
                <label>Soil Type</label>
                <select name="soil" value={growthForm.soil} onChange={handleGrowthChange}>
                  <option value="loamy">Loamy</option>
                  <option value="sandy">Sandy</option>
                  <option value="clay">Clay</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fertilizer</label>
                <select name="fertilizer" value={growthForm.fertilizer} onChange={handleGrowthChange}>
                  <option value="organic">Organic</option>
                  <option value="chemical">Chemical</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            <button 
              className="predict-btn" 
              onClick={submitGrowthPredict}
              disabled={isPredictingGrowth}
              style={{ marginTop: '1rem', width: '100%' }}
            >
              {isPredictingGrowth ? 'Simulating...' : <><Sprout size={20} /> Predict Growth Stage</>}
            </button>

            {growthError && (
              <div className="result-container error" style={{ marginTop: '1.5rem' }}>
                <div className="result-title">Error</div>
                <div className="result-value" style={{fontSize: '1rem'}}>{growthError}</div>
              </div>
            )}

            {growthResult && (
              <div className="result-container" style={{ marginTop: '1.5rem', animation: 'slideUp 0.5s ease' }}>
                <div className="result-title">Predicted Growth Stage</div>
                <div className="result-value" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
                  <Leaf size={28} color="var(--secondary-color)" />
                  <span style={{ fontSize: '2rem' }}>{growthResult.growth_stage}</span>
                </div>

                <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'var(--card-bg)', borderRadius: '0.5rem', border: '1px solid var(--card-border)' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--primary-color)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Expert Recommendation</div>
                  <div style={{ lineHeight: '1.6' }}>{growthResult.recommendation}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-color)', opacity: 0.8 }}>
                    <span>Match Confidence</span>
                    <span>{(growthResult.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--card-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${(growthResult.confidence * 100)}%`, 
                        background: 'linear-gradient(90deg, var(--secondary-color), #22c55e)', 
                        borderRadius: '4px',
                        transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)'
                      }} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
