import { useEffect, useState, type FormEvent } from 'react'
import './App.css'

interface Task {
  id: number
  title: string
  completed: boolean
}

const API_BASE = '/api'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/tasks`)
      if (!res.ok) throw new Error(`Failed to load tasks (${res.status})`)
      setTasks(await res.json())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  async function addTask(e: FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: trimmed }),
    })
    if (!res.ok) {
      setError(`Failed to add task (${res.status})`)
      return
    }
    const created: Task = await res.json()
    setTasks((prev) => [...prev, created])
    setTitle('')
  }

  async function toggleTask(task: Task) {
    const res = await fetch(`${API_BASE}/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    })
    if (!res.ok) {
      setError(`Failed to update task (${res.status})`)
      return
    }
    const updated: Task = await res.json()
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  async function deleteTask(id: number) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 204) {
      setError(`Failed to delete task (${res.status})`)
      return
    }
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <main className="app">
      <h1>Nathan Hills</h1>
      <p className="subtitle">FastAPI + React starter — a task list to prove the stack works end to end.</p>

      <form className="add-form" onSubmit={addTask}>
        <input
          type="text"
          placeholder="Add a task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="empty">No tasks yet. Add one above.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className={task.completed ? 'completed' : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task)}
                />
                <span>{task.title}</span>
              </label>
              <button className="delete" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
