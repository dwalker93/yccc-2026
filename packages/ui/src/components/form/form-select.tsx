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
}

export function FormSelect({
  label,
  description,
  optionalField,
  placeholder,
  children,
}: FormSelectProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <FormBase
      label={label}
      description={description}
      optionalField={optionalField}
    >
      <Select
        value={field.state.value}
        onValueChange={(e) => field.handleChange(e)}
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
