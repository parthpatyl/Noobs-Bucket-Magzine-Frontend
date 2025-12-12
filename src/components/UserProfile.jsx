import { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bookmark, Heart, Calendar, Edit, Camera, Settings, Download, User, Mail, Lock, Eye, EyeOff, Save, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from './Notification';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


const UserProfile = () => {
  const { id } = useParams();
  const { user, likedArticles, savedArticles, updateUser, changePassword } = useContext(AuthContext);
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('saved');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    email: user?.email || ''
  });
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);

  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        bio: user.bio || '',
        email: user.email || ''
      });
      setProfileImage(user.profileImage || null);
    }
  }, [user]);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [crop, setCrop] = useState();
  const [imageSrc, setImageSrc] = useState();
  const [croppedImage, setCroppedImage] = useState();
  const [isCropping, setIsCropping] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  // Handle profile image upload with size validation
  const handleProfileImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (2-5 MB limit)
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB < 2) {
        setFileSizeError('Image must be at least 2MB');
        return;
      }
      if (fileSizeMB > 5) {
        setFileSizeError('Image must be less than 5MB');
        return;
      }
      
      setFileSizeError(null);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        setImageSrc(imageUrl);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to handle crop completion
  const handleCropComplete = (crop) => {
    if (!imgRef.current || !crop.width || !crop.height) return;
    
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        imgRef.current,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
      
      const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCroppedImage(croppedImageUrl);
    }
  };

  // Function to compress image data URL
  const compressImageDataURL = (dataURL, quality = 0.8) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = dataURL;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image with reduced quality
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL with specified quality
        const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataURL);
      };
    });
  };

  // Function to handle crop confirmation
  const handleCropConfirm = async () => {
    if (croppedImage) {
      try {
        // Compress the image before saving to reduce size
        const compressedImage = await compressImageDataURL(croppedImage, 0.7);
        setProfileImage(compressedImage);
        updateUser({ profileImage: compressedImage });
        setIsCropping(false);
        setImageSrc(undefined);
        setCroppedImage(undefined);
      } catch (error) {
        console.error("Error compressing image:", error);
        // Fallback to original image if compression fails
        setProfileImage(croppedImage);
        updateUser({ profileImage: croppedImage });
        setIsCropping(false);
        setImageSrc(undefined);
        setCroppedImage(undefined);
      }
    }
  };

  // Function to handle crop cancellation
  const handleCropCancel = () => {
    setIsCropping(false);
    setImageSrc(undefined);
    setCroppedImage(undefined);
  };

  const handleEditClick = () => {
    setEditData({
      name: user?.name || '',
      bio: user?.bio || '',
      email: user?.email || ''
    });
    setIsEditModalOpen(true);
  };

  // Email validation function
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  // Password validation function
  const validatePassword = (password) => {
    // Minimum 8 characters, at least one letter and one number
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return re.test(password);
  };

  // Theme toggle functions
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Apply theme to document
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
      addNotification('Dark mode enabled', 'info');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      addNotification('Light mode enabled', 'info');
    }
  };

  const toggleEmailNotifications = () => {
    const newSetting = !emailNotifications;
    setEmailNotifications(newSetting);
    localStorage.setItem('emailNotifications', newSetting.toString());
    addNotification(
      newSetting ? 'Email notifications enabled' : 'Email notifications disabled',
      newSetting ? 'success' : 'warning'
    );
  };

  const toggleBrowserNotifications = async () => {
    const newSetting = !browserNotifications;
    
    if (newSetting) {
      // Request notification permission
      if ('Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            setBrowserNotifications(true);
            localStorage.setItem('browserNotifications', 'true');
            addNotification('Browser notifications enabled', 'success');
          } else {
            setBrowserNotifications(false);
            localStorage.setItem('browserNotifications', 'false');
            addNotification('Browser notifications blocked by user', 'warning');
          }
        } catch (error) {
          console.error('Error requesting notification permission:', error);
          setBrowserNotifications(false);
          addNotification('Failed to enable browser notifications', 'error');
        }
      } else {
        addNotification('Browser notifications not supported', 'warning');
      }
    } else {
      setBrowserNotifications(false);
      localStorage.setItem('browserNotifications', 'false');
      addNotification('Browser notifications disabled', 'info');
    }
  };

  // Load preferences from localStorage on mount
  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.add('light');
    }

    // Load notification preferences
    const savedEmailNotifications = localStorage.getItem('emailNotifications');
    if (savedEmailNotifications !== null) {
      setEmailNotifications(savedEmailNotifications === 'true');
    }

    const savedBrowserNotifications = localStorage.getItem('browserNotifications');
    if (savedBrowserNotifications !== null) {
      setBrowserNotifications(savedBrowserNotifications === 'true');
    }
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    // Validate email before saving
    if (editData.email && !validateEmail(editData.email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    updateUser({
      name: editData.name,
      bio: editData.bio,
      email: editData.email
    });
    setIsEditModalOpen(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleExportData = () => {
    const userData = {
      userInfo: {
        name: user?.name || 'Unknown',
        email: user?.email || 'Unknown',
        bio: user?.bio || 'No bio available',
        memberSince: user?.memberSince ? new Date(user.memberSince).toISOString() : 'Unknown',
        profileImage: user?.profileImage || 'None'
      },
      savedArticles: savedArticles.map(article => ({
        id: article._id || article,
        title: article.title || `Article ${article._id || article}`
      })),
      likedArticles: likedArticles.map(article => ({
        id: article._id || article,
        title: article.title || `Article ${article._id || article}`
      })),
      statistics: {
        totalSaved: savedArticles.length,
        totalLiked: likedArticles.length,
        joinDate: user.memberSince ? new Date(user.memberSince).toISOString() : 'Unknown'
      }
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `noobs-bucket-user-data-${user._id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Check for active tab from localStorage (set by dropdown navigation)
  useEffect(() => {
    const activeTabFromStorage = localStorage.getItem('activeProfileTab');
    if (activeTabFromStorage && ['saved', 'liked', 'settings'].includes(activeTabFromStorage)) {
      setActiveTab(activeTabFromStorage);
      localStorage.removeItem('activeProfileTab'); // Clean up after reading
    }
  }, []);

  // Ensure UserProfile is wrapped in AuthProvider
  if (!user) {
    console.warn("⚠️ User is undefined, redirecting...");
    navigate("/auth/login");
    return null; // Return null to avoid rendering the component
  }

  // Ensure the URL id matches our user id
  if (user._id !== id) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="bg-brand-surface p-8 rounded-lg shadow-lg text-center border border-white/10">
          <span className="text-6xl mb-4 block">😞</span>
          <h1 className="text-2xl font-bold text-brand-text mb-4">
            User Not Found
          </h1>
          <button
            onClick={() => navigate("/magazine")}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-orange-600 transition-colors shadow-glow"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Helper function to render articles from an array (handles both objects and IDs)
  const renderArticles = (articlesArray) => {
    // If elements are objects, use their properties; if they are IDs, just display the ID.
    return articlesArray.map((article) => {
      const articleId = article._id || article.id || article; // fallback to article itself if it's an ID
      const title = (article && article.title) ? article.title : `Article ${articleId}`;
      return (
          <div
            key={articleId}
            className="cursor-pointer bg-brand-bg rounded-xl shadow-lg p-6 hover:shadow-glow transition-all duration-300 border border-white/5 group hover:-translate-y-1 flex flex-col h-full"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(`/article/${articleId}`)}
          >
            <div className="min-h-[120px]">
              <h3 className="text-xl font-bold text-brand-text group-hover:text-brand-primary transition-colors mb-2">{title}</h3>
              {article.excerpt && (
                <div className="flex-1">
                  <p className="text-sm text-brand-muted line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center">
              <div className="ml-auto">
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/article/${articleId}`); }}
                  className="px-4 py-2 bg-brand-primary text-white rounded-xl hover:bg-orange-600 focus:outline-none focus:ring focus:ring-orange-300 font-bold shadow-glow text-sm"
                >
                  Read Article
                </button>
              </div>
            </div>
          </div>
        );
    });
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      {/* Header Banner */}
      <div className="h-64 bg-gradient-to-r from-brand-primary via-orange-500 to-brand-secondary relative">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
        <div className="bg-brand-surface rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-brand-surface flex items-center justify-center border-4 border-brand-surface shadow-xl overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl font-bold text-brand-primary">
                      {user?.name && user.name[0] ? user.name[0].toUpperCase() : '?'}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-2 right-2 bg-brand-primary p-2 rounded-full hover:bg-orange-600 transition-colors shadow-glow"
                  title="Change profile picture"
                >
                  <Camera className="h-4 w-4 text-white" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfileImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                {fileSizeError && (
                  <div className="absolute -bottom-8 left-0 right-0 text-center">
                    <p className="text-sm text-red-500 bg-red-900/20 px-2 py-1 rounded">{fileSizeError}</p>
                  </div>
                )}
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white ">{user?.name || 'User'}</h1>
                  <button
                    onClick={handleEditClick}
                    className="p-2 bg-brand-bg rounded-full hover:bg-white/10 transition-colors border border-white/10"
                    title="Edit profile"
                  >
                    <Edit className="h-4 w-4 text-brand-text" />
                  </button>
                </div>
                <p className="text-brand-muted text-lg">{user?.email || 'No email'}</p>
                {user?.bio && (
                  <p className="text-brand-text mt-2 text-sm italic">{user.bio}</p>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/magazine")}
                  className="px-6 py-3 bg-brand-bg text-brand-text rounded-xl hover:bg-white/10 transition-colors border border-white/10 font-medium"
                >
                  Back to Articles
                </button>
                <button
                  onClick={handleExportData}
                  className="px-6 py-3 bg-brand-bg text-brand-text rounded-xl hover:bg-white/10 transition-colors border border-white/10 font-medium"
                  title="Export your data"
                >
                  <Download className="h-4 w-4 inline-block mr-2" /> Export Data
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-brand-bg p-6 rounded-xl border border-white/5 flex items-center gap-4">
                <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
                  <Bookmark className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-brand-muted text-sm">Saved Articles</p>
                  <p className="text-2xl font-bold text-brand-text">{savedArticles.length}</p>
                </div>
              </div>
              <div className="bg-brand-bg p-6 rounded-xl border border-white/5 flex items-center gap-4">
                <div className="p-3 bg-brand-secondary/10 rounded-lg text-brand-secondary">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-brand-muted text-sm">Liked Articles</p>
                  <p className="text-2xl font-bold text-brand-text">{likedArticles.length}</p>
                </div>
              </div>
              <div className="bg-brand-bg p-6 rounded-xl border border-white/5 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-brand-muted text-sm">Member Since</p>
                  <p className="text-2xl font-bold text-brand-text">
                    {user.memberSince ? new Date(user.memberSince).getFullYear() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10 mb-8">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`pb-4 text-lg font-medium transition-all relative ${activeTab === 'saved'
                    ? 'text-brand-primary'
                    : 'text-brand-muted hover:text-brand-text'
                    }`}
                >
                  Saved Articles
                  {activeTab === 'saved' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-t-full"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('liked')}
                  className={`pb-4 text-lg font-medium transition-all relative ${activeTab === 'liked'
                    ? 'text-brand-primary'
                    : 'text-brand-muted hover:text-brand-text'
                    }`}
                >
                  Liked Articles
                  {activeTab === 'liked' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-t-full"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`pb-4 text-lg font-medium transition-all relative ${activeTab === 'settings'
                    ? 'text-brand-primary'
                    : 'text-brand-muted hover:text-brand-text'
                    }`}
                >
                  Settings
                  {activeTab === 'settings' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-t-full"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
              {activeTab === 'saved' ? (
                savedArticles.length > 0 ? renderArticles(savedArticles) : (
                  <div className="col-span-full text-center py-12 text-brand-muted bg-brand-bg rounded-xl border border-white/5">
                    <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No saved articles yet.</p>
                  </div>
                )
              ) : activeTab === 'liked' ? (
                likedArticles.length > 0 ? renderArticles(likedArticles) : (
                  <div className="col-span-full text-center py-12 text-brand-muted bg-brand-bg rounded-xl border border-white/5">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No liked articles yet.</p>
                  </div>
                )
              ) : (
                // Settings Tab Content
                <div className="col-span-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Account Settings */}
                    <div className="bg-brand-bg p-6 rounded-xl border border-white/5">
                      <h3 className="text-xl font-bold text-brand-text mb-4 flex items-center gap-2">
                        <User className="h-5 w-5" /> Account Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-brand-surface rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-brand-muted" />
                            <span className="text-brand-text">Email Address</span>
                          </div>
                          <span className="text-brand-primary font-medium">{user?.email || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-brand-surface rounded-lg">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-brand-muted" />
                            <span className="text-brand-text">Member Since</span>
                          </div>
                          <span className="text-brand-primary font-medium">
                            {user?.memberSince ? new Date(user.memberSince).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-brand-surface rounded-lg">
                          <div className="flex items-center gap-3">
                            <Bookmark className="h-5 w-5 text-brand-muted" />
                            <span className="text-brand-text">Saved Articles</span>
                          </div>
                          <span className="text-brand-primary font-medium">{savedArticles.length}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-brand-surface rounded-lg">
                          <div className="flex items-center gap-3">
                            <Heart className="h-5 w-5 text-brand-muted" />
                            <span className="text-brand-text">Liked Articles</span>
                          </div>
                          <span className="text-brand-primary font-medium">{likedArticles.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-brand-bg p-6 rounded-xl border border-white/5">
                      <h3 className="text-xl font-bold text-brand-text mb-4 flex items-center gap-2">
                        <Lock className="h-5 w-5" /> Security Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="p-3 bg-brand-surface rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-brand-text font-medium">Change Password</span>
                          </div>
                          <div className="space-y-3">
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                name="currentPassword"
                                placeholder="Current Password"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-3 py-2 bg-brand-bg border border-white/10 rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
                              />
                            </div>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                name="newPassword"
                                placeholder="New Password"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-3 py-2 bg-brand-bg border border-white/10 rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
                              />
                            </div>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm New Password"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-3 py-2 bg-brand-bg border border-white/10 rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
                              />
                            </div>
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-sm text-brand-primary hover:text-orange-400 transition-colors flex items-center gap-1"
                            >
                              {showPassword ? (
                                <> <EyeOff className="h-4 w-4" /> Hide Passwords </>
                              ) : (
                                <> <Eye className="h-4 w-4" /> Show Passwords </>
                              )}
                            </button>
                            <button
                              onClick={async () => {
                                // Validate new password
                                if (!validatePassword(passwordData.newPassword)) {
                                  addNotification('Password must be at least 8 characters with at least one letter and one number', 'error');
                                  return;
                                }

                                // Call the changePassword function from AuthContext
                                const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
                                
                                if (result.success) {
                                  addNotification('Password changed successfully!', 'success');
                                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                } else {
                                  addNotification(result.message || 'Failed to change password', 'error');
                                }
                              }}
                              disabled={!passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${passwordData.newPassword && passwordData.newPassword === passwordData.confirmPassword
                                ? 'bg-brand-primary text-white hover:bg-orange-600 shadow-glow'
                                : 'bg-brand-bg text-brand-muted cursor-not-allowed'}`}
                            >
                              Update Password
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-brand-bg p-6 rounded-xl border border-white/5 lg:col-span-2">
                      <h3 className="text-xl font-bold text-brand-text mb-4 flex items-center gap-2">
                        <Settings className="h-5 w-5" /> Preferences
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-brand-surface rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-brand-text">Dark Mode</span>
                            <div className="relative inline-block w-12 h-6">
                              <input
                                type="checkbox"
                                aria-label="Toggle dark mode"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer peer z-30"
                                checked={darkMode}
                                onChange={toggleDarkMode}
                                id="darkModeToggle"
                              />
                              <div className="w-12 h-6 bg-brand-bg rounded-full peer-checked:bg-brand-primary transition-colors"></div>
                              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full peer-checked:left-6 peer-checked:bg-white transition-all"></div>
                            </div>
                          </div>
                          <p className="text-sm text-brand-muted">Toggle between light and dark theme</p>
                        </div>
                        <div className="p-4 bg-brand-surface rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-brand-text">Email Notifications</span>
                            <div className="relative inline-block w-12 h-6">
                              <input
                                type="checkbox"
                                aria-label="Toggle email notifications"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer peer z-30"
                                checked={emailNotifications}
                                onChange={toggleEmailNotifications}
                                id="emailNotificationsToggle"
                              />
                              <div className="w-12 h-6 bg-brand-bg rounded-full peer-checked:bg-brand-primary transition-colors"></div>
                              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full peer-checked:left-6 peer-checked:bg-white transition-all"></div>
                            </div>
                          </div>
                          <p className="text-sm text-brand-muted">Receive updates and newsletters</p>
                        </div>
                        <div className="p-4 bg-brand-surface rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-brand-text">Browser Notifications</span>
                            <div className="relative inline-block w-12 h-6">
                              <input
                                type="checkbox"
                                aria-label="Toggle browser notifications"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer peer z-30"
                                checked={browserNotifications}
                                onChange={toggleBrowserNotifications}
                                id="browserNotificationsToggle"
                              />
                              <div className="w-12 h-6 bg-brand-bg rounded-full peer-checked:bg-brand-primary transition-colors"></div>
                              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full peer-checked:left-6 peer-checked:bg-white transition-all"></div>
                            </div>
                          </div>
                          <p className="text-sm text-brand-muted">Get desktop notifications for important updates</p>
                        </div>
                        <div className="p-4 bg-brand-surface rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-brand-text">Content Preferences</span>
                            <button
                              onClick={() => addNotification('Content preferences coming soon!', 'info')}
                              className="px-3 py-1 bg-brand-primary text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
                            >
                              Configure
                            </button>
                          </div>
                          <p className="text-sm text-brand-muted">Customize article categories and recommendations</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    {/* Image Crop Modal */}
    {isCropping && imageSrc && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-brand-surface rounded-2xl p-6 max-w-2xl w-full border border-white/10 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-brand-text flex items-center gap-2">
              <Camera className="h-5 w-5" /> Crop Profile Image
            </h3>
            <button
              onClick={handleCropCancel}
              className="p-2 bg-brand-bg rounded-full hover:bg-white/10 transition-colors border border-white/10"
            >
              <X className="h-4 w-4 text-brand-text" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-brand-muted text-sm">Adjust the crop area and click Confirm to set your profile picture.</p>
            <p className="text-brand-muted text-sm mt-1">Recommended: Square aspect ratio for best results.</p>
          </div>

          <div className="relative mb-6" style={{ height: '400px' }}>
            <ReactCrop
              crop={crop}
              onChange={(c, percentCrop) => setCrop(percentCrop)}
              onComplete={handleCropComplete}
              aspect={1}
              minWidth={100}
              circularCrop
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop me"
                className="max-h-full max-w-full object-contain"
                onLoad={(e) => {
                  const { width, height } = e.currentTarget;
                  const crop = centerCrop(
                    makeAspectCrop(
                      {
                        unit: '%',
                        width: 90,
                      },
                      width / height,
                      width,
                      height
                    ),
                    width,
                    height
                  );
                  setCrop(crop);
                }}
              />
            </ReactCrop>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCropCancel}
              className="px-4 py-2 bg-brand-bg text-brand-text rounded-lg hover:bg-white/10 transition-colors border border-white/10 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCropConfirm}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-orange-600 transition-colors shadow-glow font-medium flex items-center gap-2"
            >
              <Save className="h-4 w-4" /> Confirm Crop
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Profile Modal */}
    {isEditModalOpen && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-brand-surface rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-brand-text flex items-center gap-2">
              <Edit className="h-5 w-5" /> Edit Profile
            </h3>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="p-2 bg-brand-bg rounded-full hover:bg-white/10 transition-colors border border-white/10"
            >
              <X className="h-4 w-4 text-brand-text" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                className="w-full px-3 py-2 bg-brand-bg border border-white/10 rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={editData.email}
                onChange={handleEditChange}
                className="w-full px-3 py-2 bg-brand-bg border border-white/10 rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text mb-1">Bio</label>
              <textarea
                name="bio"
                value={editData.bio}
                onChange={handleEditChange}
                rows={4}
                placeholder="Tell us about yourself..."
                className="w-full px-3 py-2 bg-brand-bg border border-white/10 rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-brand-bg text-brand-text rounded-lg hover:bg-white/10 transition-colors border border-white/10 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-orange-600 transition-colors shadow-glow font-medium flex items-center gap-2"
              >
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

  </div>
);
};

export default UserProfile;
