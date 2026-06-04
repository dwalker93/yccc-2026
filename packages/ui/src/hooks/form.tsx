import { createFormHook, createFormHookContexts } from "@tanstack/react-form"

import { FormCheckbox } from "@workspace/ui/components/form/form-checkbox"
import { FormInput } from "@workspace/ui/components/form/form-input"
import { FormInputGroup } from "@workspace/ui/components/form/form-input-group"
import { FormSelect } from "@workspace/ui/components/form/form-select"

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

const { useAppForm } = createFormHook({
  fieldComponents: {
    input: FormInput,
    inputGroup: FormInputGroup,
    checkbox: FormCheckbox,
    select: FormSelect,
  },
  formComponents: {},
  fieldContext,
  formContext,
})

export { useAppForm, useFieldContext, useFormContext }
