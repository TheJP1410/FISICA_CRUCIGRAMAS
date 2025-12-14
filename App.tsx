import React, { useState, useCallback } from 'react';
import { generateCrossword } from './services/geminiService';
import { Topic, CrosswordData, CellData } from './types';
import { Grid } from './components/Grid';
import { ArrowLeft, CheckCircle, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { Analytics } from "@vercel/analytics/react";

const TOPICS: Topic[] = [
  'TERMODINÁMICA',
  'TEMPERATURA',
  'ONDAS',
  'MAS',
  'FLUIDOS',
  'ELASTICIDAD'
];

const GRID_SIZE = 10;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'MENU' | 'GAME'>('MENU');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [puzzleData, setPuzzleData] = useState<CrosswordData | null>(null);
  const [grid, setGrid] = useState<CellData[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize empty grid
  const createEmptyGrid = useCallback((): CellData[][] => {
    return Array(GRID_SIZE).fill(null).map((_, r) => 
      Array(GRID_SIZE).fill(null).map((_, c) => ({
        row: r,
        col: c,
        char: null,
        userChar: '',
        number: null,
        isActive: false,
        relatedWords: []
      }))
    );
  }, []);

  const handleStartGame = async (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentView('GAME');
    setLoading(true);
    setError(null);
    setPuzzleData(null);
    setSuccessMsg(null);
    setIsVerified(false);

    try {
      const data = await generateCrossword(topic);
      setPuzzleData(data);
      
      // Map data to grid
      const newGrid = createEmptyGrid();
      
      data.words.forEach((word, index) => {
        let r = word.startRow;
        let c = word.startCol;
        
        // Safety check
        if (r >= GRID_SIZE || c >= GRID_SIZE) return;

        // Place number at start
        if (newGrid[r][c]) {
            newGrid[r][c].number = word.number;
        }

        for (let i = 0; i < word.answer.length; i++) {
           if (r >= GRID_SIZE || c >= GRID_SIZE) break;

           const cell = newGrid[r][c];
           cell.isActive = true;
           cell.char = word.answer[i];
           cell.relatedWords.push(index);

           if (word.direction === 'across') c++;
           else r++;
        }
      });
      
      setGrid(newGrid);

    } catch (err) {
      setError("Error cargando el crucigrama. Por favor intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (row: number, col: number, val: string) => {
    if (isVerified) setIsVerified(false); // Reset verification state on edit
    setSuccessMsg(null);
    
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[row] = [...prev[row]];
      newGrid[row][col] = {
        ...newGrid[row][col],
        userChar: val,
        isError: false,
        isCorrect: false
      };
      return newGrid;
    });
  };

  const verifyPuzzle = () => {
    let allCorrect = true;
    let anyFilled = false;

    const newGrid = grid.map(row => row.map(cell => {
      if (!cell.isActive) return cell;
      if (cell.userChar) anyFilled = true;

      const isCorrect = cell.userChar.toUpperCase() === cell.char;
      if (!isCorrect) allCorrect = false;

      return {
        ...cell,
        isCorrect: isCorrect && cell.userChar !== '',
        isError: !isCorrect && cell.userChar !== ''
      };
    }));

    setGrid(newGrid);
    setIsVerified(true);

    if (allCorrect && anyFilled) {
      setSuccessMsg("¡Felicidades! Has completado el crucigrama correctamente.");
    } else {
      setSuccessMsg(null);
    }
  };

  const goBack = () => {
    setCurrentView('MENU');
    setSelectedTopic(null);
    setPuzzleData(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             {currentView === 'GAME' && (
               <button onClick={goBack} className="p-2 hover:bg-slate-700 rounded-full transition">
                 <ArrowLeft size={20} />
               </button>
             )}
             <h1 className="text-xl md:text-2xl font-bold tracking-tight">
               Física <span className="text-blue-400">Crucigramas</span>
             </h1>
          </div>
          {currentView === 'GAME' && selectedTopic && (
             <span className="hidden md:block text-sm font-semibold bg-slate-800 px-3 py-1 rounded-full text-blue-300">
               {selectedTopic}
             </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col p-4 md:p-6 max-w-5xl mx-auto w-full">
        
        {currentView === 'MENU' && (
          <div className="flex flex-col items-center justify-center flex-grow space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-slate-800">Elige tu desafío</h2>
              <p className="text-slate-500">Selecciona un tema de física para comenzar el crucigrama.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
              {TOPICS.map(topic => (
                <button
                  key={topic}
                  onClick={() => handleStartGame(topic)}
                  className="group relative flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <span className="relative z-10 text-lg font-bold text-slate-700 group-hover:text-blue-600">
                    {topic}
                  </span>
                  <div className="absolute bottom-4 right-4 text-slate-200 group-hover:text-blue-100 transition-colors">
                     <RefreshCw size={24} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentView === 'GAME' && (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-grow h-full">
            
            {/* Left Column: Grid & Controls */}
            <div className="flex-1 flex flex-col items-center gap-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Loader2 className="animate-spin text-blue-500" size={48} />
                  <p className="text-slate-500 font-medium">Cargando crucigrama...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
                  <AlertCircle className="text-red-500" size={48} />
                  <p className="text-slate-700">{error}</p>
                  <button onClick={() => handleStartGame(selectedTopic!)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Intentar de nuevo
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-full">
                    <Grid 
                      grid={grid} 
                      onCellChange={handleCellChange} 
                      width={GRID_SIZE} 
                      height={GRID_SIZE} 
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-[500px]">
                    <button 
                      onClick={verifyPuzzle}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-green-200/50 transition-all active:scale-95"
                    >
                      <CheckCircle size={20} />
                      Verificar
                    </button>
                    <button 
                       onClick={() => handleStartGame(selectedTopic!)}
                       className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 font-semibold py-3 px-6 rounded-xl transition-all"
                    >
                       <RefreshCw size={20} />
                       Reiniciar
                    </button>
                  </div>

                  {successMsg && (
                    <div className="w-full max-w-[500px] p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-center font-medium animate-bounce-in">
                      {successMsg}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Column: Clues */}
            {!loading && !error && puzzleData && (
              <div className="w-full lg:w-80 flex flex-col gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3">Horizontal</h3>
                  <ul className="space-y-3">
                    {puzzleData.words.filter(w => w.direction === 'across').map((word, i) => (
                      <li key={i} className="text-sm text-slate-600 leading-relaxed hover:bg-slate-50 p-2 rounded transition">
                        <span className="font-bold text-blue-600 mr-2">{word.number}H.</span>
                        {word.clue}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3">Vertical</h3>
                  <ul className="space-y-3">
                    {puzzleData.words.filter(w => w.direction === 'down').map((word, i) => (
                      <li key={i} className="text-sm text-slate-600 leading-relaxed hover:bg-slate-50 p-2 rounded transition">
                        <span className="font-bold text-blue-600 mr-2">{word.number}V.</span>
                        {word.clue}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs md:text-sm">
          <p className="font-medium">Hecho por Jean Paul Tomas Beltran Mendoza 20250156B</p>
          <p className="mt-2 text-slate-600">&copy; {new Date().getFullYear()} Física Crucigramas.</p>
        </div>
      </footer>
      <Analytics />
    </div>
  );
};

export default App;