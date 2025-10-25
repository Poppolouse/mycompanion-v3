import React, { useState } from 'react';
import { searchGamesIGDB } from '../../api/igdbApi';
import './IGDBTest.css';

/**
 * IGDB API Test Komponenti
 * IGDB API'nin çalışıp çalışmadığını test eder
 */
function IGDBTest() {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('Life is Strange');

  const testIGDB = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log('🧪 IGDB API test başlıyor...');
      const results = await searchGamesIGDB(searchTerm, 3);
      
      setTestResult({
        success: true,
        data: results,
        message: `${results.length} oyun bulundu`
      });
      
      console.log('✅ IGDB test başarılı:', results);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        message: 'IGDB API hatası'
      });
      
      console.error('❌ IGDB test hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="igdb-test">
      <h3>🧪 IGDB API Test</h3>
      
      <div className="test-controls">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Oyun adı girin..."
          className="search-input"
        />
        <button 
          onClick={testIGDB} 
          disabled={loading}
          className="test-button"
        >
          {loading ? '⏳ Test Ediliyor...' : '🚀 IGDB Test Et'}
        </button>
      </div>

      {testResult && (
        <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
          <h4>{testResult.success ? '✅ Başarılı' : '❌ Hata'}</h4>
          <p>{testResult.message}</p>
          
          {testResult.success && testResult.data && (
            <div className="games-list">
              {testResult.data.map((game, index) => (
                <div key={index} className="game-item">
                  <div className="game-info">
                    <strong>{game.title}</strong>
                    <p>ID: {game.igdbId}</p>
                    <p>Genres: {game.genres?.join(', ') || 'N/A'}</p>
                  </div>
                  {game.cover && (
                    <div className="game-cover">
                      <img 
                        src={game.cover} 
                        alt={game.title}
                        onLoad={() => console.log('✅ Resim yüklendi:', game.cover)}
                        onError={() => console.error('❌ Resim yüklenemedi:', game.cover)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {!testResult.success && (
            <div className="error-details">
              <code>{testResult.error}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default IGDBTest;