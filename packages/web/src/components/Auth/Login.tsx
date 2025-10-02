/**
 * Login Component - Professional Fortune 500 Style
 */

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Sprout, AlertCircle, ArrowRight } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((state) => state.login);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-sage-50 to-soil-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="max-w-6xl w-full flex items-center gap-12 relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col flex-1 text-left">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sage-600 to-earth-600 rounded-xl shadow-large">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-sage-800 to-earth-800 bg-clip-text text-transparent">
                GateMesh
              </h1>
              <p className="text-soil-600 font-medium">Enterprise Agriculture Platform</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-soil-900 mb-4 leading-tight">
            Smart Agriculture<br />Management System
          </h2>
          <p className="text-lg text-soil-600 mb-8 leading-relaxed">
            Monitor, control, and optimize your agricultural operations with real-time insights
            and intelligent automation. Built for modern farms and ranches.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-sage-600" />
              </div>
              <div>
                <h3 className="font-semibold text-soil-900">Real-Time Monitoring</h3>
                <p className="text-sm text-soil-600">Track all sensors and equipment across your entire operation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-sage-600" />
              </div>
              <div>
                <h3 className="font-semibold text-soil-900">Automated Controls</h3>
                <p className="text-sm text-soil-600">Intelligent irrigation and equipment management</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-sage-600" />
              </div>
              <div>
                <h3 className="font-semibold text-soil-900">Network Topology</h3>
                <p className="text-sm text-soil-600">Visualize and manage your mesh network infrastructure</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sage-600 to-earth-600 rounded-xl shadow-large mb-4">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sage-800 to-earth-800 bg-clip-text text-transparent mb-1">
              GateMesh
            </h1>
            <p className="text-soil-600 font-medium">Enterprise Agriculture Platform</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-large p-8 border border-earth-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-soil-900 mb-2">Welcome back</h2>
              <p className="text-soil-600">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-soil-800 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition-all bg-white text-soil-900 placeholder-soil-400"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-soil-800 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition-all bg-white text-soil-900"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-danger-50 border-2 border-danger-200 rounded-xl text-danger-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-medium hover:shadow-large disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 p-5 bg-gradient-to-br from-sage-50 to-earth-50 border-2 border-sage-300 rounded-xl">
              <p className="text-sm font-bold text-soil-900 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sage-600 animate-pulse" />
                Demo Account (Recommended)
              </p>
              <div className="text-sm text-soil-700 space-y-2 font-medium">
                <div className="p-3 bg-white rounded-lg border-2 border-sage-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sage-700">Demo User</span>
                    <span className="px-2 py-0.5 bg-sage-100 text-sage-700 rounded text-xs font-bold">15 Test Nodes</span>
                  </div>
                  <code className="text-xs text-soil-600">demo@gatemesh.com / demo</code>
                </div>
                <details className="cursor-pointer">
                  <summary className="text-xs text-soil-500 hover:text-soil-700 font-semibold">Other Demo Accounts</summary>
                  <div className="mt-2 space-y-2 pl-2">
                    <div className="flex items-center justify-between">
                      <span className="text-soil-600 text-xs">Owner:</span>
                      <code className="px-2 py-1 bg-white rounded text-xs">owner@farm.com / demo</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-soil-600 text-xs">Admin:</span>
                      <code className="px-2 py-1 bg-white rounded text-xs">admin@gatemesh.com / demo</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-soil-600 text-xs">Viewer:</span>
                      <code className="px-2 py-1 bg-white rounded text-xs">viewer@farm.com / demo</code>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-soil-500 text-sm mt-6 font-medium">
            &copy; {new Date().getFullYear()} GateMesh Corporation. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
