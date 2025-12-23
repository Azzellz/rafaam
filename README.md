# 🏯 Rafaam

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)
![Gemini AI](https://img.shields.io/badge/Google%20AI-Gemini%202.5-8E75B2.svg)
![Style](https://img.shields.io/badge/Style-Pixel%20Art-facc15.svg)

**Rafaam** is a retro-styled, AI-powered language quest platform that turns study time into an RPG adventure. Built with **React** and the **Google Gemini API**, it now generates personalized grammar lessons, interactive quizzes, and real-time voice conversations for multiple practice languages (Japanese, English, French, German).

## ✨ Features

-   **📚 AI Grammar Lessons**: Generates structured lessons aligned with JLPT (N5-N1) for Japanese or CEFR (A1-C2) for English/French/German, tailored to any topic ("Anime", "Travel", "Business").
-   **⚔️ Battle Quizzes**: Test your knowledge with dynamically generated 5-question quizzes in the target practice language. Get instant feedback and explanations in your UI language.
-   **🗣️ Live Voice Chat (Sensei Mode)**: Practice speaking in real-time using the **Gemini Live API**. The AI Sensei corrects your mistakes and roleplays scenarios with low-latency audio streaming.
-   **🔊 Native-Quality TTS**: Click on any generated text to hear it read aloud with language-aware neural text-to-speech voices.
-   **💾 Save Favorites**: Bookmark useful grammar points and examples to your local inventory (Local Storage).
-   **🌍 Multi-language Support**: Interface available in English, Simplified Chinese, Traditional Chinese, and Japanese, while quests can target Japanese, English, French, or German.
-   **🧭 Practice Language Selector**: Swap between supported practice languages and level systems without leaving the quest setup screen.
-   **🎨 Pixel Art Aesthetic**: Styled with Tailwind CSS and retro fonts (DotGothic16 & VT323) for an immersive 8-bit experience.

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript
-   **Styling**: Tailwind CSS
-   **AI Integration**: Google GenAI SDK (`@google/genai`)
-   **Models Used**:
    -   `gemini-2.5-flash`: For text generation (Grammar & Quizzes).
    -   `gemini-2.5-flash-preview-tts`: For Text-to-Speech functionality.
    -   `gemini-2.5-flash-native-audio-preview-09-2025`: For real-time Live API voice conversations.
-   **Fonts**: Google Fonts (DotGothic16, VT323).
-   **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   A valid **Google Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/)).

### Installation & Local Development

1. **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/rafaam.git
    cd rafaam
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory. The project uses `vite.config.ts` to load environment variables. You must set `GEMINI_API_KEY`, which gets mapped to the application's internal API key usage.

    ```env
    GEMINI_API_KEY=your_google_gemini_api_key_here
    ```

4. **Run the development server**
    ```bash
    npm run dev
    ```
    The application will start on `http://localhost:3000`.

### Production Build

To build the application for local production testing:

1. **Build the project**

    ```bash
    npm run build
    ```

    This compiles the project into the `dist` directory with optimized assets.

2. **Preview the build**
    ```bash
    npm run preview
    ```
    This launches a local web server to preview the production build.

## 🎮 Usage Guide

1. **Select your settings**: Pick a practice language (Japanese, English, French, German) and the matching level system (JLPT or CEFR).
2. **Choose a Quest**:
    - **Grammar Lesson**: Enter a topic (e.g., "Shopping") to generate a study guide.
    - **Quiz Battle**: Enter a topic to generate multiple-choice questions.
    - **Voice Practice**: Connect directly to the AI Sensei for a spoken conversation.
3. **Interact**:
    - Click the **Speaker Icon** next to any generated practice text to hear pronunciation.
    - Highlight any text on the screen to trigger the **Selection Reader**.
    - Click "Save to Favorites" to build your personal study list.

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the code or add new features (like Kanji practice or spaced repetition), please follow these steps:

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgements

-   [Google AI Studio](https://aistudio.google.com/) for the powerful Gemini models.
-   [Google Fonts](https://fonts.google.com/) for the retro typography.
-   The open-source community for the React ecosystem.

---

<p align="center">
  Generated with ❤️ by Gemini
</p>
