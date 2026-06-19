'use client'

import { useActionState, useState } from 'react'
import { updateClientProfile, type ActionState } from '../../../actions/admin/client-profiles'
import { Table } from '../../ui/table'
import { Input } from '../../ui/input'
import { Check, X, Pencil } from 'lucide-react'

type Profile = {
    user_id: string
    name: string
    sex: 'male' | 'female'
    birthday: string
    nationality: string
    age: number | null
    address: string | null
}

const initialState: ActionState = { error: null, success: false }

function initials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

export function ClientsTable({ profiles }: { profiles: Profile[] }) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [state, formAction, pending] = useActionState(updateClientProfile, initialState)

    return (
        <div className="overflow-x-auto">
            {state.error && (
                <p className="mb-3 text-sm text-brand-primary-600 bg-brand-primary-50 border border-brand-primary-200 rounded-md px-3 py-2">
                    {state.error}
                </p>
            )}
            <Table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="border-b text-left">
                        {['Name', 'Gender', 'Birthday', 'Nationality', 'Age', 'Address', ''].map((h) => (
                            <th key={h} className="py-2.5 pr-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {profiles.map((p) =>
                        editingId === p.user_id ? (
                            <tr key={p.user_id} className="border-b bg-muted/30">
                                <td colSpan={7} className="py-4">
                                    <form action={formAction} className="grid grid-cols-2 gap-4 px-2">
                                        <input type="hidden" name="user_id" value={p.user_id} />

                                        <Field label="Name">
                                            <Input name="name" defaultValue={p.name} required />
                                        </Field>

                                        <Field label="Gender">
                                            {/*
                                                Kept as a native <select> on purpose: it submits via
                                                native FormData with the surrounding server action.
                                                A Radix-based Select component does not, without
                                                wiring up a hidden input — styled to match Input below.
                                            */}
                                            <select
                                                name="sex"
                                                defaultValue={p.sex}
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                        </Field>

                                        <Field label="Birthday">
                                            <Input
                                                name="birthday"
                                                type="date"
                                                defaultValue={p.birthday?.slice(0, 10)}
                                                required
                                            />
                                        </Field>

                                        <Field label="Nationality">
                                            <Input name="nationality" defaultValue={p.nationality} required />
                                        </Field>

                                        <Field label="Age">
                                            <Input name="age" type="number" defaultValue={p.age ?? ''} />
                                        </Field>

                                        <Field label="Address">
                                            <Input name="address" defaultValue={p.address ?? ''} />
                                        </Field>

                                        <div className="col-span-2 flex gap-2 mt-1">
                                            <button
                                                type="submit"
                                                disabled={pending}
                                                className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 disabled:opacity-50 text-brand-primary-50 text-sm font-medium rounded-md px-3 py-1.5 transition-colors"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                {pending ? 'Saving\u2026' : 'Save'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingId(null)}
                                                className="inline-flex items-center gap-1.5 border border-brand-primary-800 text-brand-primary-800 hover:bg-brand-primary-50 text-sm font-medium rounded-md px-3 py-1.5 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </td>
                            </tr>
                        ) : (
                            <tr key={p.user_id} className="border-b hover:bg-muted/40 transition-colors">
                                <td className="py-3 pr-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                                            {initials(p.name)}
                                        </div>
                                        {p.name}
                                    </div>
                                </td>
                                <td className="py-3 pr-4 capitalize">{p.sex}</td>
                                <td className="py-3 pr-4">{p.birthday?.slice(0, 10)}</td>
                                <td className="py-3 pr-4">{p.nationality}</td>
                                <td className="py-3 pr-4">{p.age ?? '\u2014'}</td>
                                <td className="py-3 pr-4">{p.address ?? '\u2014'}</td>
                                <td className="py-3">
                                    <button
                                        onClick={() => setEditingId(p.user_id)}
                                        className="inline-flex items-center gap-1.5 border border-brand-primary-800 text-brand-primary-800 hover:bg-brand-primary-50 text-sm font-medium rounded-md px-3 py-1.5 transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </Table>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-medium text-muted-foreground">{label}</span>
            {children}
        </label>
    )
}