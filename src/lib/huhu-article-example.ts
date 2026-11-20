import { calculateCounterfactual, causalScenarios } from './huhu-counterfactual';

export const conversation = causalScenarios.find(scenario => scenario.id === 'conversation')!;
export const example = calculateCounterfactual(conversation, 'conversation')!;
export const changedWeight = example.evidenceMass * example.necessity!;
export const defaultSketchProbability = conversation.background.find(factor => factor.key === 'k')!.probability;
export const probabilityComparison = [0.05, defaultSketchProbability, 0.50, 0.80].map(sketchProbability => ({
  sketchProbability,
  necessity: calculateCounterfactual(conversation, 'conversation', { k: sketchProbability })!.necessity!,
}));
