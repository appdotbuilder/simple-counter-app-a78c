import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Counter, UpdateCounterInput } from '../../server/src/schema';

function App() {
  const [counter, setCounter] = useState<Counter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Load counter data
  const loadCounter = useCallback(async () => {
    try {
      const result = await trpc.getCounter.query();
      setCounter(result);
    } catch (error) {
      console.error('Failed to load counter:', error);
    } finally {
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    loadCounter();
  }, [loadCounter]);

  const handleOperation = async (operation: UpdateCounterInput['operation']) => {
    setIsLoading(true);
    try {
      const result = await trpc.updateCounter.mutate({ operation });
      setCounter(result);
    } catch (error) {
      console.error(`Failed to ${operation} counter:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
            ✨ Counter App
          </CardTitle>
          <p className="text-gray-600">Simple and elegant counting</p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Counter Display */}
          <div className="text-center">
            <div className="mb-4">
              <Badge variant="secondary" className="text-xs px-3 py-1">
                Current Count
              </Badge>
            </div>
            <div className="text-8xl font-bold text-blue-600 mb-2">
              {counter?.value ?? 0}
            </div>
            <p className="text-sm text-gray-500">
              Last updated: {counter?.updated_at.toLocaleTimeString() ?? 'Never'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={() => handleOperation('decrement')}
              disabled={isLoading}
              variant="outline"
              className="h-14 text-lg font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-200"
            >
              {isLoading ? '⏳' : '➖'}
            </Button>
            
            <Button
              onClick={() => handleOperation('reset')}
              disabled={isLoading}
              variant="outline"
              className="h-14 text-lg font-semibold hover:bg-gray-50 hover:text-gray-600 hover:border-gray-300 transition-all duration-200"
            >
              {isLoading ? '⏳' : '🔄'}
            </Button>
            
            <Button
              onClick={() => handleOperation('increment')}
              disabled={isLoading}
              variant="outline"
              className="h-14 text-lg font-semibold hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all duration-200"
            >
              {isLoading ? '⏳' : '➕'}
            </Button>
          </div>

          {/* Button Labels */}
          <div className="grid grid-cols-3 gap-3 text-center text-sm text-gray-500">
            <span>Decrease</span>
            <span>Reset</span>
            <span>Increase</span>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Made with ❤️ using React & tRPC
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;