import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Users, Settings, DollarSign, Ban as Bank, ArrowUpCircle, ArrowDownCircle, Ticket, Gavel, UserPlus, Notebook as Robot, Trash2, Play } from 'lucide-react';
import { gameStore } from '../store/GameStore';
import type { GameConfig } from '../store/GameStore';

const SetupScreen: React.FC = observer(() => {
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<GameConfig>({ ...gameStore.config });
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isBot, setIsBot] = useState(false);

  const handleConfigChange = (key: keyof GameConfig, value: number) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      alert('Please enter a player name');
      return;
    }
    gameStore.addPlayer(newPlayerName.trim(), isBot);
    setNewPlayerName('');
    setIsBot(false);
  };

  const handleStartGame = () => {
    if (gameStore.players.length < 2) {
      alert('At least 2 players are required to start the game');
      return;
    }
    gameStore.config = config;
    gameStore.startGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Economic Strategy Game</h1>
          <p className="text-lg text-blue-200">A game of investment, risk, and reward</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              <h2 className="text-2xl font-semibold">Game Setup</h2>
            </div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>{showConfig ? 'Hide Configuration' : 'Show Configuration'}</span>
            </button>
          </div>

          <div className="space-y-6">
            {showConfig && (
              <div className="space-y-4 bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Game Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Initial Money Per Player
                    </label>
                    <input
                      type="number"
                      value={config.initialMoneyPerPlayer}
                      onChange={(e) => handleConfigChange('initialMoneyPerPlayer', parseInt(e.target.value))}
                      min="1000"
                      step="1000"
                      className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Bank className="w-4 h-4" />
                      Bank Contribution
                    </label>
                    <input
                      type="number"
                      value={config.bankContributionPerPlayer}
                      onChange={(e) => handleConfigChange('bankContributionPerPlayer', parseInt(e.target.value))}
                      min="100"
                      step="100"
                      className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <ArrowUpCircle className="w-4 h-4" />
                      Cost to Raise Level
                    </label>
                    <input
                      type="number"
                      value={config.costToRaiseLevel}
                      onChange={(e) => handleConfigChange('costToRaiseLevel', parseInt(e.target.value))}
                      min="100"
                      step="100"
                      className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <ArrowDownCircle className="w-4 h-4" />
                      Refund to Lower Level
                    </label>
                    <input
                      type="number"
                      value={config.refundToLowerLevel}
                      onChange={(e) => handleConfigChange('refundToLowerLevel', parseInt(e.target.value))}
                      min="50"
                      step="50"
                      className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Ticket className="w-4 h-4" />
                      Lottery Base Cost
                    </label>
                    <input
                      type="number"
                      value={config.lotteryBaseCost}
                      onChange={(e) => handleConfigChange('lotteryBaseCost', parseInt(e.target.value))}
                      min="50"
                      step="50"
                      className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Ticket className="w-4 h-4" />
                      Lottery Base Reward
                    </label>
                    <input
                      type="number"
                      value={config.lotteryBaseReward}
                      onChange={(e) => handleConfigChange('lotteryBaseReward', parseFloat(e.target.value))}
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Gavel className="w-4 h-4" />
                      Auction Base Increment
                    </label>
                    <input
                      type="number"
                      value={config.auctionBaseIncrement}
                      onChange={(e) => handleConfigChange('auctionBaseIncrement', parseFloat(e.target.value))}
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Penalty Increment
                    </label>
                    <input
                      type="number"
                      value={config.penaltyIncrement}
                      onChange={(e) => handleConfigChange('penaltyIncrement', parseInt(e.target.value))}
                      min="10"
                      step="10"
                      className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter player name"
                />
                <button
                  onClick={() => setIsBot(!isBot)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    isBot ? 'bg-purple-500/50 border-2 border-purple-400' : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {isBot ? <Robot className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  <span>{isBot ? 'Bot' : 'Human'}</span>
                </button>
                <button
                  onClick={handleAddPlayer}
                  className="px-4 py-2 rounded-lg bg-green-500/30 hover:bg-green-500/50 transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {gameStore.players.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Players</h3>
                  <div className="space-y-2">
                    {gameStore.players.map((player) => (
                      <div key={player.id} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          {player.isBot ? (
                            <Robot className="w-4 h-4 text-purple-400" />
                          ) : (
                            <Users className="w-4 h-4 text-blue-400" />
                          )}
                          <span>{player.name}</span>
                        </div>
                        <button
                          onClick={() => gameStore.removePlayer(player.id)}
                          className="p-2 rounded-lg hover:bg-white/20 transition-colors text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleStartGame}
              disabled={gameStore.players.length < 2}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>Start Game</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SetupScreen;