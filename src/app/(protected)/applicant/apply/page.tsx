'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { toast } from 'sonner'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

// Validation schema for application
const applicationSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  application_code: z.string().min(1, 'Application code is required'),
  service_type: z.enum(['basic', 'premium', 'vip']),
  status: z.enum(['processing', 'paused', 'approved', 'rejected']).optional(),
})

type ApplicationForm = z.infer<typeof applicationSchema>

const SERVICE_TYPE_OPTIONS = ['basic', 'premium', 'vip'] as const
const STATUS_OPTIONS = ['processing', 'paused', 'approved', 'rejected'] as const

export default function ApplyPage() {
  const supabase = createClient()
  const [applications, setApplications] = useState<Tables<'applications'>[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      user_id: '',
      application_code: '',
      service_type: 'basic',
    },
  })


  // Fetch applications on mount
  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to load applications: ' + error.message)
    } else {
      setApplications(data ?? [])
    }
    setIsLoading(false)
  }

  // Create or Update
  async function onSubmit(data: ApplicationForm) {
    if (editingId) {
      // Update existing application
      const updateData: TablesUpdate<'applications'> = {
        service_type: data.service_type,
        user_id: data.user_id,
        application_code: data.application_code,
        ...(data.status !== undefined && { status: data.status }),
      }

      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', editingId)

      if (error) {
        toast.error('Update failed: ' + error.message)
      } else {
        toast.success('Application updated successfully')
        setEditingId(null)
        reset()
        fetchApplications()
      }
    } else {
      // Create new application - get next available ID
      const { data: maxIdData } = await supabase
        .from('applications')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)

      let newId = 1
      if (maxIdData && maxIdData.length > 0) {
        newId = maxIdData[0].id + 1
      }

      const insertData = {
        id: newId,
        user_id: data.user_id,
        application_code: data.application_code,
        service_type: data.service_type,
        status: data.status ?? 'processing',
      }

      const { error } = await supabase
        .from('applications')
        .insert(insertData)

      if (error) {
        toast.error('Create failed: ' + error.message)
      } else {
        toast.success('Application created successfully')
        reset()
        fetchApplications()
      }
    }
  }

  // Edit handler - populate form
  function handleEdit(app: Tables<'applications'>) {
    setEditingId(app.id)
    reset({
      user_id: app.user_id,
      application_code: app.application_code,
      service_type: app.service_type as ApplicationForm['service_type'],
      status: app.status ?? undefined,
    })
  }

  // Delete handler
  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this application?')) {
      return
    }
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Delete failed: ' + error.message)
    } else {
      toast.success('Application deleted successfully')
      fetchApplications()
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Applications</h1>

      {/* Create/Update Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Application' : 'Create New Application'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="user_id">User ID</FieldLabel>
                <Input
                  id="user_id"
                  placeholder="Enter user ID"
                  {...register('user_id')}
                />
                {errors.user_id && (
                  <FieldError errors={[errors.user_id]} />
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="application_code">Application Code</FieldLabel>
                <Input
                  id="application_code"
                  placeholder="Enter application code"
                  {...register('application_code')}
                />
                {errors.application_code && (
                  <FieldError errors={[errors.application_code]} />
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="service_type">Service Type</FieldLabel>
                <Controller
                  name="service_type"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      items={SERVICE_TYPE_OPTIONS}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value as 'basic' | 'premium' | 'vip')}
                    >
                      <ComboboxInput id="service_type" placeholder="Select service type" />
                      <ComboboxContent>
                        <ComboboxEmpty>No options found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item) => (
                            <ComboboxItem key={item} value={item}>
                              {item}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  )}
                />
                {errors.service_type && (
                  <FieldError errors={[errors.service_type]} />
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="status">Status (Optional)</FieldLabel>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      items={STATUS_OPTIONS}
                      value={field.value ?? ''}
                      onValueChange={(value) => field.onChange(
                        value === '' ? undefined : (value as 'processing' | 'paused' | 'approved' | 'rejected')
                      )}
                    >
                      <ComboboxInput id="status" placeholder="Select status (optional)" />
                      <ComboboxContent>
                        <ComboboxEmpty>No options found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item) => (
                            <ComboboxItem key={item} value={item}>
                              {item}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  )}
                />
                {errors.status && (
                  <FieldError errors={[errors.status]} />
                )}
              </Field>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? editingId
                      ? 'Updating...'
                      : 'Creating...'
                    : editingId
                    ? 'Update Application'
                    : 'Create Application'}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null)
                      reset()
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Existing Applications</h2>
        {isLoading ? (
          <p>Loading applications...</p>
        ) : applications.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ID</p>
                    <p className="font-medium">{app.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Application Code</p>
                    <p className="font-medium">{app.application_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="font-medium">{app.user_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Service Type</p>
                    <p className="font-medium">{app.service_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">{app.status || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created At</p>
                    <p className="font-medium">{app.created_at ? new Date(app.created_at).toLocaleString() : 'N/A'}</p>
                  </div>
                  {app.updated_at && (
                    <div>
                      <p className="text-sm text-muted-foreground">Updated At</p>
                      <p className="font-medium">{new Date(app.updated_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => handleEdit(app)}>
                    Edit
                  </Button>
                  <Button size="sm" onClick={() => handleDelete(app.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
