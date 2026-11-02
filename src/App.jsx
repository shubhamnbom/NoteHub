import { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, Image as ImageIcon, Calendar, X, FolderPlus, ChevronRight, ArrowLeft, FileText, Upload, BookMarked, Sun, Moon, Highlighter, Edit3 } from 'lucide-react';
import axios from 'axios';

export default function App() {
  // App view mode: 'vault' or 'diary'
  const [activeMainTab, setActiveMainTab] = useState('vault');

  // Theme state (Dark mode by default as requested)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Navigation hierarchy states for Vault
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);

  // Vault Data Hierarchy
  const [vaultData, setVaultData] = useState({
    Placements: {
      subjects: {
        DSA: {
          topics: {
            "Binary Search Trees": {
              notes: "Remember: Average time complexity for search is O(log n), but worst case is O(n) if unbalanced.",
              files: [
                { id: 1, caption: "BST Insertion Rotation Rules", date: "2026-03-20", image: "https://via.placeholder.com/400x250" }
              ]
            }
          }
        }
      }
    },
    College: {
      subjects: {
        Mathematics: {
          topics: {
            "Integration by Parts": {
              notes: "Formula: integral of u dv = uv - integral of v du. Use ILATE rule.",
              files: []
            }
          }
        }
      }
    }
  });
  // Fetch categories from backend when the app loads
  useEffect(() => {
    axios.get('http://localhost:5000/api/categories')
      .then(response => {
        // Convert array from database into the object format our vault uses
        const fetchedVault = {};
        response.data.forEach(cat => {
          fetchedVault[cat.name] = { subjects: {} };
        });
        if (Object.keys(fetchedVault).length > 0) {
          setVaultData(fetchedVault);
        }
      })
      .catch(err => console.error('Error fetching categories from database:', err));
  }, []);

  // Diary Data State
  const [diaryEntries, setDiaryEntries] = useState([
    {
      id: 1,
      date: '2026-03-21',
      title: 'First day building StudyVault',
      content: 'Today I started building my custom study vault and diary app. It feels amazing to structure my learning categories, subjects, and topics cleanly!',
      highlights: ['started building my custom study vault', 'structure my learning categories']
    }
  ]);
  const [newDiaryTitle, setNewDiaryTitle] = useState('');
  const [newDiaryContent, setNewDiaryContent] = useState('');
  const [selectedDiary, setSelectedDiary] = useState(null);

  // Creation input states for Vault
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');

  // Upload Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [captionInput, setCaptionInput] = useState('');
  const [fileInput, setFileInput] = useState(null);

  // Notes editing state
  const [topicNotes, setTopicNotes] = useState('');

  // Handlers for Vault Hierarchy
 const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    // Send the new category to the backend database
    axios.post('http://localhost:5000/api/categories', { name: newCategoryName.trim() })
      .then(response => {
        const addedName = response.data.name;
        setVaultData({
          ...vaultData,
          [addedName]: { subjects: {} }
        });
        setNewCategoryName('');
      })
      .catch(err => {
        console.error('Error adding category:', err);
        alert('Category already exists or database error!');
      });
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !currentCategory) return;
    const cat = vaultData[currentCategory];
    if (cat.subjects[newSubjectName.trim()]) {
      alert('Subject already exists!');
      return;
    }
    setVaultData({
      ...vaultData,
      [currentCategory]: {
        ...cat,
        subjects: { ...cat.subjects, [newSubjectName.trim()]: { topics: {} } }
      }
    });
    setNewSubjectName('');
  };

  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!newTopicName.trim() || !currentCategory || !currentSubject) return;
    const cat = vaultData[currentCategory];
    const subj = cat.subjects[currentSubject];
    if (subj.topics[newTopicName.trim()]) {
      alert('Topic already exists!');
      return;
    }
    setVaultData({
      ...vaultData,
      [currentCategory]: {
        ...cat,
        subjects: {
          ...cat.subjects,
          [currentSubject]: {
            ...subj,
            topics: { ...subj.topics, [newTopicName.trim()]: { notes: '', files: [] } }
          }
        }
      }
    });
    setNewTopicName('');
  };

  const handleSaveNotes = () => {
    if (!currentCategory || !currentSubject || !currentTopic) return;
    const updated = { ...vaultData };
    updated[currentCategory].subjects[currentSubject].topics[currentTopic].notes = topicNotes;
    setVaultData(updated);
    alert('Notes updated successfully!');
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!fileInput || !captionInput || !currentCategory || !currentSubject || !currentTopic) return;

    const newFile = {
      id: Date.now(),
      caption: captionInput,
      date: new Date().toISOString().split('T')[0],
      image: 'https://via.placeholder.com/400x250'
    };

    const updated = { ...vaultData };
    updated[currentCategory].subjects[currentSubject].topics[currentTopic].files.push(newFile);
    setVaultData(updated);

    setCaptionInput('');
    setFileInput(null);
    setIsModalOpen(false);
    alert('File uploaded successfully!');
  };

  // Diary Handlers
  const handleCreateDiary = (e) => {
    e.preventDefault();
    if (!newDiaryTitle.trim() || !newDiaryContent.trim()) return;

    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      title: newDiaryTitle,
      content: newDiaryContent,
      highlights: []
    };

    setDiaryEntries([newEntry, ...diaryEntries]);
    setNewDiaryTitle('');
    setNewDiaryContent('');
  };

  // Highlighter Feature for Diary Text
  const handleHighlightText = () => {
    const selection = window.getSelection().toString();
    if (!selection || !selectedDiary) return;

    const updated = diaryEntries.map(entry => {
      if (entry.id === selectedDiary.id) {
        const highlights = [...(entry.highlights || []), selection];
        return { ...entry, highlights };
      }
      return entry;
    });

    setDiaryEntries(updated);
    setSelectedDiary({ ...selectedDiary, highlights: [...(selectedDiary.highlights || []), selection] });
    alert(`Highlighted: "${selection}"`);
  };

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar Navigation */}
      <aside className={`w-72 border-r flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-indigo-500" />
            <h1 className="text-xl font-bold tracking-wide">StudyVault</h1>
          </div>
          {/* Light/Dark Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            title="Toggle Light/Dark Mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Main Sections Switcher: Vault vs Diary */}
        <div className="p-4 grid grid-cols-2 gap-2 border-b border-slate-800/50">
          <button
            onClick={() => setActiveMainTab('vault')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeMainTab === 'vault' ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Vault
          </button>
          <button
            onClick={() => setActiveMainTab('diary')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeMainTab === 'diary' ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookMarked className="w-4 h-4" /> Daily Diary
          </button>
        </div>

        {/* VAULT SIDEBAR */}
        {activeMainTab === 'vault' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Hierarchy Navigation</div>
            
            <button
              onClick={() => { setCurrentCategory(null); setCurrentSubject(null); setCurrentTopic(null); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                !currentCategory ? 'bg-indigo-600 text-white' : isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🏠 All Categories
            </button>

            {Object.keys(vaultData).map((cat) => (
              <div key={cat} className="space-y-1">
                <button
                  onClick={() => { setCurrentCategory(cat); setCurrentSubject(null); setCurrentTopic(null); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    currentCategory === cat && !currentSubject ? 'bg-indigo-600 text-white' : isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>📁 {cat}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {currentCategory === cat && (
                  <div className={`pl-4 space-y-1 border-l ml-3 mt-1 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    {Object.keys(vaultData[cat].subjects || {}).map((subj) => (
                      <div key={subj}>
                        <button
                          onClick={() => { setCurrentSubject(subj); setCurrentTopic(null); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            currentSubject === subj && !currentTopic ? 'bg-indigo-600/80 text-white' : isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <span>📂 {subj}</span>
                          <ChevronRight className="w-3 h-3 text-slate-500" />
                        </button>

                        {currentSubject === subj && (
                          <div className={`pl-4 space-y-1 border-l ml-3 mt-1 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                            {Object.keys(vaultData[cat].subjects[subj].topics || {}).map((top) => (
                              <button
                                key={top}
                                onClick={() => {
                                  setCurrentTopic(top);
                                  setTopicNotes(vaultData[cat].subjects[subj].topics[top].notes || '');
                                }}
                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors truncate cursor-pointer ${
                                  currentTopic === top ? 'bg-indigo-600 text-white' : isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
                                }`}
                              >
                                📄 {top}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* DIARY SIDEBAR */}
        {activeMainTab === 'diary' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Past Journal Entries</div>
            {diaryEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setSelectedDiary(entry)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  selectedDiary?.id === entry.id ? 'bg-indigo-600 text-white' : isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-semibold truncate">{entry.title}</div>
                <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{entry.date}</div>
              </button>
            ))}
          </div>
        )}

        {/* Dynamic Bottom Input Box for Vault */}
        {activeMainTab === 'vault' && (
          <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'}`}>
            {!currentCategory && (
              <form onSubmit={handleAddCategory} className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Create Category</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Placements..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                  />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg text-xs cursor-pointer">
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {currentCategory && !currentSubject && (
              <form onSubmit={handleAddSubject} className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Add Subject in {currentCategory}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., DSA..."
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                  />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg text-xs cursor-pointer">
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {currentCategory && currentSubject && !currentTopic && (
              <form onSubmit={handleAddTopic} className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Add Topic in {currentSubject}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Graphs..."
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                  />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg text-xs cursor-pointer">
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <header className={`h-20 border-b px-8 flex items-center justify-between transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-slate-200'}`}>
          <div className="flex items-center gap-3">
            {activeMainTab === 'vault' && currentCategory && (
              <button 
                onClick={() => {
                  if (currentTopic) setCurrentTopic(null);
                  else if (currentSubject) setCurrentSubject(null);
                  else setCurrentCategory(null);
                }}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold">
                {activeMainTab === 'vault' && !currentCategory && "All Categories"}
                {activeMainTab === 'vault' && currentCategory && !currentSubject && `Category: ${currentCategory}`}
                {activeMainTab === 'vault' && currentCategory && currentSubject && !currentTopic && `Subject: ${currentSubject}`}
                {activeMainTab === 'vault' && currentTopic && `Topic: ${currentTopic}`}
                {activeMainTab === 'diary' && "Daily Diary & Journal"}
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {activeMainTab === 'diary' ? "Write your everyday thoughts, reflections, and highlight key lines." : "Manage your vault hierarchy seamlessly."}
              </p>
            </div>
          </div>

          {activeMainTab === 'vault' && currentTopic && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              Upload File / Photo
            </button>
          )}
        </header>

        {/* Dynamic Display Area */}
        <div className="flex-1 overflow-y-auto p-8">

          {/* VAULT TAB VIEWS */}
          {activeMainTab === 'vault' && (
            <>
              {!currentCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.keys(vaultData).map((cat) => (
                    <div 
                      key={cat} 
                      onClick={() => setCurrentCategory(cat)}
                      className={`border p-6 rounded-2xl shadow-xl transition-all cursor-pointer group ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-500/50'}`}
                    >
                      <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
                        📁
                      </div>
                      <h3 className="text-lg font-bold mb-1">{cat}</h3>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {Object.keys(vaultData[cat].subjects || {}).length} Subjects inside
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {currentCategory && !currentSubject && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.keys(vaultData[currentCategory].subjects || {}).map((subj) => (
                    <div 
                      key={subj} 
                      onClick={() => setCurrentSubject(subj)}
                      className={`border p-6 rounded-2xl shadow-xl transition-all cursor-pointer group ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-500/50'}`}
                    >
                      <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
                        📂
                      </div>
                      <h3 className="text-lg font-bold mb-1">{subj}</h3>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {Object.keys(vaultData[currentCategory].subjects[subj].topics || {}).length} Topics inside
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {currentCategory && currentSubject && !currentTopic && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.keys(vaultData[currentCategory].subjects[currentSubject].topics || {}).map((top) => (
                    <div 
                      key={top} 
                      onClick={() => {
                        setCurrentTopic(top);
                        setTopicNotes(vaultData[currentCategory].subjects[currentSubject].topics[top].notes || '');
                      }}
                      className={`border p-6 rounded-2xl shadow-xl transition-all cursor-pointer group ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-500/50'}`}
                    >
                      <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
                        📄
                      </div>
                      <h3 className="text-lg font-bold mb-1">{top}</h3>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {vaultData[currentCategory].subjects[currentSubject].topics[top].files.length} Files uploaded
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {currentTopic && (
                <div className="space-y-8">
                  <div className={`border rounded-2xl p-6 shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500" /> Topic Notes & Important Facts
                      </h3>
                      <button 
                        onClick={handleSaveNotes}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
                      >
                        Save Notes
                      </button>
                    </div>
                    <textarea
                      rows="4"
                      placeholder="Write important bullet points, formulas, or facts related to this topic..."
                      value={topicNotes}
                      onChange={(e) => setTopicNotes(e.target.value)}
                      className={`w-full border rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}
                    />
                  </div>

                  <div>
                    <h3 className="text-md font-bold mb-4">Uploaded Lecture Files & Photos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {vaultData[currentCategory].subjects[currentSubject].topics[currentTopic].files.map((item) => (
                        <div key={item.id} className={`border rounded-2xl overflow-hidden shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                          <div className={`h-48 relative overflow-hidden flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <ImageIcon className="w-12 h-12 text-slate-500" />
                          </div>
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                <Calendar className="w-3.5 h-3.5" /> {item.date}
                              </span>
                            </div>
                            <p className="text-sm font-medium mt-2">{item.caption}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* DIARY TAB VIEW */}
          {activeMainTab === 'diary' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Create / View Column */}
              <div className="lg:col-span-1 space-y-6">
                <div className={`border rounded-2xl p-6 shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className="text-md font-bold mb-4 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-indigo-500" /> New Diary Entry
                  </h3>
                  <form onSubmit={handleCreateDiary} className="space-y-4">
                    <div>
                      <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Title</label>
                      <input
                        type="text"
                        placeholder="Today's headline..."
                        value={newDiaryTitle}
                        onChange={(e) => setNewDiaryTitle(e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Thoughts</label>
                      <textarea
                        rows="5"
                        placeholder="Write your day's journey..."
                        value={newDiaryContent}
                        onChange={(e) => setNewDiaryContent(e.target.value)}
                        className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
                    >
                      Save Journal Entry
                    </button>
                  </form>
                </div>
              </div>

              {/* Diary Reading & Highlighter Workspace */}
              <div className="lg:col-span-2">
                {selectedDiary ? (
                  <div className={`border rounded-2xl p-8 shadow-xl space-y-6 relative ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between border-b pb-4 border-slate-800">
                      <div>
                        <h2 className="text-2xl font-bold">{selectedDiary.title}</h2>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedDiary.date}</p>
                      </div>
                      <button
                        onClick={handleHighlightText}
                        className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-yellow-500/30 transition-colors cursor-pointer"
                        title="Highlight any text you select with your mouse!"
                      >
                        <Highlighter className="w-4 h-4" /> Highlight Selected Text
                      </button>
                    </div>

                    <div className={`text-base leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                      {selectedDiary.content}
                    </div>

                    {/* Highlights Summary Box */}
                    {selectedDiary.highlights && selectedDiary.highlights.length > 0 && (
                      <div className={`mt-6 p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-yellow-50 border-yellow-200'}`}>
                        <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Highlighted Key Quotes</h4>
                        <ul className="space-y-2">
                          {selectedDiary.highlights.map((hl, idx) => (
                            <li key={idx} className={`text-sm italic border-l-2 pl-3 ${isDarkMode ? 'text-slate-300 border-yellow-400 bg-yellow-500/10 py-1' : 'text-slate-800 border-yellow-500 bg-yellow-100/50 py-1'}`}>
                              "{hl}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`border rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                    <BookMarked className="w-12 h-12 mb-3 text-indigo-500 opacity-50" />
                    <p className="text-sm">Select an entry from the left sidebar to read and highlight key sentences.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`border w-full max-w-lg rounded-2xl p-6 shadow-2xl relative ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold mb-4">Upload File to: {currentTopic}</h2>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Caption / Notes</label>
                <input 
                  type="text" 
                  placeholder="e.g., Explanation screenshot..."
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Select File (Image or PDF)</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={(e) => setFileInput(e.target.files[0])}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}