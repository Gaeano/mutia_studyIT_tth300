'use client';

import { useState, useEffect } from 'react';
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

export default function Dashboard() {
    const [username, setUsername] = useState('');
    const [tasks, setTasks] = useState([] as Task[]);
    const [sortOption, setSortOption] = useState('dueDateAsc');

    useEffect(() => {
        const storedName = localStorage.getItem('planner_username');
        if (storedName) {
            setUsername(storedName);
        }

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
    <div className="min-h-screen flex bg-black text-white">
    <Sidebar />

    <main className="flex-1 p-10 animate-page-transition">
        <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
            Welcome back{username ? `, ${username}` : ''}!
        </h1>  
        </header>

        <div className="grid grid-cols-3 gap-6">
        <section className="col-span-2 bg-zinc-900 p-6 rounded-xl border border-zinc-800 min-h-[400px]">
            <h3 className="text-lg font-bold mb-4 text-purple-100">Active Tasks</h3>
            <div className="flex flex-col gap-2">
              {sortedTasks.length === 0 ? (
                <p className="text-zinc-500 italic">No active tasks. Click "+ New Task" to start planning!</p>
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

        </section>
        
        <section className="col-span-1 bg-zinc-900 p-6 rounded-xl border border-zinc-800 min-h-[400px]">
            <h3 className="text-lg font-bold mb-4 text-purple-100">Upcoming Schedule</h3>
            <p className="text-zinc-400 italic">Mini-calendar will render here...</p>
        </section>
        </div>
    </main>

    
    </div>
);
}