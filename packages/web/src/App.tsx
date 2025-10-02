/**
 * Main Application Component
 */

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNodeStore, createUnconfiguredNode } from '@/store/nodeStore';
import { Login } from '@/components/Auth/Login';
import { SetupWizard } from '@/components/Wizard/SetupWizard';
import { SerialConnect } from '@/components/Connect/SerialConnect';
import { IrrigationDashboard } from '@/components/Dashboard/IrrigationDashboard';
import { MonitoringView } from '@/components/Monitor/MonitoringView';
import { FarmMapView } from '@/components/Maps/FarmMapView';
import { IrrigationPathsDashboard } from '@/components/Irrigation/IrrigationPathsDashboard';
import { NetworkTopologyView } from '@/components/Topology/NetworkTopologyView';
import { ToastContainer } from '@/components/Layout/ToastContainer';
import { NodeManagement } from '@/components/Nodes/NodeManagement';
import { GateMeshNode } from '@/types/agriculture';
import { Sprout, LogOut, Plus, User, Map as MapIcon, Network } from 'lucide-react';
import { createDemoNodes } from '@/data/demoNodes';
import { createDemoPaths } from '@/data/demoPaths';
import { usePathStore } from '@/store/pathStore';
import { LoRaStatusIndicator } from '@/components/LoRa/LoRaStatusIndicator';

export function App() {
  const { isAuthenticated, currentUser, logout } = useAuthStore();
  const { addNode, updateNode, nodes } = useNodeStore();
  const pathStore = usePathStore();

  const [view, setView] = useState<'connect' | 'dashboard' | 'monitor' | 'nodes' | 'map' | 'paths' | 'topology'>('dashboard');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardNode, setWizardNode] = useState<GateMeshNode | null>(null);

  // Load demo nodes and paths for demo user
  useEffect(() => {
    if (isAuthenticated && currentUser?.email === 'demo@gatemesh.com') {
      // Load demo nodes
      if (nodes.size === 0) {
        const demoNodes = createDemoNodes();
        demoNodes.forEach((node) => {
          addNode(node);
        });
      }

      // Load demo paths
      if (pathStore.paths.size === 0) {
        const demoPaths = createDemoPaths();
        demoPaths.forEach((path) => {
          const { id, createdAt, updatedAt, ...pathData } = path;
          pathStore.addPath(pathData);
        });
      }
    }
  }, [isAuthenticated, currentUser, nodes.size, pathStore.paths.size, addNode, pathStore]);

  // If not authenticated, show login
  if (!isAuthenticated) {
    return <Login />;
  }

  function handleNewNode() {
    // Create a new unconfigured node (simulating connection)
    const newNode = createUnconfiguredNode(`ESP32-${Math.random().toString(36).substr(2, 6)}`);
    setWizardNode(newNode);
    setShowWizard(true);
  }

  function handleWizardComplete(configuredNode: GateMeshNode) {
    // Add or update node
    if (wizardNode) {
      updateNode(wizardNode.id, configuredNode);
    } else {
      addNode(configuredNode);
    }
    setShowWizard(false);
    setWizardNode(null);
  }

  function handleWizardClose() {
    setShowWizard(false);
    setWizardNode(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Setup Wizard */}
      {showWizard && wizardNode && (
        <SetupWizard
          node={wizardNode}
          onClose={handleWizardClose}
          onComplete={handleWizardComplete}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-soft border-b border-earth-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-sage-600 to-earth-600 rounded-xl flex items-center justify-center shadow-medium">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-sage-800 to-earth-800 bg-clip-text text-transparent">GateMesh</h1>
                <p className="text-xs text-soil-600 font-medium">Enterprise Agriculture Platform</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setView('dashboard')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  view === 'dashboard'
                    ? 'bg-gradient-to-r from-sage-600 to-sage-700 text-white shadow-medium'
                    : 'text-soil-700 hover:bg-earth-100 hover:text-soil-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setView('nodes')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  view === 'nodes'
                    ? 'bg-gradient-to-r from-sage-600 to-sage-700 text-white shadow-medium'
                    : 'text-soil-700 hover:bg-earth-100 hover:text-soil-900'
                }`}
              >
                Nodes
              </button>
              <button
                onClick={() => setView('monitor')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  view === 'monitor'
                    ? 'bg-gradient-to-r from-sage-600 to-sage-700 text-white shadow-medium'
                    : 'text-soil-700 hover:bg-earth-100 hover:text-soil-900'
                }`}
              >
                Monitor
              </button>
              <button
                onClick={() => setView('map')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  view === 'map'
                    ? 'bg-gradient-to-r from-sage-600 to-sage-700 text-white shadow-medium'
                    : 'text-soil-700 hover:bg-earth-100 hover:text-soil-900'
                }`}
              >
                <MapIcon className="w-4 h-4 inline mr-1" />
                Map
              </button>
              <button
                onClick={() => setView('paths')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  view === 'paths'
                    ? 'bg-gradient-to-r from-sage-600 to-sage-700 text-white shadow-medium'
                    : 'text-soil-700 hover:bg-earth-100 hover:text-soil-900'
                }`}
              >
                Irrigation Paths
              </button>
              <button
                onClick={() => setView('topology')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  view === 'topology'
                    ? 'bg-gradient-to-r from-sage-600 to-sage-700 text-white shadow-medium'
                    : 'text-soil-700 hover:bg-earth-100 hover:text-soil-900'
                }`}
              >
                <Network className="w-4 h-4 inline mr-1" />
                Topology
              </button>
              <button
                onClick={() => setView('connect')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  view === 'connect'
                    ? 'bg-gradient-to-r from-sage-600 to-sage-700 text-white shadow-medium'
                    : 'text-soil-700 hover:bg-earth-100 hover:text-soil-900'
                }`}
              >
                Connect
              </button>

              <div className="ml-4 h-6 w-px bg-earth-300" />

              {/* LoRa Connection Status */}
              <LoRaStatusIndicator />

              <div className="h-6 w-px bg-earth-300" />

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-earth-100 to-sage-100 rounded-xl border border-earth-200">
                  <User className="w-4 h-4 text-soil-700" />
                  <span className="text-sm font-semibold text-soil-900">{currentUser?.name}</span>
                  <span className="text-xs px-2.5 py-1 bg-sage-600 text-white rounded-md font-semibold">
                    {currentUser?.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2.5 text-soil-700 hover:bg-earth-100 rounded-xl transition-all hover:text-soil-900"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-gradient-to-br from-earth-50/30 via-white to-sage-50/20">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Quick Actions Bar */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-soil-900">
                {view === 'dashboard' && 'Farm Overview'}
                {view === 'nodes' && 'Node Management'}
                {view === 'monitor' && 'Real-Time Monitoring'}
                {view === 'map' && 'Farm Map'}
                {view === 'paths' && 'Irrigation Paths'}
                {view === 'topology' && 'Network Topology'}
                {view === 'connect' && 'Connect New Device'}
              </h2>
              <p className="text-sm text-soil-600 mt-2 font-medium">
                {view === 'dashboard' && 'Monitor all your agriculture systems in real-time'}
                {view === 'nodes' && 'Configure and manage your network nodes'}
                {view === 'monitor' && 'Live data from your sensors and equipment'}
                {view === 'map' && 'Visualize all nodes on satellite map'}
                {view === 'paths' && 'Visualize and control water flow distribution'}
                {view === 'topology' && 'View mesh network structure and connections'}
                {view === 'connect' && 'Add new nodes via USB connection'}
              </p>
            </div>

            {/* New Node Button */}
            <button
              onClick={handleNewNode}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 text-white font-semibold rounded-xl shadow-medium hover:shadow-large transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Node
            </button>
          </div>

        {/* View Content */}
        {view === 'connect' && (
          <div className="max-w-2xl mx-auto">
            <SerialConnect />
          </div>
        )}

        {view === 'dashboard' && <IrrigationDashboard />}

        {view === 'monitor' && <MonitoringView />}

        {view === 'map' && <FarmMapView />}

        {view === 'paths' && <IrrigationPathsDashboard />}

        {view === 'topology' && <NetworkTopologyView />}

        {view === 'nodes' && <NodeManagement />}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-earth-200 bg-gradient-to-b from-white to-earth-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-soil-900 font-semibold">&copy; {new Date().getFullYear()} GateMesh Corporation. All rights reserved.</p>
              <p className="text-soil-600 text-xs mt-1">Enterprise Agriculture Management Platform</p>
            </div>
            <div className="flex items-center gap-6">
              <button className="text-soil-700 hover:text-sage-700 font-medium transition-colors">Documentation</button>
              <button className="text-soil-700 hover:text-sage-700 font-medium transition-colors">Support</button>
              <button className="text-soil-700 hover:text-sage-700 font-medium transition-colors">About</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
