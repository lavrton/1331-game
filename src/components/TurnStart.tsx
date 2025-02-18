import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Play, AlertCircle } from 'lucide-react';
import { gameStore } from '../store/GameStore';

const TurnStart: React.FC = observer(() => {
  useEffect(() => {
    // If only one player remains, finish the game
    if (gameStore.activePlayers.length <= 1) {
      gameStore.setTurnPhase('start'); // This will trigger the game finish logic
      return;
    }

    // If the first active player is a bot, automatically move to actions phase
    const firstPlayer = gameStore.activePlayers[0];
    if (firstPlayer?.isBot) {
      gameStore.setTurnPhase('actions');
    }
  }, []);

  if (gameStore.activePlayers.length <= 1) {
    return null; // Don't render anything as the game will be finished
  }

  const firstPlayer = gameStore.activePlayers[0];
  if (firstPlayer?.isBot) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Play className="w-5 h-5" />
            Turn {gameStore.turnNumber}
          </h2>
          <div className="flex items-center gap-2 text-yellow-300">
            <AlertCircle className="w-5 h-5" />
            <span>Current Modifier: ×{gameStore.modifier}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-gray-300">Starting turn automatically...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Play className="w-5 h-5" />
          Turn {gameStore.turnNumber} Start
        </h2>
        <div className="flex items-center gap-2 text-yellow-300">
          <AlertCircle className="w-5 h-5" />
          <span>Current Modifier: ×{gameStore.modifier}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-gray-300 mb-4">
            A new turn is about to begin. Each player will take their actions in
            order. The current modifier affects lottery costs and rewards.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => gameStore.setTurnPhase('actions')}
            className="px-6 py-3 rounded-lg bg-green-500/30 hover:bg-green-500/50 transition-colors flex items-center gap-2"
          >
            <span>Start Turn Actions</span>
            <Play className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default TurnStart;
