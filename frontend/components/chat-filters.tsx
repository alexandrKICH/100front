"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pin, Star, Archive, Users, User } from "lucide-react"

interface ChatFiltersProps {
  onFilterChange: (filters: string[]) => void
  pinnedCount: number
  starredCount: number
  archivedCount: number
}

export function ChatFilters({ onFilterChange, pinnedCount, starredCount, archivedCount }: ChatFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const toggleFilter = (filter: string) => {
    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter((f) => f !== filter)
      : [...activeFilters, filter]

    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  const filters = [
    { id: "pinned", label: "Закрепленные", icon: Pin, count: pinnedCount },
    { id: "starred", label: "Избранные", icon: Star, count: starredCount },
    { id: "archived", label: "Архив", icon: Archive, count: archivedCount },
    { id: "groups", label: "Группы", icon: Users, count: 0 },
    { id: "individual", label: "Личные", icon: User, count: 0 },
  ]

  return (
    <div className="flex gap-2 p-2 overflow-x-auto">
      {filters.map((filter) => {
        const Icon = filter.icon
        const isActive = activeFilters.includes(filter.id)

        return (
          <Button
            key={filter.id}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => toggleFilter(filter.id)}
            className={`flex items-center gap-1 whitespace-nowrap ${
              isActive ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-white/70 hover:bg-white/10"
            }`}
          >
            <Icon className="h-3 w-3" />
            {filter.label}
            {filter.count > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {filter.count}
              </Badge>
            )}
          </Button>
        )
      })}
    </div>
  )
}
