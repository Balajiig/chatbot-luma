// app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
// Removed: import { FaRobot, FaPaperPlane, FaPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// --- Inline SVG Icons ---

// SVG for the Bot Avatar (FaRobot replacement)
const RobotIcon = (props: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={props.className || 'w-4 h-4'}
  >
    <path
      fillRule="evenodd"
      d="M6.75 5.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 .75.75v5.72a2.25 2.25 0 0 1-.689 1.637L15 15.253V18a2.25 2.25 0 0 1-2.25 2.25h-1.5A2.25 2.25 0 0 1 9 18v-2.747l-2.561-2.636A2.25 2.25 0 0 1 5.25 10.97V5.25Zm8.575 4.773a.75.75 0 0 0-1.144-.094L12 9.47l-1.181.668a.75.75 0 0 0-1.144.094L8.25 9.75a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 .75.75h7.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75h-1.075Z"
      clipRule="evenodd"
    />
  </svg>
);

// SVG for the Send Button (FaPaperPlane replacement)
const PaperPlaneIcon = (props: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={props.className || 'w-5 h-5'}
  >
    <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 10.355 10.355 0 0 0 18.232-6.538 10.355 10.355 0 0 0-18.232-6.538Z" />
  </svg>
);

// SVG for the New Conversation Button (FaPlus replacement)
const PlusIcon = (props: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={props.className || 'w-5 h-5'}
  >
    <path
      fillRule="evenodd"
      d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
      clipRule="evenodd"
    />
  </svg>
);
// --- End Inline SVG Icons ---

type Message = {
  id: number;
  sender: 'user' | 'bot';
  text: string;
};

const EMOTION_OPTIONS = [
  { label: '😊 Happy', value: 'happy' },
  { label: '😢 Sad', value: 'sad' },
  { label: '😰 Anxious', value: 'anxious' },
  { label: '😐 Neutral', value: 'neutral' },
];

const ROLE_OPTIONS = [
  { label: 'Student', value: 'student' },
  { label: 'Faculty Member', value: 'faculty' },
];

// Your API endpoint
const API_URL = 'http://127.0.0.1:8000/api/v1/chat';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Hi there! I’m Luma, your emotional support companion. I’m here to listen and help you through tough moments.',
    },
    {
      id: 2,
      sender: 'bot',
      text: 'Before we begin, how are you feeling right now?',
    },
  ]);
  const [awaitingEmotion, setAwaitingEmotion] = useState(true);
  const [awaitingRoleInChat, setAwaitingRoleInChat] = useState(false); // <-- NEW state for inline role selection
  const [selectedEmotion, setSelectedEmotion] = useState(''); // <-- Stores the selected emotion label
  const [inputText, setInputText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate a new session ID on initial load
  useEffect(() => {
    setSessionId(`luma-session-${Date.now()}`);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping, awaitingRoleInChat]); // Added awaitingRoleInChat to dependencies

  // Standard message handler (used after initial flow is complete)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isBotTyping) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: inputText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsBotTyping(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMsg: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.response, // Assuming API returns { "response": "..." }
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Failed to fetch chat response:', error);
      const errorMsg: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "Sorry, I'm having trouble connecting. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsBotTyping(false);
    }
  };

  // Step 1: User selects emotion (Closes modal, prompts for role in chat)
  const handleEmotionSelect = (emotionValue: string) => {
    const emotionLabel =
      EMOTION_OPTIONS.find((e) => e.value === emotionValue)?.label || emotionValue;

    setSelectedEmotion(emotionLabel); // <-- Store the emotion label
    setAwaitingEmotion(false); // <-- Close emotion modal

    // Add a bot message prompting for the role
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Thanks for sharing. To personalize your support, could you tell me your role?',
      },
    ]);

    setAwaitingRoleInChat(true); // <-- Trigger the inline role selection buttons
  };

  // Step 2: User selects role in chat (Builds combined message, sends to API)
  const handleRoleSelectInChat = async (roleValue: string) => {
    if (!selectedEmotion) return; // Guard: ensure emotion is selected

    // Remove emojis from emotion label for a cleaner message string
    const cleanEmotion = selectedEmotion.replace(/[\uD800-\uDBFF\uDC00-\uDFFF]/g, '').trim();
    
    // Construct the specific message format requested by the user
    // e.g., "im student, right now I'm feeling "Happy""
    const roleText = roleValue === 'student' ? 'a student' : 'a faculty member';
    const finalUserMessage = `im ${roleText}, right now I'm feeling "${cleanEmotion}"`;

    // 1. Display the constructed message as the user's message
    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: finalUserMessage,
    };
    setMessages((prev) => [...prev, userMsg]);

    // 2. Reset states and show typing indicator
    setAwaitingRoleInChat(false); // Stop showing role options
    setSelectedEmotion(''); // Clear stored emotion
    setIsBotTyping(true);

    // 3. Send the combined message to the API
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: finalUserMessage, // Send the combined string
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMsg: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.response, // Assuming API returns { "response": "..." }
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Failed to fetch chat response:', error);
      const errorMsg: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "Sorry, I'm having trouble connecting. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsBotTyping(false);
    }
  };

  // Resets chat AND generates a new session ID
  const handleNewConversation = () => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: 'Hi there! I’m Luma, your emotional support companion. I’m here to listen and help you through tough moments.',
      },
      {
        id: 2,
        sender: 'bot',
        text: 'Before we begin, how are you feeling right now?',
      },
    ]);
    setAwaitingEmotion(true); // <-- Start over at emotion modal
    setAwaitingRoleInChat(false); // <-- Ensure inline role selection is closed
    setSelectedEmotion(''); // Clear any stored emotion
    setSessionId(`luma-session-${Date.now()}`);
  };

  return (
    // Main container: full screen, flex column
    <div className="flex flex-col h-screen bg-white text-gray-900">
      {/* Header: Now triggers reset directly */}
      <div className="absolute top-5 left-5 flex items-center gap-2 z-10">
        <span className="font-bold text-gray-800 text-xl">Luma</span>
        <button
          onClick={handleNewConversation}
          className="text-blue-600 hover:text-blue-800 p-1.5 rounded-full hover:bg-blue-100 transition"
          title="New conversation"
          aria-label="New conversation"
        >
          {/* Using PlusIcon component instead of FaPlus */}
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      {/* --- Emotion Selector Modal (Modern & Minimal) --- */}
      <AnimatePresence>
        {awaitingEmotion && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-sm w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.1,
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
            >
              <h2 className="text-xl font-semibold text-blue-900 text-center mb-6">
                How are you feeling?
              </h2>
              {/* 2x2 Grid for buttons */}
              <div className="grid grid-cols-2 gap-3">
                {EMOTION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleEmotionSelect(opt.value)}
                    className="w-full px-4 py-4 bg-blue-50 text-blue-700 rounded-xl text-md font-medium hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area: Takes remaining space, scrolls */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl mx-auto w-full pt-20 pb-28">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-blue-50 text-blue-900 rounded-bl-none border border-blue-100'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {msg.sender === 'bot' && (
                  <motion.div
                    className="bg-blue-500 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {/* Using RobotIcon component instead of FaRobot */}
                    <RobotIcon className="text-white text-sm" />
                  </motion.div>
                )}
                <div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* --- NEW: Inline Role Selection Buttons --- */}
        <AnimatePresence>
          {awaitingRoleInChat && (
            <motion.div
              className="flex justify-start w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.1 }}
            >
              <div className="max-w-[85%]">
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleRoleSelectInChat(opt.value)}
                      className="px-5 py-3 bg-white border border-blue-300 text-blue-800 rounded-xl text-sm font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 shadow-sm whitespace-nowrap"
                      disabled={isBotTyping}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bot Typing Indicator */}
        {isBotTyping && (
          <div className="flex justify-start">
            <div className="bg-blue-50 rounded-2xl rounded-bl-none px-5 py-4 border border-blue-100 shadow-sm">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar: Sticky footer with "glassmorphism" effect */}
      <div className="mt-auto border-t border-blue-100 bg-white/90 backdrop-blur-sm sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto w-full p-4">
          <AnimatePresence>
            {/* Show input bar ONLY if NOT awaiting emotion OR role in chat */}
            {!awaitingEmotion && !awaitingRoleInChat && (
              <motion.form
                onSubmit={handleSendMessage}
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Share what's on your mind..."
                  className="flex-1 bg-blue-50 text-gray-900 placeholder-gray-500 outline-none px-5 py-3 rounded-full border-2 border-transparent focus:border-blue-300 focus:ring-2 focus:ring-blue-200 transition-all"
                  disabled={isBotTyping}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isBotTyping}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20"
                  aria-label="Send message"
                >
                  {/* Using PaperPlaneIcon component instead of FaPaperPlane */}
                  <PaperPlaneIcon className="w-5 h-5" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Luma provides emotional support, not medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}