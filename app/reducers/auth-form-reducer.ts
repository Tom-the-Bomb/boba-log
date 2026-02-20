import type { AuthMode } from "@/lib/types";
import { useReducer } from "react";

interface AuthFormState {
  mode: AuthMode;
  username: string;
  password: string;
  usernameError: string;
  passwordError: string;
  error: string;
  showPassword: boolean;
  isSubmitting: boolean;
  turnstileToken: string;
}

type AuthFormAction =
  | { type: "set_mode"; mode: AuthMode }
  | { type: "set_username"; value: string }
  | { type: "set_password"; value: string }
  | { type: "set_validation"; usernameError: string; passwordError: string }
  | { type: "set_error"; error: string }
  | { type: "toggle_password" }
  | { type: "submit_start" }
  | { type: "submit_end" }
  | { type: "reset_turnstile" }
  | { type: "set_turnstile"; token: string };

function authFormReducer(
  state: AuthFormState,
  action: AuthFormAction,
): AuthFormState {
  switch (action.type) {
    case "set_mode":
      return {
        ...state,
        mode: action.mode,
        usernameError: "",
        passwordError: "",
        error: "",
        turnstileToken: "",
      };
    case "set_username":
      return {
        ...state,
        username: action.value,
        usernameError: "",
      };
    case "set_password":
      return {
        ...state,
        password: action.value,
        passwordError: "",
      };
    case "set_validation":
      return {
        ...state,
        usernameError: action.usernameError,
        passwordError: action.passwordError,
        error: "",
      };
    case "set_error":
      return { ...state, error: action.error, turnstileToken: "" };
    case "toggle_password":
      return { ...state, showPassword: !state.showPassword };
    case "submit_start":
      return { ...state, isSubmitting: true, error: "" };
    case "submit_end":
      return { ...state, isSubmitting: false, turnstileToken: "" };
    case "reset_turnstile":
      return { ...state, turnstileToken: "" };
    case "set_turnstile":
      return { ...state, turnstileToken: action.token };
  }
}

const INITIAL_AUTH_FORM_STATE: AuthFormState = {
  mode: "login",
  username: "",
  password: "",
  usernameError: "",
  passwordError: "",
  error: "",
  showPassword: false,
  isSubmitting: false,
  turnstileToken: "",
};

export default function useAuthFormReducer() {
  return useReducer(authFormReducer, INITIAL_AUTH_FORM_STATE);
}
