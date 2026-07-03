import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  FormBase,
  FormControlProps,
} from "@workspace/ui/components/form/form-base"
import { useFieldContext } from "@workspace/ui/hooks/form"

export function FormCheckbox(props: FormControlProps) {
  const field = useFieldContext<boolean>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <FormBase {...props} controlFirst horizontal>
      <Checkbox
        className="mt-[3px] shrink-0"
        aria-describedby={isInvalid ? `${field.name}-error` : undefined}
        aria-invalid={isInvalid}
        id={field.name}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(!!checked)}
        onBlur={field.handleBlur}
      />
    </FormBase>
  )
}
