// app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [awaitingRole, setAwaitingRole] = useState(false); // <-- New state for role modal
  const [selectedEmotion, setSelectedEmotion] = useState(''); // <-- New state to store emotion
  const [userRole, setUserRole] = useState(''); // <-- New state to store role
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
  }, [messages, isBotTyping]);

  // Converted to async function
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
    setAwaitingEmotion(false);

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

  // Step 1: User selects emotion
  const handleEmotionSelect = (emotion: string) => {
    const emotionLabel =
      EMOTION_OPTIONS.find((e) => e.value === emotion)?.label || emotion;

    setSelectedEmotion(emotionLabel); // <-- Store the emotion
    setAwaitingEmotion(false); // <-- Close emotion modal
    setAwaitingRole(true); // <-- Open role modal
  };

  // Step 2: User selects role, then we send the first message
  const handleRoleSelect = async (role: string) => {
    setUserRole(role); // <-- Store the role
    setAwaitingRole(false); // <-- Close role modal

    // Now, add the user's emotion message to the chat
    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: selectedEmotion, // <-- Use the stored emotion
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsBotTyping(true);

    // And send the emotion to the API
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: selectedEmotion, // Send the emotion label as the message
          session_id: sessionId,
          // You could also send the role if your API supports it:
          // role: role,
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
      setSelectedEmotion(''); // Clear stored emotion
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
    setAwaitingRole(false); // <-- Ensure role modal is closed
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
          <FaPlus className="text-lg" />
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

      {/* --- NEW: Role Selector Modal (Minimalistic) --- */}
      <AnimatePresence>
        {awaitingRole && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-xs w-full"
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
                Are you a...
              </h2>
              {/* Vertical list for role buttons */}
              <div className="flex flex-col gap-3">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleRoleSelect(opt.value)}
                    className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-xl text-md font-medium hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
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
                    <FaRobot className="text-white text-sm" />
                  </motion.div>
                )}
                <div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

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
            {/* Show input bar ONLY if NOT awaiting emotion OR role */}
            {!awaitingEmotion && !awaitingRole && (
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
                  <FaPaperPlane className="w-5 h-5" />
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