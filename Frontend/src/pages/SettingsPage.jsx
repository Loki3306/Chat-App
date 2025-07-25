// src/pages/SettingsPage.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx'; // Ensure correct path
import { Settings, Palette, Moon, Sun, User, Lock, Bell, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const SettingsPage = () => {
  const { theme, toggleTheme, themes } = useTheme(); 

  const settingGroups = [
    {
      title: "Appearance",
      icon: <Palette size={20} />,
      settings: [
        {
          name: "Theme",
          description: "Change the color scheme of the application.",
          control: (
            <div className="flex flex-wrap gap-3">
              {themes.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTheme(t)}
                  // Added 'relative' to the button for z-index context
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out ${
                    theme === t
                      ? 'ring-2 ring-offset-2 ring-[var(--primary-color)] scale-110'
                      : 'opacity-80 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: `var(--${t}-bg-preview, var(--bg-color-alt))`,
                    // The color for the icon/text inside the button
                    color: `var(--${t}-text-preview, var(--text-color))`, 
                    borderColor: 'var(--border-color)', // Consistent border
                    boxShadow: theme === t ? '0 0 8px rgba(var(--primary-color-rgb-values, 252, 211, 77), 0.5)' : 'none',
                    // Ensure the button itself has a z-index if needed, though relative should suffice
                    zIndex: 1, 
                  }}
                  aria-label={`${t} theme`}
                >
                  {/* Wrapped icon/text in a div with z-index to ensure visibility */}
                  <div className="relative z-10 flex items-center justify-center">
                    {t === 'dark' ? <Moon size={16} /> : t === 'light' ? <Sun size={16} /> : t.charAt(0).toUpperCase()}
                  </div>
                </button>
              ))}
            </div>
          )
        },
      ]
    },
    {
      title: "Account",
      icon: <User size={20} />,
      settings: [
        {
          name: "Profile",
          description: "Update your profile information and view details.",
          control: (
            <Link
              to="/profile" // Link to the profile page
              className="px-4 py-2 text-sm rounded-md font-medium transition-colors duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--primary-color)', // Use primary for button background
                color: 'var(--bg-color-alt)', // Text color contrasting with primary
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              }}
            >
              Edit Profile
            </Link>
          )
        },
        {
          name: "Security",
          description: "Change password and 2FA settings.",
          control: (
            <button
              className="px-4 py-2 text-sm rounded-md font-medium transition-colors duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--secondary-color)', // Use secondary for button background
                color: 'var(--bg-color-alt)', // Text color contrasting with secondary
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              }}
            >
              Manage Security
            </button>
          )
        },
        {
          name: "Notifications",
          description: "Configure your notification preferences.",
          icon: <Bell size={20} />,
          control: (
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[var(--border-color)] transition-colors"
                    onClick={() => console.log("Toggle Notifications")}> {/* Placeholder for actual toggle logic */}
              <span className={`inline-block h-4 w-4 transform rounded-full bg-[var(--primary-color)] transition ${
                // Example: if a notification setting exists and is true, move slider
                false ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          )
        }
      ]
    },
    {
      title: "Help & Support",
      icon: <HelpCircle size={20} />,
      settings: [
        {
          name: "FAQ",
          description: "Find answers to frequently asked questions.",
          control: (
            <button
              className="px-4 py-2 text-sm rounded-md font-medium transition-colors duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--bg-color-alt)',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
              }}
            >
              View FAQ
            </button>
          )
        },
        {
          name: "Contact Us",
          description: "Get in touch with our support team.",
          control: (
            <button
              className="px-4 py-2 text-sm rounded-md font-medium transition-colors duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--bg-color-alt)',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
              }}
            >
              Contact
            </button>
          )
        }
      ]
    }
  ];

  return (
    <div
      className="max-w-4xl mx-auto p-4 sm:p-6 rounded-lg transition-colors duration-300 ease-in-out"
      style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
    >
      <div className="flex items-center gap-3 mb-8">
        <Settings size={24} style={{ color: 'var(--primary-color)' }} />
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Settings</h1>
      </div>

      <div className="space-y-6">
        {settingGroups.map((group, index) => (
          <div
            key={index}
            className="rounded-lg border p-5 shadow-sm"
            style={{
              backgroundColor: 'var(--bg-color-alt)', // Use alt background for cards
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              {React.cloneElement(group.icon, { style: { color: 'var(--primary-color)' } })} {/* Apply primary color to group icons */}
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>{group.title}</h2>
            </div>

            <div className="space-y-4">
              {group.settings.map((setting, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="sm:w-1/2">
                    <h3 className="font-medium" style={{ color: 'var(--text-color)' }}>{setting.name}</h3>
                    <p className="text-sm" style={{ color: 'var(--text-color-secondary)' }}>{setting.description}</p>
                  </div>
                  <div className="sm:w-1/2 flex sm:justify-end">
                    {setting.control}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
