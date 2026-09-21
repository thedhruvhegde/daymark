"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";

type Task = { id: string; title: string; completed_at: string | null };
type Props = { date: string; editable: boolean; mood?: number | null; energy?: number | null; promptAnswer?: string; initialTasks?: Task[] };

export function DailySignals({ date, editable, mood: initialMood = null, energy: initialEnergy = null, promptAnswer: initialAnswer = "", initialTasks = [] }: Props) {
  const [mood, setMood] = useState<number | null>(initialMood);
  const [energy, setEnergy] = useState<number | null>(initialEnergy);
  const [answer, setAnswer] = useState(initialAnswer);
  const [tasks, setTasks] = useState(initialTasks);
  const [task, setTask] = useState("");
  async function saveReflection(nextMood = mood, nextEnergy = energy, nextAnswer = answer) {
    await fetch(`/api/reflections/${date}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ mood: nextMood, energy: nextEnergy, promptAnswer: nextAnswer }) });
  }
  async function addTask() {
    if (!task.trim()) return;
    const response = await fetch(`/api/tasks/day/${date}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: task }) });
    if (response.ok) {
      const { task: createdTask } = await response.json();
      setTasks((items) => [...items, createdTask]);
      setTask("");
    }
  }
  async function toggleTask(item: Task) {
    const completed = !item.completed_at;
    const response = await fetch(`/api/tasks/${item.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ completed }) });
    if (response.ok) setTasks((items) => items.map((current) => current.id === item.id ? { ...current, completed_at: completed ? new Date().toISOString() : null } : current));
  }
  return <section className="mt-8 border-t border-[#e8e9e2] pt-7"><p className="label">Daily signal</p><div className="mt-4 grid gap-6 sm:grid-cols-2"><div><p className="text-sm font-semibold">How did today feel?</p><div className="mt-3 flex gap-2">{["Low", "Soft", "Steady", "Bright", "Great"].map((label, index) => <button disabled={!editable} onClick={() => { const value = index + 1; setMood(value); saveReflection(value, energy, answer); }} key={label} className={`focus-ring grid h-9 w-9 place-items-center rounded-full text-xs font-semibold ${mood === index + 1 ? "bg-[#d9f16d] text-[#222420]" : "bg-[#f1f2ed] text-[#787b72]"}`} aria-label={`Mood: ${label}`}>{index + 1}</button>)}</div><p className="mt-4 text-sm font-semibold">Energy</p><div className="mt-3 flex gap-2">{[1, 2, 3, 4, 5].map((value) => <button disabled={!editable} onClick={() => { setEnergy(value); saveReflection(mood, value, answer); }} key={value} className={`focus-ring grid h-9 w-9 place-items-center rounded-full text-xs font-semibold ${energy === value ? "bg-[#ffdf85] text-[#222420]" : "bg-[#f1f2ed] text-[#787b72]"}`}>{value}</button>)}</div></div><div><p className="text-sm font-semibold">One thing worth keeping</p><textarea disabled={!editable} value={answer} onChange={(event) => setAnswer(event.target.value)} onBlur={() => saveReflection()} placeholder="A small win, a thought, a detail…" className="focus-ring mt-3 min-h-25 w-full resize-none rounded-xl border border-[#e8e9e2] p-3 text-sm leading-6 outline-none disabled:bg-[#f7f7f3]"/></div></div><div className="mt-6"><p className="text-sm font-semibold">Small promises</p><div className="mt-3 space-y-2">{tasks.map((item) => <button disabled={!editable} onClick={() => toggleTask(item)} key={item.id} className="focus-ring flex w-full items-center gap-3 text-left text-sm"><span className={`grid h-5 w-5 place-items-center rounded-full border ${item.completed_at ? "border-[#222420] bg-[#d9f16d]" : "border-[#dfe1d9]"}`}>{item.completed_at && <Check size={13}/>}</span><span className={item.completed_at ? "text-[#787b72] line-through" : ""}>{item.title}</span></button>)}</div>{editable && <div className="mt-3 flex gap-2"><input value={task} onChange={(event) => setTask(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTask(); } }} placeholder="Add a small task" maxLength={160} className="focus-ring min-w-0 flex-1 rounded-xl border border-[#e8e9e2] px-3 py-2 text-sm outline-none"/><button onClick={addTask} className="focus-ring grid h-10 w-10 place-items-center rounded-xl bg-[#222420] text-white" aria-label="Add task"><Plus size={17}/></button></div>}</div></section>;
}
