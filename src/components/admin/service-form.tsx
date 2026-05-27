'use client'

import {
  useState,
  useTransition,
} from 'react'

import { toast } from 'sonner'

import { createService } from '@/actions/service'

import { Button } from '@/components/ui/button'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Input } from '@/components/ui/input'

import { Textarea } from '@/components/ui/textarea'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ServiceType =
  | 'basic'
  | 'premium'
  | 'vip'

export function ServiceForm() {
  const [isPending, startTransition] =
    useTransition()

  const [type, setType] =
    useState<ServiceType>('basic')

  const [price, setPrice] =
    useState('')

  const [description, setDescription] =
    useState('')

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    if (!price) {
      toast.error('Price is required')
      return
    }

    startTransition(async () => {
      const payload = {
        type,
        price: Number(price),
        description:
          description.trim() || null,
        is_available: true,
      }

      console.log(payload)

      const result =
        await createService(payload)

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success(
        'Service created successfully'
      )

      setType('basic')
      setPrice('')
      setDescription('')
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Create Service
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Service Type
            </label>

            <Select
              value={type}
              onValueChange={(value) =>
                setType(
                  value as ServiceType
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="basic">
                  Basic
                </SelectItem>

                <SelectItem value="premium">
                  Premium
                </SelectItem>

                <SelectItem value="vip">
                  VIP
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Price
            </label>

            <Input
              type="number"
              placeholder="1000"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Description
            </label>

            <Textarea
              placeholder="Service description..."
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending
              ? 'Creating...'
              : 'Create Service'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}