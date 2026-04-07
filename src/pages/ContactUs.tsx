import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export default function ContactUs() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
          Developer Profile
        </h1>
        <p className="text-text-muted text-lg">Get in touch with the creator of LendLedger</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center md:items-start">
          
          {/* Profile Info */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-bold">Rahool Gir</h2>
              <p className="text-accent font-medium mt-2">Senior Software Engineer</p>
              <p className="text-sm text-text-muted mt-1">Java · Microservices · Full-Stack | Fintech & Core Banking</p>
            </div>

            <p className="text-sm leading-relaxed text-text-muted max-w-2xl">
              Software Engineer with 3 years 8 months of hands-on production experience building enterprise Core Banking and Fintech systems. 
              Specialized in microservices architecture, REST API development, and full-stack engineering using Java, Quarkus, Spring Boot, Node.js, and Vue.js. 
              Successfully contributed to AL-Habib Bank's Core Banking System.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <a href="mailto:rahool.goswami16@gmail.com" className="flex items-center gap-3 p-4 glass rounded-2xl hover:bg-white/10 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <Mail size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-text-muted">Email</p>
                  <p className="text-sm font-medium">rahool.goswami16@gmail.com</p>
                </div>
              </a>

              <a href="tel:+923089567074" className="flex items-center gap-3 p-4 glass rounded-2xl hover:bg-white/10 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                  <Phone size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-text-muted">Phone</p>
                  <p className="text-sm font-medium">+92 308 9567074</p>
                </div>
              </a>

              <div className="flex items-center gap-3 p-4 glass rounded-2xl sm:col-span-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                  <MapPin size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-text-muted">Location</p>
                  <p className="text-sm font-medium">Karachi, Pakistan</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center md:justify-start gap-4 pt-4">
              <a href="https://www.linkedin.com/in/rahool-goswami-4b055a126/" target="_blank" rel="noopener noreferrer" className="p-3 glass rounded-xl hover:bg-white/20 transition-colors text-text-muted hover:text-text">
                <Linkedin size={24} />
              </a>
              <a href="https://github.com/Rahul-AlPHA1" target="_blank" rel="noopener noreferrer" className="p-3 glass rounded-xl hover:bg-white/20 transition-colors text-text-muted hover:text-text">
                <Github size={24} />
              </a>
              <a href="https://rahul-alpha1.github.io/RahoolPortfolio.com/" target="_blank" rel="noopener noreferrer" className="p-3 glass rounded-xl hover:bg-white/20 transition-colors text-text-muted hover:text-text">
                <Globe size={24} />
              </a>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 text-left">
              <h3 className="text-xl font-bold mb-4">Technologies Used in LendLedger</h3>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {[
                  'React 19', 'TypeScript', 'Tailwind CSS v4', 'Framer Motion', 
                  'Vite', 'Google Gemini AI', 'Java 17+', 'Spring Boot 3', 
                  'PostgreSQL', 'jsPDF'
                ].map(tech => (
                  <span key={tech} className="px-3 py-1.5 glass rounded-lg text-sm font-medium text-accent">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
