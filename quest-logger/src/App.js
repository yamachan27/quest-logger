import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Swords, Trophy, Flame, Star, Zap, Calendar, ChevronLeft, ChevronRight, Gift, X, Award, Sparkles } from 'lucide-react';

export default function QuestLogger() {
  const [quests, setQuests] = useState([]);
  const [input, setInput] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [playerData, setPlayerData] = useState({
    level: 1,
    xp: 0,
    totalCompleted: 0,
    streak: 0,
    lastCompletedDate: null,
    lastLoginDate: null,
    titles: [],
    dailyQuests: { easy: 0, medium: 0, hard: 0, date: null }
  });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newTitle, setNewTitle] = useState(null);
  const [showLoginBonus, setShowLoginBonus] = useState(false);
  const [loginBonusXP, setLoginBonusXP] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTitles, setShowTitles] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [completionAnimation, setCompletionAnimation] = useState(null);
  const [showQuestAdded, setShowQuestAdded] = useState(false);

  const difficulties = {
    easy: { label: '簡単', xp: 20, color: 'text-green-400', bg: 'bg-green-500', limit: 10 },
    medium: { label: '普通', xp: 40, color: 'text-yellow-400', bg: 'bg-yellow-500', limit: 5 },
    hard: { label: '難しい', xp: 60, color: 'text-red-400', bg: 'bg-red-500', limit: 3 }
  };

  const titles = [
    { id: 1, name: '見習い冒険者', requirement: 1, type: 'level', description: 'レベル1到達' },
    { id: 2, name: '駆け出し勇者', requirement: 5, type: 'level', description: 'レベル5到達' },
    { id: 3, name: 'クエストハンター', requirement: 10, type: 'completed', description: '10個のクエスト完了' },
    { id: 4, name: '伝説の英雄', requirement: 10, type: 'level', description: 'レベル10到達' },
    { id: 5, name: '不屈の戦士', requirement: 7, type: 'streak', description: '7日連続達成' },
    { id: 6, name: 'タスクマスター', requirement: 50, type: 'completed', description: '50個のクエスト完了' },
    { id: 7, name: '修羅', requirement: 100, type: 'completed', description: '100個のクエスト完了' },
    { id: 8, name: '神話級の存在', requirement: 20, type: 'level', description: 'レベル20到達' },
    { id: 9, name: '継続の鬼', requirement: 14, type: 'streak', description: '14日連続達成' },
    { id: 10, name: '真の達人', requirement: 30, type: 'level', description: 'レベル30到達' },
    { id: 11, name: 'クエスト狂', requirement: 200, type: 'completed', description: '200個のクエスト完了' },
    { id: 12, name: '月の覇者', requirement: 30, type: 'streak', description: '30日連続達成' },
    { id: 13, name: '超越者', requirement: 50, type: 'level', description: 'レベル50到達' },
    { id: 14, name: '伝説の継続者', requirement: 100, type: 'streak', description: '100日連続達成' },
    { id: 15, name: '究極の冒険者', requirement: 500, type: 'completed', description: '500個のクエスト完了' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (playerData.level > 1 || playerData.totalCompleted > 0) {
      checkLoginBonus();
    }
  }, [playerData.level, playerData.totalCompleted]);

  const loadData = () => {
    try {
      const questData = localStorage.getItem('quest-logger-quests');
      const playerInfo = localStorage.getItem('quest-logger-player');
      
      if (questData) setQuests(JSON.parse(questData));
      if (playerInfo) {
        const data = JSON.parse(playerInfo);
        if (!data.dailyQuests) {
          data.dailyQuests = { easy: 0, medium: 0, hard: 0, date: null };
        }
        setPlayerData(data);
      }
    } catch (error) {
      console.log('初回起動');
    }
  };

  const saveData = (newQuests, newPlayerData) => {
    try {
      localStorage.setItem('quest-logger-quests', JSON.stringify(newQuests));
      localStorage.setItem('quest-logger-player', JSON.stringify(newPlayerData));
    } catch (error) {
      console.error('保存エラー:', error);
      alert('データの保存に失敗しました。ストレージ容量を確認してください。');
    }
  };

  const checkLoginBonus = () => {
    if (!playerData.lastLoginDate && playerData.totalCompleted === 0) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastLogin = playerData.lastLoginDate ? new Date(playerData.lastLoginDate) : null;
    if (lastLogin) {
      lastLogin.setHours(0, 0, 0, 0);
    }

    if (!lastLogin || today.getTime() !== lastLogin.getTime()) {
      const bonusXP = 20 + (playerData.streak * 5);
      setLoginBonusXP(bonusXP);
      setShowLoginBonus(true);
    }
  };

  const closeLoginBonus = () => {
    setShowLoginBonus(false);
    if (loginBonusXP > 0) {
      giveLoginBonus(loginBonusXP);
    }
  };

  const giveLoginBonus = (bonusXP) => {
    const newXp = playerData.xp + bonusXP;
    let newLevel = playerData.level;
    let remainingXp = newXp;

    while (remainingXp >= getXpForNextLevel(newLevel)) {
      remainingXp -= getXpForNextLevel(newLevel);
      newLevel++;
    }

    const today = new Date().toISOString().split('T')[0];
    const newPlayerData = {
      ...playerData,
      xp: remainingXp,
      level: newLevel,
      lastLoginDate: new Date().toISOString(),
      dailyQuests: playerData.dailyQuests?.date === today ? playerData.dailyQuests : { easy: 0, medium: 0, hard: 0, date: today }
    };

    setPlayerData(newPlayerData);
    saveData(quests, newPlayerData);
  };

  const resetDailyQuests = () => {
    const today = new Date().toISOString().split('T')[0];
    if (playerData.dailyQuests?.date !== today) {
      return { easy: 0, medium: 0, hard: 0, date: today };
    }
    return playerData.dailyQuests;
  };

  const getXpForNextLevel = (level) => level * 100;

  const checkStreak = (lastDate) => {
    if (!lastDate) return 1;
    
    const last = new Date(lastDate);
    const today = new Date();
    last.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return playerData.streak;
    if (diffDays === 1) return playerData.streak + 1;
    return 1;
  };

  const checkNewTitles = (newPlayerData) => {
    const earnedTitles = titles.filter(title => {
      if (newPlayerData.titles.includes(title.id)) return false;
      
      if (title.type === 'level') return newPlayerData.level >= title.requirement;
      if (title.type === 'completed') return newPlayerData.totalCompleted >= title.requirement;
      if (title.type === 'streak') return newPlayerData.streak >= title.requirement;
      return false;
    });

    if (earnedTitles.length > 0) {
      setNewTitle(earnedTitles[0]);
      setTimeout(() => setNewTitle(null), 3000);
      return [...newPlayerData.titles, ...earnedTitles.map(t => t.id)];
    }
    return newPlayerData.titles;
  };

  const addQuest = () => {
    if (!input.trim()) {
      return;
    }
    
    const dailyQuests = resetDailyQuests();
    
    if (dailyQuests[difficulty] >= difficulties[difficulty].limit) {
      alert(`今日の${difficulties[difficulty].label}クエストは上限に達しています！`);
      return;
    }

    const newQuests = [...quests, {
      id: Date.now(),
      text: input.trim(),
      difficulty: difficulty,
      completed: false,
      createdAt: new Date().toISOString()
    }];
    setQuests(newQuests);
    saveData(newQuests, playerData);
    setInput('');
    
    setShowQuestAdded(true);
    setTimeout(() => {
      setShowQuestAdded(false);
    }, 2000);
  };

  const completeQuest = (id) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.completed) return;

    setCompletionAnimation({ x: Math.random() * 80 + 10, y: Math.random() * 50 + 20 });
    setTimeout(() => setCompletionAnimation(null), 1000);

    const xpGained = difficulties[quest.difficulty].xp;
    const newXp = playerData.xp + xpGained;
    
    let newLevel = playerData.level;
    let remainingXp = newXp;
    let leveledUp = false;

    while (remainingXp >= getXpForNextLevel(newLevel)) {
      remainingXp -= getXpForNextLevel(newLevel);
      newLevel++;
      leveledUp = true;
    }

    if (leveledUp) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 2000);
    }

    const newStreak = checkStreak(playerData.lastCompletedDate);
    const dailyQuests = resetDailyQuests();
    dailyQuests[quest.difficulty]++;

    const newPlayerData = {
      level: newLevel,
      xp: remainingXp,
      totalCompleted: playerData.totalCompleted + 1,
      streak: newStreak,
      lastCompletedDate: new Date().toISOString(),
      lastLoginDate: playerData.lastLoginDate,
      titles: playerData.titles,
      dailyQuests: dailyQuests
    };

    newPlayerData.titles = checkNewTitles(newPlayerData);

    const newQuests = quests.map(q =>
      q.id === id ? { ...q, completed: true, completedAt: new Date().toISOString() } : q
    );

    setPlayerData(newPlayerData);
    setQuests(newQuests);
    saveData(newQuests, newPlayerData);
  };

  const deleteQuest = (id) => {
    if (!window.confirm('このクエストを削除しますか？')) {
      return;
    }
    const newQuests = quests.filter(q => q.id !== id);
    setQuests(newQuests);
    saveData(newQuests, playerData);
  };

  const getCharacterImage = () => {
    const level = playerData?.level || 1;
    if (level >= 20) return '🦸‍♂️';
    if (level >= 15) return '🧙‍♂️';
    if (level >= 10) return '⚔️';
    if (level >= 5) return '🛡️';
    return '🗡️';
  };

  const getCharacterTitle = () => {
    if (!playerData?.titles || playerData.titles.length === 0) return '冒険者';
    const lastTitle = titles.find(t => t.id === playerData.titles[playerData.titles.length - 1]);
    return lastTitle ? lastTitle.name : '冒険者';
  };

  const getQuestsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return quests.filter(q => {
      if (!q.completedAt) return false;
      const completedDate = new Date(q.completedAt).toISOString().split('T')[0];
      return completedDate === dateStr;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const hasQuestsOnDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return quests.some(q => {
      if (!q.completedAt) return false;
      const completedDate = new Date(q.completedAt).toISOString().split('T')[0];
      return completedDate === dateStr;
    });
  };

  const activeQuests = quests.filter(q => !q.completed);
  const completedQuests = quests.filter(q => q.completed);
  const dailyQuests = resetDailyQuests();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {completionAnimation && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{ left: `${completionAnimation.x}%`, top: `${completionAnimation.y}%` }}
        >
          <div className="animate-ping absolute">
            <Sparkles size={48} className="text-yellow-400" />
          </div>
          <div className="animate-bounce">
            <Star size={48} className="text-yellow-300" />
          </div>
        </div>
      )}

      {showLoginBonus && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" onClick={closeLoginBonus}>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 px-8 py-6 rounded-xl font-bold shadow-2xl relative animate-bounce">
            <button onClick={closeLoginBonus} className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded-full">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3">
              <Gift size={32} />
              <div>
                <div className="text-3xl">ログインボーナス！</div>
                <div className="text-xl">+{loginBonusXP} XP</div>
              </div>
            </div>
            <div className="text-sm mt-2 text-slate-800">クリックで閉じる</div>
          </div>
        </div>
      )}

      {showQuestAdded && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" onClick={() => setShowQuestAdded(false)}>
          <div className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white px-8 py-6 rounded-xl font-bold shadow-2xl relative animate-bounce">
            <button onClick={() => setShowQuestAdded(false)} className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded-full">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3">
              <Plus size={32} />
              <div>
                <div className="text-2xl">クエスト追加完了！</div>
                <div className="text-lg">頑張ってクリアしよう！</div>
              </div>
            </div>
            <div className="text-sm mt-2">クリックで閉じる</div>
          </div>
        </div>
      )}

      {showLevelUp && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" onClick={() => setShowLevelUp(false)}>
          <div className="bg-yellow-400 text-slate-900 px-8 py-6 rounded-xl text-3xl font-bold shadow-2xl relative animate-bounce">
            <button onClick={() => setShowLevelUp(false)} className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded-full">
              <X size={20} />
            </button>
            <div>⭐ LEVEL UP! ⭐</div>
            <div className="text-sm mt-2 text-slate-800">クリックで閉じる</div>
          </div>
        </div>
      )}

      {newTitle && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" onClick={() => setNewTitle(null)}>
          <div className="bg-purple-500 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-yellow-400 relative animate-bounce">
            <button onClick={() => setNewTitle(null)} className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded-full">
              <X size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400" size={24} />
              <div>
                <div className="text-sm">称号獲得！</div>
                <div className="font-bold text-lg">{newTitle.name}</div>
              </div>
            </div>
            <div className="text-sm mt-2">クリックで閉じる</div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto pt-8 pb-16">
        <div className="bg-slate-800 rounded-xl p-6 mb-6 border-2 border-purple-500 shadow-2xl">
          <div className="flex items-start gap-6">
            <div className="text-6xl">{getCharacterImage()}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">冒険者</h2>
                <span className="text-purple-400 text-sm">Lv.{playerData.level}</span>
              </div>
              <div className="text-yellow-400 text-sm mb-3 flex items-center gap-2">
                <Trophy size={16} />
                {getCharacterTitle()}
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>XP: {playerData.xp} / {getXpForNextLevel(playerData.level)}</span>
                  <span>{Math.floor((playerData.xp / getXpForNextLevel(playerData.level)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
                    style={{ width: `${(playerData.xp / getXpForNextLevel(playerData.level)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-xs mb-1">完了クエスト</div>
                  <div className="text-white text-xl font-bold flex items-center gap-2">
                    <Check size={16} className="text-green-400" />
                    {playerData.totalCompleted}
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-xs mb-1">連続日数</div>
                  <div className="text-white text-xl font-bold flex items-center gap-2">
                    <Flame size={16} className="text-orange-400" />
                    {playerData.streak}
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-gray-400 text-xs mb-1">称号</div>
                  <div className="text-white text-xl font-bold flex items-center gap-2">
                    <Trophy size={16} className="text-yellow-400" />
                    {playerData.titles.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setShowTitles(!showTitles)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 font-bold shadow-xl"
          >
            <Award size={24} />
            称号
          </button>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 font-bold shadow-xl"
          >
            <Calendar size={24} />
            履歴
          </button>
        </div>

        {showTitles && (
          <div className="bg-slate-800 rounded-xl p-6 mb-6 border-2 border-yellow-500 shadow-xl">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-400" size={24} />
              称号コレクション ({playerData.titles.length}/{titles.length})
            </h3>
            <div className="grid gap-3">
              {titles.map(title => {
                const earned = playerData.titles.includes(title.id);
                return (
                  <div
                    key={title.id}
                    className={`p-4 rounded-lg border-2 ${
                      earned
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400'
                        : 'bg-slate-700/50 border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-2xl ${earned ? '' : 'grayscale opacity-50'}`}>
                        {earned ? '🏆' : '🔒'}
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold ${earned ? 'text-yellow-400' : 'text-gray-500'}`}>
                          {title.name}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">{title.description}</div>
                      </div>
                      {earned && <div className="text-green-400 font-bold text-sm">✓ 獲得済み</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showCalendar && (
          <div className="bg-slate-800 rounded-xl p-6 mb-6 border-2 border-indigo-500 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-slate-700 rounded-lg"
              >
                <ChevronLeft className="text-white" size={24} />
              </button>
              <h3 className="text-white font-bold text-xl">
                {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
              </h3>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-slate-700 rounded-lg"
              >
                <ChevronRight className="text-white" size={24} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                <div key={day} className="text-center text-gray-400 text-sm font-bold py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {(() => {
                const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
                const days = [];
                
                for (let i = 0; i < startingDayOfWeek; i++) {
                  days.push(<div key={`empty-${i}`} className="aspect-square" />);
                }
                
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const hasQuests = hasQuestsOnDate(date);
                  const isToday = new Date().toDateString() === date.toDateString();
                  
                  days.push(
                    <button
                      key={day}
                      onClick={() => setSelectedDate(date)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                        isToday 
                          ? 'bg-purple-500 text-white ring-2 ring-yellow-400' 
                          : hasQuests
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                      }`}
                    >
                      {day}
                    </button>
                  );
                }
                
                return days;
              })()}
            </div>

            {selectedDate && (
              <div className="mt-4 p-4 bg-slate-700 rounded-lg">
                <h4 className="text-white font-bold mb-3">
                  {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
                </h4>
                {(() => {
                  const dayQuests = getQuestsForDate(selectedDate);
                  return dayQuests.length > 0 ? (
                    <div className="space-y-2">
                      {dayQuests.map(quest => (
                        <div key={quest.id} className="bg-slate-600 rounded-lg p-3 flex items-center gap-2">
                          <Check size={16} className="text-green-400" />
                          <span className="text-white flex-1">{quest.text}</span>
                          <span className={`text-xs ${difficulties[quest.difficulty].color}`}>
                            +{difficulties[quest.difficulty].xp} XP
                          </span>
                        </div>
                      ))}
                      <div className="text-right text-sm text-gray-400 mt-2">
                        合計 {dayQuests.reduce((sum, q) => sum + difficulties[q.difficulty].xp, 0)} XP
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center py-4">クエストなし</div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        <div className="bg-slate-800 rounded-xl p-6 mb-6 border-2 border-slate-700 shadow-xl">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Swords size={20} className="text-purple-400" />
            新規クエスト
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addQuest()}
              placeholder="クエスト内容を入力..."
              className="w-full px-4 py-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex gap-2">
              {Object.entries(difficulties).map(([key, diff]) => {
                const remaining = diff.limit - dailyQuests[key];
                return (
                  <button
                    key={key}
                    onClick={() => setDifficulty(key)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      difficulty === key ? `${diff.bg} text-white shadow-lg` : 'bg-slate-700 text-gray-400'
                    }`}
                  >
                    <div>{diff.label}</div>
                    <div className="text-xs mt-1">+{diff.xp}XP | 残{remaining}</div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={addQuest}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2 font-bold shadow-lg"
            >
              <Plus size={20} />
              クエスト追加
            </button>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 mb-6 border-2 border-slate-700 shadow-xl">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Zap size={20} className="text-yellow-400" />
            進行中のクエスト ({activeQuests.length})
          </h3>
          {activeQuests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">クエストがありません</div>
          ) : (
            <div className="space-y-3">
              {activeQuests.map((quest) => (
                <div key={quest.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 group border border-slate-600">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => completeQuest(quest.id)}
                      className="w-10 h-10 rounded-lg bg-slate-600 hover:bg-green-500 flex items-center justify-center"
                    >
                      <Check size={20} className="text-white" />
                    </button>
                    <div className="flex-1">
                      <div className="text-white font-medium mb-1">{quest.text}</div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${difficulties[quest.difficulty].color} font-bold`}>
                          {difficulties[quest.difficulty].label}
                        </span>
                        <span className="text-xs text-gray-400">
                          +{difficulties[quest.difficulty].xp} XP
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteQuest(quest.id)}
                      className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {completedQuests.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-6 border-2 border-slate-700 shadow-xl">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Star size={20} className="text-green-400" />
              完了したクエスト ({completedQuests.length})
            </h3>
            <div className="space-y-2">
              {completedQuests.slice(-5).reverse().map((quest) => (
                <div key={quest.id} className="bg-slate-700/50 rounded-lg p-3 border border-green-500/30">
                  <div className="flex items-center gap-3">
                    <Check size={20} className="text-green-400" />
                    <span className="text-gray-400 line-through flex-1">{quest.text}</span>
                    <span className="text-xs text-green-400">
                      +{difficulties[quest.difficulty].xp} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}