import { ChevronLeft, ChevronRight } from "lucide-react"

export default function StepNavigation({
  step,
  steps,
  prevStep,
  nextStep,
}) {
  return (
    <div className="flex justify-between my-auto">
      <button
        type="button"
        onClick={prevStep}
        disabled={step === 1}
        className="
          flex items-center gap-2 px-2 py-1 rounded border
          border-border-light dark:border-border-dark hover:border-border-dark
          bg-primary dark:bg-background-dark
          text-text-light dark:text-primary-dark dark:hover:text-text-light
          hover:bg-background-light dark:hover:bg-primary-dark
          disabled:opacity-50 transition-colors
        "
        aria-label="Paso anterior"
      >
        <ChevronLeft size={18} className="" />
      </button>

      <button
        type="button"
        onClick={nextStep}
        disabled={step === steps.length}
        className="
          flex items-center gap-2 px-2 py-1 rounded border
          border-border-light dark:border-border-dark hover:border-border-dark
          bg-primary dark:bg-background-dark
          text-text-light dark:text-primary-dark dark:hover:text-text-light
          hover:bg-background-light dark:hover:bg-primary-dark
          disabled:opacity-50 transition-colors
        "
        aria-label="Siguiente paso"
      >
        <ChevronRight size={18} className="" />
      </button>
    </div>
  )
}
