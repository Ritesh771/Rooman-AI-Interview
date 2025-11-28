# Architecture Diagram

## ASCII Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   User Browser  │◄──►│  Next.js App    │◄──►│   Firebase Auth  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  Firestore DB   │◄──►│  Interview Data │    │   User Profiles │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              ▲
                              │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   VAPI Service  │◄──►│ Voice Assistant │    │   Real-time     │
│                 │    │                 │    │   Conversations │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│ Google Gemini   │◄──►│   AI Feedback   │    │   Analysis &    │
│                 │    │                 │    │   Evaluation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              ▲
                              │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│ Code Platform   │◄──►│ Monaco Editor   │    │   WebSocket     │
│                 │    │                 │    │   Collaboration │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Component Descriptions

### Frontend Layer
- **Next.js App**: Main application framework handling routing, UI, and client-side logic
- **Code Platform**: Integrated coding environment with Monaco Editor
- **User Interface**: Responsive design using Tailwind CSS and shadcn/ui components

### Backend Services
- **Firebase Auth**: Handles user authentication and authorization
- **Firestore**: NoSQL database for storing interview data, user profiles, and transcripts (now the sole database backend)
- **VAPI**: Provides voice assistant capabilities for interactive interviews
- **Google Gemini**: AI service for generating feedback and analysis

### Data Flow
1. User authenticates via Firebase Auth
2. Interview sessions are created and stored in Firestore
3. Voice interactions are handled through VAPI
4. AI feedback is generated using Google Gemini
5. Code challenges use real-time collaboration via WebSockets

## Technology Stack
- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Auth, Firestore)
- **AI Services**: VAPI, Google Gemini
- **Real-time**: WebSocket connections
- **Validation**: Zod