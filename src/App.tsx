import React from 'react';
import { observer } from 'mobx-react-lite';
import { gameStore } from './store/GameStore';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';

const App: React.FC = observer(() => {
  return (
    <div className="min-h-screen bg-gray-100">
      {!gameStore.gameStarted ? <SetupScreen /> : <GameBoard />}
    </div>
  );
});

export default App;
