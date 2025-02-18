import React from 'react';
import { observer } from 'mobx-react-lite';
import { FileText } from 'lucide-react';
import { gameStore } from '../store/GameStore';
import clsx from 'clsx';

const GameLog: React.FC<{ currentPlayerId?: string }> = observer(
  ({ currentPlayerId }) => {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Recent Activity
        </h2>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {gameStore.transactions
            .slice()
            .reverse()
            .map((transaction) => (
              <div
                key={`${transaction.timestamp}-${transaction.playerId}-${transaction.type}`}
                className="text-sm"
              >
                <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
                  <span>Turn {transaction.turn}</span>
                  <span>
                    {new Date(transaction.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div
                  className={clsx(
                    'bg-white/5 rounded-lg p-3',
                    transaction.playerId === currentPlayerId &&
                      'bg-blue-500/20 border border-blue-400/50'
                  )}
                >
                  <div className="font-medium">
                    {transaction.type.replace('_', ' ')}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {transaction.details}
                  </div>
                </div>
              </div>
            ))}
          {gameStore.transactions.length === 0 && (
            <div className="text-center text-gray-400 py-4">
              No activity yet
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default GameLog;
