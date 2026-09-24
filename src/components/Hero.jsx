import React, { useState } from 'react';
import { Sparkles, Upload, FolderHeart, ShieldCheck, Heart, Layers, ChevronUp, ChevronDown } from 'lucide-react';

export default function Hero({ onOpenUpload, totalPins, totalFolders, totalLikes }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <section className="hero-section">
      <div className="hero-glow-blob"></div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expandir portada de Olivia" : "Minimizar portada"}
        className="hero-collapse-btn"
      >
        <span>{isCollapsed ? "Ver Presentación" : "Ocultar"}</span>
        {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {!isCollapsed && (
        <div className="hero-content">
          {/* Logo Frame */}
          <div className="hero-logo-frame">
            <div className="hero-logo-inner">
              <img
                src="/olivia-logo.png"
                alt="Olivia the Cat Logo"
                className="hero-logo-img"
              />
            </div>
          </div>

          {/* Badge */}
          <div className="hero-badge-tag">
            <Sparkles size={12} />
            <span>Colección Oficial &middot; Galería Exclusiva</span>
          </div>

          {/* Main Title */}
          <h1 className="hero-title">
            Olivia the Cat! IMG
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            Explora el universo de Olivia: poses reales, siestas majestuosas, aventuras en el jardín y momentos inolvidables.
            Comparte tus fotos favoritas y disfruta de la comunidad en tiempo real.
          </p>

          {/* Action buttons */}
          <div className="hero-actions">
            <button
              className="btn-primary-pinterest hero-btn-main"
              onClick={onOpenUpload}
            >
              <Upload size={17} />
              <span>Publicar Foto</span>
            </button>
            <a
              href="#masonry-grid"
              className="btn-secondary hero-btn-sub"
            >
              <FolderHeart size={17} color="#f59e0b" />
              <span>Explorar Álbumes</span>
            </a>
          </div>

          {/* Stats Bar */}
          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <Layers size={15} color="#f59e0b" />
              <span><strong className="hero-stat-num">{totalPins}</strong> Pines</span>
            </div>
            <div className="hero-stat-item">
              <FolderHeart size={15} color="#8b5cf6" />
              <span><strong className="hero-stat-num">{totalFolders}</strong> Álbumes</span>
            </div>
            <div className="hero-stat-item">
              <Heart size={15} color="#f43f5e" fill="#f43f5e" />
              <span><strong className="hero-stat-num">{totalLikes}</strong> Likes</span>
            </div>
            <div className="hero-stat-item">
              <ShieldCheck size={15} color="#10b981" />
              <span>Sincronizado <strong>En Vivo</strong></span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
