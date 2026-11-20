import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, Image, Mic, BookOpen, Loader2 } from 'lucide-react';
import { ScreenId, FoodAnalysisResponse } from '../../types/food';
import { apiService } from '../../services/apiService';

interface AskIntelligenceScreenProps {
  onNavigate: (screen: ScreenId) => void;
  foodName?: string;
  analysis?: FoodAnalysisResponse;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  sources?: string[];
}

export const AskIntelligenceScreen: React.FC<AskIntelligenceScreenProps> = ({
  onNavigate,
  foodName = 'Paneer Biryani',
  analysis,
}) => {
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Hello! I have full access to the nutritional composition, safety profile, and scientific evidence for ${foodName}. Ask me anything!`,
      sources: ['USDA FoodData Central', 'NIH Guidelines'],
    },
  ]);

  useEffect(() => {
    setMessages([
      {
        sender: 'ai',
        text: `Hello! I have full access to the nutritional composition, safety profile, and scientific evidence for ${foodName}. Ask me anything!`,
        sources: ['USDA FoodData Central', 'NIH Guidelines'],
      },
    ]);
  }, [foodName]);

  const suggestedQuestions = [
    'Why is the protein high?',
    'Is this suitable for weight loss?',
    'What are the health benefits?',
    'Are there any long-term risks?',
  ];

  const exampleQuestions = [
    'Why is the calorie value this high?',
    'Is this safe for daily consumption?',
    'Compare this with a homemade version',
  ];

  const handleSend = async (qText?: string) => {
    const question = qText || inputQuestion;
    if (!question.trim()) return;

    // Add user message
    const newMessages: Message[] = [...messages, { sender: 'user', text: question }];
    setMessages(newMessages);
    setInputQuestion('');
    setIsAsking(true);

    try {
      const res = await apiService.askIntelligence({
        foodId: analysis?.analysisId || 'scan_current',
        foodName,
        question,
        analysis,
      });

      setMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: res.answer,
          sources: res.sources,
        },
      ]);
    } catch (e) {
      console.error(e);
      setMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: 'Sorry, I encountered an issue reaching the intelligence endpoint. Please try again.',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-6 justify-between h-full">
      
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pt-1 mb-2">
          <button
            onClick={() => onNavigate('overview')}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ask about this analysis</span>
          </div>
          <div className="w-9" />
        </div>

        {/* Suggested Chips Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 text-xs">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 rounded-full bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 text-blue-900 font-medium whitespace-nowrap transition-colors cursor-pointer text-[11px]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="space-y-3 pt-2 max-h-[360px] overflow-y-auto pr-1">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-br-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                }`}
              >
                {msg.text}

                {/* Sources Cited */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center gap-1 text-[10px] text-slate-400">
                    <BookOpen className="w-3 h-3 text-emerald-600" />
                    <span>Sources: {msg.sources.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isAsking && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-100 w-fit">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Thinking with nutrition RAG evidence...</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Input Area & Example Questions */}
      <div className="space-y-3 pt-3">
        {/* Example Questions Section */}
        {messages.length <= 2 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Example Questions</span>
            <div className="space-y-1">
              {exampleQuestions.map((eq) => (
                <button
                  key={eq}
                  onClick={() => handleSend(eq)}
                  className="w-full text-left p-2 rounded-xl bg-white border border-slate-100 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-[11px] transition-colors cursor-pointer"
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="relative flex items-center bg-white rounded-2xl border border-slate-300 shadow-xs focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 p-1">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your question..."
            className="flex-1 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />

          <div className="flex items-center gap-1 pr-1 text-slate-400">
            <button className="p-1.5 hover:text-slate-600 transition-colors cursor-pointer" title="Attach image">
              <Image className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:text-slate-600 transition-colors cursor-pointer" title="Speak question">
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={!inputQuestion.trim() || isAsking}
              className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
