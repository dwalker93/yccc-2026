import { TanStackDevtools } from "@tanstack/react-devtools"
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"

export function DevTools() {
  return (
    <TanStackDevtools
      config={{ position: "bottom-right", hideUntilHover: true }}
      eventBusConfig={{ connectToServerBus: true }}
      plugins={[
        {
          name: "TanStack Form",
          render: <FormDevtoolsPanel />,
          defaultOpen: true,
        },
        {
          name: "TanStack Query",
          render: <ReactQueryDevtoolsPanel />,
          defaultOpen: true,
        },
      ]}
    />
  )
}
