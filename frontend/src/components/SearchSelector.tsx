'use client'

import { useState, ReactNode } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { useDebounce } from '@/hooks/use-debounce'

interface GenericSearchSelectorProps<T> {
    placeholder: string
    searchPlaceholder: string
    emptyMessage: string
    // La función de búsqueda que devuelve el hook de TanStack Query
    useSearchHook: (query: string) => { data: any; isLoading: boolean }
    // Cómo extraer el nombre a mostrar en el botón
    getDisplayValue: (item: T) => string
    // Cómo renderizar cada opción en la lista
    renderItem: (item: T) => React.ReactNode
    onSelect: (id: string) => void
}

export function SearchSelector<T extends { id: string }>({
    placeholder,
    searchPlaceholder,
    emptyMessage,
    useSearchHook,
    getDisplayValue,
    renderItem,
    onSelect,
}: GenericSearchSelectorProps<T>) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 400)
    const [selectedLabel, setSelectedLabel] = useState('')

    const { data: response, isLoading } = useSearchHook(debouncedSearch)
    const items = response?.data?.data || []

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                >
                    {selectedLabel || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-100 p-0"
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        onValueChange={setSearch}
                    />
                    <CommandList
                        onWheel={(e) => {
                            // Esto detiene que Radix o el Dialog capturen el scroll
                            e.stopPropagation()
                        }}
                        className="max-h-75 overflow-y-auto" // Asegúrate de que tenga estas clases
                    >
                        {isLoading && (
                            <div className="p-4 flex justify-center">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        )}
                        {!isLoading &&
                            items.length === 0 &&
                            debouncedSearch.length > 2 && (
                                <CommandEmpty>{emptyMessage}</CommandEmpty>
                            )}
                        <CommandGroup>
                            {items.map((item: T) => (
                                <CommandItem
                                    className="my-1"
                                    key={item.id}
                                    value={item.id}
                                    onSelect={() => {
                                        setSelectedLabel(getDisplayValue(item))
                                        onSelect(item.id)
                                        setOpen(false)
                                    }}
                                >
                                    {renderItem(item)}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
