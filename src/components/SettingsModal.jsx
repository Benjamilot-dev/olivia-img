import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cloud, 
  Shield, 
  Check, 
  Save, 
  Users, 
  Crown, 
  UserCheck, 
  UserX,
  Lock, 
  Clock,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Bell,
  Folder,
  Image,
  RotateCcw,
  Layers,
  Sparkles,
  Globe
} from 'lucide-react';
import { getCloudinaryConfig, saveCloudinaryConfig } from '../services/cloudinary';
import { firebaseConfig } from '../firebase/config';
import { 
  getAllUsers, 
  updateUserStatus, 
  changeUserRole, 
  deleteUserFromDatabase 
} from '../services/userService';
import UserAvatar from './UserAvatar';
import ConfirmModal from './ConfirmModal';

export default function SettingsModal({
  isOpen,
  onClose,
  onSettingsSaved,
  isAdmin,
  user,
  pins = [],
  folders = [],
  onDeletePin,
  onDeleteAllPins,
  onResetInitialPins,
  onDeleteFolder,
  onDeleteAllCustomFolders,
  onToggleVisibility,
  addToast
}) {
  const currentConfig = getCloudinaryConfig();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'content' | 'cloudinary'
  const [cloudName, setCloudName] = useState(currentConfig.cloudName || '');
  const [uploadPreset, setUploadPreset] = useState(currentConfig.uploadPreset || '');
  const [baseFolder, setBaseFolder] = useState(currentConfig.baseFolder || 'olivia-cat');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Users from Firebase Realtime Database
  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userFilter, setUserFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [userSearch, setUserSearch] = useState('');
  const [pinSearch, setPinSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [confirmConfig, setConfirmConfig] = useState(null);

  useEffect(() => {
    if (isOpen && isAdmin) {
      loadUsers();
    }
  }, [isOpen, isAdmin]);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    const users = await getAllUsers();
    setUsersList(users);
    setIsLoadingUsers(false);
  };

  const showFeedback = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  // Actions for Admin
  const handleApprove = async (targetUid, targetName) => {
    const res = await updateUserStatus(targetUid, 'approved', user?.displayName || 'Admin');
    if (res.success) {
      showFeedback(`Solicitud de ${targetName || 'usuario'} aprobada con éxito ✅`);
      if (addToast) addToast(`Usuario ${targetName || ''} aprobado con éxito ✅`);
      loadUsers();
    } else {
      showFeedback("Error: " + res.error);
      if (addToast) addToast("Error: " + res.error, "error");
    }
  };

  const handleReject = async (targetUid, targetName) => {
    const res = await updateUserStatus(targetUid, 'rejected', user?.displayName || 'Admin');
    if (res.success) {
      showFeedback(`Acceso de ${targetName || 'usuario'} denegado / pausado`);
      if (addToast) addToast(`Acceso pausado para ${targetName || 'usuario'}`, 'info');
      loadUsers();
    } else {
      showFeedback("Error: " + res.error);
      if (addToast) addToast("Error: " + res.error, "error");
    }
  };

  const handleDelete = (targetUid, targetName) => {
    if (targetUid === user?.uid) {
      showFeedback("No puedes eliminar tu propia cuenta de Administrador ⚠️");
      if (addToast) addToast("No puedes eliminar tu propia cuenta de Administrador", "error");
      return;
    }

    setConfirmConfig({
      title: `¿Eliminar al usuario "${targetName}"?`,
      message: 'Esta acción removerá permanentemente al usuario de la base de datos de Firebase y revocará sus permisos.',
      confirmText: 'Sí, eliminar usuario',
      cancelText: 'Cancelar',
      variant: 'danger',
      itemPreview: {
        title: targetName,
        subtitle: `ID: ${targetUid.slice(0, 14)}...`,
        badge: 'Usuario registrado'
      },
      onConfirm: async () => {
        const res = await deleteUserFromDatabase(targetUid);
        if (res.success) {
          showFeedback(`Usuario "${targetName}" eliminado correctamente 🗑️`);
          if (addToast) addToast(`Usuario "${targetName}" eliminado de Firebase`, 'info');
          loadUsers();
        } else {
          showFeedback("Error al eliminar: " + res.error);
          if (addToast) addToast("Error al eliminar: " + res.error, "error");
        }
      }
    });
  };

  const handleToggleRole = (targetUid, currentRole, targetName) => {
    if (targetUid === user?.uid) {
      showFeedback("No puedes quitarte el rol de Administrador a ti mismo ⚠️");
      if (addToast) addToast("No puedes quitarte el rol de Administrador", "error");
      return;
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    setConfirmConfig({
      title: newRole === 'admin' 
        ? `¿Ascender a "${targetName}" a Administrador?` 
        : `¿Cambiar a "${targetName}" a Usuario Estándar?`,
      message: newRole === 'admin'
        ? 'El usuario tendrá control total para gestionar fotos, carpetas, configuraciones y aprobar nuevos miembros.'
        : 'El usuario perderá las facultades de administración y pasará a ser un usuario estándar de la comunidad.',
      confirmText: newRole === 'admin' ? 'Ascender a Administrador 👑' : 'Cambiar a Estándar',
      cancelText: 'Cancelar',
      variant: newRole === 'admin' ? 'warning' : 'info',
      onConfirm: async () => {
        const res = await changeUserRole(targetUid, newRole);
        if (res.success) {
          showFeedback(`Rol de ${targetName} actualizado a: ${newRole === 'admin' ? 'Administrador 👑' : 'Usuario estándar 👤'}`);
          if (addToast) addToast(`Rol de ${targetName} actualizado`);
          loadUsers();
        } else {
          showFeedback("Error al cambiar rol: " + res.error);
          if (addToast) addToast("Error al cambiar rol: " + res.error, "error");
        }
      }
    });
  };

  if (!isOpen) return null;

  // Strict Security Access Guard
  if (!isAdmin) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <button className="modal-close-floating" onClick={onClose} title="Cerrar">
          <X size={20} />
        </button>

        <div
          className="upload-modal-card"
          style={{ maxWidth: '440px', textAlign: 'center', padding: '36px 24px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Lock size={32} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px' }}>
            Acceso Restringido
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '24px' }}>
            El panel de administración y la configuración del sistema están reservados exclusivamente para el <strong>Administrador</strong>.
          </p>

          <button
            className="btn-secondary"
            onClick={onClose}
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  const handleSaveConfig = (e) => {
    e.preventDefault();
    saveCloudinaryConfig({
      cloudName: cloudName.trim(),
      uploadPreset: uploadPreset.trim(),
      baseFolder: baseFolder.trim() || 'olivia-cat'
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onSettingsSaved) onSettingsSaved();
      onClose();
    }, 1000);
  };

  // Filter users by tab and search
  const pendingCount = usersList.filter(u => u.status === 'pending' && u.role !== 'admin').length;
  const filteredUsers = usersList.filter((u) => {
    // Tab filter
    if (userFilter === 'pending' && (u.status !== 'pending' || u.role === 'admin')) return false;
    if (userFilter === 'approved' && (u.status !== 'approved' && u.role !== 'admin')) return false;
    if (userFilter === 'rejected' && u.status !== 'rejected') return false;

    // Search filter
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      const matchName = u.displayName?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      return matchName || matchEmail;
    }
    return true;
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <button className="modal-close-floating" onClick={onClose} title="Cerrar">
        <X size={20} />
      </button>

      <div
        className="upload-modal-card"
        style={{ maxWidth: '780px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b'
            }}>
              <Shield size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800 }}>
                  Panel de Administrador
                </h2>
                <span style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#fbbf24',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Crown size={11} /> Admin Activo
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Gestión integral de usuarios, solicitudes de acceso y contenido
              </p>
            </div>
          </div>

          {/* Pending Requests Badge */}
          {pendingCount > 0 && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.18)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              animation: 'pulse 2s infinite'
            }}>
              <Bell size={13} />
              <span>{pendingCount} Solicitud{pendingCount > 1 ? 'es' : ''} pendiente{pendingCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Feedback message banner */}
        {statusMessage && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 14px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.84rem',
            color: '#34d399'
          }}>
            <CheckCircle size={15} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          marginBottom: '18px',
          gap: '4px',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            style={{
              flex: 1,
              minWidth: '180px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: activeTab === 'users' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'users' ? '#fff' : 'var(--text-muted)'
            }}
          >
            <Users size={15} />
            <span>Usuarios en DB ({usersList.length})</span>
            {pendingCount > 0 && (
              <span style={{
                background: '#e60023',
                color: '#fff',
                borderRadius: '9999px',
                fontSize: '0.68rem',
                padding: '1px 6px',
                fontWeight: 700
              }}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('content')}
            style={{
              flex: 1,
              minWidth: '180px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: activeTab === 'content' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'content' ? '#fff' : 'var(--text-muted)'
            }}
          >
            <Layers size={15} />
            <span>Pines ({pins.length}) & Álbumes ({folders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cloudinary')}
            style={{
              flex: 1,
              minWidth: '180px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: activeTab === 'cloudinary' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'cloudinary' ? '#fff' : 'var(--text-muted)'
            }}
          >
            <Cloud size={15} />
            <span>Almacenamiento & Servidor</span>
          </button>
        </div>

        {/* TAB: USERS & ACCESS REQUESTS */}
        {activeTab === 'users' && (
          <div>
            {/* Search and Filters Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              marginBottom: '14px',
              flexWrap: 'wrap'
            }}>
              {/* Filter pills */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                <button
                  type="button"
                  className={`btn-secondary ${userFilter === 'all' ? 'active-filter' : ''}`}
                  onClick={() => setUserFilter('all')}
                  style={{
                    fontSize: '0.76rem',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: userFilter === 'all' ? '#ffffff' : 'rgba(255, 255, 255, 0.06)',
                    color: userFilter === 'all' ? '#111827' : 'var(--text-muted)',
                    fontWeight: userFilter === 'all' ? 700 : 500
                  }}
                >
                  Todos ({usersList.length})
                </button>
                <button
                  type="button"
                  className={`btn-secondary ${userFilter === 'pending' ? 'active-filter' : ''}`}
                  onClick={() => setUserFilter('pending')}
                  style={{
                    fontSize: '0.76rem',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: userFilter === 'pending' ? '#f59e0b' : 'rgba(245, 158, 11, 0.1)',
                    color: userFilter === 'pending' ? '#000000' : '#fbbf24',
                    fontWeight: userFilter === 'pending' ? 700 : 600
                  }}
                >
                  Pendientes ({pendingCount})
                </button>
                <button
                  type="button"
                  className={`btn-secondary ${userFilter === 'approved' ? 'active-filter' : ''}`}
                  onClick={() => setUserFilter('approved')}
                  style={{
                    fontSize: '0.76rem',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: userFilter === 'approved' ? '#10b981' : 'rgba(16, 185, 129, 0.1)',
                    color: userFilter === 'approved' ? '#ffffff' : '#34d399',
                    fontWeight: userFilter === 'approved' ? 700 : 500
                  }}
                >
                  Aprobados ({usersList.filter(u => u.status === 'approved' || u.role === 'admin').length})
                </button>
                <button
                  type="button"
                  className={`btn-secondary ${userFilter === 'rejected' ? 'active-filter' : ''}`}
                  onClick={() => setUserFilter('rejected')}
                  style={{
                    fontSize: '0.76rem',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: userFilter === 'rejected' ? '#ef4444' : 'rgba(239, 68, 68, 0.1)',
                    color: userFilter === 'rejected' ? '#ffffff' : '#f87171',
                    fontWeight: userFilter === 'rejected' ? 700 : 500
                  }}
                >
                  Rechazados ({usersList.filter(u => u.status === 'rejected').length})
                </button>
              </div>

              {/* Search input & Refresh */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Buscar usuario o email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{
                    background: '#11151c',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px 12px',
                    fontSize: '0.78rem',
                    width: '180px'
                  }}
                />
                <button
                  type="button"
                  className="btn-icon"
                  onClick={loadUsers}
                  style={{ width: '32px', height: '32px' }}
                  title="Actualizar lista de usuarios"
                >
                  <RefreshCw size={13} className={isLoadingUsers ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Users List Container */}
            <div style={{
              maxHeight: '360px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '18px',
              paddingRight: '4px'
            }}>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isCurrent = u.uid === user?.uid;
                  const isUserAdmin = u.role === 'admin';
                  const isPending = u.status === 'pending' && !isUserAdmin;
                  const isApproved = u.status === 'approved' || isUserAdmin;
                  const isRejected = u.status === 'rejected';

                  return (
                    <div
                      key={u.uid}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        background: isPending
                          ? 'rgba(245, 158, 11, 0.08)'
                          : isCurrent
                          ? 'rgba(255, 255, 255, 0.04)'
                          : 'rgba(0, 0, 0, 0.22)',
                        border: isPending
                          ? '1px solid rgba(245, 158, 11, 0.35)'
                          : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}
                    >
                      {/* Left: User Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '220px', flex: 1 }}>
                        <UserAvatar user={u} size={36} />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#fff', whiteSpace: 'nowrap' }}>
                              {u.displayName || 'Usuario'}
                            </strong>
                            {isCurrent && (
                              <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 700 }}>
                                (Tú)
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.email || u.uid}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                            {u.createdAt ? `Registrado: ${new Date(u.createdAt).toLocaleDateString()}` : 'Registrado recientemente'}
                          </span>
                        </div>
                      </div>

                      {/* Center: Status & Role Badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {/* Status Badge */}
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: isPending
                            ? 'rgba(245, 158, 11, 0.2)'
                            : isApproved
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                          color: isPending ? '#fbbf24' : isApproved ? '#34d399' : '#f87171',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {isPending ? (
                            <>
                              <Clock size={11} />
                              <span>Pendiente</span>
                            </>
                          ) : isApproved ? (
                            <>
                              <CheckCircle size={11} />
                              <span>Aprobado</span>
                            </>
                          ) : (
                            <>
                              <UserX size={11} />
                              <span>Rechazado</span>
                            </>
                          )}
                        </span>

                        {/* Role Badge */}
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: isUserAdmin ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                          color: isUserAdmin ? '#fbbf24' : 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {isUserAdmin ? <Crown size={11} /> : <UserCheck size={11} />}
                          <span>{isUserAdmin ? 'Admin' : 'Usuario'}</span>
                        </span>
                      </div>

                      {/* Right: Admin Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {/* Approve Button */}
                        {!isApproved && (
                          <button
                            type="button"
                            onClick={() => handleApprove(u.uid, u.displayName)}
                            style={{
                              background: '#10b981',
                              color: '#fff',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '5px 10px',
                              borderRadius: 'var(--radius-full)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Aceptar solicitud del usuario para subir fotos y crear carpetas"
                          >
                            <Check size={12} />
                            <span>Aceptar</span>
                          </button>
                        )}

                        {/* Reject / Pause Button */}
                        {!isCurrent && isApproved && !isUserAdmin && (
                          <button
                            type="button"
                            onClick={() => handleReject(u.uid, u.displayName)}
                            className="btn-secondary"
                            style={{ fontSize: '0.72rem', padding: '5px 9px', color: '#f87171' }}
                            title="Bloquear o pausar permisos"
                          >
                            Pausar
                          </button>
                        )}

                        {/* Toggle Admin Role */}
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleToggleRole(u.uid, u.role, u.displayName)}
                            className="btn-secondary"
                            style={{ fontSize: '0.72rem', padding: '5px 9px' }}
                            title={isUserAdmin ? "Quitar rol de Administrador" : "Hacer Administrador del sistema"}
                          >
                            {isUserAdmin ? 'Quitar Admin' : 'Hacer Admin'}
                          </button>
                        )}

                        {/* Delete User from DB */}
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleDelete(u.uid, u.displayName)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              padding: '5px 8px',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer'
                            }}
                            title="Eliminar usuario de la plataforma"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{
                  padding: '30px 20px',
                  textAlign: 'center',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-dim)',
                  fontSize: '0.85rem'
                }}>
                  {userSearch
                    ? `No se encontraron usuarios que coincidan con "${userSearch}".`
                    : `No hay usuarios con el filtro seleccionado (${userFilter}).`}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        )}

        {/* TAB: CONTENT MANAGEMENT (PINS & FOLDERS) */}
        {activeTab === 'content' && (
          <div>
            {/* Global Stats & Admin Batch Actions */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={16} color="#ef4444" />
                  <strong style={{ fontSize: '0.92rem', color: '#f87171' }}>
                    Acciones Globales de Limpieza (Solo Admin)
                  </strong>
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem' }}>
                  <span style={{ padding: '3px 10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)' }}>
                    📸 <strong>{pins.length}</strong> Pines en total
                  </span>
                  <span style={{ padding: '3px 10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)' }}>
                    📁 <strong>{folders.length}</strong> Carpetas activas
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => onDeleteAllPins && onDeleteAllPins(null)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title="Eliminar permanentemente todos los pines de la base de datos"
                >
                  <Trash2 size={14} />
                  <span>Eliminar TODOS los Pines ({pins.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => onResetInitialPins && onResetInitialPins()}
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title="Restablecer los pines y fotos oficiales de Olivia"
                >
                  <RotateCcw size={14} />
                  <span>Restablecer Pines Oficiales</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteAllCustomFolders && onDeleteAllCustomFolders()}
                  style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    color: '#c4b5fd',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title="Eliminar carpetas creadas y volver a las predeterminadas"
                >
                  <Folder size={14} />
                  <span>Restablecer Carpetas</span>
                </button>
              </div>
            </div>

            {/* FOLDERS MANAGEMENT */}
            <div style={{ marginBottom: '22px' }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Folder size={15} color="#fbbf24" />
                <span>Gestión de Carpetas ({folders.length})</span>
              </h3>

              <div style={{
                maxHeight: '190px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                {folders.map((f) => {
                  const folderPinsCount = f.slug ? pins.filter(p => p.cloudinaryFolder === f.slug).length : pins.length;
                  const isAll = f.id === 'all';

                  return (
                    <div
                      key={f.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Folder size={14} color={f.color || '#fbbf24'} />
                        <strong style={{ color: '#fff' }}>{f.name}</strong>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.74rem' }}>
                          ({f.slug || 'General'})
                        </span>
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#fff',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}>
                          {folderPinsCount} fotos
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* Empty folder pins */}
                        {f.slug && folderPinsCount > 0 && (
                          <button
                            type="button"
                            onClick={() => onDeleteAllPins && onDeleteAllPins(f.slug)}
                            className="btn-secondary"
                            style={{ fontSize: '0.72rem', padding: '4px 8px', color: '#f87171' }}
                            title={`Eliminar las ${folderPinsCount} fotos de esta carpeta`}
                          >
                            Vaciar fotos
                          </button>
                        )}

                        {/* Delete folder */}
                        {!isAll && (
                          <button
                            type="button"
                            onClick={() => onDeleteFolder && onDeleteFolder(f)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.12)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title={`Eliminar carpeta "${f.name}"`}
                          >
                            <Trash2 size={11} />
                            <span>Eliminar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PINS MANAGEMENT (INDIVIDUAL PINS LIST) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Image size={15} color="#60a5fa" />
                  <span>Eliminar Fotos Individuales ({pins.length})</span>
                </h3>

                <input
                  type="text"
                  placeholder="Buscar foto por título..."
                  value={pinSearch}
                  onChange={(e) => setPinSearch(e.target.value)}
                  style={{
                    background: '#11151c',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px 12px',
                    fontSize: '0.78rem',
                    width: '200px'
                  }}
                />
              </div>

              <div style={{
                maxHeight: '220px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '16px'
              }}>
                {pins
                  .filter((p) => {
                    if (!pinSearch.trim()) return true;
                    const q = pinSearch.toLowerCase();
                    return p.title?.toLowerCase().includes(q) || p.cloudinaryFolder?.toLowerCase().includes(q);
                  })
                  .map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          style={{ width: '38px', height: '38px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0, background: '#111' }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                          <strong style={{ color: '#fff', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {p.title}
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {p.cloudinaryFolder || 'general'} • por {p.author?.name || 'Olivia'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => onToggleVisibility && onToggleVisibility(p)}
                          style={{
                            background: p.visibility === 'members' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: p.visibility === 'members' ? '#c4b5fd' : '#34d399',
                            border: p.visibility === 'members' ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title={p.visibility === 'members' ? "Clic para hacerla Pública para todos" : "Clic para hacerla Solo para Miembros Registrados"}
                        >
                          {p.visibility === 'members' ? <Lock size={11} /> : <Globe size={11} />}
                          <span>{p.visibility === 'members' ? 'Solo Miembros' : 'Pública'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeletePin && onDeletePin(p)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '5px 9px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title={`Eliminar pin "${p.title}"`}
                        >
                          <Trash2 size={12} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        )}

        {/* TAB: CLOUDINARY & FIREBASE SETTINGS */}
        {activeTab === 'cloudinary' && (
          <form onSubmit={handleSaveConfig}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '18px'
            }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Cloud size={16} color="#60a5fa" />
                <span>Almacenamiento en la Nube</span>
              </h3>

              <div className="form-group">
                <label className="form-label">Cloud Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ej: duy58b6re"
                  value={cloudName}
                  onChange={(e) => setCloudName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Upload Preset (Unsigned / No firmado)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ej: olivia_pins"
                  value={uploadPreset}
                  onChange={(e) => setUploadPreset(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Prefijo de Carpeta Principal</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="olivia-cat"
                  value={baseFolder}
                  onChange={(e) => setBaseFolder(e.target.value)}
                />
              </div>
            </div>

            {/* Firebase Connection Status */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Shield size={16} color="#10b981" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>
                  Base de Datos en Tiempo Real Conectada
                </h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <div><strong>Project ID:</strong> {firebaseConfig.projectId}</div>
                <div><strong>Auth Domain:</strong> {firebaseConfig.authDomain}</div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Realtime DB:</strong> {firebaseConfig.databaseURL}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="btn-primary-pinterest"
                style={{ padding: '9px 20px', background: savedSuccess ? '#10b981' : 'var(--accent-pinterest)' }}
              >
                {savedSuccess ? (
                  <>
                    <Check size={16} />
                    <span>¡Guardado!</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Guardar Ajustes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Internal Confirm Modal */}
      {confirmConfig && (
        <ConfirmModal
          isOpen={Boolean(confirmConfig)}
          onClose={() => setConfirmConfig(null)}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          variant={confirmConfig.variant}
          itemPreview={confirmConfig.itemPreview}
          options={confirmConfig.options}
          onConfirm={confirmConfig.onConfirm}
        />
      )}
    </div>
  );
}
