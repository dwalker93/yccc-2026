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
      {optionalField ? (
        <span aria-label="optional" className="text-muted-foreground">
          (optional)
        </span>
      ) : (
        <span aria-label="required" className="text-destructive">
          *
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
