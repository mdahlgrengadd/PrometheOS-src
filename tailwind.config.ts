
import type { Config } from "tailwindcss";

export default {
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
				window: {
					DEFAULT: 'hsl(var(--window))',
					foreground: 'hsl(var(--window-foreground))',
					border: 'hsl(var(--window-border))',
					header: 'hsl(var(--window-header))'
				},
				taskbar: {
					DEFAULT: 'hsl(var(--taskbar))',
					foreground: 'hsl(var(--taskbar-foreground))'
				},
				neon: {
					blue: '#1EAEDB',
					purple: '#8B5CF6',
					pink: '#D946EF',
					orange: '#F97316',
					green: '#10B981',
					yellow: '#FBBF24',
					red: '#EF4444',
					cyan: '#06B6D4'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				'glow': {
					'0%, 100%': { 
						boxShadow: '0 0 5px rgba(30, 174, 219, 0.5), 0 0 15px rgba(30, 174, 219, 0.3)' 
					},
					'50%': { 
						boxShadow: '0 0 20px rgba(30, 174, 219, 0.8), 0 0 30px rgba(30, 174, 219, 0.5)' 
					}
				},
				'scanner': {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(100%)' }
				},
				'pulse-rainbow': {
					'0%, 100%': { 
						boxShadow: '0 0 5px rgba(30, 174, 219, 0.5), 0 0 15px rgba(30, 174, 219, 0.3)' 
					},
					'16%': { 
						boxShadow: '0 0 15px rgba(139, 92, 246, 0.7), 0 0 25px rgba(139, 92, 246, 0.5)' 
					},
					'33%': { 
						boxShadow: '0 0 15px rgba(217, 70, 239, 0.7), 0 0 25px rgba(217, 70, 239, 0.5)' 
					},
					'50%': { 
						boxShadow: '0 0 15px rgba(249, 115, 22, 0.7), 0 0 25px rgba(249, 115, 22, 0.5)' 
					},
					'66%': { 
						boxShadow: '0 0 15px rgba(16, 185, 129, 0.7), 0 0 25px rgba(16, 185, 129, 0.5)' 
					},
					'83%': { 
						boxShadow: '0 0 15px rgba(251, 191, 36, 0.7), 0 0 25px rgba(251, 191, 36, 0.5)' 
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'heart-beat': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.25)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.2s ease-out',
				'fade-out': 'fade-out 0.2s ease-out',
				'glow': 'glow 2s ease-in-out infinite',
				'scanner': 'scanner 2s linear infinite',
				'pulse-rainbow': 'pulse-rainbow 8s ease-in-out infinite',
				'float': 'float 4s ease-in-out infinite',
				'spin-slow': 'spin-slow 8s linear infinite',
				'heart-beat': 'heart-beat 1.5s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
