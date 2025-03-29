"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardBody } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { Users, CheckSquare, Clock, AlertCircle, BarChart2, Activity } from "lucide-react"
import { useToast } from "@/contexts/toast-context"

type TaskStats = {
  total: number
  completed: number
  inProgress: number
  todo: number
}

type UserStats = {
  total: number
  admins: number
  users: number
}

type Task = {
  id: string
  title: string
  status: string
  priority: string
  assignee: {
    id: string
    name: string
  }
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const [taskStats, setTaskStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
  })
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    admins: 0,
    users: 0,
  })
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchStats()
      fetchRecentTasks()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      setLoadingStats(true)

      // Fetch tasks for stats
      const tasksResponse = await fetch("/api/tasks")
      if (!tasksResponse.ok) {
        throw new Error("Failed to fetch tasks")
      }
      const tasksData = await tasksResponse.json()

      // Calculate task stats
      const completed = tasksData.filter((task:any) => task.status === "DONE").length
      const inProgress = tasksData.filter((task:any) => task.status === "IN_PROGRESS").length
      const todo = tasksData.filter((task:any) => task.status === "TODO").length

      setTaskStats({
        total: tasksData.length,
        completed,
        inProgress,
        todo,
      })

      // Fetch users for stats
      const usersResponse = await fetch("/api/users")
      if (!usersResponse.ok) {
        throw new Error("Failed to fetch users")
      }
      const usersData = await usersResponse.json()

      // Calculate user stats
      const admins = usersData.filter((user:any) => user.role === "ADMIN").length
      const regularUsers = usersData.filter((user:any) => user.role === "USER").length

      setUserStats({
        total: usersData.length,
        admins,
        users: regularUsers,
      })

      setLoadingStats(false)
    } catch (error) {
      console.error("Error fetching stats:", error)
      showToast("Failed to load dashboard stats", "error")
      setLoadingStats(false)
    }
  }

  const fetchRecentTasks = async () => {
    try {
      const response = await fetch("/api/tasks?limit=4")
      if (!response.ok) {
        throw new Error("Failed to fetch recent tasks")
      }

      const data = await response.json()
      // Sort by most recently updated
      const sortedTasks = data
        .sort((a:any, b:any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 4)

      setRecentTasks(sortedTasks)
    } catch (error) {
      console.error("Error fetching recent tasks:", error)
      showToast("Failed to load recent tasks", "error")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-amber-100 text-amber-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "DONE":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-gray-100 text-gray-800"
      case "MEDIUM":
        return "bg-indigo-100 text-indigo-800"
      case "HIGH":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your projects today.</p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-indigo-50 to-white">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                  <CheckSquare className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Tasks</p>
                  <h3 className="text-2xl font-bold">{loadingStats ? "..." : taskStats.total}</h3>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Completion rate</p>
                  <p className="text-sm font-medium text-indigo-600">
                    {loadingStats || taskStats.total === 0
                      ? "0%"
                      : `${Math.round((taskStats.completed / taskStats.total) * 100)}%`}
                  </p>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{
                      width:
                        loadingStats || taskStats.total === 0
                          ? "0%"
                          : `${(taskStats.completed / taskStats.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-50 to-white">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">In Progress</p>
                  <h3 className="text-2xl font-bold">{loadingStats ? "..." : taskStats.inProgress}</h3>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Of total tasks</p>
                  <p className="text-sm font-medium text-green-600">
                    {loadingStats || taskStats.total === 0
                      ? "0%"
                      : `${Math.round((taskStats.inProgress / taskStats.total) * 100)}%`}
                  </p>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                  <div
                    className="h-full bg-green-600 rounded-full"
                    style={{
                      width:
                        loadingStats || taskStats.total === 0
                          ? "0%"
                          : `${(taskStats.inProgress / taskStats.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-amber-50 to-white">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Pending Tasks</p>
                  <h3 className="text-2xl font-bold">{loadingStats ? "..." : taskStats.todo}</h3>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Of total tasks</p>
                  <p className="text-sm font-medium text-amber-600">
                    {loadingStats || taskStats.total === 0
                      ? "0%"
                      : `${Math.round((taskStats.todo / taskStats.total) * 100)}%`}
                  </p>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                  <div
                    className="h-full bg-amber-600 rounded-full"
                    style={{
                      width:
                        loadingStats || taskStats.total === 0 ? "0%" : `${(taskStats.todo / taskStats.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-purple-50 to-white">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Team Members</p>
                  <h3 className="text-2xl font-bold">{loadingStats ? "..." : userStats.total}</h3>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Admins</p>
                  <p className="text-sm font-medium text-purple-600">{loadingStats ? "..." : userStats.admins}</p>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-500">Regular users</p>
                  <p className="text-sm font-medium text-purple-600">{loadingStats ? "..." : userStats.users}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg h-full">
            <CardHeader className="pb-2 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Recent Tasks</h2>
                <Link href="/tasks" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y">
                {recentTasks.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    {loadingStats ? "Loading recent tasks..." : "No tasks found. Create your first task!"}
                  </div>
                ) : (
                  recentTasks.map((task) => (
                    <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="text-lg font-medium hover:text-indigo-600 transition-colors"
                        >
                          {task.title}
                        </Link>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status.replace("_", " ")}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Assigned to: <span className="font-medium">{task.assignee.name}</span>
                        </div>
                        <Link
                          href={`/tasks/${task.id}`}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Quick Actions and Activity */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2 border-b">
              <h2 className="text-xl font-bold">Quick Actions</h2>
            </CardHeader>
            <CardBody className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/tasks/create"
                  className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <CheckSquare className="h-8 w-8 text-indigo-600 mb-2" />
                  <span className="text-sm font-medium text-center">New Task</span>
                </Link>
                <Link
                  href="/users/create"
                  className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Users className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-center">Add User</span>
                </Link>
                <Link
                  href="/tasks"
                  className="flex flex-col items-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <BarChart2 className="h-8 w-8 text-amber-600 mb-2" />
                  <span className="text-sm font-medium text-center">All Tasks</span>
                </Link>
                <Link
                  href="/users"
                  className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Activity className="h-8 w-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-center">Team</span>
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2 border-b">
              <h2 className="text-xl font-bold">System Status</h2>
            </CardHeader>
            <CardBody className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">API Services</span>
                  </div>
                  <span className="text-green-600 text-sm font-medium">Operational</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">Database</span>
                  </div>
                  <span className="text-green-600 text-sm font-medium">Operational</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">Authentication</span>
                  </div>
                  <span className="text-green-600 text-sm font-medium">Operational</span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Last updated</span>
                    <span className="text-sm text-gray-500">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

