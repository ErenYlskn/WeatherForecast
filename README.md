# 🌤️ Weather Forecast - Complete AI-Powered Weather Application

A comprehensive weather application suite featuring AI-powered recommendations, real-time data, and cross-platform mobile support.

## 🚀 Project Overview

This project consists of two main components:
1. **Mastra Backend Framework** - AI-powered weather agent with Gemini 2.0 Flash
2. **React Native Mobile App** - Cross-platform mobile application with 4-tab navigation

## 📱 Mobile Application Features

### 🌡️ Weather Tab
- **Real-time weather data** for all 81 Turkish provinces
- **Current temperature** display with city information
- **AI-powered recommendations**:
  - 👔 **Clothing advice** based on temperature
  - 🎯 **Activity suggestions** for the day
  - 💊 **Health tips** for weather conditions

### ⭐ Favorites Tab
- **Save favorite cities** for quick access
- **One-tap weather check** - click any favorite city
- **Auto-navigation** to weather results
- **Easy management** - add/remove favorites

### 🌾 Agriculture Tab
- **Farming guidance** based on weather conditions
- **🌱 Planting advice** - what to plant when
- **💧 Irrigation recommendations** - optimal watering schedules
- **🚜 Field work suggestions** - best times for farming activities
- **Temperature-based insights** for agricultural planning

### ⚙️ Settings Tab
- **🔔 Notification controls** - enable/disable weather alerts
- **🌡️ Temperature units** - switch between Celsius/Fahrenheit
- **📱 App information** - version and developer details
- **🎨 Customization options**

## 🛠️ Tech Stack

### Backend
- **Framework**: Mastra Framework
- **Runtime**: Node.js
- **AI Model**: Google Gemini 2.0 Flash
- **Weather API**: Open-Meteo
- **Storage**: LibSQL memory storage
- **Tools**: MCP (Model Context Protocol)

### Mobile App
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **UI Design**: Glass-morphism with modern UX
- **Navigation**: 4-tab system
- **Platform**: Cross-platform (iOS/Android)

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (for mobile development)
- Google Gemini API key

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/ErenYlskn/Weather_forecast.git
cd Weather_forecast

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Google Gemini API key to .env

# Start the Mastra server
npm run dev
```

### Mobile App Setup
```bash
# Navigate to mobile app directory
cd weather-mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Scan QR code with Expo Go app or run on simulator
```

## 🌍 Supported Locations

All 81 provinces of Turkey with accurate coordinates:
- Major cities: İstanbul, Ankara, İzmir, Antalya, Bursa
- Coastal cities: Samsun, Trabzon, Mersin, Muğla
- Eastern cities: Erzurum, Van, Hakkari, Şırnak
- Central Anatolia: Konya, Kayseri, Sivas, Yozgat
- And 65+ more provinces...

## 🤖 AI Features

### Smart Recommendations
- **Temperature-based clothing advice**: From winter coats to summer wear
- **Weather-appropriate activities**: Indoor/outdoor activity suggestions
- **Health guidance**: Seasonal health tips and precautions
- **Agriculture insights**: Farming recommendations by weather conditions

### Intelligent Responses
- Natural language processing with Gemini 2.0 Flash
- Context-aware recommendations
- Turkish language support
- Real-time weather data integration

## 🎯 Usage

### Mobile App
1. **Download Expo Go** on your mobile device
2. **Scan QR code** from the development server
3. **Search for cities** in the Weather tab
4. **Save favorites** for quick access
5. **Get agriculture advice** in the Agriculture tab
6. **Customize settings** as needed

### Backend API
```bash
# Test the weather agent
curl -X POST http://localhost:4111/api/agents/weather-assistant/generate \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"İstanbul'\''da hava nasıl?"}]}'
```

## 📁 Project Structure

```
Weather_forecast/
├── 📱 weather-mobile/          # React Native Mobile App
│   ├── App.tsx                 # Main application component
│   ├── package.json           # Dependencies and scripts
│   ├── app.json               # Expo configuration
│   └── assets/                # App icons and images
├── 🔧 agents/                  # Mastra agents
│   └── weather-assistant.ts   # Weather AI agent
├── 🛠️ tools/                   # MCP tools
│   └── weather.ts             # Weather API integration
├── ⚙️ mastra.config.ts         # Mastra configuration
├── 📦 package.json            # Backend dependencies
└── 📄 README.md               # This file
```

## 🌐 API Endpoints

- `GET /api/agents` - List available agents
- `POST /api/agents/weather-assistant/generate` - Get weather recommendations
- Weather data powered by Open-Meteo API

## 🔧 Development

### Running Tests
```bash
# Backend tests
npm test

# Mobile app tests
cd weather-mobile
npm test
```

### Building for Production
```bash
# Build backend
npm run build

# Build mobile app
cd weather-mobile
npx expo build:android
npx expo build:ios
```

## 📄 License

MIT License - feel free to use and modify

## 👨‍💻 Developer

Created with ❤️ by AI Weather Assistant Team

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Weather Forecast - Your AI-Powered Life Assistant** 🌤️📱🤖
