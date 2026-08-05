type StepIndicatorProps = {
  currentStep: number;
};

const STEPS = [
  { num: 1, label: "Personal Info" },
  { num: 2, label: "Family Tree" },
  { num: 3, label: "Employment" },
  { num: 4, label: "Disability" },
  { num: 5, label: "Education" },
  { num: 6, label: "Household" },
  { num: 7, label: "GPS" },
];

export function StepIndicator({
  currentStep,
}: StepIndicatorProps) {
  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex min-w-max items-center">
        {STEPS.map((step, index) => {
          const completed = currentStep > step.num;
          const active = currentStep === step.num;

          return (
            <div
              key={step.num}
              className="flex flex-1 items-center"
            >
              <div className="flex flex-col items-center">
                <div
                  aria-current={active ? "step" : undefined}
                  className={`
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    text-sm
                    font-semibold
                    transition-all
                    ${
                      completed
                        ? "bg-green-600 text-white"
                        : active
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : "bg-gray-200 text-gray-500"
                    }
                  `}
                >
                  {completed ? "✓" : step.num}
                </div>

                <span
                  className={`
                    mt-2
                    whitespace-nowrap
                    text-xs
                    font-medium
                    ${
                      active || completed
                        ? "text-gray-900"
                        : "text-gray-400"
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={`
                    mx-4
                    h-1
                    flex-1
                    rounded-full
                    ${
                      completed
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}