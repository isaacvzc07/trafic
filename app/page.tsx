'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  MapPin, 
  Clock, 
  DollarSign, 
  BarChart3, 
  Shield, 
  Zap, 
  Users, 
  ChevronRight,
  Mail,
  Phone,
  Building,
  Car,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                TraficMX
              </span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-6"
            >
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors font-medium">
                Dashboard
              </Link>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
                Solicitar Demo
              </button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium mb-6">
                <Zap className="w-4 h-4 mr-2" />
                Revolucionando el Tráfico en México
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Control de Tráfico
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  en Tiempo Real
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Transforma la gestión del tráfico urbano con nuestra solución económica y 
                avanzada. Monitorea, analiza y optimiza el flujo vehicular en tiempo real 
                para reducir congestión y mejorar la movilidad en las ciudades mexicanas.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Solicitar Cotización
                  <ChevronRight className="w-5 h-5 ml-2 inline" />
                </motion.button>
                
                <Link href="/dashboard">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-lg transition-all border border-slate-600"
                  >
                    Ver Demo
                  </motion.button>
                </Link>
              </div>
              
              <div className="flex items-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-400" />
                  <span>50+ Ciudades Activas</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                  <span>40% Reducción en Congestión</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-cyan-400" />
                  <span>99.9% Uptime</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-slate-800/50 rounded-2xl p-8 backdrop-blur-sm border border-slate-700/50 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl" />
                
                {/* Mock Dashboard */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Dashboard en Vivo</h3>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30"
                    >
                      <Car className="w-8 h-8 text-blue-400 mb-2" />
                      <div className="text-2xl font-bold">1,247</div>
                      <div className="text-sm text-gray-400">Vehículos/Hora</div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30"
                    >
                      <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
                      <div className="text-2xl font-bold">89%</div>
                      <div className="text-sm text-gray-400">Fluidez</div>
                    </motion.div>
                  </div>
                  
                  <div className="h-32 bg-slate-700/30 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-12 h-12 text-slate-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Características que
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {" "}Transforman Ciudades
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Tecnología de vanguardia diseñada específicamente para los desafíos del tráfico urbano en México
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Monitoreo 24/7",
                description: "Acceso a datos en tiempo real de cámaras y sensores en toda la ciudad"
              },
              {
                icon: MapPin,
                title: "Geolocalización Precisa",
                description: "Mapas interactivos con ubicación exacta de incidentes y congestión"
              },
              {
                icon: DollarSign,
                title: "Solución Económica",
                description: "Costos accesibles con ROI comprobado en menos de 6 meses"
              },
              {
                icon: AlertCircle,
                title: "Alertas Inteligentes",
                description: "Notificaciones automáticas de incidentes y patrones anómalos"
              },
              {
                icon: BarChart3,
                title: "Análisis Predictivo",
                description: "IA que predice patrones de tráfico y recomienda rutas óptimas"
              },
              {
                icon: Shield,
                title: "Seguridad Garantizada",
                description: "Encriptación de nivel empresarial y cumplimiento de normativas"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50 hover:border-blue-500/50 transition-all"
              >
                <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Inquiry */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl p-8 lg:p-12 border border-blue-500/30 backdrop-blur-sm"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">
                Comienza la Revolución del Tráfico en tu Ciudad
              </h2>
              <p className="text-xl text-gray-300">
                Obtén una cotización personalizada adaptada a las necesidades de tu municipio
              </p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); alert('Gracias por tu interés. Te contactaremos pronto.'); }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre Completo</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Juan Pérez"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="juan@ejemplo.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono</label>
                  <input 
                    type="tel" 
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+52 55 o"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Municipio</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ci"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Mensaje (Opcional)</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Cuéntanos sobre las necesidades de tráfico en tu ciudad..."
                />
              </div>
              
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl mx-auto"
              >
                Solicitar Cotización Personalizada
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-slate-700/50 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold">TraficMX</span>
              </div>
              <p className="text-gray-400 text-sm">
                Revolucionando el tráfico urbano en México con tecnología de vanguardia.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Casos de Éxito</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  info@trafic.mx
                </li>
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +52 55 123 o
                </li>
                <li className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Ciudad de México
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-700/50 text-center text-gray-400 text-sm">
            <p>&copy; 2024 TraficMX. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
