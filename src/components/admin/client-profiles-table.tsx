'use client'

import { useActionState, useState } from 'react'
import { updateClientProfile, type ActionState } from '../../actions/admin/client-profiles'
import { Table } from '../ui/table'

type Profile = {
    user_id: string
    name: string
    gender: 'male' | 'female' | 'other' | 'prefer_not'
    birthday: string
    nationality: string
    age: number | null
    address: string | null
}

const initialState: ActionState = { error: null, success: false }

export function ClientsTable({ profiles }: { profiles: Profile[] }) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [state, formAction, pending] = useActionState(updateClientProfile, initialState)

    return (
        <div className="overflow-x-auto">
            {state.error && (
                <p className="mb-3 text-sm text-red-500">{state.error}</p>
            )}
            <Table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="border-b text-left">
                        {['Name', 'Gender', 'Birthday', 'Nationality', 'Age', 'Address', ''].map(
                            (h) => <th key={h} className="py-2 pr-4 font-medium">{h}</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {profiles.map((p) =>
                        editingId === p.user_id ? (
                            <tr key={p.user_id} className="border-b">
                                <td colSpan={7} className="py-3">
                                    <form action={formAction} className="grid grid-cols-2 gap-3">
                                        <input type="hidden" name="user_id" value={p.user_id} />

                                        <Field label="Name">
                                            <input name="name" defaultValue={p.name} required />
                                        </Field>

                                        <Field label="Gender">
                                            <select name="gender" defaultValue={p.gender}>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                                <option value="prefer_not">Prefer not to say</option>
                                            </select>
                                        </Field>

                                        <Field label="Birthday">
                                            <input
                                                name="birthday"
                                                type="date"
                                                defaultValue={p.birthday?.slice(0, 10)}
                                                required
                                            />
                                        </Field>

                                        <Field label="Nationality">
                                            <input name="nationality" defaultValue={p.nationality} required />
                                        </Field>

                                        <Field label="Age">
                                            <input name="age" type="number" defaultValue={p.age ?? ''} />
                                        </Field>

                                        <Field label="Address">
                                            <input name="address" defaultValue={p.address ?? ''} />
                                        </Field>

                                        <div className="col-span-2 flex gap-2 mt-1">
                                            <button
                                                type="submit"
                                                disabled={pending}
                                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs disabled:opacity-50"
                                            >
                                                {pending ? 'Saving\u2026' : 'Save'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingId(null)}
                                                className="px-3 py-1 border rounded text-xs"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </td>
                            </tr>
                        ) : (
                            <tr key={p.user_id} className="border-b hover:bg-muted/40">
                                <td className="py-2 pr-4">{p.name}</td>
                                <td className="py-2 pr-4 capitalize">{p.gender?.replace('_', ' ')}</td>
                                <td className="py-2 pr-4">{p.birthday?.slice(0, 10)}</td>
                                <td className="py-2 pr-4">{p.nationality}</td>
                                <td className="py-2 pr-4">{p.age ?? '\u2014'}</td>
                                <td className="py-2 pr-4">{p.address ?? '\u2014'}</td>
                                <td className="py-2">
                                    <button
                                        onClick={() => setEditingId(p.user_id)}
                                        className="text-xs text-blue-500 hover:underline"
                                    >
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
        <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium text-muted-foreground">{label}</span>
            <div className="[&>*]:w-full [&>*]:border [&>*]:rounded [&>*]:px-2 [&>*]:py-1 [&>*]:text-sm">
                {children}
            </div>
        </label>
    )
}
