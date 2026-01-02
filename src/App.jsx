{view === 'inventory' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black uppercase tracking-tight">Full Inventory</h2>
                <button className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2">
                  <Download size={18} /> EXPORT CSV
                </button>
              </div>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Name</th>
                        <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand</th>
                        <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial</th>
                        <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                        <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Service</th>
                        <th className="text-right p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssets.map(a => (
                        <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4 font-bold text-slate-800">{a.name}</td>
                          <td className="p-4 text-slate-600">{a.brand}</td>
                          <td className="p-4 text-slate-600 font-mono text-xs">{a.serial}</td>
                          <td className="p-4">
                            <Badge variant={a.status === 'operational' ? 'success' : a.status === 'maintenance' ? 'warning' : 'default'}>
                              {a.status || 'Unknown'}
                            </Badge>
                          </td>
                          <td className="p-4 text-slate-600">{a.location || 'N/A'}</td>
                          <td className="p-4 text-slate-600">{a.nextMaintenance || 'N/A'}</td>
                          <td className="p-4 text-right">
                            <button onClick={() => { setSelectedAsset(a); setView('detail'); }} className="text-blue-600 hover:text-blue-800 font-bold text-xs">
                              VIEW →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {view === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-2xl font-black uppercase tracking-tight">Clinic Settings</h2>
              <Card className="p-8">
                <form onSubmit={handleSaveClinicSettings} className="space-y-6">
                  <FormItem label="Clinic Name" name="clinicName" required defaultValue={clinicInfo.name} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormItem label="Email" name="clinicEmail" type="email" required defaultValue={clinicInfo.email} />
                    <FormItem label="Phone" name="clinicPhone" defaultValue={clinicInfo.phone || ''} />
                  </div>
                  <FormItem label="Address" name="clinicAddress" defaultValue={clinicInfo.address || ''} />
                  
                  <div className="border-t pt-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Subscription</h3>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-800">Current Plan: <Badge variant="premium">{clinicInfo.subscription.toUpperCase()}</Badge></p>
                        <p className="text-xs text-slate-500 mt-1">Manage your subscription and billing</p>
                      </div>
                      <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black">
                        UPGRADE
                      </button>
                    </div>
                  </div>
                  
                  <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
                    <Save size={16} className="inline mr-2" /> Save Settings
                  </button>
                </form>
              </Card>
            </div>
          )}import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, LayoutDashboard, Stethoscope, Settings, QrCode, Wrench, History, 
  LogOut, MoreVertical, AlertTriangle, CheckCircle2, Clock, ChevronRight, 
  Search, X, User, CreditCard, Save, TrendingUp, DollarSign, Activity, Zap, 
  Sparkles, Edit2, Trash2, Menu, Download, FileText, MapPin, Camera, Calendar,
  Filter, Grid, List, Bell, Package, Tool, Shield
} from 'lucide-react';
