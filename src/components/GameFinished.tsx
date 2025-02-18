import React from 'react';
import { observer } from 'mobx-react-lite';
import { Trophy, Medal, RotateCcw } from 'lucide-react';
import { gameStore } from '../store/GameStore';

const GameFinished: React.FC = observer(() => {
  // Sort players by final balance
  const sortedPlayers = [...gameStore.players].sort((a, b) => {
    const balanceA = gameStore.getPlayerBalance(a.id);
    const balanceB = gameStore.getPlayerBalance(b.id);
    return balanceB - balanceA;
  });

  const handleReset = () => {
    if (window.confirm('Start a new game? This will reset all progress.')) {
      gameStore.resetGame();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Game Finished!
          </h2>
          <p className="text-gray-300">
            Final results after {gameStore.turnNumber - 1} turns
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4">
            {sortedPlayers.map((player, index) => {
              const playerBalance = gameStore.getPlayerBalance(player.id);
              const playerMultiplier = gameStore.getPlayerMultiplier(player.id);
              const playerLevel = gameStore.getPlayerLevel(player.id);

              return (
                <div
                  key={player.id}
                  className={`bg-white/20 rounded-lg p-4 ${
                    index === 0
                      ? 'bg-yellow-500/20 border border-yellow-400/50'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {index === 0 && (
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      )}
                      {index === 1 && (
                        <Medal className="w-5 h-5 text-gray-400" />
                      )}
                      {index === 2 && (
                        <Medal className="w-5 h-5 text-amber-700" />
                      )}
                      <div>
                        <div className="font-semibold text-lg">
                          {player.name}
                          {player.isBot && (
                            <span className="text-purple-400"> (Bot)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-300">
                          Final Multiplier: ×{playerMultiplier.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xl">
                        ${playerBalance.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-300">
                        Level {playerLevel}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-6">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Start New Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default GameFinished;
