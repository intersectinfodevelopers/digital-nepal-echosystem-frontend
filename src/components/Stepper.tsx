"use client";

import React from "react";

const STEPS = [
  "Personal",
  "NID",
  "Family",
  "Employment",
  "Household",
  "Disability",
  "Education",
  "Photo",
  "Location",
  "Submit",
];

interface PortalStepperProps {
  currentStep: number;
}

const MIN_STEP_WIDTH = 82;

export function PortalStepper({ currentStep }: PortalStepperProps) {
  const minRowWidth = MIN_STEP_WIDTH * STEPS.length;

  return (
    <div
      className="stepper-scrollbar mb-8 w-full overflow-x-auto rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#063477] focus-visible:ring-offset-2"
      role="region"
      aria-label="Registration progress"
      tabIndex={0}
    >
      <div className="relative flex pt-3" style={{ minWidth: minRowWidth }}>
        {STEPS.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          let circleClasses =
            "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold";
          let labelClasses =
            "font-sans mt-2 w-full truncate px-1 text-center text-[11px] font-semibold leading-tight";

          if (isCompleted) {
            circleClasses += " bg-[#138A42] text-white";
            labelClasses += " text-[#138A42]";
          } else if (isActive) {
            circleClasses += " bg-[#063477] text-white";
            labelClasses += " text-[#063477]";
          } else {
            circleClasses +=
              " bg-white text-[#777777] border-[1.5px] border-[#D9D9D9]";
            labelClasses += " text-[#AAAAAA]";
          }

          return (
            <div
              key={label}
              className="relative flex flex-1 flex-col items-center"
              style={{ minWidth: MIN_STEP_WIDTH }}
            >
              {index < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`absolute left-1/2 top-3.75 h-0.5 rounded-full ${
                    stepNumber < currentStep ? "bg-[#138A42]" : "bg-[#D9D9D9]"
                  }`}
                  style={{ width: "100%" }}
                />
              )}
              <div className={circleClasses}>{stepNumber}</div>
              <span className={labelClasses}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
