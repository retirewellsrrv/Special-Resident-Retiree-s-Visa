'use client'

import { useTransition } from 'react'

import { toast } from 'sonner'

import type { Service } from '@/types/services'

import {
  deleteService,
  toggleServiceAvailability,
} from '@/actions/service'

import { Button } from '@/components/ui/button'

import { Badge } from '@/components/ui/badge'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Switch } from '@/components/ui/switch'

interface Props {
  services: Service[]
}

export function ServiceTable({
  services,
}: Props) {
  const [isPending, startTransition] =
    useTransition()

  async function handleDelete(
    id: number
  ) {
    startTransition(async () => {
      const result =
        await deleteService(id)

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success(
        'Service deleted'
      )
    })
  }

  async function handleToggle(
    id: number,
    value: boolean
  ) {
    startTransition(async () => {
      const result =
        await toggleServiceAvailability(
          id,
          value
        )

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success(
        'Availability updated'
      )
    })
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>

            <TableHead>
              Type
            </TableHead>

            <TableHead>
              Price
            </TableHead>

            <TableHead>
              Description
            </TableHead>

            <TableHead>
              Status
            </TableHead>

            <TableHead>
              Available
            </TableHead>

            <TableHead>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell>
                {service.id}
              </TableCell>

              <TableCell className="capitalize">
                {service.type}
              </TableCell>

              <TableCell>
                ₱
                {service.price.toLocaleString()}
              </TableCell>

              <TableCell className="max-w-[300px] truncate">
                {service.description ??
                  'No description'}
              </TableCell>

              <TableCell>
                <Badge>
                  {service.is_available
                    ? 'Available'
                    : 'Unavailable'}
                </Badge>
              </TableCell>

              <TableCell>
                <Switch
                  checked={
                    service.is_available
                  }
                  onCheckedChange={(
                    value: boolean
                  ) =>
                    handleToggle(
                      service.id,
                      value
                    )
                  }
                />
              </TableCell>

              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    handleDelete(
                      service.id
                    )
                  }
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {services.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center"
              >
                No services found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}