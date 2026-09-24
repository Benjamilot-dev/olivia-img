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
  Bell
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

export default function SettingsModal({
  isOpen,
  onClose,
  onSettingsSaved,
  isAdmin,
  user
}) {
  const currentConfig = getCloudinaryConfig();
  const [activeTab, setActiveTab] = useState('users'); // Start on 'users' so admin sees requests directly
  const [cloudName, setCloudName] = useState(currentConfig.cloudName || '');
  const [uploadPreset, setUploadPreset] = useState(currentConfig.uploadPreset || '');
  const [baseFolder, setBaseFolder] = useState(currentConfig.baseFolder || 'olivia-cat');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Users from Firebase Realtime Database
  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userFilter, setUserFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [userSearch, setUserSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

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
      loadUsers();
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleReject = async (targetUid, targetName) => {
    const res = await updateUserStatus(targetUid, 'rejected', user?.displayName || 'Admin');
    if (res.success) {
      showFeedback(`Acceso de ${targetName || 'usuario'} denegado / pausado`);
      loadUsers();
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleDelete = async (targetUid, targetName) => {
    if (targetUid === user?.uid) {
      alert("No puedes eliminar tu propia cuenta de Administrador.");
      return;
    }
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a "${targetName}" de la base de datos de Firebase?`);
    if (!confirmed) return;

    const res = await deleteUserFromDatabase(targetUid);
    if (res.success) {
      showFeedback(`Usuario ${targetName} eliminado de la base de datos 🗑️`);
      loadUsers();
    } else {
      alert("Error al eliminar: " + res.error);
    }
  };

  const handleToggleRole = async (targetUid, currentRole, targetName) => {
    if (targetUid === user?.uid) {
      alert("No puedes quitarte el rol de Administrador a ti mismo.");
      return;
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const res = await changeUserRole(targetUid, newRole);
    if (res.success) {
      showFeedback(`Rol de ${targetName} cambiado a: ${newRole === 'admin' ? 'Administrador 👑' : 'Usuario estándar 👤'}`);
      loadUsers();
    } else {
      alert("Error al cambiar rol: " + res.error);
    }
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
            La configuración de Cloudinary y la administración de usuarios está reservada exclusivamente para el <strong>Administrador</strong>.
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
                Gestión de solicitudes de acceso, usuarios en Firebase y Cloudinary
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
          marginBottom: '18px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            style={{
              flex: 1,
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.84rem',
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
            <span>Solicitudes & Usuarios en DB ({usersList.length})</span>
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
            onClick={() => setActiveTab('cloudinary')}
            style={{
              flex: 1,
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.84rem',
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
            <span>Almacenamiento Cloudinary & Firebase</span>
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
                  title="Actualizar lista de Firebase"
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
                            title="Eliminar usuario permanentemente de Firebase"
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
                <span>Credenciales de Cloudinary</span>
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
                  Firebase Conectado Activo
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
    </div>
  );
}
