"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, Circle, Send, 
  Plus, Bot, User as UserIcon, Calendar, ClipboardList, AlertCircle, FileText, ArrowRight, ChevronLeft, ChevronRight, Trash2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, onSnapshot, collection, getDocs, deleteDoc
} from 'firebase/firestore';

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = 'discipline_app';

const getFormattedDateString = (dateObj) => {
  const offset = dateObj.getTimezoneOffset() * 60000;
  return (new Date(dateObj.getTime() - offset)).toISOString().slice(0, 10);
};

const getTomorrowString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getFormattedDateString(tomorrow);
};

const defaultDay1Checklist = [
  "6:00 AM - Wake up immediately no snooze.",
  "6:15 AM - Grooming & dressing.",
  "8:05 AM - Arrive at work before 8:17, list 3 top tasks.",
  "9:00 AM - 11:00 AM - Deep work.",
  "During Meetings - Active listening, empathetic understanding.",
  "4:50 PM - Review and clean desk.",
  "5:30 PM - Commute home (30 mins).",
  "6:00 PM - Grocery shopping & Dinner prep.",
  "7:00 PM - Dinner.",
  "8:00 PM - 45-min Walk (posture focus).",
  "9:00 PM - Quality time with girlfriend.",
  "10:00 PM - Review app, tick tasks, write reasons for unchecked ones.",
  "10:30 PM - Sleep."
];

const generateGeminiResponse = async (chatHistory, systemInstruction) => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: chatHistory,
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (result.error) {
      console.error("Gemini API Error:", result.error);
      return `Error from AI: ${result.error.message}`;
    }
    return result?.candidates?.[0]?.content?.parts?.[0]?.text || "AI response error. Please try again.";
  } catch (error) {
    console.error("Fetch Error:", error);
    return "Cannot connect to AI. Check your network or API Key.";
  }
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Quản lý Ngày tháng & Start Date
  const [currentDateObj, setCurrentDateObj] = useState(new Date());
  const [startDate, setStartDate] = useState(null); // Ngày được đánh dấu là Day 1
  const todayStr = getFormattedDateString(new Date());
  const currentDateStr = getFormattedDateString(currentDateObj);

  const [checklist, setChecklist] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reportSent, setReportSent] = useState(false);
  
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Lắng nghe Settings (để lấy Start Date)
  useEffect(() => {
    if (!user) return;
    const settingsRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'settings', 'main');
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().startDate) {
        setStartDate(docSnap.data().startDate);
      } else {
        // Nếu chưa có, mặc định gán ngày mai là Day 1
        const tmr = getTomorrowString();
        setStartDate(tmr);
        setDoc(settingsRef, { startDate: tmr }, { merge: true });
      }
    });
    return () => unsubSettings();
  }, [user]);

  // Lắng nghe dữ liệu theo ngày đang chọn
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    
    const dayRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'dailyLogs', currentDateStr);
    const unsubDay = onSnapshot(dayRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setChecklist(data.checklist || []);
        setNotes(data.notes || '');
        setReportSent(data.reportSent || false);
      } else {
        // Seed Day 1 Checklist (Chỉ gen tự động nếu là Day 1 hoặc Today)
        if (currentDateStr === startDate || (!startDate && currentDateStr === getTomorrowString())) {
          const seedChecklist = defaultDay1Checklist.map((text, index) => ({
            id: `seed-${index}`,
            text: text,
            completed: false,
            reason: ''
          }));
          setChecklist(seedChecklist);
        } else {
          setChecklist([]);
        }
        setNotes('');
        setReportSent(false);
      }
      setLoading(false);
      setIsSubmitting(false); 
    }, (err) => console.error(err));

    return () => unsubDay();
  }, [user, currentDateStr, startDate]);

  // Lắng nghe đoạn chat
  useEffect(() => {
    if (!user) return;
    const chatRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'chats', 'persistentChat');
    const unsubChat = onSnapshot(chatRef, (docSnap) => {
      if (docSnap.exists()) {
        setChatMessages(docSnap.data().messages || []);
      }
    }, (err) => console.error(err));
    return () => unsubChat();
  }, [user]);

  const changeDay = (offset) => {
    const newDate = new Date(currentDateObj);
    newDate.setDate(newDate.getDate() + offset);
    setCurrentDateObj(newDate);
  };

  // Tính Day hiện tại dựa trên startDate
  const getDayLabel = () => {
    if (!startDate) return "";
    const targetDate = new Date(currentDateStr);
    const sDate = new Date(startDate);
    const diffTime = targetDate - sDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (diffDays === 1) return "DAY 1";
    if (diffDays > 1) return `DAY ${diffDays}`;
    if (diffDays === 0) return "DAY 0 (PREP)";
    return `PRE-TRAINING`;
  };

  // Hàm Reset toàn bộ dữ liệu
  const handleResetData = async () => {
    if (!window.confirm("⚠️ BẠN CÓ CHẮC CHẮN MUỐN XÓA TOÀN BỘ DỮ LIỆU?\nHành động này không thể hoàn tác! Nó sẽ xóa sạch checklist, báo cáo và chat AI, đồng thời set lại Day 1 vào ngày mai.")) {
      return;
    }
    
    setLoading(true);
    try {
      // 1. Xóa toàn bộ document trong collection dailyLogs
      const logsRef = collection(db, 'artifacts', APP_ID, 'users', user.uid, 'dailyLogs');
      const logsSnap = await getDocs(logsRef);
      const deletePromises = logsSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      
      // 2. Xóa cuộc trò chuyện
      await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'chats', 'persistentChat'));
      
      // 3. Set lại startDate là ngày mai
      const tmr = getTomorrowString();
      await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'settings', 'main'), { startDate: tmr }, { merge: true });
      
      // 4. Đưa UI về hôm nay
      setCurrentDateObj(new Date());
      alert("✅ Đã xóa toàn bộ dữ liệu. Ngày mai chính thức là Day 1.");
    } catch (e) {
      console.error("Error resetting data:", e);
      alert("Lỗi khi xóa dữ liệu, hãy thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const saveDailyData = async (newChecklist, newNotes, isSent = reportSent) => {
    if (!user) return;
    const dayRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'dailyLogs', currentDateStr);
    await setDoc(dayRef, {
      checklist: newChecklist,
      notes: newNotes,
      reportSent: isSent,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  };

  const handleAddChecklist = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || reportSent) return;
    const updated = [...checklist, { id: Date.now().toString(), text: newTask, completed: false, reason: '' }];
    setChecklist(updated);
    setNewTask('');
    await saveDailyData(updated, notes);
  };

  const toggleChecklist = async (id) => {
    if (isSubmitting || reportSent) return;
    const updated = checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
    setChecklist(updated);
    await saveDailyData(updated, notes);
  };

  const handleReasonChange = (id, reason) => {
    const updated = checklist.map(item => item.id === id ? { ...item, reason } : item);
    setChecklist(updated);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const initiateSubmitReport = () => {
    if (checklist.length === 0 && !notes.trim()) {
       setErrorMessage("You have no tasks or notes for this day.");
       setShowError(true);
       return;
    }
    const hasUnchecked = checklist.some(item => !item.completed);
    if (hasUnchecked) {
      setIsSubmitting(true);
      setShowError(false);
      setErrorMessage("");
    } else {
      executeFinalSubmit();
    }
  };

  const confirmSubmissionWithReasons = () => {
    const hasEmptyReasons = checklist.some(item => !item.completed && (!item.reason || !item.reason.trim()));
    if (hasEmptyReasons) {
      setShowError(true);
      setErrorMessage("Please provide a reason for ALL incomplete tasks.");
      return;
    }
    executeFinalSubmit();
  };

  const cancelSubmission = () => {
    setIsSubmitting(false);
    setShowError(false);
    setErrorMessage("");
  };

  const executeFinalSubmit = async () => {
    if (!user) return;
    setIsSubmitting(false);
    setReportSent(true);
    await saveDailyData(checklist, notes, true);

    const completedTasks = checklist.filter(i => i.completed).map(i => `- ${i.text}`).join('\n') || "None.";
    const missedTasks = checklist.filter(i => !i.completed).map(i => `- ${i.text} (Reason:${i.reason})`).join('\n') || "None.";
    
    const dayTag = getDayLabel();
    const reportText = `**Daily Report for ${currentDateStr} (${dayTag})**\n\n**Completed:**\n${completedTasks}\n\n**Incomplete & Reasons:**\n${missedTasks}\n\n**Notes & Food/Calories:**\n${notes || "No extra notes."}`;

    const newUserMessage = { role: 'user', parts: [{ text: reportText }] };
    const updatedHistory = [...chatMessages, newUserMessage];
    
    setChatMessages(updatedHistory);
    setIsTyping(true);

    const systemInstruction = `You are a strict but empathetic discipline coach helping the user build responsibility, a masculine/confident character, and empathy for others.
Core Context of the User:
- Work Schedule: Mon-Fri, arrive exactly by 8:17 AM, leave at 5:00 PM. Commute takes 30 minutes each way.
- Exercise: Walking for 45 mins with a straight back and confident posture.
- Personal life: Wants to spend quality time with his girlfriend AFTER completing all tasks. Needs a consistent sleep schedule (in bed by 10:30 PM).
- Goal: Deep work focus, active listening to understand others, and strict discipline.
- Language: English.

When the user submits a daily report:
1. Score the day (out of 100).
2. Analyze the "Incomplete" tasks and their reasons. Give strict but constructive advice to improve.
3. Evaluate their food/calorie intake and their empathy reflection.
4. FINALLY, generate a checklist for tomorrow based on today's performance. The schedule MUST adapt to his core constraints.

CRITICAL: You MUST output the JSON for tomorrow's checklist anywhere in your response wrapped in \`\`\`json ... \`\`\` format, containing a valid JSON array of strings. Like this:
\`\`\`json
[
  "6:00 AM - Wake up",
  "Task 2"
]
\`\`\``;

    const replyText = await generateGeminiResponse(updatedHistory, systemInstruction);
    
    let parsedChecklist = null;
    try {
      const jsonRegex = /```(?:json)?\n?([\s\S]*?)\n?```/;
      const match = replyText.match(jsonRegex);
      if (match && match[1]) {
        parsedChecklist = JSON.parse(match[1].trim());
      } else {
        const arrayMatch = replyText.match(/\[\s*[\s\S]*\s*\]/);
        if (arrayMatch) {
          parsedChecklist = JSON.parse(arrayMatch[0]);
        }
      }
    } catch (e) {
      console.error("Failed to parse JSON from AI response", e);
    }

    let finalReplyText = replyText;
    
    if (parsedChecklist && Array.isArray(parsedChecklist)) {
       finalReplyText = finalReplyText.replace(/```(?:json)?\n?[\s\S]*?\n?```/g, ''); 
       finalReplyText += "\n\n<span style='color: #10b981; font-weight: bold;'>✅ Tomorrow's checklist has been successfully generated! (Check the calendar for tomorrow)</span>";
       
       const tomorrowDate = new Date(currentDateObj);
       tomorrowDate.setDate(tomorrowDate.getDate() + 1);
       const tomorrowStr = getFormattedDateString(tomorrowDate);
       
       const tomorrowChecklist = parsedChecklist.map(task => ({
         id: crypto.randomUUID(),
         text: task,
         completed: false,
         reason: ''
       }));
       
       const tomorrowRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'dailyLogs', tomorrowStr);
       await setDoc(tomorrowRef, {
         checklist: tomorrowChecklist,
         updatedAt: new Date().toISOString()
       }, { merge: true });
    } else {
       finalReplyText += "\n\n<span style='color: #ef4444; font-weight: bold;'>⚠️ Could not generate tomorrow's checklist. Format error.</span>";
    }

    const newModelMessage = { role: 'model', parts: [{ text: finalReplyText }] };
    const finalHistory = [...updatedHistory, newModelMessage];
    
    setChatMessages(finalHistory);
    setIsTyping(false);

    const chatRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'chats', 'persistentChat');
    await setDoc(chatRef, { messages: finalHistory });
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;

    const userText = chatInput.trim();
    setChatInput('');
    
    const newUserMessage = { role: 'user', parts: [{ text: userText }] };
    const updatedHistory = [...chatMessages, newUserMessage];
    
    setChatMessages(updatedHistory);
    setIsTyping(true);

    const systemInstruction = `You are a discipline and empathy coach for this male user. Always keep his context in mind (building masculinity/responsibility, 8:17 AM - 5:00 PM work, 30m commute, walking for exercise, quality time with girlfriend, 10:30 PM sleep). Reply in English, be genuine, strict but constructive.`;
    const replyText = await generateGeminiResponse(updatedHistory, systemInstruction);
    
    const cleanedReplyText = replyText.replace(/```(?:json)?\n?[\s\S]*?\n?```/g, '').trim();
    
    const newModelMessage = { role: 'model', parts: [{ text: cleanedReplyText }] };
    const finalHistory = [...updatedHistory, newModelMessage];
    
    setChatMessages(finalHistory);
    setIsTyping(false);

    const chatRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'chats', 'persistentChat');
    await setDoc(chatRef, { messages: finalHistory });
  };

  if (!user || loading) {
    return <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-gray-400">Loading your data...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#0a0a0a] text-gray-100 font-sans overflow-hidden">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto custom-scrollbar">
        <header className="mb-8 flex items-center justify-between pb-4 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                Discipline & Empathy Board
              </h1>
              <button 
                onClick={handleResetData}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 text-red-400 hover:bg-red-900/60 hover:text-red-300 rounded-lg text-xs font-bold border border-red-900/50 transition-colors"
                title="Reset all data and start Day 1 tomorrow"
              >
                <Trash2 size={14} /> Reset App
              </button>
            </div>
            
            <div className="flex items-center gap-4 mt-3">
              <button onClick={() => changeDay(-1)} className="p-1 hover:bg-gray-800 rounded-lg transition-colors">
                 <ChevronLeft size={20} className="text-gray-400" />
              </button>
              <div className="flex items-center gap-2 text-cyan-400 font-bold bg-cyan-950/30 px-4 py-1.5 rounded-lg border border-cyan-900/50">
                <Calendar size={16} />
                <span>{currentDateStr}</span>
              </div>
              <button onClick={() => changeDay(1)} className="p-1 hover:bg-gray-800 rounded-lg transition-colors">
                 <ChevronRight size={20} className="text-gray-400" />
              </button>
              
              <span className="text-xs font-bold bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 px-3 py-1.5 rounded-md ml-2 tracking-wide">
                 {getDayLabel()}
              </span>
              
              {currentDateStr === todayStr && (
                 <span className="text-xs font-semibold bg-gray-800 text-gray-300 px-2 py-1 rounded">TODAY</span>
              )}
            </div>
          </div>
          
          {reportSent && (
            <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-semibold border border-emerald-500/20 flex items-center gap-2">
              <CheckCircle2 size={18} /> Day Reported
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 gap-6 max-w-4xl w-full mx-auto pb-20">
          {/* Checklist Section */}
          <section className="bg-[#111111] rounded-2xl p-4 lg:p-6 border border-gray-800 shadow-2xl">
            <h2 className="text-lg lg:text-xl font-bold flex items-center gap-3 mb-4 text-cyan-400">
              <ClipboardList size={22} /> {currentDateStr === todayStr ? "Today's Checklist" : "Checklist for " + currentDateStr}
            </h2>
            
            {!reportSent && !isSubmitting && currentDateStr >= todayStr && (
              <form onSubmit={handleAddChecklist} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={newTask} 
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add new task..." 
                  className="flex-1 bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm lg:text-base focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-gray-200"
                />
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 px-4 rounded-xl transition-colors text-black font-bold">
                  <Plus size={24} />
                </button>
              </form>
            )}

            <div className="space-y-3">
              {checklist.length === 0 && (
                <p className="text-gray-500 italic py-4 text-sm lg:text-base">No tasks found for this date. Check back later.</p>
              )}
              {checklist.map(item => (
                <div key={item.id} className={`flex flex-col p-3 lg:p-4 rounded-xl transition-all border ${item.completed ? 'bg-black/40 border-gray-800 text-gray-600' : 'bg-gray-800/20 border-gray-700'}`}>
                  <div 
                    onClick={() => toggleChecklist(item.id)}
                    className={`flex items-start gap-3 cursor-pointer group`}
                  >
                    <div className="mt-0.5">
                      {item.completed 
                        ? <CheckCircle2 size={22} className="text-emerald-500 shrink-0" /> 
                        : <Circle size={22} className="text-gray-500 shrink-0 group-hover:text-cyan-400 transition-colors" />}
                    </div>
                    <span className={`text-sm lg:text-base font-medium leading-relaxed ${item.completed ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                      {item.text}
                    </span>
                  </div>
                  
                  {isSubmitting && !item.completed && (
                    <div className="mt-4 ml-8 animate-in fade-in slide-in-from-top-2">
                      <label className="text-xs lg:text-sm text-red-400 flex items-center gap-2 mb-2 font-semibold">
                        <ArrowRight size={16} /> Why did you miss this task?
                      </label>
                      <input
                        type="text"
                        value={item.reason || ''}
                        onChange={(e) => handleReasonChange(item.id, e.target.value)}
                        placeholder="Be honest. (e.g., Got distracted, Unexpected event...)"
                        className={`w-full bg-black border rounded-lg px-4 py-2 lg:py-3 text-xs lg:text-sm focus:outline-none focus:ring-1 transition-colors ${showError && !item.reason?.trim() ? 'border-red-500 focus:border-red-500 focus:ring-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-gray-700 focus:border-cyan-500 focus:ring-cyan-500'}`}
                      />
                    </div>
                  )}

                  {reportSent && !item.completed && item.reason && (
                    <div className="mt-3 ml-8 text-xs lg:text-sm text-gray-400 bg-black/50 p-2 lg:p-3 rounded-lg border border-gray-800 border-l-2 border-l-red-500/50">
                      <span className="font-semibold text-red-400/80">Reason missed:</span> {item.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Notes Section */}
          <section className="bg-[#111111] rounded-2xl p-4 lg:p-6 border border-gray-800 shadow-2xl flex flex-col h-72 lg:h-80">
            <h2 className="text-lg lg:text-xl font-bold flex items-center gap-3 mb-2 text-emerald-400">
              <FileText size={22} /> Notes & Reflection
            </h2>
            <p className="text-xs lg:text-sm text-gray-400 mb-4 font-medium">Log your food, estimated calories, and thoughts on empathy/discipline.</p>
            <textarea 
              value={notes}
              onChange={(e) => !reportSent && setNotes(e.target.value)}
              disabled={reportSent || currentDateStr !== todayStr}
              placeholder="Breakfast: Oats (300 kcal)... Today when my boss got mad, I tried to listen actively..."
              className="flex-1 bg-black border border-gray-700 rounded-xl p-3 lg:p-4 text-sm lg:text-base focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none text-gray-200 disabled:opacity-50 custom-scrollbar leading-relaxed"
            />
          </section>

          {/* Submit Action */}
          {!reportSent && currentDateStr === todayStr && (
            <div className="mt-2 flex flex-col items-center gap-4">
              {errorMessage && !isSubmitting && (
                <div className="text-red-400 text-xs lg:text-sm font-medium flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-lg text-center">
                  <AlertCircle size={16} className="shrink-0" /> {errorMessage}
                </div>
              )}

              {isSubmitting ? (
                <div className="flex flex-col items-center w-full bg-[#151515] p-5 lg:p-6 rounded-2xl border border-red-500/30 shadow-2xl">
                  <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                    <AlertCircle size={20} /> Accountability Required
                  </div>
                  <p className="text-gray-400 text-xs lg:text-sm text-center mb-6">You have incomplete tasks. A disciplined man faces his failures. Provide reasons above.</p>
                  
                  {showError && errorMessage && (
                    <p className="text-red-400 text-xs lg:text-sm font-medium mb-4">{errorMessage}</p>
                  )}

                  <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 w-full max-w-md">
                    <button 
                      onClick={cancelSubmission}
                      className="flex-1 py-3 px-6 rounded-xl text-sm lg:text-base font-semibold bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      Go Back
                    </button>
                    <button 
                      onClick={confirmSubmissionWithReasons}
                      className="flex-1 py-3 px-6 rounded-xl text-sm lg:text-base font-bold bg-red-600 text-white hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                    >
                      Confirm Submission
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={initiateSubmitReport}
                  className="w-full max-w-md py-4 rounded-xl font-bold text-base lg:text-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(5,150,105,0.3)] hover:shadow-[0_0_25px_rgba(5,150,105,0.5)]"
                >
                  Submit Daily Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Persistent Chat Area */}
      <div className="w-full lg:w-[400px] xl:w-[450px] h-[50vh] lg:h-full border-t lg:border-t-0 lg:border-l border-gray-800 bg-[#0c0c0c] flex flex-col shadow-2xl z-10 relative shrink-0">
        <div className="p-4 lg:p-5 border-b border-gray-800 flex items-center justify-between bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-900/40 rounded-xl border border-cyan-700/50">
              <Bot size={20} className="text-cyan-400 lg:w-6 lg:h-6" />
            </div>
            <div>
              <h2 className="font-bold text-gray-100 text-base lg:text-lg">AI Coach</h2>
              <p className="text-[10px] lg:text-xs text-cyan-500/80 font-medium tracking-wide uppercase">Discipline & Empathy</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed" style={{ backgroundColor: 'rgba(12, 12, 12, 0.98)', backgroundBlendMode: 'overlay' }}>
          {chatMessages.length === 0 && (
            <div className="text-center text-gray-400 mt-10 lg:mt-20 p-5 lg:p-6 bg-black/60 rounded-2xl border border-gray-800 mx-2 lg:mx-4">
              <Bot size={36} className="mx-auto mb-4 text-cyan-600/50" />
              <p className="font-bold text-gray-300 mb-2">Welcome, brother.</p>
              <p className="text-xs lg:text-sm leading-relaxed">I am here to help you build discipline, responsibility, and empathy.<br/><br/>Complete your checklist and submit the daily report to get feedback and tomorrow's schedule.</p>
            </div>
          )}
          
          {chatMessages.map((msg, idx) => {
            const isReport = msg.parts[0].text.includes('**Daily Report');
            let displayText = msg.parts[0].text;
            
            return (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center shadow-lg border ${msg.role === 'user' ? (isReport ? 'bg-emerald-900/50 border-emerald-700' : 'bg-gray-800 border-gray-600') : 'bg-cyan-900/50 border-cyan-700'}`}>
                  {msg.role === 'user' ? (isReport ? <FileText size={16} className="text-emerald-400 lg:w-[18px] lg:h-[18px]" /> : <UserIcon size={16} className="text-gray-300 lg:w-[18px] lg:h-[18px]" />) : <Bot size={16} className="text-cyan-400 lg:w-[18px] lg:h-[18px]" />}
                </div>
                <div className={`p-3 lg:p-4 rounded-2xl max-w-[85%] text-xs lg:text-sm leading-relaxed prose prose-invert prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 ${
                    msg.role === 'user' 
                      ? isReport 
                        ? 'bg-emerald-950/40 border border-emerald-900/50 rounded-tr-none text-emerald-100/90' 
                        : 'bg-gray-800/80 border border-gray-700 rounded-tr-none text-gray-200'
                      : 'bg-[#151515] border border-gray-800 rounded-tl-none text-gray-300 shadow-xl'
                  }`}
                  dangerouslySetInnerHTML={{ 
                    __html: displayText
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                      .replace(/\n/g, '<br/>')
                      .replace(/- (.*?)(?:<br\/>|$)/g, '<li class="ml-4 list-disc marker:text-gray-600">$1</li>')
                  }}
                />
              </div>
            )
          })}
          
          {isTyping && (
             <div className="flex gap-3">
               <div className="shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-cyan-900/50 border border-cyan-700 flex items-center justify-center shadow-lg">
                 <Bot size={16} className="text-cyan-400 lg:w-[18px] lg:h-[18px]" />
               </div>
               <div className="p-3 lg:p-4 rounded-2xl bg-[#151515] border border-gray-800 rounded-tl-none flex gap-1.5 items-center h-[42px] lg:h-[52px]">
                 <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-cyan-600 rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                 <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
               </div>
             </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendChatMessage} className="p-3 lg:p-4 border-t border-gray-800 bg-black">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask AI Coach..."
              className="w-full bg-[#111] border border-gray-800 rounded-xl pl-4 pr-12 lg:pr-14 py-3 lg:py-3.5 text-xs lg:text-sm focus:outline-none focus:border-cyan-700 focus:ring-1 focus:ring-cyan-700 transition-all text-gray-200"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={isTyping || !chatInput.trim()}
              className="absolute right-2 p-1.5 lg:p-2 bg-cyan-800/80 text-cyan-100 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} className="ml-0.5 lg:w-[18px] lg:h-[18px]" />
            </button>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        @media (min-width: 1024px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #262626;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #404040;
        }
      `}} />
    </div>
  );
}