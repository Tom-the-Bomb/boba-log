import { useReducer } from "react";

interface PresetsState {
  hasMeasured: boolean;
  isCollapsible: boolean;
  isExpanded: boolean;
}

type PresetsAction =
  | { type: "measured"; isCollapsible: boolean }
  | { type: "toggle" };

function presetsReducer(
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

const INITIAL_PRESETS_STATE: PresetsState = {
  hasMeasured: false,
  isCollapsible: false,
  isExpanded: false,
};

export default function usePresetsReducer() {
  return useReducer(presetsReducer, INITIAL_PRESETS_STATE);
}
