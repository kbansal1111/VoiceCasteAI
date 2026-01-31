# 🎙️ VoiceCast AI - Interactive AI Podcast Generator

Transform your blog posts into **engaging, interactive AI-powered podcasts** with realistic 3D avatars and real-time conversation capabilities.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Python](https://img.shields.io/badge/Python-3.11-blue)

## ✨ Features

### 🎯 Core Features
- 📝 **Blog-to-Podcast Conversion** - AI transforms written content into natural podcast scripts
- 🗣️ **High-Quality Text-to-Speech** - Multiple realistic AI voices
- 👤 **3D Avatar Animation** - Synchronized lip-sync and facial expressions
- 🎨 **Avatar Customization** - Create and customize your podcast host
- 🎵 **Background Music Integration** - Auto-mix music with voice

### 🎤 Interactive Features (What Makes This Unique!)
- 💬 **Real-Time Q&A** - Pause and ask questions during the podcast
- 🗨️ **Voice Commands** - Control podcast with voice ("explain more", "skip ahead")
- 🤝 **Conversational Mode** - Have a two-way discussion with the AI host
- 🧠 **Context Awareness** - Agent remembers the entire blog content
- ⚡ **Adaptive Explanations** - Content adjusts based on your understanding
- 🎛️ **Live Customization** - Change tone, depth, and pace on-the-fly

### 📊 Advanced Features
- 📈 **Analytics Dashboard** - Track engagement and popular topics
- 🌍 **Multi-Language Support** - Generate podcasts in multiple languages
- 📱 **Export Options** - MP3, MP4, RSS feed generation
- 🔐 **User Authentication** - Save and manage your podcast library
- 🚀 **Batch Processing** - Convert multiple blogs simultaneously

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Blog Input   │ │ 3D Avatar    │ │ Interactive  │        │
│  │ & Upload     │ │ Viewer       │ │ Chat Panel   │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────────────────────────────────────────┐       │
│  │         Podcast Player with Voice Controls        │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   │  WebSocket      │
                   │  Connection     │
                   └────────┬────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│              PYTHON BACKEND API (FastAPI)                    │
│  /api/upload-blog     /api/generate-script                   │
│  /api/text-to-speech  /api/avatar-animate                    │
│  /api/chat            /api/voice-command   (Interactive!)    │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
┌───────────▼────┐ ┌───────▼──────┐ ┌──────▼────────┐
│ Ollama/Llama   │ │ Coqui TTS/   │ │ Whisper.cpp   │
│ (Script Gen +  │ │ Bark         │ │ (Voice Input) │
│  Interactive   │ │ (Voice Gen)  │ │               │
│  Chat)         │ │              │ │               │
└────────────────┘ └──────────────┘ └───────────────┘
            │               │               │
┌───────────▼───────────────▼───────────────▼────────┐
│         3D AVATAR RENDERING & LIP SYNC              │
│  Three.js + React Three Fiber + Rhubarb Lip Sync   │
└────────────────────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────────┐
│      DATABASE & STORAGE (PostgreSQL + R2)          │
│  Blogs │ Scripts │ Audio │ Videos │ Chat History  │
└────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend (Next.js 14)
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **Tailwind CSS** | Styling and UI components |
| **shadcn/ui** | Pre-built accessible components |
| **Three.js** | 3D avatar rendering |
| **React Three Fiber** | React integration for Three.js |
| **Framer Motion** | Smooth animations |
| **Socket.io-client** | Real-time WebSocket communication |
| **Web Speech API** | Browser-based voice input |

### Backend (Python)
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance REST API |
| **Python 3.11+** | Core backend language |
| **Socket.io** | WebSocket server for real-time features |
| **LangChain** | Conversational AI context management |
| **Pydantic** | Data validation |

### AI/ML Models
| Technology | Purpose |
|------------|---------|
| **Ollama (Llama 3.2)** | Script generation & interactive chat |
| **Coqui TTS** | High-quality text-to-speech |
| **Bark** | Expressive realistic voices |
| **Whisper.cpp** | Speech-to-text for voice commands |
| **Rhubarb Lip Sync** | Automatic lip-sync generation |

### Database & Storage
| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | User data, blogs, podcast metadata |
| **Redis** | Caching and session management |
| **Cloudflare R2** | Audio/video file storage |

### Deployment
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Vercel** | Next.js frontend hosting |
| **Railway/Render** | Backend API hosting |
| **GitHub Actions** | CI/CD pipeline |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **Python** 3.11+
- **Docker** (optional but recommended)
- **Git**

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/voicecast-ai.git
cd voicecast-ai
```

#### 2. Setup Backend (Python)
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Ollama (for AI script generation)
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.2

# Install Whisper.cpp (for voice input)
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
make
./models/download-ggml-model.sh base.en

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration
```

#### 3. Setup Frontend (Next.js)
```bash
cd ../frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your API endpoints
```

#### 4. Setup Database
```bash
# Using Docker
docker-compose up -d postgres redis

# OR manually
# Install PostgreSQL and Redis
# Create database: voicecast_ai
```

### Running the Application

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Ollama (if not running as service):**
```bash
ollama serve
```

Access the application at: **http://localhost:3000**

#### Production Mode with Docker
```bash
docker-compose up --build
```

---

## 📖 Usage Guide

### Basic Workflow

#### 1. Create a Podcast from Blog
```
1. Go to dashboard
2. Click "New Podcast"
3. Paste blog URL or text
4. Select voice and avatar
5. Click "Generate Podcast"
6. Wait for processing (30s - 2min)
7. Play and interact!
```

#### 2. Interactive Features

**Voice Commands:**
```
"Pause"
"Resume"
"Explain that in more detail"
"What does [term] mean?"
"Give me an example"
"Skip to conclusion"
"Slow down"
"Make it more technical"
```

**Text Chat:**
- Click chat icon during playback
- Type questions about the content
- Agent responds in context
- Chat history saved

**Conversational Mode:**
- Toggle "Interactive Mode"
- Have a real-time discussion
- Agent references blog content
- Natural back-and-forth dialogue

### API Usage

#### Generate Podcast Script
```bash
curl -X POST http://localhost:8000/api/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "blog_text": "Your blog content here...",
    "style": "conversational",
    "duration_target": "5-7 minutes"
  }'
```

#### Interactive Chat
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "podcast_id": "abc123",
    "message": "Can you explain the main concept?",
    "context_timestamp": 120
  }'
```

#### Voice Command Processing
```bash
curl -X POST http://localhost:8000/api/voice-command \
  -H "Content-Type: multipart/form-data" \
  -F "audio=@command.wav" \
  -F "podcast_id=abc123"
```

---

## 📁 Project Structure

```
voicecast-ai/
├── frontend/                 # Next.js frontend
│   ├── app/
│   │   ├── (auth)/          # Authentication pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── podcast/         # Podcast viewer & player
│   │   └── api/             # Next.js API routes
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── Avatar3D.tsx     # 3D avatar component
│   │   ├── PodcastPlayer.tsx
│   │   ├── InteractiveChat.tsx
│   │   └── VoiceInput.tsx
│   ├── lib/
│   │   ├── websocket.ts     # WebSocket client
│   │   └── utils.ts
│   └── public/
│       └── avatars/         # 3D avatar models
│
├── backend/                  # Python FastAPI backend
│   ├── main.py              # FastAPI app entry
│   ├── routers/
│   │   ├── podcast.py       # Podcast endpoints
│   │   ├── chat.py          # Interactive chat
│   │   └── auth.py          # Authentication
│   ├── services/
│   │   ├── script_generator.py    # Ollama integration
│   │   ├── tts_service.py         # Text-to-speech
│   │   ├── voice_service.py       # Whisper integration
│   │   ├── avatar_service.py      # Avatar animation
│   │   └── chat_service.py        # Interactive chat logic
│   ├── models/              # Database models
│   ├── utils/
│   │   └── websocket.py     # WebSocket manager
│   └── requirements.txt
│
├── models/                   # AI model files
│   ├── ollama/
│   ├── whisper/
│   └── tts/
│
├── docker-compose.yml
├── Dockerfile.frontend
├── Dockerfile.backend
└── README.md
```

---

## 🎯 Roadmap

### Phase 1: MVP (Weeks 1-2) ✅
- [x] Blog text input
- [x] Basic script conversion
- [x] Simple TTS
- [x] Basic 3D avatar
- [x] Audio playback

### Phase 2: Interactive Features (Weeks 3-4) 🚧
- [x] WebSocket integration
- [x] Real-time chat
- [x] Voice command processing
- [ ] Context-aware responses
- [ ] Conversational mode

### Phase 3: Enhancement (Weeks 5-6)
- [ ] Advanced avatar customization
- [ ] Emotion detection
- [ ] Multiple avatar support
- [ ] Background music mixer
- [ ] Analytics dashboard

### Phase 4: Scale & Polish (Weeks 7-8)
- [ ] Multi-language support
- [ ] Batch processing
- [ ] API for third-party integration
- [ ] Mobile app (React Native)
- [ ] Podcast RSS feed generation

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint rules for frontend
- Use Black formatter for Python
- Write tests for new features
- Update documentation

---

## 🐛 Troubleshooting

### Common Issues

**Ollama Connection Error:**
```bash
# Check if Ollama is running
ollama list

# Start Ollama service
ollama serve
```

**TTS Generation Slow:**
```bash
# Use faster TTS model
# In backend/.env change:
TTS_MODEL=piper-tts  # Instead of Bark
```

**Avatar Not Loading:**
```bash
# Check Three.js dependencies
npm install three @react-three/fiber @react-three/drei
```

**WebSocket Connection Failed:**
```bash
# Ensure backend is running on correct port
# Check CORS settings in backend/main.py
```

---

## 📊 Performance Benchmarks

| Process | Duration | Notes |
|---------|----------|-------|
| Script Generation | 10-30s | Depends on blog length |
| TTS (Coqui) | 2-5s/minute | High quality |
| TTS (Piper) | 0.5-1s/minute | Fast, good quality |
| Lip Sync Processing | 1-3s | Per audio file |
| Avatar Rendering | Real-time | 60 FPS on modern hardware |
| Voice Command Recognition | 1-2s | Using Whisper base model |

---

## 🔐 Security

- API authentication using JWT tokens
- Rate limiting on all endpoints
- Input sanitization for blog content
- Secure WebSocket connections (WSS)
- Environment variables for sensitive data
- CORS configuration for production

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Ollama** - Local LLM inference
- **Coqui TTS** - Open-source TTS
- **Three.js** - 3D graphics library
- **Ready Player Me** - Avatar creation
- **Rhubarb Lip Sync** - Lip-sync generation
- **Whisper** - Speech recognition

---

## 📧 Contact & Support

- **GitHub Issues:** [Report bugs](https://github.com/yourusername/voicecast-ai/issues)
- **Discussions:** [Ask questions](https://github.com/yourusername/voicecast-ai/discussions)
- **Email:** support@voicecast.ai
- **Discord:** [Join our community](https://discord.gg/voicecast)

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/voicecast-ai&type=Date)](https://star-history.com/#yourusername/voicecast-ai&Date)

---

**Built with ❤️ by the VoiceCast AI Team**

*Transform your content into engaging, interactive conversations!*
