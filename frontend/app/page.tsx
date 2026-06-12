"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "./services/auth.service";
import { Button } from "@/components/ui/button";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "./services/todo.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Edit3,
  LogOut,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  Clock,
  ListTodo,
  Loader2,
} from "lucide-react";

interface Todo {
  id: number;
  documentId: string;
  title: string;
  completed: boolean;
  createdAt?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [user, setUser] = useState<{
    id: number;
    username: string;
    email: string;
  } | null>(null);

  // Editing state variables
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Authentication check and load data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      try {
        const [userData, todosData] = await Promise.all([
          getCurrentUser(),
          getTodos(),
        ]);
        setUser(userData);
        setTodos(todosData.data || []);
      } catch (err) {
        if (err instanceof Error) {
          toast.error(err.message);
        } else {
          toast.error(
            "Session expired or failed to load data. Please sign in again.",
          );
        }
        localStorage.removeItem("token");
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    toast.success("Successfully logged out.");
    router.push("/login");
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Task title cannot be empty.");
      return;
    }

    setIsAdding(true);
    try {
      const res = await createTodo(newTitle.trim());
      const newTodo = res.data || res;
      setTodos((prev) => [newTodo, ...prev]);
      setNewTitle("");
      toast.success("Task added successfully.");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to add task.");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    const originalStatus = todo.completed;
    const targetDocId = todo.documentId || String(todo.id);

    setTodos((prev) =>
      prev.map((t) =>
        t.documentId === todo.documentId || t.id === todo.id
          ? { ...t, completed: !originalStatus }
          : t,
      ),
    );

    try {
      await updateTodo(targetDocId, { completed: !originalStatus });
      toast.success(
        !originalStatus
          ? "Task marked as completed."
          : "Task marked as pending.",
      );
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update task status.");
      }
      setTodos((prev) =>
        prev.map((t) =>
          t.documentId === todo.documentId || t.id === todo.id
            ? { ...t, completed: originalStatus }
            : t,
        ),
      );
    }
  };

  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
  };

  const handleSaveEdit = async () => {
    if (!editingTodo) return;
    if (!editTitle.trim()) {
      toast.error("Task title cannot be empty.");
      return;
    }

    const targetDocId = editingTodo.documentId || String(editingTodo.id);
    setIsUpdating(true);
    try {
      await updateTodo(targetDocId, { title: editTitle.trim() });
      setTodos((prev) =>
        prev.map((t) =>
          t.documentId === editingTodo.documentId || t.id === editingTodo.id
            ? { ...t, title: editTitle.trim() }
            : t,
        ),
      );
      toast.success("Task updated successfully.");
      setEditingTodo(null);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update task title.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTodo = async (todo: Todo) => {
    const targetDocId = todo.documentId || String(todo.id);

    const prevTodos = [...todos];
    setTodos((prev) =>
      prev.filter((t) => t.documentId !== todo.documentId && t.id !== todo.id),
    );

    try {
      await deleteTodo(targetDocId);
      toast.success("Task deleted.");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to delete task.");
      }
      setTodos(prevTodos);
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-slate-950 text-slate-100 p-6">
        <div className="w-full max-w-4xl space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 bg-slate-800" />
              <Skeleton className="h-4 w-32 bg-slate-800" />
            </div>
            <Skeleton className="h-10 w-24 bg-slate-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24 bg-slate-800 rounded-xl" />
            <Skeleton className="h-24 bg-slate-800 rounded-xl" />
            <Skeleton className="h-24 bg-slate-800 rounded-xl" />
          </div>
          <Skeleton className="h-12 w-full bg-slate-800 rounded-lg" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full bg-slate-800 rounded-lg" />
            <Skeleton className="h-16 w-full bg-slate-800 rounded-lg" />
            <Skeleton className="h-16 w-full bg-slate-800 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-linear-to-b from-slate-950 via-slate-900 to-black text-slate-100 min-h-full pb-12 select-none">
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-5 animate-pulse text-blue-300" />
            <span className="text-xl font-bold tracking-tight text-blue-400">
              TaskFlow
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full  flex items-center justify-center border border-primary/30 text-white font-bold text-sm uppercase">
                {user?.username?.charAt(0) || "U"}
              </div>
              <span className="text-sm font-medium text-slate-300 hidden sm:inline">
                {user?.username}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-100 border-slate-800 bg-slate-900 hover:bg-slate-800 h-9 px-3 cursor-pointer "
            >
              <LogOut className="size-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-800/80 bg-slate-950/30 backdrop-blur-sm text-slate-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Total Tasks
              </CardTitle>
              <ClipboardList className="size-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-xs text-slate-500 mt-1">
                Active + Completed tasks
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800/80 bg-slate-950/30 backdrop-blur-sm text-slate-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Pending
              </CardTitle>
              <Clock className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-400">
                {pendingTasks}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Waiting to be finished
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800/80 bg-slate-950/30 backdrop-blur-sm text-slate-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Completed
              </CardTitle>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">
                {completedTasks}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {totalTasks > 0
                  ? `${Math.round((completedTasks / totalTasks) * 100)}% completion rate`
                  : "No tasks to complete"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-800 bg-slate-950/30 backdrop-blur-sm text-slate-100">
          <CardContent className="pt-6">
            <form onSubmit={handleAddTodo} className="flex gap-2">
              <Input
                placeholder="Write a new task title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-slate-900/50 border-slate-800 focus:border-primary text-slate-100 rounded-lg flex-1 h-11"
                disabled={isAdding}
              />
              <Button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold px-4 h-11 rounded-lg cursor-pointer"
                disabled={isAdding}
              >
                {isAdding ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="size-4 mr-1.5" />
                    Add Task
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-950/20 backdrop-blur-sm text-slate-100">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ListTodo className="size-5 text-primary" />
                Task Manager
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Manage and track all your custom assignments
              </CardDescription>
            </div>

            <div className="flex bg-slate-900/60 p-1 rounded-lg border border-slate-800/60 self-start sm:self-center">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  filter === "all"
                    ? "bg-slate-800 text-slate-100"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  filter === "active"
                    ? "bg-slate-800 text-slate-100"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  filter === "completed"
                    ? "bg-slate-800 text-slate-100"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Completed
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-3">
              {filteredTodos.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <ClipboardList className="size-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">
                    No tasks match this filter.
                  </p>
                  <p className="text-xs opacity-80 mt-1">
                    Get started by creating one above.
                  </p>
                </div>
              ) : (
                filteredTodos.map((todo) => (
                  <div
                    key={todo.documentId || todo.id}
                    className={`group flex items-center justify-between p-4 rounded-xl border border-slate-800/60 bg-slate-950/40 hover:bg-slate-900/30 transition-all duration-300 ${
                      todo.completed ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                      <Checkbox
                        id={`todo-${todo.id}`}
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleComplete(todo)}
                        className="size-5 rounded border-slate-700 bg-slate-900/50 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 cursor-pointer"
                      />
                      <label
                        htmlFor={`todo-${todo.id}`}
                        className={`text-sm font-medium leading-none cursor-pointer truncate flex-1 select-none ${
                          todo.completed
                            ? "line-through text-slate-500"
                            : "text-slate-200"
                        }`}
                      >
                        {todo.title}
                      </label>
                    </div>

                    <div className="flex items-center gap-1.5 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 pointer-events-none mr-2 hidden sm:inline-flex ${
                          todo.completed
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {todo.completed ? "Completed" : "Pending"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditDialog(todo)}
                        className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md cursor-pointer"
                      >
                        <Edit3 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDeleteTodo(todo)}
                        className="text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog
        open={editingTodo !== null}
        onOpenChange={(open) => !open && setEditingTodo(null)}
      >
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the title of your task below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Task title..."
              className="bg-slate-900 border-slate-800 focus:border-primary text-slate-100 rounded-lg"
              disabled={isUpdating}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEditingTodo(null)}
              className="border-slate-800 text-[#CBD5E1] hover:text-slate-100 bg-[#1E293B] hover:bg-[#0a164e] cursor-pointer mr-1"
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-[#092c79] hover:bg-[#1852b5] text-white hover:text-slate-100 font-semibold  cursor-pointer"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
