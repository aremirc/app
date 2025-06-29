import { useState } from "react"
import { ChevronDown } from "lucide-react"

const SimpleAccordion = ({ items }) => {
  const [openIndexes, setOpenIndexes] = useState([])

  const toggleIndex = (index) => {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
      {items.slice().reverse().map((item, index) => {
        const isOpen = openIndexes.includes(index)
        return (
          <div
            key={index}
            className="h-fit border border-border-light dark:border-border-dark rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleIndex(index)}
              className={`w-full flex justify-between items-center px-4 py-2 text-left ${isOpen ? "bg-primary/15" : "bg-background-muted"} dark:bg-background-muted-dark hover:bg-primary/20 dark:hover:bg-primary-dark/10 transition-colors`}
            >
              <span className="truncate text-text-light dark:text-text-dark">{item.title}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform text-text-light dark:text-text-dark ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="px-4 py-3 bg-primary/5 dark:bg-background-dark text-sm text-text-light dark:text-text-dark">
                {item.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SimpleAccordion