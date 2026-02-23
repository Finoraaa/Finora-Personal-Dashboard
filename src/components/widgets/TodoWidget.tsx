import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export const TodoWidget = ({ className }: { className?: string }) => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", text: "GitHub repolarını güncelle", completed: false },
    { id: "2", text: "Yeni API anahtarlarını ekle", completed: true },
  ]);
  const [inputValue, setInputValue] = useState("");

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newTodo: Todo = {
      id: Math.random().toString(36).substr(2, 9),
      text: inputValue,
      completed: false,
    };
    setTodos([newTodo, ...todos]);
    setInputValue("");
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 p-6 transition-all hover:border-emerald-500/30 shadow-sm dark:shadow-none",
        className
      )}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Quick Tasks</span>
          <span className="text-[10px] font-mono text-zinc-600">{todos.filter(t => !t.completed).length} pending</span>
        </div>

        <form onSubmit={addTodo} className="mb-4 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none"
          />
          <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white dark:text-black hover:scale-105 transition-transform">
            <Plus className="h-4 w-4" />
          </button>
        </form>

        <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1 max-h-[120px]">
          <AnimatePresence initial={false}>
            {todos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/5 p-2 group/item"
              >
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-zinc-600" />
                  )}
                  <span className={cn("text-xs transition-all", todo.completed ? "text-zinc-400 dark:text-zinc-600 line-through" : "text-zinc-700 dark:text-zinc-300")}>
                    {todo.text}
                  </span>
                </button>
                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover/item:opacity-100 p-1 text-zinc-600 hover:text-red-500 transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
