import { useState } from "react"
import { Check } from "lucide-react"

export default function Stepper({
  steps = [], // Array de { id: number, title: string }
  initialStep = 1,
  children,
  onStepChange, // callback opcional: (stepId) => void
  controlledStep, // si se quiere controlar externamente
}) {
  const [currentStep, setCurrentStep] = useState(initialStep)

  // Si se pasa controlledStep, siempre se usa ese valor
  const activeStep = controlledStep ?? currentStep

  const handleStepClick = (stepId) => {
    if (stepId <= activeStep) {
      if (controlledStep === undefined) {
        setCurrentStep(stepId)
      }
      if (onStepChange) onStepChange(stepId)
    }
  }

  return (
    <section className="relative flex flex-col gap-2 p-1 focus:outline-hidden" role="list" tabIndex={0}>
      <div className="flex justify-between gap-5">
        {steps.map((step) => {
          const isActive = step.id === activeStep
          const isCompleted = step.id < activeStep
          const isClickable = step.id <= activeStep

          return (
            <div
              key={step.id}
              onClick={() => isClickable && handleStepClick(step.id)}
              className={`flex items-center gap-2 transition-colors ${isClickable
                ? "cursor-pointer hover:opacity-90"
                : "cursor-not-allowed opacity-50"
                }`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 font-semibold transition-colors
                ${isCompleted
                    ? "bg-success-light dark:bg-success-dark text-white border-success-light dark:border-success-dark"
                    : isActive
                      ? "bg-primary text-white border-primary"
                      : "bg-gray-200 dark:bg-border-dark text-text-light dark:text-text-dark border-border-light dark:border-border-dark"
                  }`}
              >
                {isCompleted ? <Check size={20} className="text-white" /> : step.id}
              </div>
              <span
                className={`text-sm font-medium transition-colors ${isCompleted
                  ? "text-success-light dark:text-success-dark"
                  : isActive
                    ? "text-primary"
                    : "text-text-light"
                  }`}
              >
                {step.title}
              </span>
            </div>
          )
        })}
      </div>

      <div className="relative h-2 rounded-sm bg-border-light dark:bg-border-dark overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-primary transition-all duration-500"
          style={{ width: `${(activeStep / steps.length) * 100}%` }}
        />
      </div>

      <div className={`${children ? "py-2" : "py-1"}`}>
        {Array.isArray(children) ? children[activeStep - 1] : children}
      </div>
    </section>
  )
}
