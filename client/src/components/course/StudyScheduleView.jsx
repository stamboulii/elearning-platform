import React, { useState, useEffect } from 'react';
import studyScheduleService from '../../services/studyScheduleService';
import { Calendar, Clock, Sparkles, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const StudyScheduleView = ({ enrollmentId }) => {
    const [loading, setLoading] = useState(false);
    const [schedule, setSchedule] = useState(null);
    const [targetDate, setTargetDate] = useState('');
    const [hoursPerDay, setHoursPerDay] = useState(2);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (enrollmentId) {
            fetchExistingSchedule();
        }
    }, [enrollmentId]);

    const fetchExistingSchedule = async () => {
        try {
            setLoading(true);
            const response = await studyScheduleService.getSchedule(enrollmentId);
            if (response.success) {
                setSchedule(response.data);
            }
        } catch (error) {
            console.log('No existing schedule found');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!targetDate) {
            toast.error('Please select a target completion date');
            return;
        }

        try {
            setIsGenerating(true);
            const response = await studyScheduleService.generateSchedule({
                enrollmentId,
                targetDate,
                hoursPerDay
            });
            if (response.success) {
                setSchedule(response.data);
                toast.success('Your AI Study plan is ready!');
            }
        } catch (error) {
            console.error('Generation error:', error);
            toast.error('Failed to generate study plan');
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading && !schedule) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {!schedule ? (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-800">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">AI Study Planner</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">
                            Tell us your goal and availability, and our AI will create a personalized roadmap to help you finish the course on time.
                        </p>

                        <form onSubmit={handleGenerate} className="space-y-4 text-left">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Target Completion Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={targetDate}
                                        onChange={(e) => setTargetDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition outline-none dark:text-white font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Study Hours Per Day
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="number"
                                        min="0.5"
                                        max="12"
                                        step="0.5"
                                        value={hoursPerDay}
                                        onChange={(e) => setHoursPerDay(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition outline-none dark:text-white font-medium"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isGenerating}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Generating your plan...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Generate My Study Plan
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Your Study Roadmap</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                Goal: Complete by {new Date(schedule.targetDate).toLocaleDateString()} • {schedule.hoursPerDay}h/day
                            </p>
                        </div>
                        <button
                            onClick={() => setSchedule(null)}
                            className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            Adjust Settings
                        </button>
                    </div>

                    <div className="space-y-4">
                        {schedule.scheduleData.map((day, idx) => (
                            <div
                                key={idx}
                                className="group relative flex gap-6 pb-6 last:pb-0"
                            >
                                {/* Timeline vertical line */}
                                <div className="absolute left-6 top-10 bottom-0 w-px bg-slate-200 dark:bg-slate-800 group-last:hidden"></div>

                                {/* Day indicator */}
                                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center shadow-sm z-10">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Day</span>
                                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-none">{day.day}</span>
                                </div>

                                {/* Day content */}
                                <div className="flex-1">
                                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm group-hover:border-indigo-200 dark:group-hover:border-indigo-900/50 transition">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-black text-slate-900 dark:text-white">{day.title}</h4>
                                                <p className="text-xs text-slate-500 font-bold">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">
                                                    {day.tasks.reduce((sum, t) => sum + (t.duration || 0), 0)} min
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {day.tasks.map((task, tidx) => (
                                                <div key={tidx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 group/task hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{task.title}</span>
                                                    </div>
                                                    <span className="text-xs font-black text-slate-400">{task.duration}m</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-2xl p-6 flex gap-4">
                        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                        <div>
                            <h5 className="font-black text-amber-900 dark:text-amber-400 text-sm">Study Tip</h5>
                            <p className="text-sm text-amber-800/80 dark:text-amber-500/80 font-medium">
                                Consistency is key! Try to stick to your daily tasks. If you miss a day, don't worry—just pick up where you left off.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyScheduleView;
