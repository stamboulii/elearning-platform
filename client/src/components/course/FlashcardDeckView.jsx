import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FlashcardDeckView = ({ deck }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [direction, setDirection] = useState(0);

    const cards = deck?.flashcards || [];

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
            setDirection(1);
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    const handleRestart = () => {
        setDirection(0);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    if (cards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <BrainCircuit className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No flashcards available for this lesson yet.</p>
            </div>
        );
    }

    const currentCard = cards[currentIndex];
    const progress = ((currentIndex + 1) / cards.length) * 100;

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-indigo-600" />
                        AI Flashcards
                    </h3>
                    <p className="text-sm text-slate-500">Test your knowledge on this lesson</p>
                </div>
                <div className="text-right">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {currentIndex + 1} / {cards.length}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-indigo-600"
                />
            </div>

            {/* Card Container */}
            <div className="relative h-80 perspective-1000 mb-8 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={{
                            enter: (direction) => ({
                                x: direction > 0 ? 300 : direction < 0 ? -300 : 0,
                                opacity: 0,
                                rotateY: 0,
                            }),
                            center: {
                                x: 0,
                                opacity: 1,
                                rotateY: isFlipped ? 180 : 0,
                            },
                            exit: (direction) => ({
                                x: direction < 0 ? 300 : direction > 0 ? -300 : 0,
                                opacity: 0,
                            }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 300 },
                            rotateY: { duration: 0.4 },
                            opacity: { duration: 0.2 }
                        }}
                        style={{ transformStyle: "preserve-3d" }}
                        className="w-full h-full relative"
                    >
                        {/* Front Side */}
                        <div
                            className={`absolute inset-0 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 flex items-center justify-center text-center backface-hidden transform ${isFlipped ? 'opacity-0' : 'opacity-100'}`}
                            style={{ backfaceVisibility: "hidden" }}
                        >
                            <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                                {currentCard.front}
                            </p>
                            <div className="absolute bottom-6 text-xs font-bold uppercase tracking-widest text-slate-400">
                                Click to reveal answer
                            </div>
                        </div>

                        {/* Back Side */}
                        <div
                            className={`absolute inset-0 bg-indigo-600 rounded-3xl shadow-xl p-8 flex items-center justify-center text-center backface-hidden transform rotateY-180 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}
                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                        >
                            <p className="text-lg md:text-xl font-medium text-white leading-relaxed">
                                {currentCard.back}
                            </p>
                            <div className="absolute bottom-6 text-xs font-bold uppercase tracking-widest text-indigo-200">
                                Correct Answer
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    disabled={currentIndex === 0}
                    className={`p-3 rounded-2xl border transition-all ${currentIndex === 0
                        ? 'bg-slate-50 text-slate-300 border-slate-100 dark:bg-slate-900 dark:text-slate-700 dark:border-slate-800'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); handleRestart(); }}
                    className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                    <RotateCcw className="w-5 h-5" />
                    Restart
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    disabled={currentIndex === cards.length - 1}
                    className={`p-3 rounded-2xl border transition-all ${currentIndex === cards.length - 1
                        ? 'bg-slate-50 text-slate-300 border-slate-100 dark:bg-slate-900 dark:text-slate-700 dark:border-slate-800'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default FlashcardDeckView;
