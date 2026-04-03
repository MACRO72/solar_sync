"use client";
import { DevicesMap } from "@/components/dashboard/devices-map";
import { DevicesTable } from "@/components/dashboard/devices-table";

export default function DevicesPage() {
    return (
        <div className="space-y-6">
            <DevicesTable />
            <DevicesMap />
        </div>
    )
}
