import { useState, useMemo, useCallback } from "react";
import {
  FormStep,
  FORM_STEPS,
  FORM_STEPS_NO_EDITOR,
  StepConfig,
  getStepConfig,
  getStepIndex,
  getNextStep,
  getPreviousStep,
} from "../utils/constants";

export interface UseStepNavigationReturn {
  currentStep: FormStep;
  currentStepIndex: number;
  currentStepConfig: StepConfig;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToStep: (step: FormStep) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToFill: () => void;
  goToReview: () => void;
  goToEditor: () => void;
  goToDownload: () => void;
  steps: StepConfig[];
  hasPdfEditor: boolean;
}

export function useStepNavigation(
  initialStep: FormStep = "fill",
  hasPdfEditor: boolean = true
): UseStepNavigationReturn {
  const [currentStep, setCurrentStep] = useState<FormStep>(initialStep);

  const steps = hasPdfEditor ? FORM_STEPS : FORM_STEPS_NO_EDITOR;

  const currentStepIndex = useMemo(() => {
    const idx = steps.findIndex((s) => s.id === currentStep);
    return idx >= 0 ? idx : 0;
  }, [currentStep, steps]);

  const currentStepConfig = useMemo(
    () => steps.find((s) => s.id === currentStep) || steps[0],
    [currentStep, steps]
  );

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const goToStep = useCallback((step: FormStep) => setCurrentStep(step), []);

  const goToNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  }, [currentStepIndex, steps]);

  const goToPrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  }, [currentStepIndex, steps]);

  const goToFill = useCallback(() => setCurrentStep("fill"), []);
  const goToReview = useCallback(() => setCurrentStep("review"), []);
  const goToEditor = useCallback(() => {
    if (hasPdfEditor) {
      setCurrentStep("editor");
    } else {
      setCurrentStep("download");
    }
  }, [hasPdfEditor]);
  const goToDownload = useCallback(() => setCurrentStep("download"), []);

  return {
    currentStep,
    currentStepIndex,
    currentStepConfig,
    totalSteps: steps.length,
    isFirstStep,
    isLastStep,
    goToStep,
    goToNext,
    goToPrevious,
    goToFill,
    goToReview,
    goToEditor,
    goToDownload,
    steps,
    hasPdfEditor,
  };
}
