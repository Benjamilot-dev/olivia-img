import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FolderBar from './components/FolderBar';
import PinMasonry from './components/PinMasonry';
import PinDetailModal from './components/PinDetailModal';
import UploadModal from './components/UploadModal';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import PendingApprovalModal from './components/PendingApprovalModal';
import MobileBottomNav from './components/MobileBottomNav';
import Toast from './components/Toast';

import { INITIAL_PINS } from './data/initialPins';
import { DEFAULT_FOLDERS } from './services/cloudinary';
import { auth, database, logoutUser } from './firebase/config';
import { syncUserToDatabase, subscribeUserRole } from './services/userService';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set, update } from 'firebase/database';

export default function App() {
  const searchInputRef = useRef(null);

  // Pins state
  const [pins, setPins] = useState(() => {
    try {
      const saved = localStorage.getItem('olivia_pins');
      return saved ? JSON.parse(saved) : INITIAL_PINS;
    } catch {
      return INITIAL_PINS;
    }
  });

  // Folders state
  const [folders, setFolders] = useState(() => {
    try {
      const saved = localStorage.getItem('olivia_folders');
      return saved ? JSON.parse(saved) : DEFAULT_FOLDERS;
    } catch {
      return DEFAULT_FOLDERS;
    }
  });

  // Filters & Search
  const [activeFolder, setActiveFolder] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Interactivity state
  const [likedPinIds, setLikedPinIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('olivia_liked_pins') || '[]');
    } catch {
      return [];
    }
  });

  const [savedPinIds, setSavedPinIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('olivia_saved_pins') || '[]');
    } catch {
      return [];
    }
  });

  // Modals state
  const [selectedPin, setSelectedPin] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState(''); // 'upload' | 'folder' | ''
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);

  // Auth, Roles & Approval state
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem('olivia_is_admin') === 'true';
    } catch {
      return false;
    }
  });
  const [userStatus, setUserStatus] = useState(() => {
    try {
      return localStorage.getItem('olivia_user_status') || 'pending';
    } catch {
      return 'pending';
    }
  });
  const [isApproved, setIsApproved] = useState(() => {
    try {
      const savedAdmin = localStorage.getItem('olivia_is_admin') === 'true';
      const savedStatus = localStorage.getItem('olivia_user_status');
      return savedAdmin || savedStatus === 'approved';
    } catch {
      return false;
    }
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync Auth and Users in Firebase Realtime Database
  useEffect(() => {
    let unsubscribeRole = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync user profile to database and check admin & approval privileges
        const { isAdmin: resolvedAdmin, isApproved: resolvedApproved, status: resolvedStatus } = await syncUserToDatabase(currentUser);
        setIsAdmin(resolvedAdmin);
        setIsApproved(resolvedApproved);
        setUserStatus(resolvedStatus);

        // Subscribe to real-time role & approval changes in database
        unsubscribeRole = subscribeUserRole(currentUser.uid, ({ isAdmin: updatedAdmin, isApproved: updatedApproved, status: updatedStatus }) => {
          setIsAdmin(updatedAdmin);
          setIsApproved(updatedApproved);
          setUserStatus(updatedStatus);
        });
      } else {
        setIsAdmin(false);
        setIsApproved(false);
        setUserStatus('pending');
        if (unsubscribeRole) unsubscribeRole();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRole) unsubscribeRole();
    };
  }, []);

  // Sync Pins with Firebase Realtime Database
  useEffect(() => {
    try {
      const pinsRef = ref(database, 'pins');
      const unsubscribe = onValue(pinsRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const loadedPins = Object.keys(val).map((k) => ({
            ...val[k],
            id: val[k].id || k
          }));

          const existingIds = new Set(loadedPins.map((p) => p.id));
          const merged = [...loadedPins];
          INITIAL_PINS.forEach((ip) => {
            if (!existingIds.has(ip.id)) {
              merged.push(ip);
            }
          });

          setPins(merged);
          localStorage.setItem('olivia_pins', JSON.stringify(merged));
        }
      }, () => {});

      return () => unsubscribe();
    } catch (e) {
      console.warn("RTDB sync fallback to local store:", e);
    }
  }, []);

  // Persistence in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('olivia_pins', JSON.stringify(pins));
    } catch (e) {
      console.error(e);
    }
  }, [pins]);

  useEffect(() => {
    try {
      localStorage.setItem('olivia_folders', JSON.stringify(folders));
    } catch (e) {
      console.error(e);
    }
  }, [folders]);

  useEffect(() => {
    try {
      localStorage.setItem('olivia_liked_pins', JSON.stringify(likedPinIds));
    } catch (e) {
      console.error(e);
    }
  }, [likedPinIds]);

  useEffect(() => {
    try {
      localStorage.setItem('olivia_saved_pins', JSON.stringify(savedPinIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedPinIds]);

  // Auth requirement trigger
  const handleRequireAuth = (reason = '') => {
    setAuthReason(reason);
    setIsAuthOpen(true);
  };

  // Permission guarded Upload handler
  const handleOpenUpload = () => {
    if (!user) {
      handleRequireAuth('upload');
      addToast('Inicia sesión con Google para subir fotos a Cloudinary', 'info');
      return;
    }
    if (!isApproved) {
      setIsPendingModalOpen(true);
      return;
    }
    setIsUploadOpen(true);
  };

  // Permission guarded Settings handler (ADMIN ONLY)
  const handleOpenSettings = () => {
    if (!isAdmin) {
      addToast('Acceso denegado: Solo el Administrador puede ver esta configuración', 'error');
      return;
    }
    setIsSettingsOpen(true);
  };

  // Handlers
  const handleLike = (pinId) => {
    const isLiked = likedPinIds.includes(pinId);
    let newLikedIds;
    if (isLiked) {
      newLikedIds = likedPinIds.filter((id) => id !== pinId);
      addToast('Ronroneo eliminado', 'info');
    } else {
      newLikedIds = [...likedPinIds, pinId];
      addToast('¡Ronroneo agregado! ❤️');
    }
    setLikedPinIds(newLikedIds);

    setPins((prevPins) =>
      prevPins.map((p) => {
        if (p.id === pinId) {
          const delta = isLiked ? -1 : 1;
          const updatedLikes = Math.max(0, (p.likesCount || 0) + delta);
          try {
            update(ref(database, `pins/${pinId}`), { likesCount: updatedLikes }).catch(() => {});
          } catch {}
          return { ...p, likesCount: updatedLikes };
        }
        return p;
      })
    );
  };

  const handleSave = (pin) => {
    const isSaved = savedPinIds.includes(pin.id);
    if (isSaved) {
      setSavedPinIds((prev) => prev.filter((id) => id !== pin.id));
      addToast('Pin eliminado de tus guardados', 'info');
    } else {
      setSavedPinIds((prev) => [...prev, pin.id]);
      addToast('¡Pin guardado en tus favoritos!');
    }
  };

  const handleShare = async (pin) => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Olivia the Cat! - ${pin.title}`,
          text: pin.description,
          url: shareUrl
        });
        addToast('¡Compartido con éxito!');
        return;
      } catch (err) {}
    }
    navigator.clipboard?.writeText(shareUrl);
    addToast('Enlace copiado al portapapeles 📋');
  };

  const handlePinCreated = (newPin) => {
    setPins((prev) => [newPin, ...prev]);

    try {
      const newPinRef = ref(database, `pins/${newPin.id}`);
      set(newPinRef, newPin).catch(() => {});
    } catch {}

    addToast('¡Pin subido a Cloudinary y publicado con éxito! 🐱');
  };

  // Permission guarded Folder creation handler
  const handleAddFolder = (folderName) => {
    if (!user) {
      handleRequireAuth('folder');
      addToast('Inicia sesión con Google para crear carpetas', 'info');
      return;
    }
    if (!isApproved) {
      setIsPendingModalOpen(true);
      return;
    }

    const slug = `olivia-cat/${folderName.toLowerCase().trim().replace(/[^a-z0-9]/g, '-')}`;
    const newFolder = {
      id: 'f_' + Date.now(),
      name: folderName,
      slug: slug,
      icon: 'Folder',
      color: '#f59e0b',
      createdBy: user.displayName || user.email
    };
    setFolders((prev) => [...prev, newFolder]);
    setActiveFolder(slug);
    addToast(`Carpeta "${folderName}" creada en Cloudinary`);
  };

  const handleAddComment = (pinId, commentObj) => {
    setPins((prevPins) =>
      prevPins.map((p) => {
        if (p.id === pinId) {
          const updatedComments = [...(p.comments || []), commentObj];
          try {
            update(ref(database, `pins/${pinId}`), { comments: updatedComments }).catch(() => {});
          } catch {}
          return { ...p, comments: updatedComments };
        }
        return p;
      })
    );

    if (selectedPin && selectedPin.id === pinId) {
      setSelectedPin((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), commentObj]
      }));
    }

    addToast('Comentario publicado');
  };

  const handleLogout = async () => {
    await logoutUser();
    setIsAdmin(false);
    setIsApproved(false);
    setUserStatus('pending');
    localStorage.removeItem('olivia_is_admin');
    localStorage.removeItem('olivia_user_status');
    addToast('Sesión de Google cerrada', 'info');
  };

  // Mobile Bottom Nav actions
  const handleFocusSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 250);
  };

  const handleGoHome = () => {
    setActiveFolder('');
    setSearchTerm('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenFolders = () => {
    const el = document.querySelector('.folder-bar-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Filter Pins based on activeFolder and searchTerm
  const filteredPins = useMemo(() => {
    return pins.filter((pin) => {
      if (activeFolder && pin.cloudinaryFolder !== activeFolder) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesTitle = pin.title?.toLowerCase().includes(query);
        const matchesDesc = pin.description?.toLowerCase().includes(query);
        const matchesFolder = pin.cloudinaryFolder?.toLowerCase().includes(query);
        const matchesTags = pin.tags?.some((t) => t.toLowerCase().includes(query));
        return matchesTitle || matchesDesc || matchesFolder || matchesTags;
      }
      return true;
    });
  }, [pins, activeFolder, searchTerm]);

  // Stats
  const totalPins = pins.length;
  const totalFolders = folders.filter((f) => f.slug).length;
  const totalLikes = pins.reduce((acc, p) => acc + (p.likesCount || 0), 0);

  const getPinsCountByFolder = (slug) => {
    if (!slug) return pins.length;
    return pins.filter((p) => p.cloudinaryFolder === slug).length;
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenUpload={handleOpenUpload}
        onOpenAuth={() => handleRequireAuth('')}
        onOpenSettings={handleOpenSettings}
        user={user}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onResetFilter={handleGoHome}
        searchInputRef={searchInputRef}
      />

      {/* Hero Section */}
      <Hero
        onOpenUpload={handleOpenUpload}
        totalPins={totalPins}
        totalFolders={totalFolders}
        totalLikes={totalLikes}
      />

      {/* Cloudinary Folder / Categories Bar */}
      <FolderBar
        folders={folders}
        activeFolder={activeFolder}
        onSelectFolder={(slug) => setActiveFolder(slug)}
        onAddFolder={handleAddFolder}
        getPinsCountByFolder={getPinsCountByFolder}
        user={user}
        isApproved={isApproved}
        onRequireAuth={handleRequireAuth}
        onRequireApproval={() => setIsPendingModalOpen(true)}
      />

      {/* Pinterest Masonry Grid */}
      <PinMasonry
        pins={filteredPins}
        onSelectPin={(pin) => setSelectedPin(pin)}
        onLikePin={handleLike}
        onSavePin={handleSave}
        likedPinIds={likedPinIds}
        savedPinIds={savedPinIds}
        onSharePin={handleShare}
        onResetFilters={handleGoHome}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={!activeFolder && !searchTerm ? 'home' : ''}
        onGoHome={handleGoHome}
        onFocusSearch={handleFocusSearch}
        onOpenUpload={handleOpenUpload}
        onOpenFolders={handleOpenFolders}
        onOpenAuth={() => handleRequireAuth('')}
        onOpenSettings={handleOpenSettings}
        user={user}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      {/* Pin Detail Modal */}
      {selectedPin && (
        <PinDetailModal
          pin={selectedPin}
          onClose={() => setSelectedPin(null)}
          onLike={handleLike}
          onSave={handleSave}
          isLiked={likedPinIds.includes(selectedPin.id)}
          isSaved={savedPinIds.includes(selectedPin.id)}
          onShare={handleShare}
          onSelectTag={(tag) => setSearchTerm(tag)}
          onAddComment={handleAddComment}
          user={user}
        />
      )}

      {/* Upload Pin Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onPinCreated={handlePinCreated}
        folders={folders}
        user={user}
      />

      {/* Firebase Google Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        actionReason={authReason}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthReason('');
        }}
        onAuthSuccess={(loggedUser, msg) => {
          setUser(loggedUser);
          addToast(msg || '¡Autenticado con Google con éxito!');
          if (authReason === 'upload') {
            setTimeout(() => {
              const savedAdmin = localStorage.getItem('olivia_is_admin') === 'true';
              const savedStatus = localStorage.getItem('olivia_user_status');
              const approvedNow = savedAdmin || savedStatus === 'approved';
              if (approvedNow) {
                setIsUploadOpen(true);
              } else {
                setIsPendingModalOpen(true);
              }
            }, 350);
          }
        }}
      />

      {/* Pending Approval Modal for Standard Users */}
      <PendingApprovalModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        user={user}
        status={userStatus}
      />

      {/* Cloudinary & Firebase Settings Modal - ADMIN ONLY */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={() => addToast('Configuración de Cloudinary actualizada')}
        isAdmin={isAdmin}
        user={user}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
