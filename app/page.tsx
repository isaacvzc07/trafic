'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  Activity, 
  Camera, 
  TrendingUp, 
  Shield,
  BarChart3,
  Clock,
  Users,
  ChevronRight,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setIsScrolled(window.scrollY > 20);
    });
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 bg-white border-b border-gray-200 transition-all duration-200 ${
        isScrolled ? 'shadow-md' : 'shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              TrafficMX
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Features
              </a>
              <a href="#solutions" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Solutions
              </a>
              <a href="#about" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                About
              </a>
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Sign In
              </button>
              <Link 
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Activity className="w-4 h-4" />
            Live Traffic Intelligence
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Traffic Intelligence<br />
            <span className="text-blue-600">for Modern Cities</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Real-time traffic monitoring and analytics for municipal governments. 
            Make data-driven decisions with AI-powered insights.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">99.9%</div>
              <div className="text-sm text-gray-600">System Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">&lt;5s</div>
              <div className="text-sm text-gray-600">Update Frequency</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">24/7</div>
              <div className="text-sm text-gray-600">Monitoring</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
              Request Access
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link 
              href="/dashboard" 
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2"
            >
              View Dashboard
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Professional Traffic Management
            </h2>
            <p className="text-lg text-gray-600">
              Enterprise-grade features designed for municipal operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-Time Monitoring
              </h3>
              <p className="text-gray-600 mb-4">
                Professional camera network with AI-powered vehicle counting and flow analysis updated every 5 seconds.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                  24/7 Operation
                </span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                  AI-Powered
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md Transition-shadow">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-gray-600 mb-4">
                Comprehensive analytics with historical data, trend analysis, and predictive insights for traffic planning.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                  Historical Data
                </span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                  Export Reports
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md Transition-shadow">
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure & Reliable
              </h3>
              <p className="text-gray-600 mb-4">
                Edge computing with local data storage ensures privacy and reliability. No cloud dependency for critical operations.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                  Local Processing
                </span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                  Enterprise Security
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md Transition-shadow">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pattern Recognition
              </h3>
              <p className="text-gray-600 mb-4">
                Advanced algorithms identify traffic patterns, peak hours, and congestion points for optimized signal timing.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                  AI Analysis
                </span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                  Predictive Insights
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md Transition-shadow">
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Incident Detection
              </h3>
              <p className="text-gray-600 mb-4">
                Automated incident detection with instant alerts and snapshot capture for faster emergency response.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                  Real-Time Alerts
                </span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                  Evidence Collection
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md Transition-shadow">
              <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Multi-Agency Access
              </h3>
              <p className="text-gray-600 mb-4">
                Role-based access for traffic departments, emergency services, and municipal planning teams.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                  Role-Based
                </span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                  Audit Trail
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-600 border border-blue-700 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Traffic Management?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join municipalities using TrafficMX for smarter, data-driven traffic decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50">
                Request Demo
              </button>
              <Link 
                href="/dashboard"
                className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800"
              >
                View Live Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">TrafficMX</span>
              </div>
              <p className="text-sm text-gray-400">
                Professional traffic intelligence platform for modern municipal management.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/dashboard" className="hover:text-blue-400">Dashboard</Link></li>
                <li><a href="#features" className="hover:text-blue-400">Features</a></li>
                <li><a href="#solutions" className="hover:text-blue-400">Solutions</a></li>
                <li><a href="#" className="hover:text-blue-400">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#about" className="hover:text-blue-400">About</a></li>
                <li><a href="#" className="hover:text-blue-400">Contact</a></li>
                <li><a href="#" className="hover:text-blue-400">Partners</a></li>
                <li><a href="#" className="hover:text-blue-400">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-blue-400">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 TrafficMX. Professional Traffic Intelligence Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
