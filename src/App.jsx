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
import EditPinModal from './components/EditPinModal';
import { Lock, LogIn, Sparkles, Trash2, Folder as FolderIcon } from 'lucide-react';

import { INITIAL_PINS } from './data/initialPins';
import { DEFAULT_FOLDERS } from './services/cloudinary';
import { auth, database, logoutUser } from './firebase/config';
import { syncUserToDatabase, subscribeUserRole } from './services/userService';
import { safeStorage, cachePinsSafely } from './services/storage';
import { compressDataUrl } from './utils/imageCompressor';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { sanitizePin, sanitizeComment, sanitizeFolder, sanitizeText, isSafeUrl } from './utils/security';

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

  // Clean up any historical oversized caches on startup
  useEffect(() => {
    safeStorage.cleanupHeavyCaches();
  }, []);

  // Deleted pins state (tracks IDs of pins permanently deleted by admin/owner)
  const [deletedPinIds, setDeletedPinIds] = useState(() => {
    return safeStorage.getJSON('olivia_deleted_pins', []);
  });
  const deletedPinIdsRef = useRef(deletedPinIds);

  useEffect(() => {
    deletedPinIdsRef.current = deletedPinIds;
    safeStorage.setJSON('olivia_deleted_pins', deletedPinIds);
  }, [deletedPinIds]);

  // Sync Deleted Pins with Firebase Realtime Database
  useEffect(() => {
    try {
      const deletedRef = ref(database, 'deleted_pins');
      const unsubscribe = onValue(deletedRef, (snapshot) => {
        const val = snapshot.val();
        if (val && typeof val === 'object') {
          const ids = Object.keys(val);
          setDeletedPinIds(ids);
          deletedPinIdsRef.current = ids;
          safeStorage.setJSON('olivia_deleted_pins', ids);
          // Prune any deleted pins from local state
          setPins((prev) => prev.filter((p) => !ids.includes(p.id)));
        } else {
          setDeletedPinIds([]);
          deletedPinIdsRef.current = [];
          safeStorage.setJSON('olivia_deleted_pins', []);
        }
      }, (err) => {
        console.warn("RTDB deleted_pins sync error:", err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("RTDB deleted_pins listener fallback:", e);
    }
  }, []);

  // Pins state
  const [pins, setPins] = useState(() => {
    try {
      const deletedIds = new Set(safeStorage.getJSON('olivia_deleted_pins', []));
      const saved = safeStorage.getItem('olivia_pins');
      if (saved) {
        if (saved.length > 500000 || saved.includes('data:image/')) {
          safeStorage.removeItem('olivia_pins');
          return INITIAL_PINS.filter((p) => !deletedIds.has(p.id)).map(sanitizePin);
        }
        return JSON.parse(saved).filter((p) => !deletedIds.has(p.id)).map(sanitizePin);
      }
      return INITIAL_PINS.filter((p) => !deletedIds.has(p.id)).map(sanitizePin);
    } catch {
      return INITIAL_PINS.map(sanitizePin);
    }
  });

  // Folders state
  const [folders, setFolders] = useState(() => {
    const saved = safeStorage.getJSON('olivia_folders', null);
    return saved && Array.isArray(saved) && saved.length > 0 ? saved : DEFAULT_FOLDERS;
  });

  // Filters & Search
  const [activeFolder, setActiveFolder] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Interactivity state
  const [likedPinIds, setLikedPinIds] = useState(() => {
    return safeStorage.getJSON('olivia_liked_pins', []);
  });

  const [savedPinIds, setSavedPinIds] = useState(() => {
    return safeStorage.getJSON('olivia_saved_pins', []);
  });

  // Modals state
  const [selectedPin, setSelectedPin] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState(''); // 'upload' | 'folder' | ''
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [editingPin, setEditingPin] = useState(null);

  // Auth, Roles & Approval state (Security: Default to unprivileged until verified by Firebase Auth)
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userStatus, setUserStatus] = useState('pending');
  const [isApproved, setIsApproved] = useState(false);

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
        try {
          const val = snapshot.val();
          const deletedSet = new Set(deletedPinIdsRef.current || []);

          let loadedPins = [];
          if (val && typeof val === 'object') {
            loadedPins = Object.keys(val).map((k) => ({
              ...val[k],
              id: val[k].id || k
            }));
          }

          // Filter out any pin that was marked deleted
          const activeLoaded = loadedPins.filter((p) => !deletedSet.has(p.id));
          const existingIds = new Set(activeLoaded.map((p) => p.id));
          const merged = [...activeLoaded];

          // Merge default initial pins ONLY if they haven't been deleted!
          INITIAL_PINS.forEach((ip) => {
            if (!existingIds.has(ip.id) && !deletedSet.has(ip.id)) {
              merged.push(ip);
            }
          });

          const sanitizedMerged = merged.map(sanitizePin).filter(Boolean);
          setPins(sanitizedMerged);
          cachePinsSafely(sanitizedMerged);

          // Auto-optimizer for heavy base64 pins (e.g. uploaded before client compression)
          merged.forEach((pin) => {
            if (pin.imageUrl && pin.imageUrl.startsWith('data:image/') && pin.imageUrl.length > 400000) {
              compressDataUrl(pin.imageUrl, { maxWidth: 1200, quality: 0.78 }).then((optimizedUrl) => {
                if (optimizedUrl && optimizedUrl.length < pin.imageUrl.length) {
                  console.info(`[Auto-Optimizer] Recompressed oversized pin "${pin.title}" from ${(pin.imageUrl.length / 1024).toFixed(0)}KB to ${(optimizedUrl.length / 1024).toFixed(0)}KB`);
                  try {
                    update(ref(database, `pins/${pin.id}`), { imageUrl: optimizedUrl }).catch(() => {});
                  } catch {}
                }
              }).catch(() => {});
            }
          });
        } catch (err) {
          console.warn("Error processing pins snapshot:", err);
        }
      }, (error) => {
        console.warn("RTDB pins listener error:", error);
      });

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
        try {
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
              safeStorage.setJSON('olivia_folders', loadedFolders);
            }
          }
        } catch (err) {
          console.warn("Error processing folders snapshot:", err);
        }
      }, (err) => {
        console.warn("RTDB folders sync error:", err);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn("RTDB folders fallback to local store:", e);
    }
  }, []);

  // Safe Persistence in localStorage
  useEffect(() => {
    cachePinsSafely(pins);
  }, [pins]);

  useEffect(() => {
    safeStorage.setJSON('olivia_folders', folders);
  }, [folders]);

  useEffect(() => {
    safeStorage.setJSON('olivia_liked_pins', likedPinIds);
  }, [likedPinIds]);

  useEffect(() => {
    safeStorage.setJSON('olivia_saved_pins', savedPinIds);
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
    const cleanPin = sanitizePin(newPin);
    setPins((prev) => [cleanPin, ...prev]);

    try {
      const newPinRef = ref(database, `pins/${cleanPin.id}`);
      set(newPinRef, cleanPin).catch(() => {});
    } catch {}

    addToast('¡Pin publicado con éxito en la galería oficial! 🐱');
  };

  // Permission guarded Folder creation handler
  const handleAddFolder = (folderName) => {
    const cleanName = sanitizeText(folderName, 60);
    if (!cleanName) return;
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
    const cleanComment = sanitizeComment(commentObj);
    if (!cleanComment) return;

    setPins((prevPins) =>
      prevPins.map((p) => {
        if (p.id === pinId) {
          const updatedComments = [...(p.comments || []), cleanComment];
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
        comments: [...(prev.comments || []), cleanComment]
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
          // Remove from RTDB pins node
          remove(ref(database, `pins/${pin.id}`)).catch((err) => console.warn(err));
          // Mark as permanently deleted in RTDB deleted_pins node
          set(ref(database, `deleted_pins/${pin.id}`), {
            deletedAt: new Date().toISOString(),
            deletedBy: user?.displayName || user?.email || 'Admin',
            title: pin.title || ''
          }).catch(() => {});
        } catch {}

        // Update local deleted ids
        const updatedDeleted = Array.from(new Set([...deletedPinIdsRef.current, pin.id]));
        setDeletedPinIds(updatedDeleted);
        deletedPinIdsRef.current = updatedDeleted;
        safeStorage.setJSON('olivia_deleted_pins', updatedDeleted);

        setPins((prev) => prev.filter((p) => p.id !== pin.id));
        if (selectedPin && selectedPin.id === pin.id) {
          setSelectedPin(null);
        }
        addToast(`Pin "${pin.title}" eliminado definitivamente 🗑️`);
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
          if (folderSlug) {
            const folderPins = pins.filter((p) => p.cloudinaryFolder === folderSlug);
            const folderPinIds = folderPins.map((p) => p.id);
            const updatedDeleted = Array.from(new Set([...deletedPinIdsRef.current, ...folderPinIds]));
            setDeletedPinIds(updatedDeleted);
            deletedPinIdsRef.current = updatedDeleted;
            safeStorage.setJSON('olivia_deleted_pins', updatedDeleted);

            folderPins.forEach((p) => {
              try {
                remove(ref(database, `pins/${p.id}`)).catch(() => {});
                set(ref(database, `deleted_pins/${p.id}`), {
                  deletedAt: new Date().toISOString(),
                  folder: folderSlug
                }).catch(() => {});
              } catch {}
            });

            setPins((prev) => prev.filter((p) => p.cloudinaryFolder !== folderSlug));
            addToast(`Se eliminaron ${folderPins.length} fotos de la carpeta 🗑️`);
          } else {
            // Delete ALL pins from gallery
            const allPinIds = pins.map((p) => p.id);
            const initialPinIds = INITIAL_PINS.map((ip) => ip.id);
            const updatedDeleted = Array.from(new Set([...deletedPinIdsRef.current, ...allPinIds, ...initialPinIds]));
            setDeletedPinIds(updatedDeleted);
            deletedPinIdsRef.current = updatedDeleted;
            safeStorage.setJSON('olivia_deleted_pins', updatedDeleted);

            try {
              remove(ref(database, 'pins')).catch(() => {});
              const deletedMap = {};
              updatedDeleted.forEach((id) => {
                deletedMap[id] = { deletedAt: new Date().toISOString() };
              });
              set(ref(database, 'deleted_pins'), deletedMap).catch(() => {});
            } catch {}

            setPins([]);
            if (selectedPin) setSelectedPin(null);
            addToast('Todos los pines han sido eliminados de la galería 🗑️');
          }
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
          // Clear deleted_pins so all initial pins can be restored
          remove(ref(database, 'deleted_pins')).catch(() => {});
          INITIAL_PINS.forEach((ip) => {
            set(ref(database, `pins/${ip.id}`), ip).catch(() => {});
          });
        } catch {}

        setDeletedPinIds([]);
        deletedPinIdsRef.current = [];
        safeStorage.setJSON('olivia_deleted_pins', []);
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
              const folderPinIds = folderPins.map((p) => p.id);
              const updatedDeleted = Array.from(new Set([...deletedPinIdsRef.current, ...folderPinIds]));
              setDeletedPinIds(updatedDeleted);
              deletedPinIdsRef.current = updatedDeleted;
              safeStorage.setJSON('olivia_deleted_pins', updatedDeleted);

              folderPins.forEach((p) => {
                try {
                  remove(ref(database, `pins/${p.id}`)).catch(() => {});
                  set(ref(database, `deleted_pins/${p.id}`), {
                    deletedAt: new Date().toISOString(),
                    folder: folder.slug
                  }).catch(() => {});
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

  // 7. Update Pin (Edit title, description, tags, album/folder, visibility)
  const handleUpdatePin = (pinId, updatedData) => {
    // Sanitize any updated fields
    const safeData = {};
    if (updatedData.title !== undefined) safeData.title = sanitizeText(updatedData.title, 120);
    if (updatedData.description !== undefined) safeData.description = sanitizeText(updatedData.description, 1000);
    if (updatedData.cloudinaryFolder !== undefined) safeData.cloudinaryFolder = sanitizeText(updatedData.cloudinaryFolder, 80);
    if (updatedData.visibility !== undefined) safeData.visibility = updatedData.visibility === 'members' ? 'members' : 'public';
    if (updatedData.tags !== undefined) safeData.tags = Array.isArray(updatedData.tags) ? updatedData.tags.map(t => sanitizeText(t, 40)) : [];
    if (updatedData.updatedAt !== undefined) safeData.updatedAt = sanitizeText(updatedData.updatedAt, 50);

    try {
      update(ref(database, `pins/${pinId}`), safeData).catch((err) => {
        console.warn('RTDB pin update error:', err);
      });
    } catch (e) {
      console.warn('RTDB pin update fallback:', e);
    }

    setPins((prev) =>
      prev.map((p) => (p.id === pinId ? { ...p, ...safeData } : p))
    );

    if (selectedPin && selectedPin.id === pinId) {
      setSelectedPin((prev) => ({ ...prev, ...safeData }));
    }

    addToast('Pin actualizado y movido con éxito ✨');
  };

  const handleLogout = async () => {
    await logoutUser();
    setIsAdmin(false);
    setIsApproved(false);
    setUserStatus('pending');
    safeStorage.removeItem('olivia_is_admin');
    safeStorage.removeItem('olivia_user_status');
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
        onEditPin={(pin) => setEditingPin(pin)}
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
          onEditPin={(pin) => setEditingPin(pin)}
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
              const savedAdmin = safeStorage.getItem('olivia_is_admin') === 'true';
              const savedStatus = safeStorage.getItem('olivia_user_status');
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
        onEditPin={(pin) => setEditingPin(pin)}
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

      {/* Edit Pin Modal - Author & Admin */}
      <EditPinModal
        isOpen={Boolean(editingPin)}
        pin={editingPin}
        folders={folders}
        onClose={() => setEditingPin(null)}
        onSave={handleUpdatePin}
        onDelete={(pinToDelete) => {
          setEditingPin(null);
          handleDeletePin(pinToDelete);
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
