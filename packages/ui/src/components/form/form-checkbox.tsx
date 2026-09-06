import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  FormBase,
  FormControlProps,
} from "@workspace/ui/components/form/form-base"
import { useFieldContext } from "@workspace/ui/hooks/form"

type FormCheckboxProps = FormControlProps & {
  disabled?: boolean
}

export function FormCheckbox(props: FormCheckboxProps) {
  const field = useFieldContext<boolean>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <FormBase {...props} controlFirst horizontal>
      <Checkbox
        className="mt-0.75 shrink-0"
        aria-describedby={isInvalid ? `${field.name}-error` : undefined}
        aria-invalid={isInvalid}
        id={field.name}
        disabled={props.disabled}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(!!checked)}
        onBlur={field.handleBlur}
      />
    </FormBase>
  )
}
