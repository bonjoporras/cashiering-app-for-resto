
import React, { useState } from 'react';
import { X, Moon, Sun, CloudSnow, Type, Image as ImageIcon, Upload, Database, Download, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { AppSettings } from '../types';
import { exportAllData, importAllData, factoryReset } from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'database'>('general');
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings({ ...localSettings, appLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (confirm("WARNING: Importing a backup will overwrite ALL current data (Products, Orders, Users). This action cannot be undone. Continue?")) {
        const success = await importAllData(file);
        if (success) {
          setImportStatus('success');
          setTimeout(() => {
             window.location.reload();
          }, 1500);
        } else {
          setImportStatus('error');
        }
      } else {
        // Reset file input
        e.target.value = '';
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">System Settings</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-700">
           <button 
             onClick={() => setActiveTab('general')}
             className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'general' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
           >
             General
           </button>
           <button 
             onClick={() => setActiveTab('database')}
             className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'database' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
           >
             Database
           </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto">
          
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* App Branding */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Branding</label>
                
                {/* App Name */}
                <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Type size={14} /> App Name
                    </span>
                    <input 
                      type="text" 
                      value={localSettings.appName}
                      onChange={(e) => setLocalSettings({...localSettings, appName: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:text-white transition-colors text-sm"
                    />
                </div>

                {/* App Logo */}
                <div className="space-y-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <ImageIcon size={14} /> Logo
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                          {localSettings.appLogo === 'default' ? (
                            <span className="text-[10px] text-slate-400">Default</span>
                          ) : (
                            <img src={localSettings.appLogo} alt="Logo" className="w-full h-full object-contain" />
                          )}
                      </div>
                      <div className="flex-1">
                          <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors w-fit">
                            <Upload size={14} />
                            Upload Image
                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                          </label>
                          {localSettings.appLogo !== 'default' && (
                            <button 
                                onClick={() => setLocalSettings({...localSettings, appLogo: 'default'})}
                                className="mt-1.5 text-[10px] text-red-500 hover:underline block"
                            >
                                Reset to Default
                            </button>
                          )}
                      </div>
                    </div>
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-700" />

              {/* Appearance */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Appearance</label>

                {/* Theme Mode */}
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      {localSettings.themeMode === 'light' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-400" />}
                      <div>
                          <p className="font-bold text-slate-700 dark:text-white text-xs">Dark Mode</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Switch between light and dark themes</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={localSettings.themeMode === 'dark'}
                        onChange={(e) => setLocalSettings({...localSettings, themeMode: e.target.checked ? 'dark' : 'light'})}
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                    </label>
                </div>

                {/* Christmas Snow */}
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <CloudSnow size={18} className="text-sky-400" />
                      <div>
                          <p className="font-bold text-slate-700 dark:text-white text-xs">Christmas Snow</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Enable falling snow effect</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={localSettings.isSnowing}
                        onChange={(e) => setLocalSettings({...localSettings, isSnowing: e.target.checked})}
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                    </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
             <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3 border border-blue-100 dark:border-blue-900/30">
                   <Database className="text-blue-600 dark:text-blue-400 shrink-0 mt-1" size={20} />
                   <div>
                      <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Database Management</h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Manage your system data. Importing or Exporting includes <strong>Admin Accounts</strong>, <strong>Daily/Monthly Sales</strong>, <strong>Order History</strong>, <strong>Products</strong>, and <strong>Customers</strong>.
                      </p>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Operations</label>
                   
                   <button 
                     onClick={exportAllData}
                     className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-brand-500 hover:shadow-md transition-all group"
                   >
                      <div className="flex items-center gap-3">
                         <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-lg">
                            <Download size={20} />
                         </div>
                         <div className="text-left">
                            <p className="font-bold text-slate-800 dark:text-white text-sm">Export All Data</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Save database as .json file</p>
                         </div>
                      </div>
                   </button>

                   <label className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                      <div className="flex items-center gap-3">
                         <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                            <Upload size={20} />
                         </div>
                         <div className="text-left">
                            <p className="font-bold text-slate-800 dark:text-white text-sm">Import Data</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Restore database from file</p>
                         </div>
                      </div>
                      <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                      
                      {importStatus === 'success' && (
                        <div className="absolute inset-0 bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                           <CheckCircle size={18} className="mr-2" /> Restored! Reloading...
                        </div>
                      )}
                      {importStatus === 'error' && (
                        <div className="absolute inset-0 bg-red-500 text-white flex items-center justify-center font-bold text-sm">
                           <AlertTriangle size={18} className="mr-2" /> Failed! Invalid File.
                        </div>
                      )}
                   </label>
                </div>

                <hr className="border-slate-100 dark:border-slate-700" />

                <div className="space-y-3">
                   <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Danger Zone</label>
                   <button 
                     onClick={() => {
                        if (confirm("FACTORY RESET WARNING:\n\nThis will delete ALL data (Products, Sales, Users, Settings) permanently.\n\nAre you absolutely sure?")) {
                           factoryReset();
                        }
                     }}
                     className="w-full flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-red-600 dark:text-red-400"
                   >
                      <RefreshCw size={20} />
                      <div className="text-left">
                         <p className="font-bold text-sm">Factory Reset</p>
                         <p className="text-xs opacity-70">Clear all data and start fresh</p>
                      </div>
                   </button>
                </div>
             </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2 shrink-0">
           <button 
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs"
           >
              Cancel
           </button>
           {activeTab === 'general' && (
              <button 
                onClick={handleSave}
                className="px-4 py-2 rounded-lg font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors text-xs"
              >
                Save Changes
              </button>
           )}
        </div>

      </div>
    </div>
  );
};
