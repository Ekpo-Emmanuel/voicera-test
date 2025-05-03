'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Camera, Upload, Menu, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold">FaceReg</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-1 hover:text-gray-600 transition-colors py-2">
              <span className='text-sm'>Webcam</span>
            </Link>
            <Link href="/upload" className="flex items-center space-x-1 hover:text-gray-600 transition-colors py-2">
              <span className='text-sm'>Upload</span>
            </Link>
            <Link href="/info" className="flex items-center space-x-1 hover:text-gray-600 transition-colors py-2">
              <span className='text-sm'>Info</span>
            </Link>
            <Link href="https://github.com/yourusername/facial-recognition-app" target="_blank">
                <Button variant="outline" size="sm">
                    Github
                </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-blue-500">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Camera className="h-5 w-5" />
                <span>Webcam</span>
              </Link>
              <Link 
                href="/upload" 
                className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Upload className="h-5 w-5" />
                <span>Upload</span>
              </Link>
              <Link 
                href="/info" 
                className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Info className="h-5 w-5" />
                <span>How it works</span>
              </Link>
              <a 
                href="https://github.com/Ekpo-Emmanuel/voicera-test" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 bg-white text-blue-700 rounded-md font-medium hover:bg-blue-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                GitHub
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header; 