import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface SearchableSelectOption {
  label: string
  value: string
  icon?: React.ReactNode
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  showSearch?: boolean
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  className,
  showSearch = true,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [value, options]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between rounded-[12px] bg-background border-border shadow-sm hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200",
            !selectedOption && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedOption?.icon}
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-[14px] border border-border/60 shadow-lg bg-popover/95 backdrop-blur-md overflow-hidden animate-in fade-in-80 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
        <Command className="bg-transparent" loop>
          {showSearch && (
            <CommandInput 
              placeholder={searchPlaceholder} 
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus:ring-0" 
            />
          )}
          <CommandList className={cn(
            "max-h-[280px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent",
            !showSearch && "max-h-none"
          )}>
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2.5 text-sm outline-none transition-all duration-200 my-0.5",
                    "hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:scale-[1.01]",
                    value === option.value && "bg-primary/20 text-primary font-bold shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-2 flex-1 truncate">
                    {option.icon}
                    <span className="truncate">{option.label}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0 transition-opacity text-primary font-bold",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

