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
import ConfirmModal from './components/ConfirmModal';
import EditFolderModal from './components/EditFolderModal';
import { Lock, LogIn, Sparkles, Trash2, Folder as FolderIcon } from 'lucide-react';

import { INITIAL_PINS } from './data/initialPins';
import { DEFAULT_FOLDERS } from './services/cloudinary';
import { auth, database, logoutUser } from './firebase/config';
import { syncUserToDatabase, subscribeUserRole } from './services/userService';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set, update, remove } from 'firebase/database';

export default function App() {
  const searchInputRef = useRef(null);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'danger',
    itemPreview: null,
    options: null,
    onConfirm: () => {}
  });

  const openConfirm = ({
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    itemPreview = null,
    options = null,
    onConfirm
  }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      variant,
      itemPreview,
      options,
      onConfirm: onConfirm || (() => {})
    });
  };

  const closeConfirm = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

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
  const [editingFolder, setEditingFolder] = useState(null);

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

  // Sync Folders with Firebase Realtime Database
  useEffect(() => {
    try {
      const foldersRef = ref(database, 'folders');
      const unsubscribe = onValue(foldersRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          let loadedFolders = [];
          if (Array.isArray(val)) {
            loadedFolders = val.filter(Boolean);
          } else if (typeof val === 'object') {
            loadedFolders = Object.keys(val).map((k) => ({
              ...val[k],
              id: val[k].id || k
            }));
          }
          if (loadedFolders.length > 0) {
            setFolders(loadedFolders);
            localStorage.setItem('olivia_folders', JSON.stringify(loadedFolders));
          }
        }
      }, (err) => {
        console.warn("RTDB folders sync error:", err);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn("RTDB folders fallback to local store:", e);
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
      addToast('Inicia sesión con Google para publicar fotos en la galería', 'info');
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

    addToast('¡Pin publicado con éxito en la galería oficial! 🐱');
  };

  // Permission guarded Folder creation handler
  const handleAddFolder = (folderName) => {
    if (!user) {
      handleRequireAuth('folder');
      addToast('Inicia sesión con Google para crear álbumes', 'info');
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
    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    setActiveFolder(slug);
    try {
      set(ref(database, 'folders'), updatedFolders).catch(() => {});
    } catch {}
    addToast(`Álbum "${folderName}" creado con éxito ✨`);
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

  // =========================================================================
  // ADMIN DELETION & CONTENT MANAGEMENT ACTIONS (LUXURY MODALS)
  // =========================================================================

  // 1. Delete individual pin (Admin or author of the pin)
  const handleDeletePin = (pin) => {
    const isOwner = user && (
      (pin.authorUid && pin.authorUid === user.uid) ||
      (pin.author?.uid && pin.author.uid === user.uid) ||
      (pin.authorEmail && pin.authorEmail === user.email)
    );

    if (!isAdmin && !isOwner) {
      addToast('Solo el Administrador o el autor de la foto pueden eliminar este pin', 'error');
      return;
    }

    openConfirm({
      title: isOwner && !isAdmin ? '¿Eliminar tu Pin definitivamente?' : '¿Eliminar este Pin definitivamente?',
      message: `El pin "${pin.title}" será removido de forma permanente de la galería y de la base de datos.`,
      confirmText: 'Sí, eliminar Pin',
      cancelText: 'Cancelar',
      variant: 'danger',
      itemPreview: {
        image: pin.imageUrl,
        title: pin.title,
        subtitle: `Álbum: ${(pin.cloudinaryFolder || 'General').split('/').pop()}`
      },
      onConfirm: () => {
        try {
          remove(ref(database, `pins/${pin.id}`)).catch((err) => console.warn(err));
        } catch {}

        setPins((prev) => prev.filter((p) => p.id !== pin.id));
        if (selectedPin && selectedPin.id === pin.id) {
          setSelectedPin(null);
        }
        addToast(`Pin "${pin.title}" eliminado de la base de datos 🗑️`);
      }
    });
  };

  // 2. Delete all pins or all pins in a specific folder
  const handleDeleteAllPins = (folderSlug = null) => {
    if (!isAdmin) {
      addToast('Solo el Administrador puede realizar esta acción', 'error');
      return;
    }

    if (folderSlug) {
      const folderPins = pins.filter((p) => p.cloudinaryFolder === folderSlug);
      if (folderPins.length === 0) {
        addToast('No hay fotos en esta carpeta para eliminar', 'info');
        return;
      }

      openConfirm({
        title: '¿Vaciar fotos de esta carpeta?',
        message: `Se eliminarán permanentemente todas las ${folderPins.length} fotos asociadas a esta carpeta. Esta acción no se puede deshacer.`,
        confirmText: `Eliminar ${folderPins.length} fotos`,
        cancelText: 'Cancelar',
        variant: 'danger',
        itemPreview: {
          icon: 'folder',
          title: `Carpeta: ${folderSlug}`,
          subtitle: `${folderPins.length} fotos serán borradas`
        },
        onConfirm: () => {
          folderPins.forEach((p) => {
            try {
              remove(ref(database, `pins/${p.id}`)).catch(() => {});
            } catch {}
          });

          setPins((prev) => prev.filter((p) => p.cloudinaryFolder !== folderSlug));
          addToast(`Se eliminaron ${folderPins.length} fotos de la carpeta 🗑️`);
        }
      });
    } else {
      openConfirm({
        title: '¿Eliminar TODOS los Pines de la Galería?',
        message: `⚠️ ADVERTENCIA: Estás a punto de borrar definitivamente las ${pins.length} fotos de toda la galería de Olivia.`,
        confirmText: 'Sí, vaciar galería',
        cancelText: 'Cancelar',
        variant: 'danger',
        onConfirm: () => {
          try {
            remove(ref(database, 'pins')).catch(() => {});
          } catch {}

          setPins([]);
          if (selectedPin) setSelectedPin(null);
          addToast('Todos los pines han sido eliminados de la galería 🗑️');
        }
      });
    }
  };

  // 3. Reset initial pins to default official Olivia pins
  const handleResetInitialPins = () => {
    if (!isAdmin) {
      addToast('Solo el Administrador puede restablecer pines', 'error');
      return;
    }

    openConfirm({
      title: '¿Restablecer Pines Oficiales?',
      message: 'Se volverán a cargar todas las fotos oficiales y retratos ilustrados de Olivia the Cat en la base de datos.',
      confirmText: 'Restablecer fotos',
      cancelText: 'Cancelar',
      variant: 'reset',
      onConfirm: () => {
        try {
          INITIAL_PINS.forEach((ip) => {
            set(ref(database, `pins/${ip.id}`), ip).catch(() => {});
          });
        } catch {}

        setPins(INITIAL_PINS);
        addToast('Pines oficiales de Olivia restablecidos ✨');
      }
    });
  };

  // 4. Edit / Rename folder (Admin only)
  const handleOpenEditFolder = (folder) => {
    if (!isAdmin) {
      addToast('Solo el Administrador puede modificar o actualizar carpetas', 'error');
      return;
    }
    setEditingFolder(folder);
  };

  const handleUpdateFolder = (folderId, updatedData) => {
    if (!isAdmin) {
      addToast('Solo el Administrador puede modificar o actualizar carpetas', 'error');
      return;
    }

    const targetFolder = folders.find((f) => f.id === folderId);
    if (!targetFolder) return;

    const oldSlug = targetFolder.slug;
    const newSlug = updatedData.slug !== undefined ? updatedData.slug : oldSlug;
    const newName = updatedData.name ? updatedData.name.trim() : targetFolder.name;

    // If slug changed, update all pins assigned to this folder
    if (newSlug !== oldSlug && oldSlug) {
      const matchingPins = pins.filter((p) => p.cloudinaryFolder === oldSlug);
      if (matchingPins.length > 0) {
        matchingPins.forEach((p) => {
          try {
            update(ref(database, `pins/${p.id}`), { cloudinaryFolder: newSlug }).catch(() => {});
          } catch {}
        });
        setPins((prev) =>
          prev.map((p) => (p.cloudinaryFolder === oldSlug ? { ...p, cloudinaryFolder: newSlug } : p))
        );
      }

      if (activeFolder === oldSlug) {
        setActiveFolder(newSlug);
      }
    }

    const updatedFolders = folders.map((f) => {
      if (f.id === folderId) {
        return {
          ...f,
          name: newName,
          icon: updatedData.icon || f.icon,
          color: updatedData.color || f.color,
          slug: newSlug,
          updatedAt: Date.now(),
          updatedBy: user?.displayName || user?.email || 'Admin'
        };
      }
      return f;
    });

    setFolders(updatedFolders);

    try {
      set(ref(database, 'folders'), updatedFolders).catch((err) => console.warn(err));
    } catch {}

    setEditingFolder(null);
    addToast(`Álbum "${newName}" actualizado con éxito ✨`);
  };

  // 5. Delete single folder (Admin only)
  const handleDeleteFolder = (folder) => {
    if (!isAdmin) {
      addToast('Solo el Administrador puede eliminar carpetas', 'error');
      return;
    }
    if (folder.id === 'all') return;

    const folderPins = pins.filter((p) => p.cloudinaryFolder === folder.slug);

    if (folderPins.length === 0) {
      openConfirm({
        title: `¿Eliminar el álbum "${folder.name}"?`,
        message: 'Este álbum personalizado será eliminado de la barra de navegación.',
        confirmText: 'Eliminar álbum',
        cancelText: 'Cancelar',
        variant: 'danger',
        itemPreview: {
          icon: 'folder',
          title: folder.name,
          subtitle: '0 fotos asignadas'
        },
        onConfirm: () => {
          const remainingFolders = folders.filter((f) => f.id !== folder.id);
          setFolders(remainingFolders);
          try {
            set(ref(database, 'folders'), remainingFolders).catch(() => {});
          } catch {}
          if (activeFolder === folder.slug) {
            setActiveFolder('');
          }
          addToast(`Carpeta "${folder.name}" eliminada 📁🗑️`);
        }
      });
    } else {
      openConfirm({
        title: `¿Eliminar la carpeta "${folder.name}"?`,
        message: `Esta carpeta contiene ${folderPins.length} fotos. Selecciona cómo deseas proceder:`,
        cancelText: 'Cancelar',
        itemPreview: {
          icon: 'folder',
          title: folder.name,
          subtitle: `${folderPins.length} fotos en esta carpeta`
        },
        options: [
          {
            label: `Eliminar carpeta y sus ${folderPins.length} fotos`,
            variant: 'danger',
            icon: <Trash2 size={16} />,
            onClick: () => {
              folderPins.forEach((p) => {
                try {
                  remove(ref(database, `pins/${p.id}`)).catch(() => {});
                } catch {}
              });
              setPins((prev) => prev.filter((p) => p.cloudinaryFolder !== folder.slug));
              const remainingFolders = folders.filter((f) => f.id !== folder.id);
              setFolders(remainingFolders);
              try {
                set(ref(database, 'folders'), remainingFolders).catch(() => {});
              } catch {}
              if (activeFolder === folder.slug) setActiveFolder('');
              addToast(`Carpeta "${folder.name}" y sus ${folderPins.length} fotos eliminadas`);
            }
          },
          {
            label: 'Conservar fotos (mover a Galería General)',
            variant: 'secondary',
            icon: <FolderIcon size={16} />,
            onClick: () => {
              folderPins.forEach((p) => {
                try {
                  update(ref(database, `pins/${p.id}`), { cloudinaryFolder: 'olivia-cat/portraits' }).catch(() => {});
                } catch {}
              });
              setPins((prev) => prev.map((p) => p.cloudinaryFolder === folder.slug ? { ...p, cloudinaryFolder: 'olivia-cat/portraits' } : p));
              const remainingFolders = folders.filter((f) => f.id !== folder.id);
              setFolders(remainingFolders);
              try {
                set(ref(database, 'folders'), remainingFolders).catch(() => {});
              } catch {}
              if (activeFolder === folder.slug) setActiveFolder('');
              addToast(`Carpeta "${folder.name}" eliminada (fotos conservadas en galería)`);
            }
          }
        ]
      });
    }
  };

  // 6. Delete all custom folders (Admin only)
  const handleDeleteAllCustomFolders = () => {
    if (!isAdmin) {
      addToast('Solo el Administrador puede restablecer carpetas', 'error');
      return;
    }

    openConfirm({
      title: '¿Restablecer Carpetas Predeterminadas?',
      message: 'Se eliminarán todas las carpetas personalizadas creadas y se restaurarán las categorías originales de Olivia.',
      confirmText: 'Restablecer carpetas',
      cancelText: 'Cancelar',
      variant: 'warning',
      onConfirm: () => {
        setFolders(DEFAULT_FOLDERS);
        try {
          set(ref(database, 'folders'), DEFAULT_FOLDERS).catch(() => {});
        } catch {}
        setActiveFolder('');
        addToast('Carpetas restablecidas a las predeterminadas 📁');
      }
    });
  };

  // 6. Toggle Pin Visibility (Public / Private)
  const handleTogglePinVisibility = (pin) => {
    const isOwner = user && (
      (pin.authorUid && pin.authorUid === user.uid) ||
      (pin.author?.uid && pin.author.uid === user.uid) ||
      (pin.authorEmail && pin.authorEmail === user.email)
    );

    if (!isAdmin && !isOwner) {
      addToast('Solo el Administrador o el autor de la foto pueden cambiar su visibilidad', 'error');
      return;
    }
    const currentVis = pin.visibility || 'public';
    const newVisibility = currentVis === 'members' ? 'public' : 'members';

    try {
      update(ref(database, `pins/${pin.id}`), { visibility: newVisibility }).catch(() => {});
    } catch {}

    setPins((prev) => prev.map((p) => p.id === pin.id ? { ...p, visibility: newVisibility } : p));

    if (selectedPin && selectedPin.id === pin.id) {
      setSelectedPin((prev) => ({ ...prev, visibility: newVisibility }));
    }

    addToast(
      `Pin "${pin.title}" ahora es ${newVisibility === 'public' ? 'Público para todos 🌍' : 'Privado (visible solo para ti y el Admin) 🔒'}`
    );
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

  // Filter Pins based on activeFolder, searchTerm, and User Authentication Visibility
  const filteredPins = useMemo(() => {
    return pins.filter((pin) => {
      const isPublic = !pin.visibility || pin.visibility === 'public';

      // Privacy Rules:
      // 1. Admin: sees ALL public AND ALL private photos of everyone
      // 2. Regular user: sees all public photos + THEIR OWN private photos
      // 3. Unregistered visitor: sees ONLY public photos
      if (!isPublic) {
        if (!user) {
          return false;
        }
        if (!isAdmin) {
          const isOwner =
            (pin.authorUid && pin.authorUid === user.uid) ||
            (pin.author?.uid && pin.author.uid === user.uid) ||
            (pin.authorEmail && pin.authorEmail === user.email);
          if (!isOwner) {
            return false;
          }
        }
      }

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
  }, [pins, activeFolder, searchTerm, user, isAdmin]);

  // Total private pins in system
  const totalPrivatePinsCount = useMemo(() => {
    return pins.filter((p) => p.visibility === 'members').length;
  }, [pins]);

  // Private pins belonging to the current logged-in user
  const myPrivatePinsCount = useMemo(() => {
    if (!user) return 0;
    return pins.filter(
      (p) =>
        p.visibility === 'members' &&
        ((p.authorUid && p.authorUid === user.uid) ||
          (p.author?.uid && p.author.uid === user.uid) ||
          (p.authorEmail && p.authorEmail === user.email))
    ).length;
  }, [pins, user]);

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
        onEditFolder={handleOpenEditFolder}
        getPinsCountByFolder={getPinsCountByFolder}
        user={user}
        isApproved={isApproved}
        isAdmin={isAdmin}
        onRequireAuth={handleRequireAuth}
        onRequireApproval={() => setIsPendingModalOpen(true)}
        onDeleteFolder={handleDeleteFolder}
        onDeleteAllPinsInFolder={handleDeleteAllPins}
      />

      {/* Unregistered Visitors Notice */}
      {!user && totalPrivatePinsCount > 0 && (
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto 1.5rem auto',
          padding: '0.85rem 1.25rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(245, 158, 11, 0.08))',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              flexShrink: 0
            }}>
              <Lock size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.92rem' }}>
                Fotos exclusivas y privadas disponibles en la comunidad
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Inicia sesión con Google para subir tus propias fotos privadas, guardar pines y participar.
              </div>
            </div>
          </div>
          <button
            onClick={() => handleRequireAuth('browse')}
            className="btn btn-secondary"
            style={{
              padding: '0.5rem 1.1rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#f8fafc',
              background: 'rgba(239, 68, 68, 0.15)'
            }}
          >
            <LogIn size={15} />
            <span>Acceder con Google</span>
          </button>
        </div>
      )}

      {/* Regular user private pins indicator */}
      {user && !isAdmin && myPrivatePinsCount > 0 && (
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto 1.25rem auto',
          padding: '0.65rem 1rem',
          borderRadius: '14px',
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.85rem',
          color: '#c4b5fd'
        }}>
          <Lock size={15} color="#a78bfa" />
          <span>
            Tienes <strong>{myPrivatePinsCount} foto{myPrivatePinsCount > 1 ? 's' : ''} privada{myPrivatePinsCount > 1 ? 's' : ''}</strong> en la galería (solo visibles para ti y el Administrador).
          </span>
        </div>
      )}

      {/* Admin privileged view indicator */}
      {isAdmin && (
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto 1.25rem auto',
          padding: '0.65rem 1rem',
          borderRadius: '14px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.65rem',
          fontSize: '0.84rem',
          color: '#fcd34d',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.1rem' }}>👑</span>
            <span>
              <strong>Vista de Administrador:</strong> Estás visualizando todas las fotos públicas y las fotos privadas de todos los usuarios ({totalPrivatePinsCount} fotos privadas en la plataforma).
            </span>
          </div>
          <span style={{
            fontSize: '0.74rem',
            padding: '2px 8px',
            borderRadius: '999px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            fontWeight: 600
          }}>
            Modo Superusuario
          </span>
        </div>
      )}

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
        isAdmin={isAdmin}
        user={user}
        onDeletePin={handleDeletePin}
        onToggleVisibility={handleTogglePinVisibility}
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
          isAdmin={isAdmin}
          onDeletePin={handleDeletePin}
          onToggleVisibility={handleTogglePinVisibility}
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

      {/* Administration Settings Modal - ADMIN ONLY */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={() => addToast('Configuración del sistema guardada con éxito')}
        isAdmin={isAdmin}
        user={user}
        pins={pins}
        folders={folders}
        onDeletePin={handleDeletePin}
        onDeleteAllPins={handleDeleteAllPins}
        onResetInitialPins={handleResetInitialPins}
        onDeleteFolder={handleDeleteFolder}
        onEditFolder={handleOpenEditFolder}
        onDeleteAllCustomFolders={handleDeleteAllCustomFolders}
        onToggleVisibility={handleTogglePinVisibility}
        addToast={addToast}
      />

      {/* Edit Folder Modal - ADMIN ONLY */}
      <EditFolderModal
        isOpen={Boolean(editingFolder)}
        folder={editingFolder}
        pinsCount={editingFolder ? getPinsCountByFolder(editingFolder.slug) : 0}
        onClose={() => setEditingFolder(null)}
        onSave={(updatedData) => handleUpdateFolder(editingFolder.id, updatedData)}
        onDelete={(folderToDelete) => {
          setEditingFolder(null);
          handleDeleteFolder(folderToDelete);
        }}
        isAdmin={isAdmin}
      />

      {/* Confirmation & Alert Modal Dialog */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        itemPreview={confirmModal.itemPreview}
        options={confirmModal.options}
        onConfirm={confirmModal.onConfirm}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
