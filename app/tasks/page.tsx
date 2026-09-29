'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import TaskForm from '../Layout_Components/taskForm';
import TaskCard from '../Layout_Components/taskCard';
import Sidebar from '../Layout_Components/sidebar';

interface Task {
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    isCompleted: boolean;
}

const API_URL = 'http://localhost:5000/api/tasks';

export default function TasksPage() {
    const [tasks, setTasks] = useState([] as Task[]);
    const [isFormOpen, setFormOpen] = useState(false);
    const [sortOption, setSortOption] = useState('dueDateAsc');

    // 1. Load all tasks from the Node.js backend
    useEffect(() => {
        async function fetchTasks() {
            try {
                const res = await fetch(API_URL);
                if (!res.ok) return;

                const data = await res.json();
                if (Array.isArray(data)) {
                    const formattedTasks: Task[] = data.map((task) => ({
                        id: String(task.id),
                        title: String(task.title),
                        subject: String(task.subject ?? ''),
                        dueDate: String(task.dueDate),
                        isCompleted: Boolean(task.isCompleted),
                    }));
                    setTasks(formattedTasks);
                }
            } catch (err) {
                console.warn('Could not load tasks from backend:', err);
            }
        }
        fetchTasks();
    }, []);

    // 2. Add a new task via POST
    const handleAddTask = async (newTaskData: { title: string; subject: string; dueDate: string }) => {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTaskData),
            });

            if (!res.ok) return;
            const createdTask = await res.json();

            const newTask: Task = {
                id: String(createdTask.id),
                title: String(createdTask.title),
                subject: String(createdTask.subject ?? ''),
                dueDate: String(createdTask.dueDate),
                isCompleted: Boolean(createdTask.isCompleted),
            };

            setTasks((prev) => [...prev, newTask]);
        } catch (err) {
            console.warn('Could not add task:', err);
        }
    };

    // 3. Delete a task via DELETE
    const handleDeleteTask = async (idToDelete: string) => {
        try {
            const res = await fetch(API_URL, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: Number(idToDelete) }),
            });

            if (!res.ok) return;
            setTasks((prev) => prev.filter((task) => task.id !== idToDelete));
        } catch (err) {
            console.warn('Could not delete task:', err);
        }
    };

    // 4. Toggle task completion status via PATCH
    const handleToggleComplete = async (idToToggle: string) => {
        const targetTask = tasks.find((task) => task.id === idToToggle);
        if (!targetTask) return;

        const newStatus = !targetTask.isCompleted;

        try {
            const res = await fetch(API_URL, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: Number(idToToggle),
                    isCompleted: newStatus,
                }),
            });

            if (!res.ok) return;

            setTasks((prev) =>
                prev.map((task) =>
                    task.id === idToToggle ? { ...task, isCompleted: newStatus } : task
                )
            );
        } catch (err) {
            console.warn('Could not update task status:', err);
        }
    };

    const handleSortChange = (event: { target: { value: string } }) => {
        setSortOption(event.target.value);
    };

    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.isCompleted && !b.isCompleted) return 1;
        if (!a.isCompleted && b.isCompleted) return -1;

        if (sortOption === 'dueDateAsc') {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (sortOption === 'dueDateDesc') {
            return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        } else if (sortOption === 'subjectAsc') {
            return a.subject.localeCompare(b.subject);
        } else if (sortOption === 'subjectDesc') {
            return b.subject.localeCompare(a.subject);
        }

        return 0;
    });

    return (
        <div className="min-h-screen flex bg-black text-white relative">
           <Sidebar />
            <main className="flex-1 p-10 flex flex-col items-center animate-page-transition">
                
                <header className="w-full max-w-2xl flex flex-col items-center text-center mb-10 gap-6">
                    <h1 className="text-4xl font-bold">Tasks</h1>
                    <p className="text-zinc-400">Manage, edit, and organize all your study materials in one place.</p>
                    <button 
                        onClick={() => setFormOpen(true)} 
                        className="bg-purple-600 text-white px-8 py-3 rounded-md font-medium hover:bg-purple-400 transition shadow-md hover:shadow-lg"
                    >
                        + New Task
                    </button>
                </header>

                <div className="w-full max-w-2xl bg-zinc-900 p-8 rounded-xl border border-zinc-800 min-h-[400px]">
                    <label className="text-lg font-semibold mb-4 block">Sort by</label>
                        <select onChange={handleSortChange} className="bg-zinc-800 text-zinc-100 p-3 rounded-md border border-zinc-700 mb-6 hover:border-purple-400 transition">
                            <option value="dueDateAsc">Due Date (Ascending)</option>
                            <option value="dueDateDesc">Due Date (Descending)</option>
                            <option value="subjectAsc">Subject (A-Z)</option>
                            <option value="subjectDesc">Subject (Z-A)</option>
                        </select>

                    <div className="flex flex-col gap-3">
                        {sortedTasks .length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-zinc-500 italic mb-2">Your task list is completely empty.</p>
                                <p className="text-zinc-600 text-sm">Click the button above to start organizing your studies!</p>
                            </div>
                        ) : (

                            sortedTasks.map((task) => (
                                <TaskCard 
                                    key={task.id}
                                    id={task.id}
                                    title={task.title}
                                    subject={task.subject}
                                    dueDate={task.dueDate}
                                    isCompleted={task.isCompleted}
                                    onDelete={handleDeleteTask}
                                    onToggle={handleToggleComplete}
                                />
                            ))
                        )}
                    </div>
                </div>
            </main>

            {isFormOpen && (
                <TaskForm
                    onClose={() => setFormOpen(false)} 
                    onAddTask={handleAddTask} 
                />
            )}
        </div>
    );
}