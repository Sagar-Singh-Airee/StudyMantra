import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';

function Timer({ onComplete }) {
  const { minutes, seconds, isRunning, start, pause, reset, timeLeft } = useTimer(25);

  // Call onComplete when timer reaches 0
  if (timeLeft === 0 && onComplete) {
    onComplete();
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Focus Timer ⏱️
        </h3>
        <div className="text-6xl font-bold text-blue-600">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        {!isRunning ? (
          <button
            onClick={start}
            className="bg-green-500 text-white p-4 rounded-full hover:bg-green-600 transition"
          >
            <Play className="w-6 h-6" />
          </button>
        ) : (
          <button
            onClick={pause}
            className="bg-yellow-500 text-white p-4 rounded-full hover:bg-yellow-600 transition"
          >
            <Pause className="w-6 h-6" />
          </button>
        )}
        <button
          onClick={reset}
          className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default Timer;