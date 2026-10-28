"use client";

import { Check, ChevronDown } from "lucide-react";
import type { Key } from "react";
import {
  Select as AriaSelect,
  Button,
  Label,
  ListBox,
  ListBoxItem,
  SelectValue,
  ToggleButton,
  ToggleButtonGroup,
} from "react-aria-components";
import { Popover } from "./overlays";

interface Option<K extends string> {
  value: K;
  label: string;
  disabled?: boolean;
}

interface SelectProps<K extends string> {
  label: string;
  hideLabel?: boolean;
  value: K;
  options: readonly Option<K>[];
  onChange: (value: K) => void;
  className?: string;
}

export function Select<K extends string>({
  label,
  hideLabel = false,
  value,
  options,
  onChange,
  className = "w-48",
}: SelectProps<K>) {
  return (
    <AriaSelect
      selectedKey={value}
      onSelectionChange={(key: Key | null) => {
        if (key !== null) {
          onChange(String(key) as K);
        }
      }}
      className={className}
    >
      <Label className={hideLabel ? "sr-only" : "label"}>{label}</Label>
      <Button className="field flex h-10 items-center justify-between gap-3 text-left outline-none data-focus-visible:field-focus">
        <SelectValue className="truncate" />
        <ChevronDown
          size={15}
          strokeWidth={1.5}
          className="shrink-0 text-text-2"
        />
      </Button>
      <Popover placement="bottom start" className="w-(--trigger-width)">
        <ListBox className="max-h-72 overflow-y-auto outline-none">
          {options.map((option) => (
            <ListBoxItem
              key={option.value}
              id={option.value}
              textValue={option.label}
              className="flex h-9 cursor-pointer items-center justify-between gap-3 rounded-md px-3 text-sm text-text outline-none data-focused:bg-hover pointer-coarse:h-11"
            >
              {({ isSelected }) => (
                <>
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check
                      size={15}
                      strokeWidth={1.5}
                      className="text-accent-ink"
                    />
                  )}
                </>
              )}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}

interface SegmentedProps<K extends string> {
  label: string;
  compact?: boolean;
  value: K;
  options: readonly Option<K>[];
  onChange: (value: K) => void;
  className?: string;
}

export function Segmented<K extends string>({
  label,
  value,
  options,
  onChange,
  compact = false,
  className = "",
}: SegmentedProps<K>) {
  return (
    <ToggleButtonGroup
      aria-label={label}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={(keys) => {
        const [next] = keys;
        if (next !== undefined) {
          onChange(String(next) as K);
        }
      }}
      className={`grid auto-cols-fr grid-flow-col rounded-lg border border-rule p-1 ${className}`}
    >
      {options.map((option) => (
        <ToggleButton
          key={option.value}
          id={option.value}
          isDisabled={option.disabled}
          className={`${compact ? "h-8 px-3 text-[13px]" : "h-9 min-w-24 px-4 text-sm"} tap-target relative cursor-pointer rounded-md text-text-2 outline-none hover:text-text data-disabled:cursor-default data-disabled:opacity-45 data-focus-visible:focus-ring data-focus-visible:outline-offset-0 data-selected:forced-selected data-selected:bg-band data-selected:text-text data-selected:shadow-[inset_0_0_0_1px_var(--rule)]`}
        >
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

export function FormError({
  id,
  message,
  className = "",
}: {
  id?: string;
  message: string;
  className?: string;
}) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} role="alert" className={`text-sm text-danger ${className}`}>
      {message}
    </p>
  );
}
