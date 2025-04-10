import React from 'react';
import './MarketMap.css';

function MarketMap({ spots, onSpotClick }) {
  const getSpot = (number) => spots.find(s => s.number === number);
  const getColor = (status) => {
    switch (status) {
      case 'free': return '#c8e6c9';
      case 'reserved': return '#fff9c4';
      case 'rented': return '#ffcdd2';
      default: return '#eeeeee';
    }
  };

  const renderBoxes = (start, count) =>
    Array.from({ length: count }, (_, i) => {
      const number = start + i;
      const spot = getSpot(number);
      return (
        <div
          key={number}
          className="box"
          style={{ backgroundColor: getColor(spot?.status) }}
          onClick={() => spot && onSpotClick(spot)}
        >
          {number}
        </div>
      );
    });

  return (
    <div className="market-map-container">
      {/* Верхнее здание */}
      <div className="building top-building">
        <div className="building-label">Верхнее здание (200)</div>
        <div className="grid-4x50">
          {renderBoxes(1, 200)}
        </div>
      </div>

      {/* Г-образное здание */}
      <div className="building bottom-building">
        <div className="building-label">Г-образное здание (100)</div>
        <div className="l-shape">
          <div className="l-vertical">{renderBoxes(201, 40)}</div>
          <div className="l-horizontal">{renderBoxes(241, 60)}</div>
        </div>
      </div>

      {/* Уличные бутики */}
      <div className="building street-booths">
        <div className="building-label">Уличные бутики (100)</div>
        <div className="grid-5x20">
          {renderBoxes(301, 100)}
        </div>
      </div>
    </div>
  );
}

export default MarketMap;
