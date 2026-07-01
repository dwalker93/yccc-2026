import { createFormHook, createFormHookContexts } from "@tanstack/react-form"

import { FormCheckbox } from "@workspace/ui/components/form/form-checkbox"
import { FormDatePicker } from "@workspace/ui/components/form/form-date-picker"
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
    datePicker: FormDatePicker,
  },
  formComponents: {},
  fieldContext,
  formContext,
})

export { useAppForm, useFieldContext, useFormContext }
