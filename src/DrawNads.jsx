import React, { useState, useRef, useEffect } from 'react';
import { Users, Settings, Palette, Play, Plus, Clock, Trophy, Vote } from 'lucide-react';

const DrawNads = () => {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState('waiting'); // waiting, drawing, voting, results
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentWord, setCurrentWord] = useState('');
  const [players, setPlayers] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [votes, setVotes] = useState({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#6B46C1');
  const [brushSize, setBrushSize] = useState(3);
  
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
              return 45;
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
  }, [gameState]);

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
    contextRef.current.closePath();
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
    setPlayers([{ id: 1, name: playerName, isHost: true }]);
    setCurrentScreen('lobby');
  };

  // Rejoindre une room
  const joinRoom = () => {
    if (roomCode && playerName) {
      setPlayers([
        { id: 1, name: 'Host', isHost: true },
        { id: 2, name: playerName, isHost: false }
      ]);
      setCurrentScreen('lobby');
    }
  };

  // Démarrer le jeu
  const startGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setGameState('drawing');
    setTimeLeft(30);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Palette className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-purple-800 mb-2">DrawNads</h1>
          <p className="text-purple-600">Draw, Vote & Win !</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Ton nom"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 outline-none text-purple-800"
          />

          <button
            onClick={() => setCurrentScreen('join')}
            disabled={!playerName}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white p-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-5 h-5" />
            Join game
          </button>

          <button
            onClick={() => setCurrentScreen('create')}
            disabled={!playerName}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create game
          </button>

          <button
            onClick={() => setCurrentScreen('settings')}
            className="w-full bg-purple-400 hover:bg-purple-500 text-white p-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Join game</h2>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Code de la room"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="w-full p-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 outline-none text-purple-800 text-center text-lg font-mono"
            maxLength={6}
          />

          <button
            onClick={joinRoom}
            disabled={!roomCode || roomCode.length < 4}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white p-3 rounded-xl font-semibold transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Create game</h2>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-purple-600 mb-2">You will host the game</p>
            <p className="text-sm text-purple-500">Max 16 players</p>
          </div>

          <button
            onClick={createRoom}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl font-semibold transition-colors"
          >
            Créer la room
          </button>

          <button
            onClick={() => setCurrentScreen('menu')}
            className="w-full bg-gray-400 hover:bg-gray-500 text-white p-3 rounded-xl font-semibold transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );

  // Lobby d'attente
  const renderLobby = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-purple-300 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-purple-800 mb-2">Room: {roomCode}</h2>
            <p className="text-purple-600">Partage ce code avec tes amis !</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-purple-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Joueurs ({players.length}/16)
              </h3>
              <div className="space-y-2">
                {players.map(player => (
                  <div key={player.id} className="bg-white p-3 rounded-xl flex items-center justify-between">
                    <span className="text-purple-800 font-medium">{player.name}</span>
                    {player.isHost && <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">Hôte</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-4">Rules</h3>
              <ul className="text-purple-600 space-y-2 text-sm">
                <li>• 30 secondes to draw the word !</li>
                <li>• 45 secondes to vote for the best drawing</li>
                <li>• You can't vote for your own drawing</li>
                <li>• Drawing with most of votes win !</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            {players.find(p => p.name === playerName)?.isHost && (
              <button
                onClick={startGame}
                disabled={players.length < 2}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-3 rounded-xl font-semibold transition-colors"
              >
                Commencer la partie
              </button>
            )}
            <button
              onClick={() => setCurrentScreen('menu')}
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Quitter
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Écran de jeu
  const renderGame = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-purple-300 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6">
          {/* Header avec timer et mot */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
              <span className="text-2xl font-bold text-purple-800">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
            
            {gameState === 'drawing' && (
              <div className="bg-purple-100 rounded-2xl p-4 mb-4">
                <h2 className="text-xl font-semibold text-purple-800 mb-2">Draw :</h2>
                <p className="text-3xl font-bold text-purple-600">{currentWord}</p>
              </div>
            )}

            {gameState === 'voting' && (
              <div className="bg-purple-100 rounded-2xl p-4 mb-4">
                <h2 className="text-xl font-semibold text-purple-800 mb-2">Vote for the best drawing !</h2>
                <p className="text-purple-600">Le mot était : <span className="font-bold">{currentWord}</span></p>
              </div>
            )}
          </div>

          {gameState === 'drawing' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Outils de dessin */}
              <div className="bg-purple-50 rounded-2xl p-4">
                <h3 className="font-semibold text-purple-800 mb-4">Outils</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-purple-600 mb-2">Couleur</label>
                    <div className="flex gap-2 flex-wrap">
                      {['#6B46C1', '#DC2626', '#059669', '#D97706', '#1D4ED8', '#7C2D12'].map(color => (
                        <button
                          key={color}
                          onClick={() => setBrushColor(color)}
                          className={`w-8 h-8 rounded-full border-2 ${brushColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-purple-600 mb-2">Taille: {brushSize}px</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={brushSize}
                      onChange={(e) => setBrushSize(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={clearCanvas}
                    className="w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-colors"
                  >
                    Erase all
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
                    className="border border-gray-300 rounded-xl cursor-crosshair w-full max-w-full"
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
                <div key={drawingId} className="bg-white rounded-2xl p-4 border-2 border-purple-200">
                  <div className="bg-gray-100 h-48 rounded-xl mb-4 flex items-center justify-center text-gray-500">
                    Dessin {drawingId}
                  </div>
                  <button
                    onClick={() => voteForDrawing(drawingId)}
                    disabled={votes[playerName]}
                    className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white p-2 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Vote className="w-4 h-4" />
                    {votes[playerName] === drawingId ? 'Voté !' : 'Voter'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {gameState === 'results' && (
            <div className="text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-purple-800 mb-4">Results !</h2>
              <p className="text-purple-600 mb-6">Winner will be announced soon...</p>
              <button
                onClick={() => setCurrentScreen('lobby')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Settings</h2>
        
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-xl">
            <p className="text-purple-800 font-medium mb-2">Draw time</p>
            <p className="text-purple-600 text-sm">30 secondes (default)</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl">
            <p className="text-purple-800 font-medium mb-2">Vote time</p>
            <p className="text-purple-600 text-sm">45 secondes (default)</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl">
            <p className="text-purple-800 font-medium mb-2">Max players</p>
            <p className="text-purple-600 text-sm">16 players</p>
          </div>

          <button
            onClick={() => setCurrentScreen('menu')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl font-semibold transition-colors"
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