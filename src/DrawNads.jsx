import React, { useState, useRef, useEffect } from 'react';
import { Users, Settings, Palette, Play, Plus, Clock, Trophy, Vote, Crown } from 'lucide-react';

const DrawNads = () => {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState('waiting'); 
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentWord, setCurrentWord] = useState('');
  const [players, setPlayers] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [votes, setVotes] = useState({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#6B46C1');
  const [brushSize, setBrushSize] = useState(3);
  const [isHost, setIsHost] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    drawTime: 30,
    voteTime: 45,
    maxPlayers: 16,
    minPlayers: 2
  });
  
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  // Liste de mots pour le jeu
  const words = ['printer', 'bicycle', 'spoon', 'ball', 'soap', 'sofa', 'camera', 'television', 'glasses', 'radio', 'blanket', 'chair', 'furniture', 'fridge', 'suitcase', 'computer', 'watch', 'pillow', 'towel', 'scissors', 'bottle', 'shelf', 'brush', 'table', 'pot', 'knife', 'house', 'bucket', 'plate', 'car', 'box', 'ladder', 'shoe', 'wardrobe', 'mattress', 'carpet', 'bag', 'truck', 'lamp', 'mobile phone', 'curtain', 'key', 'pen', 'pan', 'broom', 'book', 'bed', 'fork', 'glass', 'microwave'];

  // Configuration du canvas
  useEffect(() => {
    if (canvasRef.current && currentScreen === 'game') {
      const canvas = canvasRef.current;
      canvas.width = 600;
      canvas.height = 400;
      
      const context = canvas.getContext('2d');
      context.lineCap = 'round';
      context.strokeStyle = brushColor;
      context.lineWidth = brushSize;
      contextRef.current = context;
    }
  }, [currentScreen, brushColor, brushSize]);

  // Timer pour le jeu
  useEffect(() => {
    let timer;
    if (gameState === 'drawing' || gameState === 'voting') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (gameState === 'drawing') {
              setGameState('voting');
              return gameSettings.voteTime;
            } else {
              setGameState('results');
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, gameSettings]);

  // Fonctions de dessin
  const startDrawing = (e) => {
    if (gameState !== 'drawing') return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    contextRef.current.beginPath();
    contextRef.current.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing || gameState !== 'drawing') return;
    const rect = canvasRef.current.getBoundingClientRect();
    contextRef.current.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (contextRef.current) {
      contextRef.current.closePath();
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current && gameState === 'drawing') {
      const context = canvasRef.current.getContext('2d');
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Simuler la création d'une room
  const createRoom = () => {
    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(newRoomCode);
    setIsHost(true);
    setPlayers([{ id: Date.now(), name: playerName, isHost: true }]);
    setCurrentScreen('lobby');
  };

  // Rejoindre une room
  const joinRoom = () => {
    if (roomCode && playerName) {
      // Simuler l'ajout du joueur à une room existante
      const newPlayer = { id: Date.now(), name: playerName, isHost: false };
      
      // Générer quelques joueurs fictifs pour la démo (incluant l'hôte)
      const existingPlayers = [
        { id: 1, name: 'Host Player', isHost: true }
      ];
      
      setPlayers([...existingPlayers, newPlayer]);
      setIsHost(false);
      setCurrentScreen('lobby');
    }
  };

  // Ajouter un joueur fictif (pour tester)
  const addBotPlayer = () => {
    if (players.length < gameSettings.maxPlayers) {
      const botNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
      const availableNames = botNames.filter(name => !players.some(p => p.name === name));
      
      if (availableNames.length > 0) {
        const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
        const newBot = { 
          id: Date.now() + Math.random(), 
          name: randomName, 
          isHost: false,
          isBot: true 
        };
        setPlayers(prev => [...prev, newBot]);
      }
    }
  };

  // Retirer un joueur
  const removePlayer = (playerId) => {
    if (isHost) {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
    }
  };

  // Démarrer le jeu
  const startGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setGameState('drawing');
    setTimeLeft(gameSettings.drawTime);
    setCurrentScreen('game');
  };

  // Voter pour un dessin
  const voteForDrawing = (drawingId) => {
    if (gameState === 'voting') {
      setVotes(prev => ({ ...prev, [playerName]: drawingId }));
    }
  };

  // Menu principal
  const renderMenu = () => (
    <div className="min-h-screen bg-gradient-purple flex items-center justify-center p-4 screen-transition">
      <div className="glass-card rounded-3xl shadow-2xl p-8 w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <Palette className="w-16 h-16 text-purple-600 mx-auto mb-4 icon-bounce" />
          <h1 className="text-3xl font-bold text-purple-800 mb-2">DrawNads</h1>
          <p className="text-purple-600">Draw, Vote & Win !</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Ton nom"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="custom-input w-full p-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 outline-none text-purple-800"
          />

          <button
            onClick={() => setCurrentScreen('join')}
            disabled={!playerName}
            className="btn-primary w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white p-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-5 h-5" />
            Join game
          </button>

          <button
            onClick={() => setCurrentScreen('create')}
            disabled={!playerName}
            className="btn-primary w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create game
          </button>

          <button
            onClick={() => setCurrentScreen('settings')}
            className="btn-primary w-full bg-purple-400 hover:bg-purple-500 text-white p-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </div>
    </div>
  );

  // Écran pour rejoindre une partie
  const renderJoin = () => (
    <div className="min-h-screen bg-gradient-purple flex items-center justify-center p-4 screen-transition">
      <div className="glass-card rounded-3xl shadow-2xl p-8 w-full max-w-md fade-in">
        <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Join game</h2>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Code de la room"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="custom-input w-full p-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 outline-none text-purple-800 text-center text-lg font-mono"
            maxLength={6}
          />

          <button
            onClick={joinRoom}
            disabled={!roomCode || roomCode.length < 4}
            className="btn-primary w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white p-3 rounded-xl font-semibold transition-colors"
          >
            Join
          </button>

          <button
            onClick={() => setCurrentScreen('menu')}
            className="w-full bg-gray-400 hover:bg-gray-500 text-white p-3 rounded-xl font-semibold transition-colors"
          >
            Return
          </button>
        </div>
      </div>
    </div>
  );

  // Écran pour créer une partie
  const renderCreate = () => (
    <div className="min-h-screen bg-gradient-purple flex items-center justify-center p-4 screen-transition">
      <div className="glass-card rounded-3xl shadow-2xl p-8 w-full max-w-md fade-in">
        <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Create game</h2>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-purple-600 mb-2">You will host the game</p>
            <p className="text-sm text-purple-500">Max {gameSettings.maxPlayers} players</p>
          </div>

          <button
            onClick={createRoom}
            className="btn-primary w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl font-semibold transition-colors"
          >
            Create room
          </button>

          <button
            onClick={() => setCurrentScreen('menu')}
            className="w-full bg-gray-400 hover:bg-gray-500 text-white p-3 rounded-xl font-semibold transition-colors"
          >
            Return
          </button>
        </div>
      </div>
    </div>
  );

  // Lobby d'attente
  const renderLobby = () => (
    <div className="min-h-screen bg-gradient-purple p-4 screen-transition">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card rounded-3xl shadow-2xl p-8 fade-in">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-purple-800 mb-2">Room: {roomCode}</h2>
            <p className="text-purple-600">Share this code with your friends!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-purple-50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Players ({players.length}/{gameSettings.maxPlayers})
                </h3>
                {isHost && (
                  <button
                    onClick={addBotPlayer}
                    disabled={players.length >= gameSettings.maxPlayers}
                    className="text-sm bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-3 py-1 rounded-full transition-colors"
                  >
                    Add Bot
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {players.map(player => (
                  <div key={player.id} className="player-card bg-white p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {player.isHost && <Crown className="w-4 h-4 text-yellow-500" />}
                      <span className="text-purple-800 font-medium">{player.name}</span>
                      {player.isBot && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Bot</span>}
                    </div>
                    {isHost && !player.isHost && (
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-4">Rules</h3>
              <ul className="text-purple-600 space-y-2 text-sm">
                <li>• {gameSettings.drawTime} seconds to draw the word!</li>
                <li>• {gameSettings.voteTime} seconds to vote for the best drawing</li>
                <li>• You can't vote for your own drawing</li>
                <li>• Drawing with most votes wins!</li>
                <li>• Minimum {gameSettings.minPlayers} players to start</li>
              </ul>
              
              {isHost && (
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <h4 className="text-sm font-semibold text-purple-800 mb-2">Host Controls</h4>
                  <div className="text-xs text-purple-600">
                    <p>• Add bots to test the game</p>
                    <p>• Remove players if needed</p>
                    <p>• Start when ready (min {gameSettings.minPlayers} players)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            {isHost && (
              <button
                onClick={startGame}
                disabled={players.length < gameSettings.minPlayers}
                className="btn-primary flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-3 rounded-xl font-semibold transition-colors"
              >
                Start Game ({players.length}/{gameSettings.minPlayers} min)
              </button>
            )}
            {!isHost && (
              <div className="flex-1 bg-purple-100 text-purple-600 p-3 rounded-xl font-semibold text-center">
                Waiting for host to start...
              </div>
            )}
            <button
              onClick={() => {
                setCurrentScreen('menu');
                setPlayers([]);
                setIsHost(false);
                setRoomCode('');
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Écran de jeu
  const renderGame = () => (
    <div className="min-h-screen bg-gradient-purple p-4 screen-transition">
      <div className="max-w-6xl mx-auto">
        <div className="glass-card rounded-3xl shadow-2xl p-6 fade-in">
          {/* Header avec timer et mot */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
              <span className="timer text-2xl font-bold text-purple-800">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
            
            {gameState === 'drawing' && (
              <div className="bg-purple-100 rounded-2xl p-4 mb-4 pulse-animation">
                <h2 className="text-xl font-semibold text-purple-800 mb-2">Draw:</h2>
                <p className="text-3xl font-bold text-purple-600">{currentWord}</p>
              </div>
            )}

            {gameState === 'voting' && (
              <div className="bg-purple-100 rounded-2xl p-4 mb-4">
                <h2 className="text-xl font-semibold text-purple-800 mb-2">Vote for the best drawing!</h2>
                <p className="text-purple-600">The word was: <span className="font-bold">{currentWord}</span></p>
              </div>
            )}
          </div>

          {gameState === 'drawing' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Outils de dessin */}
              <div className="bg-purple-50 rounded-2xl p-4">
                <h3 className="font-semibold text-purple-800 mb-4">Tools</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-purple-600 mb-2">Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {['#6B46C1', '#DC2626', '#059669', '#D97706', '#1D4ED8', '#7C2D12', '#000000'].map(color => (
                        <button
                          key={color}
                          onClick={() => setBrushColor(color)}
                          className={`color-picker w-8 h-8 rounded-full border-2 ${brushColor === color ? 'selected border-gray-800' : 'border-gray-300'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-purple-600 mb-2">Size: {brushSize}px</label>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={brushSize}
                      onChange={(e) => setBrushSize(e.target.value)}
                      className="brush-size-slider w-full"
                    />
                  </div>

                  <button
                    onClick={clearCanvas}
                    className="w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Canvas de dessin */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl p-4 border-2 border-purple-200">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="drawing-canvas border border-gray-300 rounded-xl cursor-crosshair w-full max-w-full"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {gameState === 'voting' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Simuler quelques dessins pour le vote */}
              {[1, 2, 3].map(drawingId => (
                <div key={drawingId} className={`vote-card bg-white rounded-2xl p-4 border-2 ${votes[playerName] === drawingId ? 'voted' : 'border-purple-200'}`}>
                  <div className="bg-gray-100 h-48 rounded-xl mb-4 flex items-center justify-center text-gray-500">
                    Drawing {drawingId}
                  </div>
                  <button
                    onClick={() => voteForDrawing(drawingId)}
                    disabled={votes[playerName]}
                    className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white p-2 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Vote className="w-4 h-4" />
                    {votes[playerName] === drawingId ? 'Voted!' : 'Vote'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {gameState === 'results' && (
            <div className="text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 bounce-animation" />
              <h2 className="text-2xl font-bold text-purple-800 mb-4">Results!</h2>
              <p className="text-purple-600 mb-6">Winner will be announced soon...</p>
              <button
                onClick={() => {
                  setCurrentScreen('lobby');
                  setGameState('waiting');
                  setVotes({});
                }}
                className="btn-primary bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Return to lobby
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Écran des réglages
  const renderSettings = () => (
    <div className="min-h-screen bg-gradient-purple flex items-center justify-center p-4 screen-transition">
      <div className="glass-card rounded-3xl shadow-2xl p-8 w-full max-w-md fade-in">
        <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Settings</h2>
        
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-xl">
            <p className="text-purple-800 font-medium mb-2">Draw time</p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="15"
                max="60"
                value={gameSettings.drawTime}
                onChange={(e) => setGameSettings(prev => ({...prev, drawTime: parseInt(e.target.value)}))}
                className="flex-1"
              />
              <span className="text-purple-600 text-sm w-12">{gameSettings.drawTime}s</span>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl">
            <p className="text-purple-800 font-medium mb-2">Vote time</p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="20"
                max="90"
                value={gameSettings.voteTime}
                onChange={(e) => setGameSettings(prev => ({...prev, voteTime: parseInt(e.target.value)}))}
                className="flex-1"
              />
              <span className="text-purple-600 text-sm w-12">{gameSettings.voteTime}s</span>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl">
            <p className="text-purple-800 font-medium mb-2">Min players to start</p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="8"
                value={gameSettings.minPlayers}
                onChange={(e) => setGameSettings(prev => ({...prev, minPlayers: parseInt(e.target.value)}))}
                className="flex-1"
              />
              <span className="text-purple-600 text-sm w-12">{gameSettings.minPlayers}</span>
            </div>
          </div>

          <button
            onClick={() => setCurrentScreen('menu')}
            className="btn-primary w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl font-semibold transition-colors"
          >
            Back to menu
          </button>
        </div>
      </div>
    </div>
  );

  // Rendu de l'écran actuel
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'menu': return renderMenu();
      case 'join': return renderJoin();
      case 'create': return renderCreate();
      case 'lobby': return renderLobby();
      case 'game': return renderGame();
      case 'settings': return renderSettings();
      default: return renderMenu();
    }
  };

  return renderCurrentScreen();
};

export default DrawNads;