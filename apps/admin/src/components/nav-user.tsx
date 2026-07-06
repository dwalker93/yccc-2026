"use client"

import { useAppGlobal } from "@/providers/app-global-provider"
import { BellIcon, LogOutIcon, UserIcon } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import { useSessionQuery } from "@/hooks/user/session-query"
import { useSignOutMutation } from "@/hooks/user/sign-out-mutation"

export function NavUser() {
  const { data: session, isPending } = useSessionQuery()
  const { mutate: signOut, isPending: isPendingSignOut } = useSignOutMutation()
  const [, setAppGlobal] = useAppGlobal()

  const user = session?.user

  if (isPending || !user) {
    return <div className="size-8 rounded-full bg-muted" />
  }

  const avatarFallback =
    user.name.charAt(0).toUpperCase() +
    (user.name.split(" ")[1]?.charAt(0).toUpperCase() ?? "")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8">
          <AvatarImage src={user.image ?? ""} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem
          className="pointer-events-none flex items-center justify-start gap-2"
        >
          <DropdownMenuLabel className="flex items-center gap-3 p-0">
            <Avatar className="size-10">
              <AvatarImage src={user.image ?? ""} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon />
            Profile
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BellIcon />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="w-full cursor-pointer text-destructive"
            variant="destructive"
            onClick={() => {
              setAppGlobal({ isLoading: true })
              signOut()
            }}
            disabled={isPendingSignOut}
          >
            <LogOutIcon />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
