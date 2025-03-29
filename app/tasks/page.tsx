"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardHeader, CardBody } from "@/components/ui/card"
import Button from "@/components/ui/button"
import Badge from "@/components/ui/badge"
import Modal from "@/components/ui/modal"
import Select from "@/components/ui/select"
import { useToast } from "@/contexts/toast-context"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { Plus, Search, Filter, CheckSquare, Clock, AlertCircle, User, Calendar, ArrowUpDown } from "lucide-react"

type Task = {
  id: string
  title: string
  description: string | null
  status: "TODO" | "IN_PROGRESS" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH"
  assigneeId: string
  createdById: string
  teamId: string | null
  createdAt: string
  updatedAt: string
  assignee: {
    id: string
    name: string
    email: string
  }
  createdBy: {
    id: string
    name: string
    email: string
  }
  team?: {
    id: string
    name: string
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { showToast } = useToast()
  const { user } = useAuth()

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const url = new URL("/api/tasks", window.location.origin)
      if (statusFilter) {
        url.searchParams.append("status", statusFilter)
      }

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }

      const data = await response.json()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      showToast("Failed to load tasks", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [statusFilter])

  const handleDeleteClick = (taskId: string) => {
    setDeleteTaskId(taskId)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTaskId) return

    try {
      const response = await fetch(`/api/tasks/${deleteTaskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== deleteTaskId))
      showToast("Task deleted successfully", "success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      showToast("Failed to delete task", "error")
    } finally {
      setIsDeleteModalOpen(false)
      setDeleteTaskId(null)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "TODO":
        return "warning"
      case "IN_PROGRESS":
        return "info"
      case "DONE":
        return "success"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "TODO":
        return <AlertCircle className="h-4 w-4" />
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4" />
      case "DONE":
        return <CheckSquare className="h-4 w-4" />
      default:
        return null
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "secondary"
      case "MEDIUM":
        return "primary"
      case "HIGH":
        return "danger"
      default:
        return "secondary"
    }
  }

  // Check if user can edit/delete a task
  const canEditTask = (task: Task) => {
    if (!user) return false
    return user.role === "ADMIN" || task.createdById === user.id || task.assigneeId === user.id
  }

  // Filter tasks by search query
  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      task.assignee.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-xl text-red-800 shadow-md">
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p>{error}</p>
        <Button onClick={fetchTasks} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="max-w-7xl mx-auto pt-16">
      <motion.div
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage and track your team's tasks</p>
        </div>
        <Link href="/tasks/create">
          <Button className="flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow">
            <Plus className="h-5 w-5" />
            Add Task
          </Button>
        </Link>
      </motion.div>

      <motion.div
        className="mb-8 bg-white rounded-xl shadow-md p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks by title, description or assignee..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select
              id="statusFilter"
              name="statusFilter"
              options={[
                { value: "", label: "All Statuses" },
                { value: "TODO", label: "To Do" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "DONE", label: "Done" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-w-[150px]"
            />
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-5 w-5 text-gray-500" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {isFilterOpen && (
          <div className="mt-4 p-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <Select
                  id="priorityFilter"
                  name="priorityFilter"
                  options={[
                    { value: "", label: "All Priorities" },
                    { value: "LOW", label: "Low" },
                    { value: "MEDIUM", label: "Medium" },
                    { value: "HIGH", label: "High" },
                  ]}
                  value=""
                  onChange={() => {}}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                <Select
                  id="assigneeFilter"
                  name="assigneeFilter"
                  options={[
                    { value: "", label: "All Assignees" },
                    { value: "1", label: "John Doe" },
                    { value: "2", label: "Jane Smith" },
                  ]}
                  value=""
                  onChange={() => {}}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <Select
                  id="sortFilter"
                  name="sortFilter"
                  options={[
                    { value: "newest", label: "Newest First" },
                    { value: "oldest", label: "Oldest First" },
                    { value: "priority", label: "Priority" },
                  ]}
                  value="newest"
                  onChange={() => {}}
                />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {filteredTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardBody>
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <CheckSquare className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
                <p className="text-gray-500 max-w-md mb-6">
                  {searchQuery
                    ? `No tasks matching "${searchQuery}" found.`
                    : statusFilter
                      ? `No tasks with status "${statusFilter}" found.`
                      : "No tasks found. Create your first task to get started!"}
                </p>
                <Link href="/tasks/create">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Task
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredTasks.map((task) => (
            <motion.div key={task.id} variants={item}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardHeader className="flex justify-between items-start p-5 border-b">
                  <div className="w-full">
                    <div className="flex justify-between items-start mb-2">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="text-lg font-semibold hover:text-indigo-600 transition-colors line-clamp-1"
                      >
                        {task.title}
                      </Link>
                      <Badge
                        variant={getStatusBadgeVariant(task.status)}
                        className="ml-2 flex items-center gap-1 px-2.5 py-1"
                      >
                        {getStatusIcon(task.status)}
                        <span>{task.status.replace("_", " ")}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <User className="h-4 w-4 mr-1" />
                      <span>{task.assignee.name}</span>
                    </div>
                    {task.team && (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <span>{task.team.name}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardBody className="p-5">
                  <div className="mb-4">
                    <p className="text-gray-600 line-clamp-2 min-h-[40px]">
                      {task.description || "No description provided."}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <Badge variant={getPriorityBadgeVariant(task.priority)} className="flex items-center gap-1">
                      <ArrowUpDown className="h-3 w-3" />
                      {task.priority} Priority
                    </Badge>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(task.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center"
                    >
                      View Details
                      <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </Link>
                    {canEditTask(task) && (
                      <div className="flex space-x-2">
                        <Link href={`/tasks/${task.id}/edit`} className="text-sm text-gray-600 hover:text-indigo-600">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(task.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        }
      >
        <div className="p-2">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-center text-lg font-medium">Are you sure you want to delete this task?</h3>
          <p className="text-center text-gray-500">
            This action cannot be undone. This will permanently delete the task and remove it from our servers.
          </p>
        </div>
      </Modal>
    </div>
  )
}

