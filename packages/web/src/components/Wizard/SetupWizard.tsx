/**
 * Setup Wizard - Multi-step node configuration
 */

import React, { useState } from 'react';
import { GateMeshNode, NodeType, MeshRole } from '@/types/agriculture';
import { StepRoleSelection } from './steps/StepRoleSelection';
import { StepMeshConfig } from './steps/StepMeshConfig';
import { StepLocationAssignment } from './steps/StepLocationAssignment';
import { StepAdvancedConfig } from './steps/StepAdvancedConfig';
import { StepReview } from './steps/StepReview';
import { useNodeStore } from '@/store/nodeStore';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface SetupWizardProps {
  node: GateMeshNode;
  onClose: () => void;
  onComplete: (node: GateMeshNode) => void;
}

export function SetupWizard({ node, onClose, onComplete }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<Partial<GateMeshNode>>({
    ...node,
  });

  const steps = [
    { id: 'role', title: 'Assign Roles', component: StepRoleSelection },
    { id: 'mesh', title: 'Network Setup', component: StepMeshConfig },
    { id: 'location', title: 'Location', component: StepLocationAssignment },
    { id: 'advanced', title: 'Configuration', component: StepAdvancedConfig },
    { id: 'review', title: 'Review', component: StepReview },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete wizard
      onComplete(wizardData as GateMeshNode);
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  function updateWizardData(updates: Partial<GateMeshNode>) {
    setWizardData({ ...wizardData, ...updates });
  }

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Node Setup Wizard</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configuring: <span className="font-semibold">{node.id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      index < currentStep
                        ? 'bg-green-600 text-white'
                        : index === currentStep
                        ? 'bg-green-600 text-white ring-4 ring-green-100'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-600 mt-2">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 mb-6 rounded transition-colors ${
                      index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <CurrentStepComponent
            node={wizardData as GateMeshNode}
            updateNode={updateWizardData}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleBack}
            disabled={isFirstStep}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <div className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            {isLastStep ? (
              <>
                <Check className="w-5 h-5" />
                Complete
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
