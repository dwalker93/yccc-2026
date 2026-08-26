import {
  FormBase,
  FormControlProps,
} from "@workspace/ui/components/form/form-base"
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useFieldContext } from "@workspace/ui/hooks/form"

type FormSelectProps = FormControlProps & {
  placeholder?: string
  children: React.ReactNode
  disabled?: boolean
}

export function FormSelect({
  label,
  description,
  optionalField,
  requiredIcon,
  placeholder,
  children,
  disabled,
}: FormSelectProps) {
  const field = useFieldContext<string | number>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const isNumber =
    typeof field.state.value === "number" || field.state.value === null
  return (
    <FormBase
      label={label}
      description={description}
      optionalField={optionalField}
      requiredIcon={requiredIcon}
    >
      <Select
        value={field.state.value?.toString() ?? ""}
        onValueChange={(e) => field.handleChange(isNumber ? Number(e) : e)}
        disabled={disabled}
      >
        <SelectTrigger
          id={field.name}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? `${field.name}-error` : undefined}
          onBlur={field.handleBlur}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </FormBase>
  )
}
