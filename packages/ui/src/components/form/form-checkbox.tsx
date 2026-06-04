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

// I agree to the{" "}
//                         <a
//                           className="rounded-sm text-primary underline underline-offset-4 hover:text-primary/80 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
//                           href={"#"}
//                           rel="noopener noreferrer"
//                           target="_blank"
//                         >
//                           Terms of Service
//                         </a>{" "}
//                         and{" "}
//                         <a
//                           className="rounded-sm text-primary underline underline-offset-4 hover:text-primary/80 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
//                           href={"#"}
//                           rel="noopener noreferrer"
//                           target="_blank"
//                         >
//                           Privacy Policy
//                         </a>
//                         <span
//                           aria-label="required"
//                           className="text-destructive"
//                         >
//                           *
//                         </span>
