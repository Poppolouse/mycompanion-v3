import { useState } from 'react';
import { readExcelFile, parseGameList, saveGameProgress } from '../../utils/excelUtils';
import './ExcelReader.css';

/**
 * Excel dosyası okuma ve oyun listesi import etme komponenti
 */
function ExcelReader({ onImportComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setPreviewData(null);
    }
  };

  const handleLoadFile = async () => {
    if (!selectedFile) {
      setError('Lütfen bir dosya seçin');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Excel dosyasını oku
      const rawData = await readExcelFile(selectedFile);
      
      if (!rawData || rawData.length === 0) {
        throw new Error('Dosya boş veya geçersiz format');
      }

      // Oyun listesine çevir
      const gameList = parseGameList(rawData);
      
      // Preview verilerini hazırla
      const strategyGames = gameList.filter(game => game.type === 'strategy');
      const normalGames = gameList.filter(game => game.type === 'normal');
      
      setPreviewData({
        games: gameList,
        totalGames: gameList.length,
        strategyGames: strategyGames.length,
        normalGames: normalGames.length,
        preview: gameList.slice(0, 5) // İlk 5 oyunu göster
      });

    } catch (err) {
      setError(`Dosya okuma hatası: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (previewData && previewData.games) {
      // Oyunları localStorage'a kaydet
      saveGameProgress(previewData.games);
      
      // Parent component'e bildir
      if (onImportComplete) {
        onImportComplete(previewData.games);
      }
      
      // State'i temizle
      setSelectedFile(null);
      setPreviewData(null);
      setError(null);
      
      alert(`${previewData.totalGames} oyun başarıyla import edildi!`);
    }
  };

  return (
    <div className="excel-reader">
      <div className="excel-reader__header">
        <h3>📊 Excel Dosyası Import Et</h3>
        <p>Oyun listenizi Excel dosyasından yükleyin</p>
      </div>

      <div className="excel-reader__upload">
        <div className="file-input-wrapper">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="file-input"
            id="excel-file"
          />
          <label htmlFor="excel-file" className="file-input-label">
            📁 Dosya Seç
          </label>
          {selectedFile && (
            <span className="selected-file">
              {selectedFile.name}
            </span>
          )}
        </div>

        <button
          onClick={handleLoadFile}
          disabled={!selectedFile || isLoading}
          className="load-button"
        >
          {isLoading ? '⏳ Yükleniyor...' : '📖 Dosyayı Oku'}
        </button>
      </div>

      {isLoading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Excel dosyası okunuyor...</p>
        </div>
      )}

      {error && (
        <div className="error">
          <p>❌ {error}</p>
        </div>
      )}

      {previewData && (
        <div className="preview">
          <div className="preview__header">
            <h4>📋 Veri Önizleme</h4>
          </div>

          <div className="preview__stats">
            <div className="stat">
              <span className="stat__label">Toplam Oyun:</span>
              <span className="stat__value">{previewData.totalGames}</span>
            </div>
            <div className="stat">
              <span className="stat__label">Strateji Oyunları:</span>
              <span className="stat__value">{previewData.strategyGames}</span>
            </div>
            <div className="stat">
              <span className="stat__label">Normal Oyunlar:</span>
              <span className="stat__value">{previewData.normalGames}</span>
            </div>
          </div>

          <div className="preview__games">
            <h5>İlk 5 Oyun:</h5>
            {previewData.preview.map((game, index) => (
              <div key={index} className="preview-game">
                <span className="game-title">{game.title}</span>
                <span className="game-type">{game.type === 'strategy' ? '⚔️ Strateji' : '🎮 Normal'}</span>
                <span className="game-platform">{game.platform}</span>
              </div>
            ))}
          </div>

          <div className="preview__actions">
            <button
              onClick={handleImport}
              className="import-button"
            >
              ✅ Oyunları Import Et
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExcelReader;