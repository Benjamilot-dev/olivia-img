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
            <span>Colección Oficial &middot; Cloudinary Folders</span>
          </div>

          {/* Main Title */}
          <h1 className="hero-title">
            Olivia the Cat! IMG
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            Explora el universo de Olivia: poses reales, siestas majestuosas, aventuras en el jardín y travesuras.
            Sube a <strong>Cloudinary</strong> y sincroniza en tiempo real con <strong>Firebase</strong>.
          </p>

          {/* Action buttons */}
          <div className="hero-actions">
            <button
              className="btn-primary-pinterest hero-btn-main"
              onClick={onOpenUpload}
            >
              <Upload size={17} />
              <span>Subir Foto a Cloudinary</span>
            </button>
            <a
              href="#masonry-grid"
              className="btn-secondary hero-btn-sub"
            >
              <FolderHeart size={17} color="#f59e0b" />
              <span>Explorar Tableros</span>
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
              <span><strong className="hero-stat-num">{totalFolders}</strong> Carpetas</span>
            </div>
            <div className="hero-stat-item">
              <Heart size={15} color="#f43f5e" fill="#f43f5e" />
              <span><strong className="hero-stat-num">{totalLikes}</strong> Likes</span>
            </div>
            <div className="hero-stat-item">
              <ShieldCheck size={15} color="#10b981" />
              <span>Sync <strong>Firebase</strong></span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
