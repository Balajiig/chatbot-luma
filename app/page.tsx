// app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';

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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: "Hi there! I’m Luma, your emotional support companion. I’m here to listen and help you through tough moments.",
    },
    {
      id: 2,
      sender: 'bot',
      text: "Before we begin, how are you feeling right now?",
    },
  ]);
  const [awaitingEmotion, setAwaitingEmotion] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
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

    setTimeout(() => {
      const botReply = generateBotResponse(inputText);
      const botMsg: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botReply,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsBotTyping(false);
      setAwaitingEmotion(false);
    }, 1500);
  };

  const handleEmotionSelect = (emotion: string) => {
    const emotionLabel = EMOTION_OPTIONS.find(e => e.value === emotion)?.label || emotion;
    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: emotionLabel,
    };
    setMessages((prev) => [...prev, userMsg]);
    setAwaitingEmotion(false);

    setTimeout(() => {
      let botReply = "";
      if (emotion === 'sad') {
        botReply = "Thank you for sharing that. It takes courage to name your feelings. Would you like to try a grounding exercise or talk more about what’s on your mind?";
      } else if (emotion === 'anxious') {
        botReply = "I hear you. Anxiety can feel heavy. Let’s take a breath together: Inhale for 4… hold for 4… exhale for 6. You’re not alone.";
      } else if (emotion === 'happy') {
        botReply = "I’m so glad you’re feeling this way! 🌟 Would you like to reflect on what’s bringing you joy?";
      } else {
        botReply = "Thanks for letting me know. I’m here whenever you’re ready to talk or explore some self-care ideas.";
      }

      const botMsg: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botReply,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsBotTyping(false);
    }, 1200);
  };

  const handleNewConversation = () => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: "Hi there! I’m Luma, your emotional support companion. I’m here to listen and help you through tough moments.",
      },
      {
        id: 2,
        sender: 'bot',
        text: "Before we begin, how are you feeling right now?",
      },
    ]);
    setAwaitingEmotion(true);
  };

  const generateBotResponse = (input: string): string => {
    const lower = input.toLowerCase();
    if (lower.includes('sad') || lower.includes('depressed')) return "I'm here with you. Would you like a journaling prompt or a calming exercise?";
    if (lower.includes('anxious')) return "Let’s breathe together. Inhale... hold... exhale. You’re safe.";
    if (lower.includes('happy')) return "That’s wonderful! Would you like to explore what’s going well?";
    return "Thank you for sharing. I’m here to support you.";
  };

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 p-6">
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-blue-50 text-blue-900 rounded-bl-none'
              }`}
            >
              <div className="flex items-start gap-2">
                {msg.sender === 'bot' && (
                  <motion.div
                    className="bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FaRobot className="text-white text-xs" />
                  </motion.div>
                )}
                <div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Emotion Quick Select */}
        {awaitingEmotion && (
          <div className="flex justify-start">
            <div className="bg-blue-50 rounded-xl rounded-bl-none px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {EMOTION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleEmotionSelect(opt.value)}
                    className="px-3 py-1.5 bg-white text-blue-700 rounded-full text-sm border border-blue-200 hover:bg-blue-100 transition"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isBotTyping && (
          <div className="flex justify-start">
            <div className="bg-blue-50 rounded-xl rounded-bl-none px-4 py-3">
              <div className="flex space-x-1">
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

      {/* Input Bar */}
      {!awaitingEmotion && (
        <div className="p-4 border-t border-blue-100 bg-blue-50 rounded-xl max-w-4xl mx-auto w-full">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Share how you're feeling..."
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none pl-4 py-2"
              disabled={isBotTyping}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isBotTyping}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg disabled:opacity-50"
            >
              <FaPaperPlane />
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Luma provides emotional support, not medical advice.
          </p>
        </div>
      )}
    </div>
  );
}