import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { useFieldContext } from "@workspace/ui/hooks/form"

export type FormControlProps = {
  label: React.ReactNode
  required?: boolean
  description?: string
  optionalField?: boolean
}

type FormBaseProps = FormControlProps & {
  children: React.ReactNode
  horizontal?: boolean
  controlFirst?: boolean
}

export function FormBase({
  children,
  label,
  required,
  description,
  controlFirst = false,
  horizontal,
  optionalField,
}: FormBaseProps) {
  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const LabelComponent = (
    <FieldLabel htmlFor={field.name}>
      {label}
      {required && (
        <span aria-label="required" className="text-destructive">
          *
        </span>
      )}
      {optionalField && (
        <span aria-label="optional" className="text-muted-foreground">
          (optional)
        </span>
      )}
    </FieldLabel>
  )

  const DescriptionComponent = description ? (
    <FieldDescription>{description}</FieldDescription>
  ) : null

  const ErrorComponent = isInvalid ? (
    <FieldError id={`${field.name}-error`} errors={field.state.meta.errors} />
  ) : null

  return (
    <Field
      data-invalid={isInvalid}
      orientation={horizontal ? "horizontal" : "vertical"}
    >
      {controlFirst ? (
        <>
          {children}
          <FieldContent>
            {LabelComponent}
            {DescriptionComponent}
            {ErrorComponent}
          </FieldContent>
        </>
      ) : (
        <>
          {LabelComponent}
          {children}
          <FieldContent>
            {DescriptionComponent}
            {ErrorComponent}
          </FieldContent>
        </>
      )}
    </Field>
  )
}
