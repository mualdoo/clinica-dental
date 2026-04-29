// 'use client'

// import * as React from 'react'
// import { Check, ChevronsUpDown, Search, Loader2 } from 'lucide-react'
// import { cn } from '@/lib/utils'
// import { Button } from '@/components/ui/button'
// import {
//     Command,
//     CommandEmpty,
//     CommandGroup,
//     CommandInput,
//     CommandItem,
//     CommandList,
// } from '@/components/ui/command'
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from '@/components/ui/popover'
// import { useSearchPatients } from '@/hooks/use-patient'
// import { useDebounce } from '@/hooks/use-debounce'

// export function PatientSelector({
//     onSelect,
// }: {
//     onSelect: (id: string) => void
// }) {
//     const [open, setOpen] = React.useState(false)
//     const [search, setSearch] = React.useState('')
//     const debouncedSearch = useDebounce(search, 400) // Espera 400ms
//     const [selectedName, setSelectedName] = React.useState('')

//     const { data, isLoading } = useSearchPatients(debouncedSearch)
//     const patients = data?.data || []

//     return (
//         <Popover open={open} onOpenChange={setOpen}>
//             <PopoverTrigger asChild>
//                 <Button
//                     variant="outline"
//                     role="combobox"
//                     aria-expanded={open}
//                     className="w-full justify-between"
//                 >
//                     {selectedName || 'Buscar paciente'}
//                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                 </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-100 p-0">
//                 <Command shouldFilter={false}>
//                     {' '}
//                     {/* Desactivamos filtro local porque lo hace el backend */}
//                     <CommandInput
//                         placeholder="Escribe para buscar..."
//                         onValueChange={setSearch}
//                     />
//                     <CommandList>
//                         {isLoading && (
//                             <div className="p-4 flex justify-center">
//                                 <Loader2 className="h-4 w-4 animate-spin text-primary" />
//                             </div>
//                         )}
//                         {!isLoading &&
//                             patients.length === 0 &&
//                             debouncedSearch.length > 2 && (
//                                 <CommandEmpty>
//                                     No se encontraron pacientes.
//                                 </CommandEmpty>
//                             )}
//                         <CommandGroup>
//                             {patients.map((patient: any) => (
//                                 <CommandItem
//                                     key={patient.id}
//                                     value={patient.id}
//                                     onSelect={() => {
//                                         setSelectedName(
//                                             `${patient.name} ${patient.lastName}`
//                                         )
//                                         onSelect(patient.id)
//                                         setOpen(false)
//                                     }}
//                                 >
//                                     <Check
//                                         className={cn(
//                                             'mr-2 h-4 w-4',
//                                             selectedName ===
//                                                 `${patient.name} ${patient.lastName}`
//                                                 ? 'opacity-100'
//                                                 : 'opacity-0'
//                                         )}
//                                     />
//                                     <div className="flex flex-col">
//                                         <span>
//                                             {patient.name} {patient.lastName}
//                                         </span>
//                                         <span className="text-xs text-muted-foreground">
//                                             {patient.email} • {patient.phone}
//                                         </span>
//                                     </div>
//                                 </CommandItem>
//                             ))}
//                         </CommandGroup>
//                     </CommandList>
//                 </Command>
//             </PopoverContent>
//         </Popover>
//     )
// }
