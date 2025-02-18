import React from 'react';
import { observer } from 'mobx-react-lite';
import { Settings, RotateCcw, FileText } from 'lucide-react';
import { gameStore } from '../store/GameStore';

const GameHeader: React.FC = observer(() => {
  const handleReset = () => {
    if (
      window.confirm(
        'Are you sure you want to reset the game? This action cannot be undone.'
      )
    ) {
      gameStore.resetGame();
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Economic Strategy</h1>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/50 hover:bg-red-500/70 transition-colors text-sm md:text-base flex-1 sm:flex-initial justify-center"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
});

export default GameHeader;
