"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, Moon, Sun, LogOut, Menu, X } from "lucide-react"
import NoticeBoard from "./NoticeBoard"
import Image from "next/image"

export default function UnifiedHeader() {
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const [showNoticeBoard, setShowNoticeBoard] = useState(false)

  useEffect(() => {
    checkAuthStatus()
    initializeTheme()
  }, [])

  const initializeTheme = () => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setDarkMode(savedTheme === "dark")
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    } else {
      document.documentElement.classList.add("dark")
    }
  }

  const checkAuthStatus = async () => {
    try {
      setAuthError(false)

      // Check localStorage first for immediate UI update
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUser(userData)
        } catch (error) {
          console.error("Error parsing stored user:", error)
          localStorage.removeItem("user")
        }
      }

      // Verify with server using dedicated verification endpoint
      const response = await fetch("/api/auth/verify", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const verificationData = await response.json()
        if (verificationData.valid) {
          // Token is valid, now get user profile
          const profileResponse = await fetch("/api/user/profile", {
            credentials: "include",
          })

          if (profileResponse.ok) {
            const userData = await profileResponse.json()
            setUser(userData)
            localStorage.setItem("user", JSON.stringify(userData))
            fetchNotifications()
          } else {
            // Profile fetch failed but token is valid - this shouldn't happen
            console.error("Profile fetch failed despite valid token")
            handleAuthFailure()
          }
        } else {
          handleAuthFailure()
        }
      } else {
        handleAuthFailure()
      }
    } catch (error) {
      console.error("Auth check error:", error)
      // Don't clear user data on network errors
      setAuthError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAuthFailure = () => {
    setUser(null)
    localStorage.removeItem("user")
    setAuthError(true)
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Always clear local state and redirect
      setUser(null)
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
        credentials: "include",
      })
      fetchNotifications()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem("theme", newDarkMode ? "dark" : "light")

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const isActivePage = (path) => pathname === path

  // Show loading state
  if (loading) {
    return (
      <header className="border-b border-slate-700 bg-slate-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpeg" alt="Discipline Pri" width={32} height={32} className="contain w-full h-8 rounded" />
          </Link>
          <div className="text-slate-400">Loading...</div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b border-slate-700 bg-slate-900">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpeg" alt="Discipline Pri" width={32} height={32} className="contain w-full h-8 rounded" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`transition-colors ${isActivePage("/") ? "text-white" : "text-slate-300 hover:text-white"}`}
          >
            Home
          </Link>
          <Link
            href="/rules"
            className={`transition-colors ${isActivePage("/rules") ? "text-white" : "text-slate-300 hover:text-white"}`}
          >
            Rules
          </Link>
          {user && (
            <>
              <Link
                href="/dashboard"
                className={`transition-colors ${isActivePage("/dashboard") ? "text-white" : "text-slate-300 hover:text-white"}`}
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className={`transition-colors ${isActivePage("/profile") ? "text-white" : "text-slate-300 hover:text-white"}`}
              >
                Profile
              </Link>
              <Link
                href="/leaderboard"
                className={`transition-colors ${isActivePage("/leaderboard") ? "text-white" : "text-slate-300 hover:text-white"}`}
              >
                Leaderboard
              </Link>
              <button
                onClick={() => setShowNoticeBoard(true)}
                className="text-slate-300 hover:text-white transition-colors"
              >
                Notice Board
              </button>
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className={`transition-colors ${isActivePage("/admin") ? "text-white" : "text-slate-300 hover:text-white"}`}
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle */}
          <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="text-white hover:bg-slate-700">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Auth Error Indicator */}
          {authError && !user && (
            <Button
              variant="outline"
              size="sm"
              onClick={checkAuthStatus}
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/20 bg-transparent"
            >
              Retry Connection
            </Button>
          )}

          {/* Notifications - Only show if user is logged in */}
          {user && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-white hover:bg-slate-700 relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="text-white font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400">No notifications yet</div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700 ${
                            !notification.read ? "bg-slate-700/50" : ""
                          }`}
                          onClick={() => markNotificationAsRead(notification._id)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-white text-sm">{notification.message}</p>
                              <p className="text-slate-400 text-xs mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {!notification.read && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Menu or Login */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-slate-700">
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture || "/placeholder.svg"}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-bold">{user.name?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-white hidden sm:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="text-white cursor-pointer">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-white cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
              >
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="text-white hover:bg-slate-700">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:bg-slate-700"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <Link
              href="/"
              className={`block py-2 transition-colors ${isActivePage("/") ? "text-white" : "text-slate-300 hover:text-white"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/rules"
              className={`block py-2 transition-colors ${isActivePage("/rules") ? "text-white" : "text-slate-300 hover:text-white"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Rules
            </Link>
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className={`block py-2 transition-colors ${isActivePage("/dashboard") ? "text-white" : "text-slate-300 hover:text-white"}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`block py-2 transition-colors ${isActivePage("/profile") ? "text-white" : "text-slate-300 hover:text-white"}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/leaderboard"
                  className={`block py-2 transition-colors ${isActivePage("/leaderboard") ? "text-white" : "text-slate-300 hover:text-white"}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Leaderboard
                </Link>
                <button
                  onClick={() => {
                    setShowNoticeBoard(true)
                    setMobileMenuOpen(false)
                  }}
                  className="block py-2 text-left text-slate-300 hover:text-white transition-colors w-full"
                >
                  Notice Board
                </button>
                {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className={`block py-2 transition-colors ${isActivePage("/leaderboard") ? "text-white" : "text-slate-300 hover:text-white"}`}
                >
                  Admin
                </Link>
              )}

                {/* Mobile User Section */}
                <div className="border-t border-slate-700 pt-2 mt-2">
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture || "/placeholder.svg"}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-bold">{user.name?.charAt(0)?.toUpperCase()}</span>
                      )}
                    </div>
                    <span className="text-white">{user.name}</span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            )}
            {!user && (
              <div className="border-t border-slate-700 pt-2 mt-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-slate-600 text-white hover:bg-slate-700"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
      {/* Notice Board Modal */}
      <NoticeBoard isOpen={showNoticeBoard} onClose={() => setShowNoticeBoard(false)} />
    </header>
  )
}
