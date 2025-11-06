// TraficMX Security Firm Landing Page - React Implementation
import React, { useState, useEffect } from 'react';
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
  Building
} from 'lucide-react';

const TraficMXLanding = () => {
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
    <div className="min-h-screen bg-primary-950 text-gray-200 relative overflow-hidden">
      {/* Background Effects */}
      <div className="background-mesh" />
      <div className="noise-overlay" />
      <div className="grid-pattern" />
      <div className="data-stream" />

      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          <a href="/" className="logo">
            <div className="logo-icon">
              <Shield className="w-5 h-5" />
            </div>
            <span>TraficMX</span>
          </a>
          
          <ul className="nav-menu">
            <li><a href="#platform" className="nav-link">Platform</a></li>
            <li><a href="#solutions" className="nav-link">Solutions</a></li>
            <li><a href="#resources" className="nav-link">Resources</a></li>
            <li><a href="#company" className="nav-link">Company</a></li>
            <li><a href="#contact" className="nav-link">Contact</a></li>
          </ul>
          
          <div className="nav-actions">
            <button className="btn-secondary">Sign In</button>
            <button className="btn-primary">Request Access</button>
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
              Real-time traffic intelligence
            </div>
            
            <h1 className="hero-title">
              Enterprise Traffic Intelligence<br />
              <span className="accent">Platform</span>
            </h1>
            
            <p className="hero-subtitle">
              Military-grade infrastructure monitoring. Predictive analytics. Zero downtime.
            </p>

            {/* Stats Grid */}
            <div className="stats-grid">
              <StatCard 
                value="50+"
                label="Protected Cities"
                icon={<Shield className="w-4 h-4" />}
                animated={statsAnimated}
              />
              <StatCard 
                value="40%"
                label="Incident Reduction"
                icon={<TrendingDown className="w-4 h-4" />}
                animated={statsAnimated}
              />
              <StatCard 
                value="99.99%"
                label="System Uptime"
                icon={<Server className="w-4 h-4" />}
                animated={statsAnimated}
              />
              <StatCard 
                value="24/7"
                label="SOC Operations"
                icon={<Radar className="w-4 h-4" />}
                animated={statsAnimated}
              />
            </div>

            <div className="flex gap-4 justify-center mt-8">
              <button className="btn-primary flex items-center gap-2">
                Deploy Solution <ChevronRight className="w-4 h-4" />
              </button>
              <button className="btn-secondary flex items-center gap-2">
                <Play className="w-4 h-4" /> View Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section className="features-section">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Mission-Critical Capabilities</h2>
            <p className="text-gray-400">Built for governments. Trusted by cities.</p>
          </motion.div>

          <div className="bento-grid">
            <FeatureCard
              title="Real-Time Surveillance"
              description="AI-powered video analytics processing 10,000+ feeds simultaneously"
              icon={<Camera className="w-6 h-6" />}
              metrics={["< 50ms latency", "4K resolution", "Edge processing"]}
              size="large"
              gradient="blue-cyan"
            />
            
            <FeatureCard
              title="Predictive Intelligence"
              description="Machine learning models predicting traffic patterns 72 hours ahead"
              icon={<Brain className="w-6 h-6" />}
              metrics={["95% accuracy", "ML-powered"]}
              size="medium"
              gradient="purple-pink"
            />
            
            <FeatureCard
              title="Incident Response"
              description="Automated alert system with multi-agency coordination"
              icon={<AlertTriangle className="w-6 h-6" />}
              metrics={["< 3 sec detection", "Auto-dispatch"]}
              size="medium"
              gradient="red-orange"
            />
            
            <FeatureCard
              title="Command Center"
              description="Unified operations dashboard for city-wide monitoring"
              icon={<Command className="w-6 h-6" />}
              metrics={["Single pane of glass", "Role-based access"]}
              size="large"
              gradient="emerald-teal"
            />
            
            <FeatureCard
              title="Data Fortress"
              description="Military-grade encryption and compliance"
              icon={<Lock className="w-6 h-6" />}
              metrics={["AES-256", "SOC 2", "ISO 27001"]}
              size="small"
              gradient="gray-blue"
            />
            
            <FeatureCard
              title="API Platform"
              description="RESTful APIs for seamless integration"
              icon={<Code className="w-6 h-6" />}
              metrics={["< 10ms response", "99.99% uptime"]}
              size="small"
              gradient="indigo-purple"
            />
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold mb-8">Trusted by Leading Municipalities</h3>
            <div className="trust-logos">
              <span className="text-sm font-mono">Government Certified</span>
              <span className="text-sm font-mono">NATO Standards</span>
              <span className="text-sm font-mono">ISO 27001</span>
              <span className="text-sm font-mono">SOC 2 Type II</span>
              <span className="text-sm font-mono">GDPR Compliant</span>
              <span className="text-sm font-mono">FedRAMP Authorized</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div 
            className="security-form"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4 text-center">
              Secure Your Infrastructure
            </h2>
            <p className="text-gray-400 mb-8 text-center">
              Get a personalized security assessment for your municipality
            </p>
            
            <form className="form-grid">
              <div className="form-field">
                <Users className="form-icon" />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="form-input"
                  required 
                />
              </div>
              
              <div className="form-field">
                <Building className="form-icon" />
                <input 
                  type="email" 
                  placeholder="Government Email" 
                  className="form-input"
                  required 
                />
              </div>
              
              <div className="form-field">
                <Building className="form-icon" />
                <input 
                  type="text" 
                  placeholder="Organization" 
                  className="form-input"
                  required 
                />
              </div>
              
              <div className="form-field">
                <MapPin className="form-icon" />
                <select className="form-input" required>
                  <option value="">City Population</option>
                  <option value="small">&lt; 100k</option>
                  <option value="medium">100k-500k</option>
                  <option value="large">500k-1M</option>
                  <option value="xlarge">&gt; 1M</option>
                </select>
              </div>
            </form>
            
            <button className="form-submit">
              <Shield className="inline w-4 h-4 mr-2" />
              Request Security Briefing
            </button>
            
            <div className="security-badge">
              <Lock className="w-4 h-4" />
              <span>256-bit SSL Encrypted</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Component: Stat Card
const StatCard = ({ value, label, icon, animated }) => {
  const [displayValue, setDisplayValue] = useState('0');
  
  useEffect(() => {
    if (animated) {
      const numericValue = parseInt(value);
      if (!isNaN(numericValue)) {
        let current = 0;
        const increment = numericValue / 20;
        const timer = setInterval(() => {
          current += increment;
          if (current >= numericValue) {
            setDisplayValue(value);
            clearInterval(timer);
          } else {
            setDisplayValue(Math.floor(current) + value.replace(/[0-9]/g, ''));
          }
        }, 50);
        return () => clearInterval(timer);
      } else {
        setDisplayValue(value);
      }
    }
  }, [animated, value]);
  
  return (
    <motion.div 
      className="stat-card"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
    >
      <span className="stat-value">{animated ? displayValue : value}</span>
      <span className="stat-label">
        {icon}
        {label}
      </span>
    </motion.div>
  );
};

// Component: Feature Card
const FeatureCard = ({ title, description, icon, metrics, size, gradient }) => {
  const sizeClass = `feature-card ${size}`;
  
  return (
    <motion.div 
      className={sizeClass}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
      <div className="feature-metrics">
        {metrics.map((metric, index) => (
          <span key={index} className="metric-badge">{metric}</span>
        ))}
      </div>
    </motion.div>
  );
};

export default TraficMXLanding;

// Additional Components for Dashboard Preview
export const DashboardPreview = () => {
  return (
    <div className="dashboard-preview">
      <div className="dashboard-header">
        <div className="dashboard-status">
          <span className="status-indicator active" />
          <span className="status-text">System Operational</span>
        </div>
        <div className="dashboard-time terminal-text">
          {new Date().toLocaleTimeString('en-US', { hour12: false })}
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <h4 className="panel-title">Active Incidents</h4>
          <div className="incident-list">
            <div className="incident-item critical">
              <AlertTriangle className="w-4 h-4" />
              <span>Congestion at Intersection 42</span>
              <span className="incident-time">2 min ago</span>
            </div>
            <div className="incident-item warning">
              <AlertTriangle className="w-4 h-4" />
              <span>Signal Malfunction - Ave 5</span>
              <span className="incident-time">15 min ago</span>
            </div>
          </div>
        </div>
        
        <div className="dashboard-panel">
          <h4 className="panel-title">Traffic Flow</h4>
          <div className="flow-visualization">
            <BarChart3 className="w-full h-32 text-cyan-500" />
          </div>
        </div>
        
        <div className="dashboard-panel">
          <h4 className="panel-title">Predictive Analysis</h4>
          <div className="prediction-chart">
            <div className="prediction-value">85%</div>
            <div className="prediction-label">Normal Flow Expected</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility Components
export const LoadingSpinner = () => (
  <div className="loading-spinner" />
);

export const DataStreamEffect = () => (
  <div className="data-stream" />
);

export const HolographicOverlay = () => (
  <div className="holographic" />
);
