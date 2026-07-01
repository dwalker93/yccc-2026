import {
  FormBase,
  FormControlProps,
} from "@workspace/ui/components/form/form-base"
import { Input } from "@workspace/ui/components/input"
import { useFieldContext } from "@workspace/ui/hooks/form"

type FormInputProps = FormControlProps & React.ComponentProps<"input">

export function FormInput({
  label,
  description,
  optionalField,
  ...inputProps
}: FormInputProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <FormBase
      label={label}
      description={description}
      optionalField={optionalField}
    >
      <Input
        {...inputProps}
        aria-describedby={isInvalid ? `${field.name}-error` : undefined}
        aria-invalid={isInvalid}
        id={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
    </FormBase>
  )
}
