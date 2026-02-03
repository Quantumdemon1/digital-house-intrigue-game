
import { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        // Big Brother themed colors from CSS variables
        bb: {
          blue: 'hsl(var(--bb-blue))',
          'blue-light': 'hsl(var(--bb-blue-light))',
          'blue-dark': 'hsl(var(--bb-blue-dark))',
          red: 'hsl(var(--bb-red))',
          'red-light': 'hsl(var(--bb-red-light))',
          'red-dark': 'hsl(var(--bb-red-dark))',
          green: 'hsl(var(--bb-green))',
          'green-light': 'hsl(var(--bb-green-light))',
          'green-dark': 'hsl(var(--bb-green-dark))',
          gold: 'hsl(var(--bb-gold))',
          'gold-light': 'hsl(var(--bb-gold-light))',
          'gold-dark': 'hsl(var(--bb-gold-dark))',
          dark: 'hsl(var(--bb-dark))',
          light: 'hsl(var(--bb-light))'
        },
        // Semantic game colors
        game: {
          success: 'hsl(var(--game-success))',
          warning: 'hsl(var(--game-warning))',
          danger: 'hsl(var(--game-danger))',
          info: 'hsl(var(--game-info))',
          hoh: 'hsl(var(--hoh-color))',
          nominee: 'hsl(var(--nominee-color))',
          pov: 'hsl(var(--pov-color))',
          safe: 'hsl(var(--safe-color))',
          evicted: 'hsl(var(--evicted-color))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Montserrat', 'sans-serif']
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' }
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'scale-out': {
          from: { transform: 'scale(1)', opacity: '1' },
          to: { transform: 'scale(0.95)', opacity: '0' }
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'slide-in-bottom': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'slide-out-bottom': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' }
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 20px hsl(var(--bb-blue) / 0.4)'
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: '0 0 30px hsl(var(--bb-blue) / 0.6)'
          }
        },
        'camera-scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(300%)' }
        },
        'competition-progress': {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        },
        'celebrate-winner': {
          '0%': { 
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 hsl(var(--bb-gold) / 0.7)'
          },
          '50%': { 
            transform: 'scale(1.05)',
            boxShadow: '0 0 0 15px hsl(var(--bb-gold) / 0)'
          },
          '100%': { 
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 hsl(var(--bb-gold) / 0)'
          }
        },
        'phase-transition': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '50%': { transform: 'translateY(-20px)', opacity: '0' },
          '51%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'reveal': {
          '0%': { 
            transform: 'rotateY(180deg) scale(0.8)',
            opacity: '0'
          },
          '100%': { 
            transform: 'rotateY(0deg) scale(1)',
            opacity: '1'
          }
        },
        'glow': {
          '0%, 100%': { 
            boxShadow: '0 0 5px hsl(var(--bb-gold) / 0.5), 0 0 20px hsl(var(--bb-gold) / 0.3)'
          },
          '50%': { 
            boxShadow: '0 0 20px hsl(var(--bb-gold) / 0.8), 0 0 40px hsl(var(--bb-gold) / 0.5)'
          }
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' }
        },
        'count-up': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' }
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'vote-reveal': {
          '0%': { 
            transform: 'scale(0) rotateY(180deg)',
            opacity: '0'
          },
          '50%': {
            transform: 'scale(1.1) rotateY(90deg)',
            opacity: '0.5'
          },
          '100%': { 
            transform: 'scale(1) rotateY(0deg)',
            opacity: '1'
          }
        },
        'nominee-highlight': {
          '0%, 100%': { 
            borderColor: 'hsl(var(--bb-red))',
            boxShadow: '0 0 10px hsl(var(--bb-red) / 0.3)'
          },
          '50%': { 
            borderColor: 'hsl(var(--bb-red-light))',
            boxShadow: '0 0 25px hsl(var(--bb-red) / 0.6)'
          }
        },
        'safe-celebration': {
          '0%': { 
            transform: 'scale(1)',
            backgroundColor: 'transparent'
          },
          '50%': { 
            transform: 'scale(1.05)',
            backgroundColor: 'hsl(var(--bb-green) / 0.1)'
          },
          '100%': { 
            transform: 'scale(1)',
            backgroundColor: 'transparent'
          }
        },
        'key-reveal': {
          '0%': {
            transform: 'rotateY(180deg) scale(0.5)',
            opacity: '0',
            filter: 'blur(10px)'
          },
          '50%': {
            transform: 'rotateY(90deg) scale(1.1)',
            opacity: '0.5',
            filter: 'blur(5px)'
          },
          '100%': {
            transform: 'rotateY(0deg) scale(1)',
            opacity: '1',
            filter: 'blur(0)'
          }
        },
        'confetti': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' }
        },
        'vote-count': {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.3)' },
          '50%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1)' }
        },
        'spotlight': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'scale-out': 'scale-out 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-out',
        'slide-in-bottom': 'slide-in-bottom 0.3s ease-out',
        'slide-out-bottom': 'slide-out-bottom 0.3s ease-out',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'camera-scan': 'camera-scan 4s linear infinite',
        'competition-progress': 'competition-progress 3s ease-in-out',
        'celebrate-winner': 'celebrate-winner 2s ease-in-out infinite',
        'phase-transition': 'phase-transition 0.5s ease',
        'reveal': 'reveal 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'glow': 'glow 2s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'count-up': 'count-up 0.3s ease-out',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'vote-reveal': 'vote-reveal 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'nominee-highlight': 'nominee-highlight 2s ease-in-out infinite',
        'safe-celebration': 'safe-celebration 0.5s ease-out',
        'key-reveal': 'key-reveal 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'confetti': 'confetti 3s ease-in-out forwards',
        'vote-count': 'vote-count 0.5s ease-out',
        'spotlight': 'spotlight 0.6s ease-out',
        // Combined animations
        'enter': 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
        'exit': 'fade-out 0.3s ease-out, scale-out 0.2s ease-out'
      },
      backgroundImage: {
        'surveillance-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M0 0h20v20H0V0zm1 1h18v18H1V1z'/%3E%3C/g%3E%3C/svg%3E\")",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
      },
      boxShadow: {
        'game-sm': 'var(--shadow-sm)',
        'game-md': 'var(--shadow-md)',
        'game-lg': 'var(--shadow-lg)',
        'game-xl': 'var(--shadow-xl)',
        'glow-primary': 'var(--shadow-glow-primary)',
        'glow-gold': 'var(--shadow-glow-gold)',
        'glow-danger': 'var(--shadow-glow-danger)',
        'glow-success': 'var(--shadow-glow-success)'
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
