'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Shield,
  BarChart3,
  Clock,
  Users,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Zap,
  Eye,
  MapPin,
  Car,
  Truck,
  Bus,
  Bike,
  User,
  Users2
} from 'lucide-react';
import {
  Icon1,
  Icon2,
  Icon3,
  Icon4,
  Icon5,
  Icon6,
  Icon7,
  Icon8,
  Icon9
} from '../components/TrafficIcons';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setIsScrolled(window.scrollY > 20);
    });
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navegación */}
      <nav className={`sticky top-0 z-50 bg-white border border-neutral-200 transition-all duration-200 ${
        isScrolled ? 'shadow-medium' : 'shadow-soft'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-4 font-semibold text-neutral-900">
              <img 
                src="/images/logo.png" 
                alt="Trafic.mx Logo" 
                className="w-15 h-15 object-contain"
              />
              <span className="text-2xl font-bold">Trafic.mx</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#caracteristicas" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                Características
              </a>
              <a href="#soluciones" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                Soluciones
              </a>
              <a href="#acerca" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                Acerca de
              </a>
              <Link href="/dashboard" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                Panel de Control
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900">
                Iniciar Sesión
              </button>
              <Link 
                href="/dashboard"
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Ver Panel
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Sección Hero */}
      <section className="relative py-20 px-6">
        {/* Low opacity backdrop with gradient fade */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('/images/cerro.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
          }}
        />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6">
            <Activity className="w-4 h-4" />
            Inteligencia de Tráfico en Tiempo Real
          </div>
          
          <h1 className="text-5xl font-bold text-neutral-900 mb-6">
            Inteligencia de Tráfico<br />
            <span className="text-primary-600">para Ciudades Modernas</span>
          </h1>
          
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Monitoreo y analítica de tráfico en tiempo real para gobiernos municipales. 
            Toma decisiones basadas en datos con insights potenciados por IA.
          </p>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900 mb-1">99.9%</div>
              <div className="text-sm text-neutral-600">Disponibilidad del Sistema</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900 mb-1">&lt;5s</div>
              <div className="text-sm text-neutral-600">Frecuencia de Actualización</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900 mb-1">24/7</div>
              <div className="text-sm text-neutral-600">Monitoreo Continuo</div>
            </div>
          </div>

          {/* Botones CTA */}
          <div className="flex items-center justify-center gap-4">
            <button className="btn-primary flex items-center gap-2">
              Solicitar Acceso
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link 
              href="/dashboard" 
              className="btn-secondary flex items-center gap-2"
            >
              Ver Panel de Control
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de Características */}
      <section id="caracteristicas" className="py-20 px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Gestión de Tráfico Profesional
            </h2>
            <p className="text-lg text-neutral-600">
              Características de nivel empresarial diseñadas para operaciones municipales
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card p-6">
              <Icon1 size={48} className="text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Monitoreo en Tiempo Real
              </h3>
              <p className="text-neutral-600 mb-4">
                Red de cámaras profesionales con conteo de vehículos por IA y análisis de flujo actualizado cada 5 segundos.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge-success px-2 py-1 rounded-md text-xs font-medium">
                  Operación 24/7
                </span>
                <span className="badge-info px-2 py-1 rounded-md text-xs font-medium">
                  Alta Resolución
                </span>
              </div>
            </div>

            <div className="card p-6">
              <Icon2 size={48} className="text-info mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Detección de Incidentes con IA
              </h3>
              <p className="text-neutral-600 mb-4">
                Identificación automática de colisiones con captura instantánea de evidencia para respuesta de emergencia.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge-error px-2 py-1 rounded-md text-xs font-medium">
                  Respuesta Rápida
                </span>
                <span className="badge-warning px-2 py-1 rounded-md text-xs font-medium">
                  Evidencia Automática
                </span>
              </div>
            </div>

            <div className="card p-6">
              <Icon9 size={48} className="text-success mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Analítica Predictiva
              </h3>
              <p className="text-neutral-600 mb-4">
                Modelado de patrones de tráfico predictivo para optimización de semáforos y planificación urbana.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge-success px-2 py-1 rounded-md text-xs font-medium">
                  Reducción 40% Congestión
                </span>
                <span className="badge-info px-2 py-1 rounded-md text-xs font-medium">
                  IA Avanzada
                </span>
              </div>
            </div>

            <div className="card p-6">
              <Icon9 size={48} className="text-warning mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Ahorro de Costos Municipal
              </h3>
              <p className="text-neutral-600 mb-4">
                Reduce costos de congestión en $2.3M anuales con optimización automatizada de flujo vehicular.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge-success px-2 py-1 rounded-md text-xs font-medium">
                  ROI 12 Meses
                </span>
                <span className="badge-warning px-2 py-1 rounded-md text-xs font-medium">
                  Eficiencia Operativa
                </span>
              </div>
            </div>

            <div className="card p-6">
              <Icon1 size={48} className="text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Captura de Evidencia 4K
              </h3>
              <p className="text-neutral-600 mb-4">
                Imágenes cristalinas para documentación de incidentes y propósitos legales/aseguradores.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge-info px-2 py-1 rounded-md text-xs font-medium">
                  4K Ultra HD
                </span>
                <span className="badge-success px-2 py-1 rounded-md text-xs font-medium">
                  Almacenamiento Seguro
                </span>
              </div>
            </div>

            <div className="card p-6">
              <Icon7 size={48} className="text-neutral-600 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Cobertura Urbana Completa
              </h3>
              <p className="text-neutral-600 mb-4">
                Sistema escalable para monitorear intersecciones críticas y arterias principales de la ciudad.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge-info px-2 py-1 rounded-md text-xs font-medium">
                  Escalable
                </span>
                <span className="badge-success px-2 py-1 rounded-md text-xs font-medium">
                  Cobertura Total
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Imágenes Demostrativas */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Tecnología de Vanguardia en Acción
            </h2>
            <p className="text-lg text-neutral-600">
              Vea cómo nuestras cámaras Hig-Vision transforman la gestión del tráfico urbano
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="relative overflow-hidden rounded-xl shadow-medium hover:shadow-large transition-shadow">
              <img 
                src="/images/IMG1.png" 
                alt="Panel de Control de Tráfico"
                className="w-full h-64 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white font-semibold">Panel de Control de Tráfico</h3>
                <p className="text-white/80 text-sm">Panel de Analítica Avanzada</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl shadow-medium hover:shadow-large transition-shadow">
              <img 
                src="/images/IMG2.png" 
                alt="Cámaras de Alta Resolución"
                className="w-full h-64 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white font-semibold">Cámaras de Alta Resolución</h3>
                <p className="text-white/80 text-sm">Instalación profesional en intersecciones críticas</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl shadow-medium hover:shadow-large transition-shadow">
              <img 
                src="/images/IMG3.png" 
                alt="Detección Automática de Incidentes"
                className="w-full h-64 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white font-semibold">Detección Automática de Incidentes</h3>
                <p className="text-white/80 text-sm">Respuesta inmediata con evidencia fotográfica</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl shadow-medium hover:shadow-large transition-shadow">
              <img 
                src="/images/IMG4.png" 
                alt="Centro de Operaciones Municipal"
                className="w-full h-64 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white font-semibold">Centro de Operaciones Municipal</h3>
                <p className="text-white/80 text-sm">Monitoreo centralizado para toda la ciudad</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl shadow-medium hover:shadow-large transition-shadow">
              <img 
                src="/images/IMG5.png" 
                alt="Comando Móvil para Emergencias"
                className="w-full h-64 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white font-semibold">Comando Móvil para Emergencias</h3>
                <p className="text-white/80 text-sm">Acceso instantáneo desde unidades de respuesta</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl shadow-medium hover:shadow-large transition-shadow bg-neutral-100 flex items-center justify-center">
              <div className="text-center p-8">
                <Icon1 size={128} className="text-neutral-400 mx-auto mb-4" />
                <h3 className="text-neutral-600 font-semibold mb-2">Próximamente</h3>
                <p className="text-neutral-500 text-sm">Más visualizaciones de nuestra tecnología</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Tipos de Vehículos */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Detección Completa de Todos los Tipos de Vehículos
            </h2>
            <p className="text-lg text-neutral-600">
              Nuestra IA identifica y clasifica automáticamente todos los tipos de tráfico urbano
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center mb-3 mx-auto">
                <Car className="w-6 h-6 text-primary-600" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-1">Automóviles</h4>
              <p className="text-sm text-neutral-600">Detección precisa de vehículos particulares</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-info-light rounded-lg flex items-center justify-center mb-3 mx-auto">
                <Truck className="w-6 h-6 text-info" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-1">Camiones</h4>
              <p className="text-sm text-neutral-600">Vehículos de carga y transporte pesado</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-success-light rounded-lg flex items-center justify-center mb-3 mx-auto">
                <Bus className="w-6 h-6 text-success" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-1">Autobuses</h4>
              <p className="text-sm text-neutral-600">Transporte público y escolar</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-warning-light rounded-lg flex items-center justify-center mb-3 mx-auto">
                <Bike className="w-6 h-6 text-warning" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-1">Motocicletas</h4>
              <p className="text-sm text-neutral-600">Vehículos de dos ruedas motorizados</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center mb-3 mx-auto">
                <Bike className="w-6 h-6 text-primary-600" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-1">Bicicletas</h4>
              <p className="text-sm text-neutral-600">Ciclistas y movilidad sostenible</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                <User className="w-6 h-6 text-neutral-600" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-1">Peatones</h4>
              <p className="text-sm text-neutral-600">Detección de personas y cruces</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección CTA Final */}
      <section className="py-20 px-6 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Transforme la Gestión del Tráfico de Su Ciudad
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Únase a municipios líderes que ya están utilizando nuestra tecnología 
            para crear ciudades más seguras y eficientes.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-neutral-50 transition-colors flex items-center gap-2">
              Solicitar Demostración
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link 
              href="/dashboard" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors flex items-center gap-2"
            >
              Ver Panel en Vivo
              <Eye className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="mt-8 text-primary-200 text-sm">
            <p>✓ Instalación profesional incluida</p>
            <p>✓ Capacitación para personal municipal</p>
            <p>✓ Soporte técnico 24/7</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-4 font-semibold text-white mb-4">
                <img 
                  src="/images/logo.png" 
                  alt="Trafic.mx Logo" 
                  className="w-12 h-12 object-contain"
                />
                <span className="font-bold text-white text-xl">Trafic.mx</span>
              </Link>
            <p className="text-sm text-neutral-400">
              Tecnología de inteligencia de tráfico de nivel gubernamental 
              para ciudades más seguras y eficientes.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Soluciones</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Monitoreo en Tiempo Real</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Detección de Incidentes</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Analítica Predictiva</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gestión Municipal</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Acerca de Nosotros</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Casos de Éxito</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Soporte</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Documentación Técnica</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Portal de Ayuda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Estado del Sistema</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Emergencias: 55-1234-5678</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-neutral-800 text-center text-sm text-neutral-400">
          <p>&copy; 2025 Trafic.mx. Todos los derechos reservados. | 
          <a href="#" className="hover:text-white transition-colors"> Política de Privacidad</a> | 
          <a href="#" className="hover:text-white transition-colors"> Términos de Servicio</a></p>
        </div>
      </footer>
    </div>
  );
}
