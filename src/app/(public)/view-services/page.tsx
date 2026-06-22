import { getServicePlans } from "@/actions/admin/service"

export default async function Services() {
    const services = await getServicePlans()
    return (
        <h1>
            Services
        </h1>
    )
}