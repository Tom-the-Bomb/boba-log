import { useReducer } from "react";

export interface PresetsState {
  hasMeasured: boolean;
  isCollapsible: boolean;
  isExpanded: boolean;
}

export type PresetsAction =
  | { type: "measured"; isCollapsible: boolean }
  | { type: "toggle" };

export function presetsReducer(
  state: PresetsState,
  action: PresetsAction,
): PresetsState {
  switch (action.type) {
    case "measured":
      return {
        hasMeasured: true,
        isCollapsible: action.isCollapsible,
        isExpanded: action.isCollapsible ? state.isExpanded : false,
      };
    case "toggle":
      return { ...state, isExpanded: !state.isExpanded };
  }
}

export const INITIAL_PRESETS_STATE: PresetsState = {
  hasMeasured: false,
  isCollapsible: false,
  isExpanded: false,
};

export function usePresetsReducer() {
  return useReducer(presetsReducer, INITIAL_PRESETS_STATE);
}
