import { HTMLAttributes } from "react"

import {
  FormBase,
  FormControlProps,
} from "@workspace/ui/components/form/form-base"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { useFieldContext } from "@workspace/ui/hooks/form"

type FormInputGroupProps = FormControlProps & {
  leftAddon?: React.ReactNode
  rightAddon?: React.ReactNode
  type?: HTMLInputElement["type"]
  autoComplete?: string
  placeholder?: string
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"]
  disabled?: boolean
}

export function FormInputGroup({
  leftAddon,
  rightAddon,
  type = "text",
  autoComplete,
  placeholder,
  inputMode,
  disabled,
  ...props
}: FormInputGroupProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <FormBase {...props}>
      <InputGroup aria-invalid={isInvalid}>
        {leftAddon && <InputGroupAddon>{leftAddon}</InputGroupAddon>}
        <InputGroupInput
          aria-describedby={isInvalid ? `${field.name}-error` : undefined}
          aria-invalid={isInvalid}
          autoComplete={autoComplete}
          id={field.name}
          placeholder={placeholder}
          type={type}
          inputMode={inputMode}
          value={field.state.value}
          disabled={disabled}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
        />
        {rightAddon && (
          <InputGroupAddon align={"inline-end"}>{rightAddon}</InputGroupAddon>
        )}
      </InputGroup>
    </FormBase>
  )
}
