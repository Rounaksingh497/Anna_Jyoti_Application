/**
 * Vercel Speed Insights Integration
 * This file initializes and configures Vercel Speed Insights for the application
 * 
 * The script will automatically track page performance metrics and send them to Vercel
 * when the application is deployed on Vercel platform.
 */

(function() {
  'use strict';
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;
  
  // Initialize the queue for Speed Insights
  window.si = window.si || function() {
    (window.siq = window.siq || []).push(arguments);
  };
  
  // Load the Speed Insights script
  var script = document.createElement('script');
  script.defer = true;
  
  // Use the Vercel-provided endpoint when deployed
  // In development, this will use the debug version
  var isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  
  if (isDevelopment) {
    script.src = 'https://va.vercel-scripts.com/v1/speed-insights/script.debug.js';
  } else {
    // When deployed to Vercel, use the injected endpoint
    script.src = '/_vercel/speed-insights/script.js';
  }
  
  // Add framework information as data attribute
  script.setAttribute('data-sdkn', '@vercel/speed-insights/vanilla');
  script.setAttribute('data-sdkv', '2.0.0');
  
  // Error handling
  script.onerror = function() {
    console.log('[Vercel Speed Insights] Failed to load script. Please check if content blockers are enabled.');
  };
  
  // Append to head
  document.head.appendChild(script);
})();
