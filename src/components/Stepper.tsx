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

const MIN_STEP_WIDTH = 76;

export function PortalStepper({ currentStep }: PortalStepperProps) {
  const minRowWidth = MIN_STEP_WIDTH * STEPS.length;

  return (
    <div
      className="w-full mb-8 overflow-x-auto stepper-scrollbar rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2D6D] focus-visible:ring-offset-2"
      role="region"
      aria-label="Registration progress"
      tabIndex={0}
    >
      <div className="relative pt-3 flex" style={{ minWidth: minRowWidth }}>
        {STEPS.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          let circleClasses =
            "relative z-10 w-[34px] h-[34px] rounded-full flex items-center justify-center text-[14px] font-semibold shrink-0";
          let labelClasses =
            "font-poppins text-[12px] text-center leading-tight mt-2 font-medium w-full px-1 truncate";

          if (isCompleted) {
            circleClasses += " bg-[#0A2D6D] text-white";
            labelClasses += " text-[#0A2D6D]";
          } else if (isActive) {
            circleClasses += " bg-[#C01F38] text-white";
            labelClasses += " text-[#C01F38] font-semibold";
          } else {
            circleClasses +=
              " bg-white text-[#64748B] border-[1.5px] border-[#D8D8D8]";
            labelClasses += " text-[#94A3B8]";
          }

          return (
            <div
              key={label}
              className="relative flex-1 flex flex-col items-center"
              style={{ minWidth: MIN_STEP_WIDTH }}
            >
              {index < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`absolute top-[28px] left-1/2 h-[2px] rounded-full ${
                    stepNumber < currentStep ? "bg-[#0A2D6D]" : "bg-[#D8D8D8]"
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
