import React from 'react';
import { observer } from 'mobx-react-lite';
import { Coins, ArrowUpCircle, TrendingUp } from 'lucide-react';
import { gameStore } from '../store/GameStore';
import clsx from 'clsx';

const PlayerList: React.FC<{ currentPlayerId?: string }> = observer(
  ({ currentPlayerId }) => {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Players</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gameStore.players.map((player) => {
            const isCurrentPlayer = player.id === currentPlayerId;
            const isActive = gameStore.activePlayers.includes(player);
            const balance = gameStore.getPlayerBalance(player.id);
            const level = gameStore.getPlayerLevel(player.id);
            const multiplier = gameStore.getPlayerMultiplier(player.id);

            return (
              <div
                key={player.id}
                className={clsx(
                  'bg-white/20 rounded-lg p-4',
                  isCurrentPlayer && 'ring-2 ring-blue-400',
                  !isActive && 'opacity-50'
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{player.name}</span>
                    {player.isBot && (
                      <span className="text-sm text-purple-400">(Bot)</span>
                    )}
                  </div>
                  <span
                    className={clsx(
                      'text-xs px-2 py-1 rounded-full',
                      isActive
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-gray-500/20 text-gray-300'
                    )}
                  >
                    {isActive ? 'Active' : 'Exited'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm">
                      <Coins className="w-4 h-4" />
                      Balance
                    </span>
                    <span className="font-mono">
                      ${balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm">
                      <ArrowUpCircle className="w-4 h-4" />
                      Level
                    </span>
                    <span className="font-mono">{level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      Multiplier
                    </span>
                    <span className="font-mono">×{multiplier.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

export default PlayerList;
