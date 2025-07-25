// src/pages/SettingsPage.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx'; // Adjust path if necessary

const SettingsPage = () => {
  const { theme, toggleTheme, customThemes } = useTheme();

  return (
    <div className="p-6 rounded-lg shadow-xl max-w-2xl mx-auto transition-colors duration-300 ease-in-out"
         style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <h2 className="text-3xl font-bold mb-6 text-center"
          style={{ color: 'var(--primary-color)' }}>
        App Settings
      </h2>

      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-4"
            style={{ color: 'var(--text-color)' }}>
          Theme Selection
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-color-secondary)' }}>
          Choose a visual theme for the application. Your selection will be saved.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {customThemes.map((t) => (
            <button
              key={t}
              onClick={() => toggleTheme(t)}
              className={`
                p-4 rounded-lg text-center font-medium capitalize
                border-2 transition-all duration-200 ease-in-out
                ${theme === t
                  ? 'border-[var(--primary-color)] shadow-lg scale-105'
                  : 'border-[var(--border-color)] hover:border-[var(--primary-color)] hover:scale-105'
                }
              `}
              style={{
                backgroundColor: `var(--${t}-bg-preview, var(--bg-color-alt))`, // Use preview color or a fallback
                color: `var(--${t}-text-preview, var(--text-color))`, // Use preview color or a fallback
                borderColor: theme === t ? 'var(--primary-color)' : 'var(--border-color)',
              }}
            >
              {t.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* You can add more settings sections here later */}
      <div className="mt-10 pt-6 border-t border-[var(--border-color)]">
        <p className="text-sm text-center" style={{ color: 'var(--text-color-secondary)' }}>
          Additional settings will be available soon.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
