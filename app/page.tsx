'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Camera, 
  Brain, 
  AlertTriangle, 
  Command, 
  Lock, 
  Code, 
  ChevronRight,
  Play,
  TrendingDown,
  Server,
  Radar,
  BarChart3,
  MapPin,
  Users,
  Building,
  Activity,
  Clock,
  TrendingUp,
  Sun,
  Moon,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [statsAnimated, setStatsAnimated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      if (window.scrollY > 300 && !statsAnimated) {
        setStatsAnimated(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [statsAnimated]);

  return (
    <div className="security-theme min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="background-mesh" />
      <div className="noise-overlay" />
      <div className="grid-pattern" />

      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <Shield className="w-5 h-5" />
            </div>
            <span>TraficMX</span>
          </Link>
          
          <ul className="nav-menu">
            <li><a href="#platform" className="nav-link">Platform</a></li>
            <li><a href="#solutions" className="nav-link">Solutions</a></li>
            <li><a href="#resources" className="nav-link">Resources</a></li>
            <li><a href="#company" className="nav-link">Company</a></li>
            <li><Link href="/dashboard" className="nav-link">Dashboard</Link></li>
          </ul>
          
          <div className="nav-actions">
            <button className="btn-secondary">Operator Login</button>
            <button className="btn-primary">Access Control</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-badge">
              <Radar className="w-4 h-4" />
              AUTHORIZED MUNICIPAL PLATFORM
            </div>
            
            <h1 className="hero-title">
              TRAFFIC<br />
              <span className="accent">INTELLIGENCE</span><br />
              COMMAND
            </h1>
            
            <p className="hero-subtitle">
              Military-Grade Urban Surveillance • Predictive AI • Zero-Day Response
            </p>

            {/* Stats Grid */}
            <div className="stats-grid">
              <StatCard 
                value="0"
                label="Protected Cities"
                icon={<Shield className="w-5 h-5" />}
                animated={statsAnimated}
              />
              <StatCard 
                value="99.9%"
                label="System Uptime"
                icon={<Server className="w-5 h-5" />}
                animated={statsAnimated}
              />
              <StatCard 
                value="0%"
                label="Congestion Reduced"
                icon={<TrendingDown className="w-5 h-5" />}
                animated={statsAnimated}
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button className="btn-primary">
                <Shield className="w-4 h-4" />
                Access Control
                <ChevronRight className="w-4 h-4" />
              </button>
              <Link href="/dashboard" className="btn-secondary">
                View Command Center
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="bento-grid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bento-card bento-card-xlarge"
        >
          <div className="bento-card-icon">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="bento-card-title">Predictive Analytics Engine</h3>
          <p className="bento-card-description">
            Advanced machine learning algorithms analyze traffic patterns to predict congestion before it happens. Our system processes millions of data points in real-time to provide actionable insights.
          </p>
          <div className="bento-card-metrics">
            <span className="metric-badge">99.8% Accuracy</span>
            <span className="metric-badge">Real-time</span>
            <span className="metric-badge">ML-Powered</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bento-card bento-card-large"
        >
          <div className="bento-card-icon">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="bento-card-title">Smart Surveillance</h3>
          <p className="bento-card-description">
            AI-powered camera network with automated incident detection and real-time alerting.
          </p>
          <div className="bento-card-metrics">
            <span className="metric-badge">24/7 Monitoring</span>
            <span className="metric-badge">AI Detection</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bento-card bento-card-medium"
        >
          <div className="bento-card-icon">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="bento-card-title">Military-Grade Security</h3>
          <p className="bento-card-description">
            End-to-end encryption with zero-knowledge architecture protecting sensitive traffic data.
          </p>
          <div className="bento-card-metrics">
            <span className="metric-badge">AES-256</span>
            <span className="metric-badge">Zero-Knowledge</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bento-card bento-card-medium"
        >
          <div className="bento-card-icon">
            <Command className="w-6 h-6" />
          </div>
          <h3 className="bento-card-title">Command Center</h3>
          <p className="bento-card-description">
            Centralized dashboard for complete traffic management and emergency response coordination.
          </p>
          <div className="bento-card-metrics">
            <span className="metric-badge">Real-time Control</span>
            <span className="metric-badge">Emergency Response</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bento-card bento-card-small"
        >
          <div className="bento-card-icon">
            <Code className="w-6 h-6" />
          </div>
          <h3 className="bento-card-title">Open API</h3>
          <p className="bento-card-description">
            Comprehensive API suite for seamless integration with existing municipal systems.
          </p>
          <div className="bento-card-metrics">
            <span className="metric-badge">RESTful</span>
            <span className="metric-badge">WebSocket</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bento-card bento-card-small"
        >
          <div className="bento-card-icon">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="bento-card-title">Government Certified</h3>
          <p className="bento-card-description">
            Fully compliant with national security standards and municipal regulations.
          </p>
          <div className="bento-card-metrics">
            <span className="metric-badge">ISO 27000</span>
            <span className="metric-badge">SOC 2 Type II</span>
          </div>
        </motion.div>
      </section>

      {/* Security Form Section */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="security-form"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">
                Request <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Government Access</span>
              </h2>
              <p className="text-lg text-gray-600">
                Secure platform access for municipal authorities and government agencies.
              </p>
            </div>
            
            <form 
              onSubmit={(e) => { e.preventDefault(); alert('Access request submitted. Our team will contact you within 24 hours.'); }} 
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="relative">
                    <Shield className="form-input-icon" />
                    <input
                      type="text"
                      placeholder="John Smith"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Official Email</label>
                  <div className="relative">
                    <Lock className="form-input-icon" />
                    <input
                      type="email"
                      placeholder="john@government.gov"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Government Agency</label>
                <div className="relative">
                  <Building className="form-input-icon" />
                  <input
                    type="text"
                    placeholder="Department of Transportation"
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">City/Municipality</label>
                <div className="relative">
                  <MapPin className="form-input-icon" />
                  <input
                    type="text"
                    placeholder="Mexico City"
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900 mb-6">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  This platform is exclusively available to government entities and authorized agencies.
                </span>
              </div>
              
              <button type="submit" className="btn-primary w-full">
                <Lock className="w-4 h-4" />
                Submit Secure Request
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-950 border-t border-primary-800 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="logo-icon">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-lg font-semibold text-white">TraficMX</span>
              </div>
              <p className="text-sm text-gray-400">
                Critical Infrastructure Intelligence Platform for modern urban security.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Certifications</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Partners</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Compliance</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">GDPR</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 TraficMX. All rights reserved. | Government Authorized Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Stat Card Component
function StatCard({ value, label, icon, animated }: { 
  value: string; 
  label: string; 
  icon: React.ReactNode; 
  animated: boolean; 
}) {
  return (
    <motion.div 
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="stat-value">
        {animated ? value : "0"}
        {icon}
      </div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
}
