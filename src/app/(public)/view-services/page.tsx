import { getServices } from "@/actions/admin/service"

export default async function Services() {
    const services = await getServices()
    return (
        <h1>
            Services
        </h1>
    )
}